from collections.abc import Sequence

from sqlalchemy import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models import Estimate, EstimateRow, Project, ProjectSystem


class ProjectRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_project(self, project: Project) -> Project:
        self.session.add(project)
        await self.session.commit()
        await self.session.refresh(project)
        return project

    async def list_projects(self) -> Sequence[Project]:
        stmt = select(Project).order_by(Project.created_at.desc())
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_project(self, project_id: int) -> Project | None:
        return await self.session.get(Project, project_id)

    async def delete_project(self, project_id: int) -> bool:
        project = await self.session.get(Project, project_id)
        if not project:
            return False

        await self.session.delete(project)
        await self.session.commit()
        return True


class ProjectSystemRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_system(self, system: ProjectSystem) -> ProjectSystem:
        self.session.add(system)
        await self.session.commit()
        await self.session.refresh(system)
        return system

    async def list_systems_for_project(
        self, project_id: int
    ) -> Sequence[ProjectSystem]:
        stmt = (
            select(ProjectSystem)
            .where(ProjectSystem.project_id == project_id)
            .order_by(ProjectSystem.created_at.desc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_system(self, system_id: int) -> ProjectSystem | None:
        return await self.session.get(ProjectSystem, system_id)

    async def update_system(self, system: ProjectSystem) -> ProjectSystem:
        self.session.add(system)
        await self.session.commit()
        await self.session.refresh(system)
        return system

    async def delete_system(self, system_id: int) -> bool:
        system = await self.session.get(ProjectSystem, system_id)
        if not system:
            return False

        await self.session.delete(system)
        await self.session.commit()
        return True


class EstimateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_estimate_with_rows(
        self, estimate: Estimate, rows: list[EstimateRow]
    ) -> Estimate:
        self.session.add(estimate)
        for row in rows:
            self.session.add(row)
        await self.session.commit()
        await self.session.refresh(estimate)
        return estimate

    async def get_estimate(self, estimate_id: int) -> Estimate | None:
        return await self.session.get(Estimate, estimate_id)