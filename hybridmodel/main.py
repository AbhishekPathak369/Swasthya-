# ml/main.py

"""
Swasthya+ ML Service — FastAPI application entrypoint.

Local run:
    cd ml
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Render start command:
    uvicorn main:app --host 0.0.0.0 --port $PORT

Startup policy
--------------
- PredictService MUST load (model + preprocessor). Otherwise startup fails.
- ExplainService attempts to initialize SHAP. If it fails, the service
  still starts, but /explain returns 503 while /predict works normally.

Both services are attached to `app.state` so `routes.py` can retrieve
them per request without globals.
"""

from __future__ import annotations

import os
import time
from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routes import router
from config.settings import settings
from services.explain_service import ExplainService
from services.predict_service import PredictService
from utils.logger import get_logger

logger = get_logger(__name__)


# ======================================================================
# LIFESPAN (startup + shutdown)
# ======================================================================
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """
    FastAPI lifespan handler (replaces deprecated on_event).

    Startup:
        - Build PredictService (fails loudly if artifacts missing)
        - Build ExplainService (soft-fails if SHAP broken)
        - Attach both to app.state

    Shutdown:
        - Log a clean shutdown message (nothing to close in our case —
          PyTorch objects are cleaned up by the process exit)
    """
    t0 = time.perf_counter()
    logger.info("=" * 60)
    logger.info("Starting %s v%s", settings.APP_NAME, settings.APP_VERSION)
    logger.info("=" * 60)

    # ------------------------------------------------------------------
    # 1. PredictService — REQUIRED
    # ------------------------------------------------------------------
    logger.info("Loading PredictService (model + preprocessor)...")
    try:
        predict_service = PredictService()
    except Exception as exc:
        logger.exception("FATAL: PredictService failed to initialize: %s", exc)
        # Re-raise: FastAPI startup aborts, uvicorn exits non-zero,
        # Render sees the failure and does not route traffic.
        raise RuntimeError(
            "PredictService initialization failed. "
            "Check that saved_models/hybrid_model.pth and "
            "saved_models/preprocessor.joblib exist and are valid."
        ) from exc

    app.state.predict_service = predict_service
    logger.info("PredictService ready.")

    # ------------------------------------------------------------------
    # 2. ExplainService — OPTIONAL
    # ------------------------------------------------------------------
    logger.info("Loading ExplainService (SHAP DeepExplainer)...")
    try:
        explain_service = ExplainService(
            model=predict_service.model,
            preprocessor=predict_service.preprocessor,
        )
        if explain_service.is_available():
            logger.info("ExplainService ready (SHAP available).")
        else:
            logger.warning(
                "ExplainService initialized but SHAP is unavailable. "
                "/explain will return 503; /predict works normally."
            )
    except Exception as exc:  # noqa: BLE001
        logger.exception(
            "ExplainService initialization failed (non-fatal): %s. "
            "Continuing with /predict only.",
            exc,
        )
        explain_service = None

    app.state.explain_service = explain_service

    # ------------------------------------------------------------------
    # 3. Startup summary
    # ------------------------------------------------------------------
    elapsed = time.perf_counter() - t0
    logger.info("Startup complete in %.2fs.", elapsed)
    logger.info("=" * 60)

    yield  # <-- application runs here

    # ------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------
    logger.info("Shutting down %s.", settings.APP_NAME)


# ======================================================================
# APPLICATION FACTORY
# ======================================================================
def create_app() -> FastAPI:
    """
    Build and configure the FastAPI application.

    Exposed as a function so tests can create isolated instances.
    """
    docs_enabled = os.getenv("ENABLE_DOCS", "true").lower() in ("1", "true", "yes")

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Swasthya+ Disease Prediction API. "
            "Hybrid Deep Learning (Transformer + BiLSTM + Attention) "
            "with SHAP explainability."
        ),
        docs_url="/docs" if docs_enabled else None,
        redoc_url="/redoc" if docs_enabled else None,
        openapi_url="/openapi.json" if docs_enabled else None,
        lifespan=lifespan,
    )

    # ------------------------------------------------------------------
    # CORS
    # ------------------------------------------------------------------
    # Server-to-server calls (Node -> FastAPI) don't trigger CORS, so
    # this list only matters for direct browser access. We keep it
    # restrictive on purpose.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=False,   # we use API key, not cookies
        allow_methods=["POST", "GET", "OPTIONS"],
        allow_headers=["*"],
    )

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------
    app.include_router(router)
    logger.info("Routes registered.")

    # ------------------------------------------------------------------
    # Global exception handlers
    # ------------------------------------------------------------------
    @app.exception_handler(RequestValidationError)
    async def _validation_exception_handler(request: Request, exc: RequestValidationError):
        """
        Wrap Pydantic validation errors in a consistent JSON envelope.
        FastAPI already returns 422, but the default shape varies.
        """
        logger.warning(
            "Validation error on %s %s: %s",
            request.method, request.url.path, exc.errors(),
        )
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": "validation_error",
                "path": request.url.path,
                "details": exc.errors(),
            },
        )

    @app.exception_handler(Exception)
    async def _unhandled_exception_handler(request: Request, exc: Exception):
        """
        Catch-all for anything not handled elsewhere. Logs full traceback,
        returns a generic 500 to the client (no stack traces leaked).
        """
        logger.exception(
            "Unhandled exception on %s %s: %s",
            request.method, request.url.path, exc,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "internal_server_error",
                "path": request.url.path,
            },
        )

    return app


# ----------------------------------------------------------------------
# Expose `app` for `uvicorn main:app`
# ----------------------------------------------------------------------
app = create_app()


# ----------------------------------------------------------------------
# Local dev convenience
# ----------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower(),
    )