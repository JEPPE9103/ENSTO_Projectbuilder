import csv
from pathlib import Path

from sqlalchemy import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Product, Project, ProjectSystem

DEMO_PROJECT_NAME = "Danderydsjukhus"


def products_csv_path() -> Path:
    """Resolve CSV for Docker (/app/backend/...) or local dev (backend/data/...)."""
    docker_path = Path("/app/backend/data/products.csv")
    if docker_path.exists():
        return docker_path
    local_path = Path(__file__).resolve().parents[2] / "data" / "products.csv"
    if local_path.exists():
        return local_path
    return docker_path


def parse_bool(value: str) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes"}


def parse_float(value: str):
    value = str(value).strip()
    if not value:
        return None
    return float(value)


def dev_unit_price_for_row(index: int, category: str) -> float | None:
    """
    Provide sparse demo pricing (not complete price list).
    Every third product gets a seeded price based on category.
    """
    if index % 3 != 0:
        return None

    base_by_category = {
        "connectors": 48.0,
        "branch connectors": 82.0,
        "boxes": 125.0,
        "linect": 66.0,
        "accessories": 39.0,
        "cables": 24.0,
    }
    base = base_by_category.get(category.lower(), 55.0)
    variation = float(index % 7)
    return round(base + variation, 2)


async def seed_products(session: AsyncSession) -> None:
    """
    Seed products from CSV when the catalog is empty.

    Does not DELETE existing rows: re-running seed after users have created
    projects (and rely on stable product ids / catalog) must remain safe.
    To reload CSV from scratch, truncate the `product` table manually or use
    a fresh database volume.
    """
    csv_path = products_csv_path()
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found: {csv_path}")

    count_stmt = select(func.count(Product.id))
    existing = (await session.execute(count_stmt)).scalar_one()
    if existing > 0:
        print(
            f"Products table already has {existing} row(s); skipping catalog seed "
            "(preserves user projects and stable product references)."
        )
        return

    products = []

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        _header = next(reader, None)

        for i, row in enumerate(reader, start=2):
            if not row or all(not cell.strip() for cell in row):
                continue

            if len(row) < 10:
                print(f"Skipping malformed row {i}: {row}")
                continue

            e_number = row[0].strip() or f"MISSING-{i}"
            article_number = row[1].strip()
            tail = row[-7:]

            name_parts = row[2:-7]
            name = ",".join(name_parts).strip()

            category = tail[0].strip() or "unknown"
            series = tail[1].strip() or "EnstoNet"
            size = tail[2].strip() or "unknown"
            color = tail[3].strip() or "unknown"
            unit = tail[4].strip() or "st"
            length_meters = parse_float(tail[5])
            active = parse_bool(tail[6])

            product = Product(
                e_number=e_number,
                article_number=article_number,
                name=name,
                category=category,
                series=series,
                size=size,
                color=color,
                unit=unit,
                unit_price=dev_unit_price_for_row(i, category),
                length_meters=length_meters,
                active=active,
            )
            products.append(product)

    session.add_all(products)
    await session.commit()

    print(f"Seeded {len(products)} products from CSV.")


async def seed_demo_project(session: AsyncSession) -> None:
    """
    Ensure the showcase demo project exists once.

    Never deletes user-created projects or systems. Safe to re-run after restarts.
    """
    existing = await session.execute(
        select(Project).where(Project.name == DEMO_PROJECT_NAME)
    )
    if existing.scalar_one_or_none() is not None:
        print(
            f'Demo project "{DEMO_PROJECT_NAME}" already exists; '
            "skipping demo seed (user projects unchanged)."
        )
        return

    project = Project(
        name=DEMO_PROJECT_NAME,
        customer_name="Danderyds sjukhus",
        country="Sweden",
        project_type="Hospital",
        notes="Showcase project for internal demos.",
    )
    session.add(project)
    await session.commit()
    await session.refresh(project)

    priced_stmt = select(Product).where(Product.active == True).where(Product.unit_price.is_not(None)).limit(6)  # noqa: E712
    result = await session.execute(priced_stmt)
    priced = list(result.scalars().all())
    if len(priced) < 4:
        fallback = await session.execute(select(Product).where(Product.active == True).limit(6))  # noqa: E712
        priced = list(fallback.scalars().all())

    items = []
    quantities = [12, 8, 6, 4, 10, 2]
    for i, p in enumerate(priced[:6]):
        override = None
        if p.unit_price is not None:
            override = round(float(p.unit_price) * (1.15 if i % 2 == 0 else 0.95), 2)
        items.append(
            {
                "productId": p.id,
                "eNumber": p.e_number,
                "articleNumber": p.article_number,
                "name": p.name,
                "category": p.category,
                "quantity": quantities[i],
                "unit": p.unit,
                "catalogUnitPrice": float(p.unit_price) if p.unit_price is not None else None,
                "unitPriceOverride": override,
            }
        )

    system = ProjectSystem(
        project_id=project.id,
        system_type="item-group",
        title="Patient rooms – power",
        config_json={
            "notes": "Patient rooms electrical distribution. Demo system with override pricing.",
            "items": items,
        },
    )
    session.add(system)
    await session.commit()
    print(f'Created demo project "{DEMO_PROJECT_NAME}" with sample system.')


async def run_seed(session: AsyncSession) -> None:
    await seed_products(session)
    await seed_demo_project(session)
