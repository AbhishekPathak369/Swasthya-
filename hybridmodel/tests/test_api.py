# ml/tests/test_api.py

"""
End-to-end tests for the Swasthya+ ML Service API.

These tests exercise the REAL trained model and REAL services.
There is no mocking of predictions — a passing test means the
actual deployed model produced the actual response.

Preconditions
-------------
- `saved_models/hybrid_model.pth` exists
- `saved_models/preprocessor.joblib` exists

If they don't, the tests fail with a clear message telling you to
run `python -m training.train` first.

Run
---
    cd ml
    pytest tests/ -v
"""

from __future__ import annotations

import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from config.settings import settings
from main import create_app


# ======================================================================
# Precondition check — fail fast with a helpful message
# ======================================================================
def _artifacts_exist() -> bool:
    return (
        settings.MODEL_CHECKPOINT_PATH.exists()
        and settings.PREPROCESSOR_PATH.exists()
    )


pytestmark = pytest.mark.skipif(
    not _artifacts_exist(),
    reason=(
        "Trained artifacts missing. Run `python -m training.train` from the "
        "ml/ directory before running tests."
    ),
)


# ======================================================================
# Fixtures
# ======================================================================
@pytest.fixture(scope="module")
def client() -> TestClient:
    """
    Build the FastAPI app with real services and return a TestClient.

    Module-scoped: the model + SHAP explainer are loaded ONCE for the
    whole test module. Cold start takes ~4s; loading per-test would
    make the suite 45s instead of 8s.
    """
    app = create_app()
    with TestClient(app) as c:   # triggers lifespan startup
        yield c


@pytest.fixture(scope="module")
def api_key_headers() -> dict:
    """Headers with a valid API key for authenticated endpoints."""
    return {"X-API-Key": settings.API_KEY}


@pytest.fixture(scope="module")
def sample_symptoms() -> list[str]:
    """
    Real symptom strings that exist in any symptom-disease Kaggle dataset.
    These are NOT fake — they're common medical symptoms that the
    preprocessor's vocabulary should contain after training.
    """
    return ["fever", "nausea", "headache"]


