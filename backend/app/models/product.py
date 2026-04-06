from typing import List, Optional

from sqlalchemy import Column, Numeric
from sqlmodel import Field, Relationship, SQLModel

from .base import TimestampedModel


class ProductBase(SQLModel):
    e_number: str = Field(index=True, nullable=False, unique=True)
    article_number: str = Field(index=True, nullable=False, unique=True)
    name: str
    category: str
    series: str
    size: str
    color: str
    unit: str
    unit_price: Optional[float] = Field(
        default=None,
        sa_column=Column(Numeric(12, 2), nullable=True),
    )
    length_meters: Optional[float] = None
    active: bool = True


class Product(ProductBase, TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    outgoing_relations: List["ProductRelation"] = Relationship(
        back_populates="base_product",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "foreign_keys": "ProductRelation.base_product_id",
        },
    )
    incoming_relations: List["ProductRelation"] = Relationship(
        back_populates="related_product",
        sa_relationship_kwargs={
            "cascade": "all, delete-orphan",
            "foreign_keys": "ProductRelation.related_product_id",
        },
    )


class ProductRelation(TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    base_product_id: int = Field(foreign_key="product.id", nullable=False, index=True)
    related_product_id: int = Field(
        foreign_key="product.id", nullable=False, index=True
    )
    relation_type: str

    base_product: Optional["Product"] = Relationship(
        back_populates="outgoing_relations",
        sa_relationship_kwargs={
            "lazy": "joined",
            "foreign_keys": "ProductRelation.base_product_id",
        },
    )
    related_product: Optional["Product"] = Relationship(
        back_populates="incoming_relations",
        sa_relationship_kwargs={
            "lazy": "joined",
            "foreign_keys": "ProductRelation.related_product_id",
        },
    )