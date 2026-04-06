from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProductBase(BaseModel):
    e_number: str
    article_number: str
    name: str
    category: str
    series: str
    size: str
    color: str
    unit: str
    unit_price: Optional[float] = None
    length_meters: Optional[float] = None
    active: bool = True


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ProductSearchParams(BaseModel):
    query: str | None = None
    category: str | None = None
    series: str | None = None
    color: str | None = None
    limit: int = 50
    offset: int = 0