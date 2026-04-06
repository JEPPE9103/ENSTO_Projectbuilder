from collections.abc import Sequence

from sqlmodel.ext.asyncio.session import AsyncSession

from app.repositories import ProductRepository
from app.schemas import ProductRead


class ProductService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.product_repo = ProductRepository(session)

    async def list_products(self, limit: int = 100, offset: int = 0) -> Sequence[ProductRead]:
        products = await self.product_repo.list_products(limit=limit, offset=offset)
        return [ProductRead.model_validate(p, from_attributes=True) for p in products]

    async def search_products(
        self,
        *,
        query: str | None,
        category: str | None,
        series: str | None,
        color: str | None,
        limit: int = 50,
        offset: int = 0,
    ) -> Sequence[ProductRead]:
        products = await self.product_repo.search_products(
            query=query,
            category=category,
            series=series,
            color=color,
            limit=limit,
            offset=offset,
        )
        return [ProductRead.model_validate(p, from_attributes=True) for p in products]

    async def get_product(self, product_id: int) -> ProductRead | None:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            return None
        return ProductRead.model_validate(product, from_attributes=True)