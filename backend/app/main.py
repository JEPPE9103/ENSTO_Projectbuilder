from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.db import init_db
from .routes import estimates, product_systems, products, projects


def create_app() -> FastAPI:
    app = FastAPI(
        title="ENSTO Sales Tool API",
        version="0.1.0",
        description="Internal API for ENSTO Sales Tool (demo/seed setup).",
    )

    # CORS for local dev (Next.js frontend)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(products.router, prefix="/products", tags=["products"])
    app.include_router(projects.router, prefix="/projects", tags=["projects"])
    app.include_router(
        product_systems.router, prefix="/projects/{project_id}/systems", tags=["systems"]
    )
    app.include_router(estimates.router, prefix="/estimates", tags=["estimates"])

    @app.on_event("startup")
    async def on_startup() -> None:
        await init_db()

    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

