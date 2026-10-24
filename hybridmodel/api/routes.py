# ml/api/routes.py

"""
FastAPI routes for the Swasthya+ ML Service.

Endpoints
---------
GET  /health     — liveness + readiness check (no auth)
POST /predict    — disease prediction from symptoms (X-API-Key)
POST /explain    — SHAP attribution for the predicted disease (X-API-Key)
POST /retrain    — admin-only, disabled by default (X-API-Key + ALLOW_RETRAIN)

Auth
----
All non-health endpoints require the `X-API-Key` header to match
`settings.API_KEY`. The Node backend is the only expected caller,
and it injects this header server-side — so the key never touches
a browser.
"""

from __future__ import annotations

import os
import time
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, Header, HTTPException, status, Request
from pydantic import BaseModel, Field, field_validator

from config.settings import settings
from services.explain_service import ExplainService
from services.predict_service import PredictService
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter()


# ======================================================================
# PYDANTIC SCHEMAS
# ======================================================================
class SymptomsRequest(BaseModel):
    """Body for /predict and /explain."""
    symptoms: List[str] = Field(
        ...,
        min_length=1,
        max_length=30,
        description="List of symptom strings, e.g. ['fever', 'nausea']",
    )

    @field_validator("symptoms")
    @classmethod
    def _strip_and_validate(cls, v: List[str]) -> List[str]:
        cleaned: List[str] = []
        for s in v:
            if not isinstance(s, str):
                raise ValueError("All symptoms must be strings.")
            s = s.strip().lower()
            if s:
                cleaned.append(s)
        if not cleaned:
            raise ValueError("At least one non-empty symptom is required.")
        return cleaned


class HealthResponse(BaseModel):
    status: str
    version: str
    predict_ready: bool
    explain_ready: bool
    device: str


class PredictionResponse(BaseModel):
    disease: str
    confidence: float
    top_features: List[str]
    all_top_k: List[Dict[str, Any]]
    latency_ms: float


class ExplanationResponse(BaseModel):
    predicted_disease: str
    shap_values: Dict[str, float]
    top_features: List[str]
    base_value: float
    is_available: bool
    note: str | None = None


class RetrainResponse(BaseModel):
    status: str
    message: str


# ======================================================================
# DEPENDENCIES
# ======================================================================
def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")) -> None:
    """Reject requests that don't carry the shared API key."""
    if not settings.API_KEY or x_api_key != settings.API_KEY:
        # Log at WARNING so you can spot abuse attempts in Render logs.
        logger.warning("Rejected request: invalid X-API-Key header.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key.",
        )


def verify_retrain_enabled() -> None:
    """Only allow /retrain if the operator explicitly enabled it."""
    enabled = os.getenv("ALLOW_RETRAIN", "false").lower() in ("1", "true", "yes")
    if not enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Retrain endpoint is disabled. "
                "Set ALLOW_RETRAIN=true in the environment to enable."
            ),
        )


# ======================================================================
# SERVICE ACCESSORS
# ----------------------------------------------------------------------
# The service instances are attached to `app.state` by `main.py` at
# startup. We retrieve them via the Request object so tests can
# override them cleanly.
# ======================================================================
def _get_predict_service(request) -> PredictService:
    svc = getattr(request.app.state, "predict_service", None)
    if svc is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="PredictService not initialized. Check /health.",
        )
    return svc


def _get_explain_service(request) -> ExplainService:
    svc = getattr(request.app.state, "explain_service", None)
    if svc is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ExplainService not initialized. Check /health.",
        )
    return svc


