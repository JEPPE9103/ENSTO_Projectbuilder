from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.db import get_session
from app.repositories import EstimateRepository
from app.schemas import (
    EstimateCalculationResult,
    EstimateCreate,
    EstimateRead,
    SystemConfiguration,
)
from app.services import CalculationService

router = APIRouter()


def get_calculation_service(
    session: AsyncSession = Depends(get_session),
) -> CalculationService:
    return CalculationService(session)


@router.post("/calculate", response_model=EstimateCalculationResult)
async def calculate_estimate(
    payload: SystemConfiguration,
    service: CalculationService = Depends(get_calculation_service),
) -> EstimateCalculationResult:
    return await service.calculate_materials(payload)


@router.post("", response_model=EstimateRead, status_code=201)
async def create_estimate(
    payload: EstimateCreate,
    service: CalculationService = Depends(get_calculation_service),
) -> EstimateRead:
    estimate = await service.save_estimate(payload)
    # Reload with rows for response
    repo = EstimateRepository(service.session)
    loaded = await repo.get_estimate(estimate.id)
    if not loaded:
        raise HTTPException(status_code=500, detail="Estimate could not be loaded")
    return EstimateRead.model_validate(loaded)


@router.get("/{estimate_id}", response_model=EstimateRead)
async def get_estimate(
    estimate_id: int,
    session: AsyncSession = Depends(get_session),
) -> EstimateRead:
    repo = EstimateRepository(session)
    estimate = await repo.get_estimate(estimate_id)
    if not estimate:
        raise HTTPException(status_code=404, detail="Estimate not found")
    return EstimateRead.model_validate(estimate)

