from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel

from ..domain import ServiceTaskType, TodoTaskPriority, TodoTaskStatus


class MotorcycleCreate(BaseModel):
    name: str
    make: str
    model: str
    year: int
    current_mileage: int
    vin: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None
    purchase_date: Optional[datetime] = None
    create_service_schedule: bool = True


class MotorcycleUpdate(BaseModel):
    name: Optional[str] = None
    current_mileage: Optional[int] = None
    vin: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None


class MotorcycleResponse(BaseModel):
    id: UUID
    name: str
    make: str
    model: str
    year: int
    current_mileage: int
    vin: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None
    purchase_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceTaskCreate(BaseModel):
    motorcycle_id: UUID
    task_type: ServiceTaskType
    name: str
    description: str
    mileage_interval: Optional[int] = None
    time_interval_months: Optional[int] = None


class ServiceTaskResponse(BaseModel):
    id: UUID
    motorcycle_id: UUID
    task_type: ServiceTaskType
    name: str
    description: str
    mileage_interval: Optional[int] = None
    time_interval_months: Optional[int] = None
    last_completed_mileage: Optional[int] = None
    last_completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ServiceRecordCreate(BaseModel):
    motorcycle_id: UUID
    title: str
    description: str
    mileage_at_service: int
    service_date: datetime
    cost: Optional[float] = None
    service_location: Optional[str] = None
    mechanic_name: Optional[str] = None
    parts_used: Optional[List[str]] = None
    completed_service_task_ids: Optional[List[UUID]] = None
    completed_todo_task_ids: Optional[List[UUID]] = None
    notes: Optional[str] = None


class ServiceRecordResponse(BaseModel):
    id: UUID
    motorcycle_id: UUID
    title: str
    description: str
    mileage_at_service: int
    service_date: datetime
    cost: Optional[float] = None
    service_location: Optional[str] = None
    mechanic_name: Optional[str] = None
    parts_used: List[str]
    completed_service_task_ids: List[UUID]
    completed_todo_task_ids: List[UUID]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TodoTaskCreate(BaseModel):
    motorcycle_id: UUID
    title: str
    description: str
    priority: TodoTaskPriority = TodoTaskPriority.MEDIUM
    due_date: Optional[datetime] = None


class TodoTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TodoTaskPriority] = None
    status: Optional[TodoTaskStatus] = None
    due_date: Optional[datetime] = None


class TodoTaskResponse(BaseModel):
    id: UUID
    motorcycle_id: UUID
    title: str
    description: str
    priority: TodoTaskPriority
    status: TodoTaskStatus
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True