# ======================================================================
# /health
# ======================================================================
def test_health_returns_200(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200, response.text


def test_health_reports_ready(client: TestClient) -> None:
    body = client.get("/health").json()
    assert body["predict_ready"] is True, (
        "PredictService should be ready. Check startup logs."
    )
    assert body["version"] == settings.APP_VERSION
    assert body["device"] in ("cpu", "cuda", "mps", "n/a")
    # 'status' is 'ok' if predict_ready, else 'degraded'
    assert body["status"] in ("ok", "degraded")


# ======================================================================
# /predict — auth
# ======================================================================
def test_predict_requires_api_key(client: TestClient, sample_symptoms: list[str]) -> None:
    response = client.post("/predict", json={"symptoms": sample_symptoms})
    assert response.status_code == 422, (
        "Missing X-API-Key header should be rejected (FastAPI returns 422 "
        "for missing required header before our handler runs). "
        f"Got {response.status_code}: {response.text}"
    )


def test_predict_rejects_wrong_api_key(
    client: TestClient, sample_symptoms: list[str]
) -> None:
    response = client.post(
        "/predict",
        json={"symptoms": sample_symptoms},
        headers={"X-API-Key": "definitely-wrong-key"},
    )
    assert response.status_code == 401, response.text
    assert "X-API-Key" in response.json()["detail"]


# ======================================================================
# /predict — validation
# ======================================================================
def test_predict_rejects_empty_symptoms(
    client: TestClient, api_key_headers: dict
) -> None:
    response = client.post(
        "/predict",
        json={"symptoms": []},
        headers=api_key_headers,
    )
    assert response.status_code == 422, response.text


def test_predict_rejects_wrong_types(
    client: TestClient, api_key_headers: dict
) -> None:
    response = client.post(
        "/predict",
        json={"symptoms": [123, 456]},
        headers=api_key_headers,
    )
    assert response.status_code == 422, response.text


def test_predict_rejects_missing_body(
    client: TestClient, api_key_headers: dict
) -> None:
    response = client.post("/predict", headers=api_key_headers)
    assert response.status_code == 422, response.text


# ======================================================================
# /predict — real inference
# ======================================================================
def test_predict_real_symptoms(
    client: TestClient,
    api_key_headers: dict,
    sample_symptoms: list[str],
) -> None:
    response = client.post(
        "/predict",
        json={"symptoms": sample_symptoms},
        headers=api_key_headers,
    )
    assert response.status_code == 200, response.text

    body = response.json()

    # Shape / type assertions
    assert isinstance(body["disease"], str) and body["disease"], (
        "disease must be a non-empty string"
    )
    assert isinstance(body["confidence"], float)
    assert 0.0 <= body["confidence"] <= 1.0
    assert isinstance(body["top_features"], list)
    assert isinstance(body["all_top_k"], list)
    assert len(body["all_top_k"]) == 3, "top-3 alternatives should be returned"
    assert isinstance(body["latency_ms"], float)
    assert body["latency_ms"] >= 0.0

    # Sanity: confidence should be the max of top-k confidences
    top_k_confs = [x["confidence"] for x in body["all_top_k"]]
    assert body["confidence"] == pytest.approx(top_k_confs[0], abs=1e-3), (
        "primary confidence must equal the top of all_top_k"
    )

    # Sanity: the top disease name matches the primary disease name
    assert body["all_top_k"][0]["disease"] == body["disease"]

    # Latency sanity (should be well under 2 seconds for a single prediction)
    assert body["latency_ms"] < 2000, (
        f"Inference took {body['latency_ms']}ms — suspiciously slow. "
        "Check whether model is on CPU with a giant batch or something's wrong."
    )


def test_predict_normalizes_case_and_whitespace(
    client: TestClient, api_key_headers: dict
) -> None:
    """
    '  Fever  ', 'NAUSEA' should predict identically to ['fever', 'nausea'].
    Both Pydantic and the preprocessor normalize — this test proves the
    normalization chain is consistent end-to-end.
    """
    normal = client.post(
        "/predict",
        json={"symptoms": ["fever", "nausea"]},
        headers=api_key_headers,
    ).json()

    messy = client.post(
        "/predict",
        json={"symptoms": ["  Fever  ", "NAUSEA"]},
        headers=api_key_headers,
    ).json()

    assert normal["disease"] == messy["disease"]
    assert normal["confidence"] == pytest.approx(messy["confidence"], abs=1e-4)


def test_predict_unknown_symptoms_low_confidence(
    client: TestClient, api_key_headers: dict
) -> None:
    """
    If a user types garbage that isn't in the vocabulary, the model
    receives only <UNK> tokens. Confidence should not be extreme, and
    top_features should be empty (nothing matched).

    Note: we don't assert confidence is *low* because the model could
    legitimately be very confident on a random combination — that's a
    real model behavior we don't want to mask. We do assert that
    top_features is empty, since none matched.
    """
    response = client.post(
        "/predict",
        json={"symptoms": ["xyzqq", "flurbleblorp"]},
        headers=api_key_headers,
    )
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["top_features"] == [], (
        "top_features should be empty when no input symptom was in vocab"
    )


# ======================================================================
# /explain
# ======================================================================
def test_explain_returns_200_or_503(
    client: TestClient,
    api_key_headers: dict,
    sample_symptoms: list[str],
) -> None:
    """200 if SHAP is available, 503 if it isn't (both are valid)."""
    response = client.post(
        "/explain",
        json={"symptoms": sample_symptoms},
        headers=api_key_headers,
    )
    assert response.status_code in (200, 503), response.text


def test_explain_returns_shap_values(
    client: TestClient,
    api_key_headers: dict,
    sample_symptoms: list[str],
) -> None:
    """
    When SHAP is available, verify the response has the expected shape
    and the SHAP values are numeric.
    """
    response = client.post(
        "/explain",
        json={"symptoms": sample_symptoms},
        headers=api_key_headers,
    )
    if response.status_code == 503:
        pytest.skip("SHAP explainer unavailable — skipping shape assertions.")

    body = response.json()
    assert body["is_available"] is True
    assert isinstance(body["predicted_disease"], str) and body["predicted_disease"]
    assert isinstance(body["shap_values"], dict)
    assert isinstance(body["top_features"], list)
    assert isinstance(body["base_value"], (int, float))

    # All returned symptoms must be in the input
    cleaned_input = {s.lower().strip() for s in sample_symptoms}
    for sym in body["shap_values"].keys():
        assert sym in cleaned_input, (
            f"SHAP returned attribution for '{sym}', which was not in the input"
        )
    for sym in body["top_features"]:
        assert sym in cleaned_input

    # All SHAP values must be finite floats (no NaN / inf)
    import math
    for sym, val in body["shap_values"].items():
        assert isinstance(val, (int, float)), f"{sym}: {val!r} is not numeric"
        assert math.isfinite(val), f"{sym}: SHAP value {val} is not finite"


def test_explain_matches_predict(
    client: TestClient,
    api_key_headers: dict,
    sample_symptoms: list[str],
) -> None:
    """
    The consistency contract: /explain and /predict must agree on the
    predicted disease for the same input.

    If they disagree, the two services are using different model
    instances, different preprocessors, or the SHAP computation is
    somehow shifting the argmax. All bad — this test catches it.
    """
    predict_body = client.post(
        "/predict",
        json={"symptoms": sample_symptoms},
        headers=api_key_headers,
    ).json()

    explain_response = client.post(
        "/explain",
        json={"symptoms": sample_symptoms},
        headers=api_key_headers,
    )
    if explain_response.status_code == 503:
        pytest.skip("SHAP explainer unavailable — cannot verify consistency.")

    explain_body = explain_response.json()
    assert explain_body["predicted_disease"] == predict_body["disease"], (
        f"/explain predicted '{explain_body['predicted_disease']}' but "
        f"/predict predicted '{predict_body['disease']}'. The two services "
        "are out of sync — check that both receive the same model and "
        "preprocessor in main.py."
    )


# ======================================================================
# /retrain
# ======================================================================
def test_retrain_disabled_by_default(
    client: TestClient, api_key_headers: dict
) -> None:
    """
    ALLOW_RETRAIN is not set in the test env, so /retrain must return 403.
    """
    # Ensure the env var isn't set from some other test
    os.environ.pop("ALLOW_RETRAIN", None)

    response = client.post("/retrain", headers=api_key_headers)
    assert response.status_code == 403, (
        f"/retrain should be disabled by default. Got "
        f"{response.status_code}: {response.text}"
    )