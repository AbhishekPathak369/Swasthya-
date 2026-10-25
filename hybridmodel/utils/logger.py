# ml/utils/logger.py

"""
Centralized logging for the Swasthya+ ML Service.

Two handlers are installed on the root logger:
  1. ConsoleHandler (plain text)  -> human readable during local dev
  2. RotatingFileHandler (JSON)   -> structured logs for Render / debugging

Every module should obtain its logger via:
    from utils.logger import get_logger
    logger = get_logger(__name__)

Never call logging.basicConfig() anywhere else in the project.
"""

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

from pythonjsonlogger import jsonlogger

from config.settings import settings


# ------------------------------------------------------------------
# Prevent duplicate handler registration if this module is reloaded
# (e.g. uvicorn --reload, or pytest importing it multiple times).
# ------------------------------------------------------------------
_CONFIGURED = False


def _configure_root_logger() -> None:
    """Configure the root logger exactly once."""
    global _CONFIGURED
    if _CONFIGURED:
        return

    root = logging.getLogger()
    root.setLevel(settings.LOG_LEVEL.upper())

    # Remove any handlers that may have been added by libraries
    for h in list(root.handlers):
        root.removeHandler(h)

    # ---------------------------------------------------------------
    # Handler 1: Console (plain text)
    # ---------------------------------------------------------------
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(settings.LOG_LEVEL.upper())
    console_fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    console_handler.setFormatter(console_fmt)
    root.addHandler(console_handler)

    # ---------------------------------------------------------------
    # Handler 2: Rotating JSON file (for Render persistent disk if mounted)
    # ---------------------------------------------------------------
    log_path: Path = settings.LOG_FILE_PATH
    try:
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = RotatingFileHandler(
            filename=str(log_path),
            maxBytes=10 * 1024 * 1024,   # 10 MB per file
            backupCount=3,               # keep 3 backups
            encoding="utf-8",
        )
        file_handler.setLevel(settings.LOG_LEVEL.upper())
        json_fmt = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
            rename_fields={"asctime": "timestamp", "levelname": "level"},
        )
        file_handler.setFormatter(json_fmt)
        root.addHandler(file_handler)
    except (OSError, PermissionError) as exc:
        # On Render, /opt/render/project may be read-only in some setups.
        # We do NOT fail startup — console logging is enough in that case.
        root.warning(
            "Could not attach JSON file handler at %s: %s. "
            "Falling back to console-only logging.",
            log_path,
            exc,
        )

    # ---------------------------------------------------------------
    # Silence noisy third-party loggers
    # ---------------------------------------------------------------
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(logging.INFO)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("shap").setLevel(logging.WARNING)
    logging.getLogger("matplotlib").setLevel(logging.WARNING)

    _CONFIGURED = True


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger. Ensures the root logger is configured.

    Usage:
        logger = get_logger(__name__)
        logger.info("Model loaded from %s", path)
    """
    _configure_root_logger()
    return logging.getLogger(name)


# Configure immediately on import so that startup logs are captured.
_configure_root_logger()