# ======================================================================
# ENDPOINTS
# ======================================================================
@router.get("/health", response_model=HealthResponse, tags=["System"])
def health(request: Request) -> HealthResponse:
    """
    Liveness + readiness. No auth — Render's health check hits this.

    - `predict_ready`: True if PredictService loaded the model + preprocessor.
    - `explain_ready`: True if SHAP DeepExplainer initialized successfully.
      (False is acceptable — /predict still works, /explain returns 503.)
    """
    predict_svc = getattr(request.app.state, "predict_service", None)
    explain_svc = getattr(request.app.state, "explain_service", None)

    predict_ready = predict_svc is not None and predict_svc.is_ready()
    explain_ready = explain_svc is not None and explain_svc.is_available()

    return HealthResponse(
        status="ok" if predict_ready else "degraded",
        version=settings.APP_VERSION,
        predict_ready=predict_ready,
        explain_ready=explain_ready,
        device=str(getattr(predict_svc, "device", "cpu")) if predict_svc else "n/a",
    )


@router.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Inference"],
    dependencies=[Depends(verify_api_key)],
)
def predict(payload: SymptomsRequest, request: Request) -> PredictionResponse:
    """
    Predict disease from symptoms. Returns disease name, confidence,
    top-k alternatives, matched symptoms, and measured latency.
    """
    svc = _get_predict_service(request)
    t0 = time.perf_counter()
    try:
        result = svc.predict(payload.symptoms)
    except ValueError as exc:
        # Client error — malformed input that escaped Pydantic.
        logger.warning("Predict ValueError: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        # Server error — unexpected (model forward crash, etc.).
        logger.exception("Predict endpoint failed: %s", exc)
        raise HTTPException(
            status_code=500, detail="Prediction failed. Check server logs."
        ) from exc

    logger.info(
        "/predict 200  disease=%s conf=%.4f  total=%.1fms",
        result["disease"], result["confidence"],
        (time.perf_counter() - t0) * 1000,
    )
    return PredictionResponse(**result)


@router.post(
    "/explain",
    response_model=ExplanationResponse,
    tags=["Inference"],
    dependencies=[Depends(verify_api_key)],
)
def explain(payload: SymptomsRequest, request: Request) -> ExplanationResponse:
    """
    Compute SHAP values for the current prediction.

    Called separately from /predict because SHAP adds 150–300ms. The
    frontend calls /predict first (fast), then /explain in parallel —
    users see the disease instantly, and the feature bar chart fades in.
    """
    svc = _get_explain_service(request)

    if not svc.is_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "SHAP explainer unavailable. /predict still works. "
                "Check startup logs for the cause."
            ),
        )

    t0 = time.perf_counter()
    try:
        result = svc.explain(payload.symptoms)
    except ValueError as exc:
        logger.warning("Explain ValueError: %s", exc)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        logger.exception("Explain RuntimeError: %s", exc)
        raise HTTPException(
            status_code=500, detail="Explanation computation failed."
        ) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Explain endpoint failed: %s", exc)
        raise HTTPException(
            status_code=500, detail="Explanation failed. Check server logs."
        ) from exc

    logger.info(
        "/explain 200  disease=%s top=%s  total=%.1fms",
        result.get("predicted_disease"), result.get("top_features"),
        (time.perf_counter() - t0) * 1000,
    )
    return ExplanationResponse(**result)


@router.post(
    "/retrain",
    response_model=RetrainResponse,
    tags=["Admin"],
    dependencies=[Depends(verify_api_key), Depends(verify_retrain_enabled)],
)
def retrain() -> RetrainResponse:
    """
    Admin-only retrain stub.

    Disabled by default. If enabled via ALLOW_RETRAIN=true, this endpoint
    would launch the training script. We intentionally do NOT implement
    HTTP-driven retraining in-process:

      - Training takes ~2 minutes (blocks the worker).
      - Render restarts on OOM during training kill the request.
      - It's a data-ops task, not a user-facing API.

    If you need a trigger, use Render Cron Jobs to run
    `python -m training.train` on a schedule. This endpoint exists for
    completeness and to document the decision.
    """
    return RetrainResponse(
        status="not_implemented",
        message=(
            "Use Render Cron Jobs or run `python -m training.train` "
            "on your server. HTTP retraining is intentionally disabled."
        ),
    )