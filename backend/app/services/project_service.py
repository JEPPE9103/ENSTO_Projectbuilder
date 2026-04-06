from collections.abc import Sequence

from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Project, ProjectSystem
from app.repositories import ProjectRepository, ProjectSystemRepository
from app.schemas import (
    ProjectCreate,
    ProjectRead,
    ProjectSystemCreate,
    ProjectSystemRead,
    ProjectSystemUpdate,
)


class ProjectService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.project_repo = ProjectRepository(session)
        self.system_repo = ProjectSystemRepository(session)

    async def create_project(self, data: ProjectCreate) -> ProjectRead:
        project = Project(**data.model_dump())
        created = await self.project_repo.create_project(project)
        return ProjectRead.model_validate(created, from_attributes=True)

    async def list_projects(self) -> Sequence[ProjectRead]:
        projects = await self.project_repo.list_projects()
        return [ProjectRead.model_validate(p, from_attributes=True) for p in projects]

    async def get_project(self, project_id: int) -> ProjectRead | None:
        project = await self.project_repo.get_project(project_id)
        if not project:
            return None
        return ProjectRead.model_validate(project, from_attributes=True)

    async def add_system_to_project(
        self, project_id: int, data: ProjectSystemCreate
    ) -> ProjectSystemRead:
        system = ProjectSystem(project_id=project_id, **data.model_dump())
        created = await self.system_repo.create_system(system)
        return ProjectSystemRead.model_validate(created, from_attributes=True)

    async def list_systems_for_project(
        self, project_id: int
    ) -> Sequence[ProjectSystemRead]:
        systems = await self.system_repo.list_systems_for_project(project_id)
        return [ProjectSystemRead.model_validate(s, from_attributes=True) for s in systems]

    async def delete_project(self, project_id: int) -> bool:
        return await self.project_repo.delete_project(project_id)

    async def update_project_system(
        self, project_id: int, system_id: int, data: ProjectSystemUpdate
    ) -> ProjectSystemRead | None:
        system = await self.system_repo.get_system(system_id)
        if not system or system.project_id != project_id:
            return None

        system.system_type = data.system_type
        system.title = data.title
        system.config_json = data.config_json
        updated = await self.system_repo.update_system(system)
        return ProjectSystemRead.model_validate(updated, from_attributes=True)

    async def delete_project_system(self, project_id: int, system_id: int) -> bool:
        system = await self.system_repo.get_system(system_id)
        if not system or system.project_id != project_id:
            return False
        return await self.system_repo.delete_system(system_id)