from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    customer_name: str
    country: str
    project_type: str
    notes: Optional[str] = None


class ProjectRead(ProjectCreate):
    id: int
    created_at: datetime
    updated_at: datetime


class ProjectSystemCreate(BaseModel):
    system_type: str
    title: str
    config_json: dict[str, Any] | None = None


class ProjectSystemUpdate(ProjectSystemCreate):
    pass


class ProjectSystemRead(ProjectSystemCreate):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime

