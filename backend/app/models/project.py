from typing import Dict, List, Optional

from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

from .base import TimestampedModel


class ProjectBase(SQLModel):
    name: str
    customer_name: str
    country: str
    project_type: str
    notes: str | None = None


class Project(ProjectBase, TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    systems: List["ProjectSystem"] = Relationship(
        back_populates="project",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class ProjectSystemBase(SQLModel):
    project_id: int = Field(foreign_key="project.id", index=True)
    system_type: str
    title: str
    config_json: Dict | None = Field(
        default=None,
        sa_type=JSONB,
    )


class ProjectSystem(ProjectSystemBase, TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    project: Optional["Project"] = Relationship(back_populates="systems")
    estimates: List["Estimate"] = Relationship(
        back_populates="project_system",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class EstimateBase(SQLModel):
    project_system_id: int = Field(foreign_key="projectsystem.id", index=True)


class Estimate(EstimateBase, TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    project_system: Optional["ProjectSystem"] = Relationship(back_populates="estimates")
    rows: List["EstimateRow"] = Relationship(
        back_populates="estimate",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )


class EstimateRowBase(SQLModel):
    estimate_id: int = Field(foreign_key="estimate.id", index=True)
    product_id: int | None = Field(
        default=None, foreign_key="product.id", index=True
    )
    article_number_snapshot: str
    product_name_snapshot: str
    quantity: float
    unit: str
    comment: str | None = None


class EstimateRow(EstimateRowBase, TimestampedModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    estimate: Optional["Estimate"] = Relationship(back_populates="rows")