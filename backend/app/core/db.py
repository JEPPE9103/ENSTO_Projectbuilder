from collections.abc import AsyncGenerator

from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

from .config import settings


engine: AsyncEngine | None = None
async_session_maker: sessionmaker | None = None


async def init_db() -> None:
    """
    Initialize the database engine and create all tables.
    Intended for demo/seed setup; in production use migrations.
    """
    global engine, async_session_maker

    if engine is not None:
        return

    engine = create_async_engine(str(settings.database_url), echo=False, future=True)
    async_session_maker = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    from app.models import base  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
        await conn.execute(
            text(
                "ALTER TABLE product "
                "ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2)"
            )
        )


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if async_session_maker is None:
        raise RuntimeError("Database not initialised. Call init_db() first.")

    async with async_session_maker() as session:
        yield session

