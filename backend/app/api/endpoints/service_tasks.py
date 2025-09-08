from typing import List
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...infrastructure.database import get_db
from ...infrastructure.repository_impl import (
    SQLAlchemyServiceTaskRepository, SQLAlchemyMotorcycleRepository
)
from ...core.services import ServiceTaskService
from ...domain import ServiceTask
from ..schemas import ServiceTaskCreate, ServiceTaskResponse

router = APIRouter()


def get_service_task_service(db: Session = Depends(get_db)) -> ServiceTaskService:
    service_task_repo = SQLAlchemyServiceTaskRepository(db)
    motorcycle_repo = SQLAlchemyMotorcycleRepository(db)
    return ServiceTaskService(service_task_repo, motorcycle_repo)


@router.post("/", response_model=ServiceTaskResponse)
def create_service_task(
    task_data: ServiceTaskCreate,
    service: ServiceTaskService = Depends(get_service_task_service)
):
    task = ServiceTask.create(**task_data.dict())
    created_task = service.create_service_task(task)
    return ServiceTaskResponse.from_orm(created_task)


@router.get("/motorcycle/{motorcycle_id}", response_model=List[ServiceTaskResponse])
def get_service_tasks_for_motorcycle(
    motorcycle_id: UUID,
    service: ServiceTaskService = Depends(get_service_task_service)
):
    tasks = service.get_service_tasks_for_motorcycle(motorcycle_id)
    return [ServiceTaskResponse.from_orm(task) for task in tasks]


@router.get("/motorcycle/{motorcycle_id}/due", response_model=List[ServiceTaskResponse])
def get_due_service_tasks(
    motorcycle_id: UUID,
    service: ServiceTaskService = Depends(get_service_task_service)
):
    tasks = service.get_due_service_tasks(motorcycle_id)
    return [ServiceTaskResponse.from_orm(task) for task in tasks]


@router.put("/{task_id}/complete", response_model=ServiceTaskResponse)
def complete_service_task(
    task_id: UUID,
    completed_mileage: int,
    completed_date: datetime,
    service: ServiceTaskService = Depends(get_service_task_service)
):
    task = service.complete_service_task(task_id, completed_mileage, completed_date)
    if not task:
        raise HTTPException(status_code=404, detail="Service task not found")
    return ServiceTaskResponse.from_orm(task)