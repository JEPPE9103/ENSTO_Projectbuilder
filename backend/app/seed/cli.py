import asyncio

from app.core.db import get_session, init_db
from app.seed.seed_data import run_seed


async def main() -> None:
  await init_db()
  # Using dependency-style generator manually
  async for session in get_session():
    await run_seed(session)
    break


if __name__ == "__main__":
  asyncio.run(main())

