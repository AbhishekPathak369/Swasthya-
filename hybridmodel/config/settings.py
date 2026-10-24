# ml/config/settings.py

"""
Centralized configuration for the Swasthya+ ML Service.

All paths, hyperparameters, and secrets are loaded from environment
variables (with sensible defaults for local development). No other
module in this project should hardcode a file path or magic number.
"""

from pathlib import Path
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# ------------------------------------------------------------------
# Project root (this file lives at ml/config/settings.py -> root = ml/)
# ------------------------------------------------------------------
BASE_DIR: Path = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables or .env file.

    Precedence (highest to lowest):
        1. Actual environment variables (Render dashboard)
        2. .env file in ml/ directory
        3. Default values defined below
    """

    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ==============================================================
    # API / SERVER
    # ==============================================================
    APP_NAME: str = "Swasthya+ ML Service"
    APP_VERSION: str = "1.0.0"
    API_KEY: str = Field(
        default="dev-secret-key-change-me",
        description="Shared secret required in the X-API-Key header.",
    )
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ==============================================================
    # PATHS
    # ==============================================================
    SAVED_MODELS_DIR: Path = BASE_DIR / "saved_models"
    DATASETS_DIR: Path = BASE_DIR / "datasets"
    LOGS_DIR: Path = BASE_DIR / "logs"

    MODEL_CHECKPOINT_NAME: str = "hybrid_model.pth"
    PREPROCESSOR_NAME: str = "preprocessor.joblib"
    DATASET_NAME: str = "symptom_disease_dataset.csv"

    @property
    def MODEL_CHECKPOINT_PATH(self) -> Path:
        return self.SAVED_MODELS_DIR / self.MODEL_CHECKPOINT_NAME

    @property
    def PREPROCESSOR_PATH(self) -> Path:
        return self.SAVED_MODELS_DIR / self.PREPROCESSOR_NAME

    @property
    def DATASET_PATH(self) -> Path:
        return self.DATASETS_DIR / self.DATASET_NAME

    # ==============================================================
    # MODEL HYPERPARAMETERS (must match training & inference)
    # ==============================================================
    VOCAB_SIZE: int = 2000          # max number of unique symptom tokens
    MAX_SEQ_LEN: int = 20           # max symptoms per patient input
    EMBED_DIM: int = 64             # paper: "64-dim symptom vectors"
    NUM_HEADS: int = 4              # Transformer attention heads
    NUM_TRANSFORMER_LAYERS: int = 2 # lightweight Transformer encoder
    FF_DIM: int = 128               # feed-forward hidden dim
    LSTM_HIDDEN_DIM: int = 128      # BiLSTM hidden size per direction
    DROPOUT: float = 0.3
    NUM_CLASSES: int = 41           # paper: "softmax (41 classes)"

    # ==============================================================
    # TRAINING
    # ==============================================================
    BATCH_SIZE: int = 32
    LEARNING_RATE: float = 1e-3
    EPOCHS: int = 30
    TEST_SPLIT: float = 0.2
    RANDOM_SEED: int = 42

    # ==============================================================
    # EXPLAINABILITY (SHAP)
    # ==============================================================
    SHAP_BACKGROUND_SAMPLES: int = 100   # samples used to build SHAP background
    SHAP_TOP_FEATURES: int = 5           # return this many top features

    # ==============================================================
    # LOGGING
    # ==============================================================
    LOG_LEVEL: str = "INFO"
    LOG_FILE_NAME: str = "ml_service.log"

    @property
    def LOG_FILE_PATH(self) -> Path:
        return self.LOGS_DIR / self.LOG_FILE_NAME

    # ==============================================================
    # CORS
    # ==============================================================
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",       # Vite dev server
        "http://localhost:3000",       # CRA / Node backend local
        "https://swasthya-backend.onrender.com",  # deployed Node backend
    ]


# ------------------------------------------------------------------
# Singleton instance – import this everywhere
# ------------------------------------------------------------------
settings = Settings()

# Ensure required directories exist at import time
settings.SAVED_MODELS_DIR.mkdir(parents=True, exist_ok=True)
settings.DATASETS_DIR.mkdir(parents=True, exist_ok=True)
settings.LOGS_DIR.mkdir(parents=True, exist_ok=True)