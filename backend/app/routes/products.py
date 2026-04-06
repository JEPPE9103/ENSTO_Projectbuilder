from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.schemas import ProductRead
from app.services import ProductService

router = APIRouter()


def get_product_service(session: AsyncSession = Depends(get_session)) -> ProductService:
    return ProductService(session)


@router.get("", response_model=Sequence[ProductRead])
async def list_products(
    service: ProductService = Depends(get_product_service),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> Sequence[ProductRead]:
    return await service.list_products(limit=limit, offset=offset)


@router.get("/search", response_model=Sequence[ProductRead])
async def search_products(
    q: str | None = Query(None, description="Free-text search in name/article number"),
    category: str | None = None,
    series: str | None = None,
    color: str | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    service: ProductService = Depends(get_product_service),
) -> Sequence[ProductRead]:
    return await service.search_products(
        query=q,
        category=category,
        series=series,
        color=color,
        limit=limit,
        offset=offset,
    )


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
) -> ProductRead:
    product = await service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

