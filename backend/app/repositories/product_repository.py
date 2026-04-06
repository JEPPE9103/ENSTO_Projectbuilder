from collections.abc import Sequence

from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Product, ProductRelation


class ProductRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_products(self, limit: int = 100, offset: int = 0) -> Sequence[Product]:
        stmt = select(Product).where(Product.active.is_(True)).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def search_products(
        self,
        query: str | None,
        category: str | None,
        series: str | None,
        color: str | None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[Product]:
        stmt = select(Product).where(Product.active.is_(True))

        if query:
            like = f"%{query.lower()}%"
            stmt = stmt.where(
                (Product.name.ilike(like)) | (Product.article_number.ilike(like))
            )

        if category:
            stmt = stmt.where(Product.category == category)
        if series:
            stmt = stmt.where(Product.series == series)
        if color:
            stmt = stmt.where(Product.color == color)

        stmt = stmt.offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, product_id: int) -> Product | None:
        return await self.session.get(Product, product_id)

    async def find_base_product(
        self, *, category: str, series: str, size: str, color: str
    ) -> Product | None:
        stmt = (
            select(Product)
            .where(
                Product.category == category,
                Product.series == series,
                Product.size == size,
                Product.color == color,
                Product.active.is_(True),
            )
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_related_products(
        self, base_product_id: int
    ) -> list[ProductRelation]:
        stmt = select(ProductRelation).where(
            ProductRelation.base_product_id == base_product_id
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

