from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...infrastructure.database import get_db
from ...infrastructure.repository_impl import SQLAlchemyMotorcycleRepository, SQLAlchemyServiceTaskRepository
from ...core.services import MotorcycleService
from ...domain import Motorcycle
from ..schemas import MotorcycleCreate, MotorcycleUpdate, MotorcycleResponse

router = APIRouter()


def get_motorcycle_service(db: Session = Depends(get_db)) -> MotorcycleService:
    motorcycle_repo = SQLAlchemyMotorcycleRepository(db)
    service_task_repo = SQLAlchemyServiceTaskRepository(db)
    return MotorcycleService(motorcycle_repo, service_task_repo)


@router.get("/makes", response_model=List[str])
def get_available_makes(
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    """Get list of motorcycle makes with predefined service schedules"""
    return service.get_available_makes()


@router.get("/makes/{make}/models", response_model=List[str])
def get_available_models(
    make: str,
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    """Get list of motorcycle models for a specific make"""
    return service.get_available_models(make)


@router.post("/", response_model=MotorcycleResponse)
def create_motorcycle(
    motorcycle_data: MotorcycleCreate,
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    motorcycle = service.create_motorcycle(**motorcycle_data.dict())
    return MotorcycleResponse.from_orm(motorcycle)


@router.get("/", response_model=List[MotorcycleResponse])
def get_motorcycles(
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    motorcycles = service.get_all_motorcycles()
    return [MotorcycleResponse.from_orm(motorcycle) for motorcycle in motorcycles]


@router.get("/{motorcycle_id}", response_model=MotorcycleResponse)
def get_motorcycle(
    motorcycle_id: UUID,
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    motorcycle = service.get_motorcycle(motorcycle_id)
    if not motorcycle:
        raise HTTPException(status_code=404, detail="Motorcycle not found")
    return MotorcycleResponse.from_orm(motorcycle)


@router.put("/{motorcycle_id}/mileage", response_model=MotorcycleResponse)
def update_motorcycle_mileage(
    motorcycle_id: UUID,
    new_mileage: int,
    service: MotorcycleService = Depends(get_motorcycle_service)
):
    motorcycle = service.update_mileage(motorcycle_id, new_mileage)
    if not motorcycle:
        raise HTTPException(status_code=404, detail="Motorcycle not found")
    return MotorcycleResponse.from_orm(motorcycle)