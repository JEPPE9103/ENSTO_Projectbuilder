from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.schemas import ProjectSystemCreate, ProjectSystemRead, ProjectSystemUpdate
from app.services import ProjectService

router = APIRouter()


def get_project_service(session: AsyncSession = Depends(get_session)) -> ProjectService:
    return ProjectService(session)


@router.post("", response_model=ProjectSystemRead, status_code=201)
async def create_project_system(
    project_id: int,
    payload: ProjectSystemCreate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectSystemRead:
    return await service.add_system_to_project(project_id=project_id, data=payload)


@router.get("", response_model=Sequence[ProjectSystemRead])
async def list_project_systems(
    project_id: int,
    service: ProjectService = Depends(get_project_service),
) -> Sequence[ProjectSystemRead]:
    return await service.list_systems_for_project(project_id=project_id)


@router.put("/{system_id}", response_model=ProjectSystemRead)
async def update_project_system(
    project_id: int,
    system_id: int,
    payload: ProjectSystemUpdate,
    service: ProjectService = Depends(get_project_service),
) -> ProjectSystemRead:
    updated = await service.update_project_system(
        project_id=project_id, system_id=system_id, data=payload
    )
    if not updated:
        raise HTTPException(status_code=404, detail="System not found")
    return updated


@router.delete("/{system_id}", status_code=204)
async def delete_project_system(
    project_id: int,
    system_id: int,
    service: ProjectService = Depends(get_project_service),
) -> Response:
    deleted = await service.delete_project_system(project_id=project_id, system_id=system_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="System not found")
    return Response(status_code=204)

