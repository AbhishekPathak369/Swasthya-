# ml/services/explain_service.py

"""
Explainability service for Swasthya+ using Captum (LayerIntegratedGradients).

Why Captum instead of shap.DeepExplainer?
-----------------------------------------
SHAP's DeepExplainer crashes on PyTorch models that start with an
nn.Embedding layer (integer input tensors cannot require gradients).
Captum's LayerIntegratedGradients is the industry standard for PyTorch,
handles embeddings natively, and computes mathematically equivalent
additive feature attributions.
"""

from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import torch

from config.settings import settings
from preprocessing.preprocessor import SymptomPreprocessor, PAD_INDEX
from utils.logger import get_logger

logger = get_logger(__name__)


class ExplainService:
    """
    Computes feature attributions (SHAP-equivalent) using Captum.
    """

    def __init__(
        self,
        model: torch.nn.Module,
        preprocessor: SymptomPreprocessor,
    ) -> None:
        self.model = model
        self.preprocessor = preprocessor
        self.device = torch.device("cpu")
        self._available = False

        try:
            from captum.attr import LayerIntegratedGradients

            logger.info("Building Captum LayerIntegratedGradients explainer...")

            # We explain the embedding layer directly. This is the standard
            # approach for NLP models in Captum.
            self.explainer = LayerIntegratedGradients(
                self.model,
                self.model.embedding,
            )
            self._available = True
            logger.info("Captum explainer ready.")

        except Exception as exc:
            logger.exception(
                "Captum initialization FAILED. /explain will return 503. "
                "Cause: %s", exc
            )
            self.explainer = None
            self._available = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def is_available(self) -> bool:
        return self._available and self.explainer is not None

    def explain(
        self,
        symptoms: List[str],
        top_k: int | None = None,
    ) -> Dict[str, Any]:
        """
        Compute feature attributions for a single prediction.
        """
        if not self.is_available():
            raise RuntimeError(
                "Explainer is unavailable. Check startup logs for the cause."
            )
        if not symptoms:
            raise ValueError("symptoms list is empty.")

        top_k = top_k or settings.SHAP_TOP_FEATURES

        # 1. Preprocess: strings -> tensor + known symptoms
        input_ids, known_symptoms = self.preprocessor.transform(symptoms)

        if not known_symptoms:
            return {
                "shap_values": {},
                "top_features": [],
                "base_value": 0.0,
                "is_available": True,
                "note": (
                    "None of the input symptoms are in the model's vocabulary. "
                    "Cannot attribute importance to <UNK> tokens."
                ),
            }

        input_ids = input_ids.to(self.device)

        # 2. Get predicted class
        with torch.no_grad():
            logits = self.model(input_ids)
        predicted_class = int(logits.argmax(dim=-1).item())

        # 3. Compute attributions using Captum
        # We use a zero-tensor baseline (representing "no symptoms")
        baseline = torch.zeros_like(input_ids).to(self.device)

        try:
            attributions, delta = self.explainer.attribute(
                inputs=input_ids,
                baselines=baseline,
                target=predicted_class,
                return_convergence_delta=True,
            )
        except Exception as exc:
            logger.exception("Captum attribution failed: %s", exc)
            raise RuntimeError(f"Explanation computation failed: {exc}") from exc

        # attributions shape: (1, seq_len, embed_dim)
        # We sum over the embedding dimension to get a (seq_len,) score per token
        token_importance = attributions.sum(dim=-1).squeeze(0).detach().cpu().numpy()

        # 4. Map token positions -> symptom strings
        symptom_shap: Dict[str, float] = {}
        for i, sym in enumerate(known_symptoms):
            if i < len(token_importance):
                symptom_shap[sym] = round(float(token_importance[i]), 4)

        # 5. Sort by absolute impact, keep top-k
        sorted_items = sorted(
            symptom_shap.items(),
            key=lambda kv: abs(kv[1]),
            reverse=True,
        )[:top_k]

        # 6. Base value: the delta / expected value baseline
        # Delta is the difference between the sum of attributions and the
        # model output difference. For reporting, we simply use the delta.
        base_value = float(delta[0].item()) if len(delta) > 0 else 0.0

        logger.info(
            "Explanation computed: predicted=%s top_features=%s",
            self.preprocessor.decode_disease(predicted_class),
            [s for s, _ in sorted_items],
        )

        return {
            "shap_values": dict(sorted_items),
            "top_features": [s for s, _ in sorted_items],
            "base_value": round(base_value, 4),
            "is_available": True,
            "predicted_disease": self.preprocessor.decode_disease(predicted_class),
        }