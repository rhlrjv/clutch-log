from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4


class ServiceTaskStatus(Enum):
    PENDING = "pending"
    OVERDUE = "overdue"
    COMPLETED = "completed"


class ServiceTaskType(Enum):
    OIL_CHANGE = "oil_change"
    AIR_FILTER = "air_filter"
    SPARK_PLUGS = "spark_plugs"
    BRAKE_PADS = "brake_pads"
    TIRE_REPLACEMENT = "tire_replacement"
    CHAIN_MAINTENANCE = "chain_maintenance"
    COOLANT_FLUSH = "coolant_flush"
    BRAKE_FLUID = "brake_fluid"
    TRANSMISSION_FLUID = "transmission_fluid"
    VALVE_ADJUSTMENT = "valve_adjustment"
    CUSTOM = "custom"


@dataclass
class ServiceTask:
    id: UUID
    motorcycle_id: UUID
    task_type: ServiceTaskType
    name: str
    description: str
    mileage_interval: Optional[int] = None
    time_interval_months: Optional[int] = None
    last_completed_mileage: Optional[int] = None
    last_completed_date: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    @classmethod
    def create(
        cls,
        motorcycle_id: UUID,
        task_type: ServiceTaskType,
        name: str,
        description: str,
        mileage_interval: Optional[int] = None,
        time_interval_months: Optional[int] = None,
    ) -> "ServiceTask":
        return cls(
            id=uuid4(),
            motorcycle_id=motorcycle_id,
            task_type=task_type,
            name=name,
            description=description,
            mileage_interval=mileage_interval,
            time_interval_months=time_interval_months,
        )

    def get_status(self, current_mileage: int) -> ServiceTaskStatus:
        is_mileage_due = False
        is_time_due = False

        if self.mileage_interval and self.last_completed_mileage is not None:
            next_due_mileage = self.last_completed_mileage + self.mileage_interval
            is_mileage_due = current_mileage >= next_due_mileage

        if self.time_interval_months and self.last_completed_date is not None:
            next_due_date = self.last_completed_date + timedelta(days=self.time_interval_months * 30)
            is_time_due = datetime.utcnow() >= next_due_date

        if is_mileage_due or is_time_due:
            return ServiceTaskStatus.OVERDUE
        elif self.last_completed_mileage is None and self.last_completed_date is None:
            return ServiceTaskStatus.PENDING
        else:
            return ServiceTaskStatus.COMPLETED

    def mark_completed(self, completed_mileage: int, completed_date: datetime) -> None:
        self.last_completed_mileage = completed_mileage
        self.last_completed_date = completed_date
        self.updated_at = datetime.utcnow()