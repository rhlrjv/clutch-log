from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4


@dataclass
class ServiceRecord:
    id: UUID
    motorcycle_id: UUID
    title: str
    description: str
    mileage_at_service: int
    service_date: datetime
    cost: Optional[float] = None
    service_location: Optional[str] = None
    mechanic_name: Optional[str] = None
    parts_used: List[str] = field(default_factory=list)
    completed_service_task_ids: List[UUID] = field(default_factory=list)
    completed_todo_task_ids: List[UUID] = field(default_factory=list)
    notes: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    @classmethod
    def create(
        cls,
        motorcycle_id: UUID,
        title: str,
        description: str,
        mileage_at_service: int,
        service_date: datetime,
        cost: Optional[float] = None,
        service_location: Optional[str] = None,
        mechanic_name: Optional[str] = None,
        parts_used: Optional[List[str]] = None,
        completed_service_task_ids: Optional[List[UUID]] = None,
        completed_todo_task_ids: Optional[List[UUID]] = None,
        notes: Optional[str] = None,
    ) -> "ServiceRecord":
        return cls(
            id=uuid4(),
            motorcycle_id=motorcycle_id,
            title=title,
            description=description,
            mileage_at_service=mileage_at_service,
            service_date=service_date,
            cost=cost,
            service_location=service_location,
            mechanic_name=mechanic_name,
            parts_used=parts_used or [],
            completed_service_task_ids=completed_service_task_ids or [],
            completed_todo_task_ids=completed_todo_task_ids or [],
            notes=notes,
        )

    def add_completed_service_task(self, service_task_id: UUID) -> None:
        if service_task_id not in self.completed_service_task_ids:
            self.completed_service_task_ids.append(service_task_id)
            self.updated_at = datetime.utcnow()

    def add_completed_todo_task(self, todo_task_id: UUID) -> None:
        if todo_task_id not in self.completed_todo_task_ids:
            self.completed_todo_task_ids.append(todo_task_id)
            self.updated_at = datetime.utcnow()

    def add_part_used(self, part: str) -> None:
        if part not in self.parts_used:
            self.parts_used.append(part)
            self.updated_at = datetime.utcnow()