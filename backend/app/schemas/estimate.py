from datetime import datetime
from typing import Any, List

from pydantic import BaseModel, Field


class SystemConfiguration(BaseModel):
    system_type: str = Field(examples=["channel"])
    category: str = Field(examples=["channel"])
    series: str
    size: str
    color: str
    total_length_meters: float
    inner_corners: int = 0
    outer_corners: int = 0
    tee_joints: int = 0
    end_caps: int = 0
    spare_percent: float = 0.0
    piece_length_meters: float
    extra_config: dict[str, Any] | None = None


class MaterialRow(BaseModel):
    product_id: int | None = None
    article_number: str
    product_name: str
    quantity: float
    unit: str
    comment: str | None = None


class EstimateCalculationResult(BaseModel):
    material_rows: List[MaterialRow]


class EstimateCreate(BaseModel):
    project_system_id: int
    material_rows: List[MaterialRow]


class EstimateRowRead(MaterialRow):
    id: int
    created_at: datetime


class EstimateRead(BaseModel):
    id: int
    project_system_id: int
    created_at: datetime
    rows: List[EstimateRowRead]

