from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...infrastructure.database import get_db
from ...infrastructure.repository_impl import (
    SQLAlchemyServiceRecordRepository, SQLAlchemyServiceTaskRepository,
    SQLAlchemyTodoTaskRepository
)
from ...core.services import ServiceRecordService
from ...domain import ServiceRecord
from ..schemas import ServiceRecordCreate, ServiceRecordResponse

router = APIRouter()


def get_service_record_service(db: Session = Depends(get_db)) -> ServiceRecordService:
    service_record_repo = SQLAlchemyServiceRecordRepository(db)
    service_task_repo = SQLAlchemyServiceTaskRepository(db)
    todo_task_repo = SQLAlchemyTodoTaskRepository(db)
    return ServiceRecordService(service_record_repo, service_task_repo, todo_task_repo)


@router.post("/", response_model=ServiceRecordResponse)
def create_service_record(
    record_data: ServiceRecordCreate,
    service: ServiceRecordService = Depends(get_service_record_service)
):
    record = ServiceRecord.create(**record_data.dict())
    created_record = service.create_service_record(record)
    return ServiceRecordResponse.from_orm(created_record)


@router.get("/motorcycle/{motorcycle_id}", response_model=List[ServiceRecordResponse])
def get_service_records_for_motorcycle(
    motorcycle_id: UUID,
    service: ServiceRecordService = Depends(get_service_record_service)
):
    records = service.get_service_records_for_motorcycle(motorcycle_id)
    return [ServiceRecordResponse.from_orm(record) for record in records]