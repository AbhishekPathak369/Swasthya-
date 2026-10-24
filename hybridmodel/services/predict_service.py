# ml/services/predict_service.py

"""
Inference service for the Swasthya+ ML API.

Single responsibility: turn a list of symptom strings into a
prediction dict. No HTTP handling, no SHAP (that's explain_service),
no training logic, no mock data.

Usage
-----
    # at FastAPI startup (once)
    predictor = PredictService()

    # per request
    result = predictor.predict(["fever", "nausea", "headache"])
    # -> {"disease": "Typhoid", "confidence": 0.96, "top_features": [...], ...}

Fail-loud contract
------------------
If `saved_models/hybrid_model.pth` or `saved_models/preprocessor.joblib`
is missing, the constructor raises. There is no silent fallback, no
random-init model, no zero-confidence prediction.
"""

from __future__ import annotations

import time
from typing import Any, Dict, List

import torch

from config.settings import settings
from models.hybrid_model import HybridDiseaseModel
from preprocessing.preprocessor import SymptomPreprocessor
from utils.logger import get_logger

logger = get_logger(__name__)


class PredictService:
    """Loads model + preprocessor once; serves predictions per request."""

    def __init__(self) -> None:
        logger.info("Initializing PredictService...")

        # ------------------------------------------------------------
        # 1. Load preprocessor (fails loudly if missing)
        # ------------------------------------------------------------
        self.preprocessor = SymptomPreprocessor.load()
        logger.info(
            "Preprocessor loaded: %d symptoms, %d diseases.",
            len(self.preprocessor.symptom2idx),
            self.preprocessor.get_num_classes(),
        )

        # ------------------------------------------------------------
        # 2. Load model (fails loudly if missing)
        # ------------------------------------------------------------
        self.device = torch.device("cpu")  # Render CPU-only
        self.model = HybridDiseaseModel.load(
            path=str(settings.MODEL_CHECKPOINT_PATH),
            map_location=self.device,
        )
        self.model.to(self.device)
        self.model.eval()
        logger.info(
            "Model loaded from %s (device=%s).",
            settings.MODEL_CHECKPOINT_PATH,
            self.device,
        )

        # ------------------------------------------------------------
        # 3. Consistency check: model.num_classes vs preprocessor
        # ------------------------------------------------------------
        if self.model.num_classes != self.preprocessor.get_num_classes():
            raise RuntimeError(
                f"Model has {self.model.num_classes} output classes, but the "
                f"preprocessor's label encoder has "
                f"{self.preprocessor.get_num_classes()} classes. "
                "The checkpoint and preprocessor are from different training runs. "
                "Retrain both together."
            )

        logger.info("PredictService ready.")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def predict(self, symptoms: List[str]) -> Dict[str, Any]:
        """
        Run inference for a single patient's symptom list.

        Parameters
        ----------
        symptoms : list[str]
            Raw symptom strings from the client, e.g. ["fever", "nausea"].

        Returns
        -------
        dict with keys:
            disease       : str   e.g. "Typhoid"
            confidence    : float e.g. 0.9643
            top_features  : list[str]   known symptoms that influenced input
            all_top_k     : list[dict]  top-3 (disease, confidence) pairs
            latency_ms    : float       wall-clock inference time
        """
        if not symptoms:
            raise ValueError("symptoms list is empty.")

        t0 = time.perf_counter()

        # 1. Preprocessor: strings -> (1, T) LongTensor + list of known symptoms
        input_ids, known_symptoms = self.preprocessor.transform(symptoms)

        if not known_symptoms:
            # Model can still predict (all <UNK>), but this is worth surfacing.
            logger.warning(
                "None of the provided symptoms are in the vocabulary: %s",
                symptoms,
            )

        input_ids = input_ids.to(self.device)

        # 2. Forward pass (no gradients — inference only)
        with torch.no_grad():
            result = self.model.predict(
                input_ids=input_ids,
                top_k=3,
            )

        # 3. Decode predicted class index -> disease name
        disease = self.preprocessor.decode_disease(result["predicted_class"])

        # 4. Build top-k list (name + confidence) for the API response
        all_top_k = []
        for idx, conf in zip(result["top_k_classes"], result["top_k_confs"]):
            all_top_k.append(
                {
                    "disease": self.preprocessor.decode_disease(int(idx)),
                    "confidence": round(float(conf), 4),
                }
            )

        latency_ms = (time.perf_counter() - t0) * 1000.0

        logger.info(
            "Prediction: disease=%s confidence=%.4f latency=%.2fms "
            "known_symptoms=%d/%d",
            disease,
            result["confidence"],
            latency_ms,
            len(known_symptoms),
            len(symptoms),
        )

        return {
            "disease": disease,
            "confidence": round(float(result["confidence"]), 4),
            "top_features": known_symptoms,   # actual matched symptoms
            "all_top_k": all_top_k,
            "latency_ms": round(latency_ms, 2),
        }

    # ------------------------------------------------------------------
    # Lightweight liveness probe used by /health
    # ------------------------------------------------------------------
    def is_ready(self) -> bool:
        """Return True if model + preprocessor are loaded and consistent."""
        return (
            self.model is not None
            and self.preprocessor is not None
            and self.preprocessor._is_fitted
        )