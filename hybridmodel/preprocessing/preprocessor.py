# ml/preprocessing/preprocessor.py

"""
Symptom preprocessor for the Swasthya+ ML Service.

Responsibilities
----------------
1. TRAINING:
   - Load the user-provided Kaggle CSV
   - Build a symptom vocabulary (symptom -> integer id)
   - Build a disease label encoder (disease name -> integer id)
   - Persist both to disk via joblib

2. INFERENCE:
   - Load the persisted artifact
   - Convert a list of symptom strings -> padded LongTensor
   - Decode predicted class index -> disease name

Contract
--------
- The vocabulary and label encoder are built ONCE during training
  and reused verbatim during inference.
- If the artifact file is missing at inference time, `load()` raises
  FileNotFoundError. There is NO fallback vocabulary. No mock data.
"""

from __future__ import annotations

import joblib
import pandas as pd
import torch
from sklearn.preprocessing import LabelEncoder
from typing import Dict, List, Tuple

from config.settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)

# Special tokens
PAD_TOKEN = "<PAD>"
UNK_TOKEN = "<UNK>"
PAD_INDEX = 0
UNK_INDEX = 1


class SymptomPreprocessor:
    """Builds, saves, loads, and applies symptom tokenization."""

    def __init__(self) -> None:
        self.symptom2idx: Dict[str, int] = {}
        self.idx2symptom: Dict[int, str] = {}
        self.label_encoder: LabelEncoder | None = None
        self.max_seq_len: int = settings.MAX_SEQ_LEN
        self.vocab_size: int = settings.VOCAB_SIZE
        self._is_fitted: bool = False

    # ------------------------------------------------------------------
    # TRAINING: fit on the Kaggle CSV
    # ------------------------------------------------------------------
    def fit(self, csv_path: str | None = None) -> None:
        """
        Build vocabulary and label encoder from the Kaggle CSV.

        Expected CSV columns
        --------------------
        The Kaggle "Disease-Symptom Prediction" datasets commonly have
        either:
          - Columns: 'disease', 'symptom1', 'symptom2', ... (wide form)
          - Columns: 'disease', 'symptoms'  (list/semicolon/comma string)

        We support both. See `_parse_row_symptoms()` for details.
        """
        path = csv_path or str(settings.DATASET_PATH)
        logger.info("Fitting preprocessor on dataset: %s", path)

        df = pd.read_csv(path)
        if df.empty:
            raise ValueError(f"Dataset at {path} is empty.")

        df.columns = [c.strip().lower() for c in df.columns]

        if "disease" not in df.columns:
            raise ValueError(
                f"Dataset must contain a 'disease' column. Got: {list(df.columns)}"
            )

        # 1. Collect all symptoms across all rows
        all_symptoms: set[str] = set()
        for _, row in df.iterrows():
            for sym in self._parse_row_symptoms(row):
                if sym:
                    all_symptoms.add(sym)

        if len(all_symptoms) < 10:
            raise ValueError(
                f"Only {len(all_symptoms)} unique symptoms found. "
                "Dataset likely malformed."
            )

        # 2. Sort for determinism, cap at VOCAB_SIZE
        sorted_symptoms = sorted(all_symptoms)
        if len(sorted_symptoms) + 2 > self.vocab_size:
            logger.warning(
                "Found %d unique symptoms, but VOCAB_SIZE=%d. Truncating.",
                len(sorted_symptoms),
                self.vocab_size,
            )
            sorted_symptoms = sorted_symptoms[: self.vocab_size - 2]

        # 3. Build vocabulary (PAD=0, UNK=1, then symptoms)
        self.symptom2idx = {PAD_TOKEN: PAD_INDEX, UNK_TOKEN: UNK_INDEX}
        for i, sym in enumerate(sorted_symptoms, start=2):
            self.symptom2idx[sym] = i
        self.idx2symptom = {i: s for s, i in self.symptom2idx.items()}

        # 4. Fit label encoder on disease column
        diseases = df["disease"].astype(str).str.strip().str.lower()
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(diseases)

        num_diseases = len(self.label_encoder.classes_)
        logger.info(
            "Preprocessor fitted: %d symptoms, %d diseases.",
            len(self.symptom2idx),
            num_diseases,
        )
        if num_diseases != settings.NUM_CLASSES:
            logger.warning(
                "Dataset has %d disease classes, but settings.NUM_CLASSES=%d. "
                "Update settings.NUM_CLASSES and retrain.",
                num_diseases,
                settings.NUM_CLASSES,
            )

        self._is_fitted = True

    # ------------------------------------------------------------------
    # PERSISTENCE
    # ------------------------------------------------------------------
    def save(self, path: str | None = None) -> None:
        if not self._is_fitted:
            raise RuntimeError("Cannot save an unfitted preprocessor.")
        out = path or str(settings.PREPROCESSOR_PATH)
        artifact = {
            "symptom2idx": self.symptom2idx,
            "idx2symptom": self.idx2symptom,
            "label_encoder": self.label_encoder,
            "max_seq_len": self.max_seq_len,
            "vocab_size": self.vocab_size,
        }
        joblib.dump(artifact, out)
        logger.info("Saved preprocessor artifact to %s", out)

    @classmethod
    def load(cls, path: str | None = None) -> "SymptomPreprocessor":
        """
        Load a previously fitted preprocessor. Raises FileNotFoundError
        if the artifact does not exist — no silent fallback.
        """
        from pathlib import Path
        p = Path(path or str(settings.PREPROCESSOR_PATH))
        if not p.exists():
            raise FileNotFoundError(
                f"Preprocessor artifact not found at {p}. "
                "Run training (training/train.py) before starting the API."
            )
        artifact = joblib.load(p)
        obj = cls()
        obj.symptom2idx = artifact["symptom2idx"]
        obj.idx2symptom = artifact["idx2symptom"]
        obj.label_encoder = artifact["label_encoder"]
        obj.max_seq_len = artifact["max_seq_len"]
        obj.vocab_size = artifact["vocab_size"]
        obj._is_fitted = True
        logger.info(
            "Loaded preprocessor from %s (%d symptoms, %d diseases).",
            p,
            len(obj.symptom2idx),
            len(obj.label_encoder.classes_) if obj.label_encoder else 0,
        )
        return obj

    # ------------------------------------------------------------------
    # INFERENCE: string symptoms -> padded tensor
    # ------------------------------------------------------------------
    def transform(self, symptoms: List[str]) -> Tuple[torch.Tensor, List[str]]:
        """
        Convert a list of symptom strings into a padded LongTensor.

        Returns
        -------
        tensor : shape (1, max_seq_len), dtype=torch.long
        known_symptoms : cleaned symptom strings that exist in the vocab
        """
        if not self._is_fitted:
            raise RuntimeError("Preprocessor is not fitted. Call load() first.")

        cleaned = [self._normalize(s) for s in symptoms if s and s.strip()]
        # Deduplicate while preserving order
        seen = set()
        unique: List[str] = []
        for s in cleaned:
            if s not in seen:
                seen.add(s)
                unique.append(s)

        indices = [self.symptom2idx.get(s, UNK_INDEX) for s in unique]
        known = [s for s in unique if s in self.symptom2idx]
        unknown = [s for s in unique if s not in self.symptom2idx]
        if unknown:
            logger.warning("Unknown symptoms mapped to <UNK>: %s", unknown)

        # Pad / truncate to max_seq_len
        indices = indices[: self.max_seq_len]
        pad_len = self.max_seq_len - len(indices)
        indices = indices + [PAD_INDEX] * pad_len

        tensor = torch.tensor([indices], dtype=torch.long)
        return tensor, known

    def decode_disease(self, class_index: int) -> str:
        """Map predicted class index -> human-readable disease name."""
        if not self._is_fitted or self.label_encoder is None:
            raise RuntimeError("Preprocessor is not fitted.")
        classes = self.label_encoder.classes_
        if not (0 <= class_index < len(classes)):
            raise IndexError(f"Class index {class_index} out of range.")
        return str(classes[class_index]).title()

    # ------------------------------------------------------------------
    # HELPERS
    # ------------------------------------------------------------------
    @staticmethod
    def _normalize(s: str) -> str:
        """Lowercase + strip + collapse whitespace."""
        return " ".join(str(s).strip().lower().split())

    @staticmethod
    def _parse_row_symptoms(row: pd.Series) -> List[str]:
        """
        Extract symptoms from a CSV row, supporting two schemas:

        Schema A (wide):
            disease, symptom1, symptom2, symptom3, ...
        Schema B (list string):
            disease, symptoms = "fever; cough; headache"  (or comma/pipe)
        """
        symptoms: List[str] = []

        # Schema B: a single 'symptoms' column holding a delimited string
        if "symptoms" in row.index:
            raw = row["symptoms"]
            if isinstance(raw, str) and raw.strip():
                for sep in [";", "|", ","]:
                    if sep in raw:
                        parts = [p.strip() for p in raw.split(sep)]
                        symptoms.extend(p for p in parts if p)
                        break
                else:
                    symptoms.append(raw.strip())

        # Schema A: columns named symptom1, symptom2, ...
        for col in row.index:
            if col.startswith("symptom") and col != "symptoms":
                val = row[col]
                if isinstance(val, str) and val.strip():
                    symptoms.append(val.strip())

        # Normalize (lowercase, collapse whitespace, replace underscores)
        normalized = []
        for s in symptoms:
            s = s.replace("_", " ").replace("-", " ")
            s = SymptomPreprocessor._normalize(s)
            if s:
                normalized.append(s)
        return normalized

    # ------------------------------------------------------------------
    # Utility for training script
    # ------------------------------------------------------------------
    def get_num_classes(self) -> int:
        if not self._is_fitted or self.label_encoder is None:
            raise RuntimeError("Preprocessor is not fitted.")
        return len(self.label_encoder.classes_)