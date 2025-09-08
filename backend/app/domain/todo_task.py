from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class TodoTaskPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TodoTaskStatus(Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


@dataclass
class TodoTask:
    id: UUID
    motorcycle_id: UUID
    title: str
    description: str
    priority: TodoTaskPriority = TodoTaskPriority.MEDIUM
    status: TodoTaskStatus = TodoTaskStatus.OPEN
    due_date: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None

    @classmethod
    def create(
        cls,
        motorcycle_id: UUID,
        title: str,
        description: str,
        priority: TodoTaskPriority = TodoTaskPriority.MEDIUM,
        due_date: Optional[datetime] = None,
    ) -> "TodoTask":
        return cls(
            id=uuid4(),
            motorcycle_id=motorcycle_id,
            title=title,
            description=description,
            priority=priority,
            due_date=due_date,
        )

    def mark_in_progress(self) -> None:
        self.status = TodoTaskStatus.IN_PROGRESS
        self.updated_at = datetime.utcnow()

    def mark_completed(self) -> None:
        self.status = TodoTaskStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def reopen(self) -> None:
        self.status = TodoTaskStatus.OPEN
        self.completed_at = None
        self.updated_at = datetime.utcnow()

    def update_priority(self, priority: TodoTaskPriority) -> None:
        self.priority = priority
        self.updated_at = datetime.utcnow()

    def is_overdue(self) -> bool:
        return (
            self.due_date is not None
            and self.status != TodoTaskStatus.COMPLETED
            and datetime.utcnow() > self.due_date
        )