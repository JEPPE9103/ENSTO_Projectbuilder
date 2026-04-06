from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.schemas import (
    ProjectCreate,
    ProjectRead,
)
from app.services import ProjectService

router = APIRouter()


def get_project_service(session: AsyncSession = Depends(get_session)) -> ProjectService:
    return ProjectService(session)


@router.post("", response_model=ProjectRead, status_code=201)
async def create_project(
    payload: ProjectCreate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    return await service.create_project(payload)


@router.get("", response_model=Sequence[ProjectRead])
async def list_projects(
    service: ProjectService = Depends(get_project_service),
) -> Sequence[ProjectRead]:
    return await service.list_projects()


@router.get("/{project_id}", response_model=ProjectRead)
async def get_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
) -> ProjectRead:
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
) -> Response:
    deleted = await service.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Project not found")
    return Response(status_code=204)

