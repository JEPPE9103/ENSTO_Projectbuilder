import csv
from pathlib import Path

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Product


CSV_PATH = Path("data/products.csv")


async def import_products(session: AsyncSession) -> None:
    """
    Import products from CSV into database.
    """

    if not CSV_PATH.exists():
        print("CSV file not found:", CSV_PATH)
        return

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        count = 0

        for row in reader:

            # Check if product already exists
            existing = await session.execute(
                select(Product).where(Product.article_number == row["article_number"])
            )

            if existing.scalars().first():
                continue

            product = Product(
                e_number=row["e_number"],
                article_number=row["article_number"],
                name=row["name"],
                category=row["category"],
                series=row["series"],
                size=row["size"],
                color=row["color"],
                unit=row["unit"],
                unit_price=float(row["unit_price"]) if row.get("unit_price") else None,
                length_meters=float(row["length_meters"]) if row["length_meters"] else None,
                active=row["active"].lower() == "true",
            )

            session.add(product)
            count += 1

        await session.commit()

        print(f"Imported {count} new products")