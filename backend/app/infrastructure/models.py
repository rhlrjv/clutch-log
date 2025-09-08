from sqlalchemy import Column, String, Integer, DateTime, Float, Text, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from .database import Base


class MotorcycleModel(Base):
    __tablename__ = "motorcycles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    current_mileage = Column(Integer, nullable=False, default=0)
    vin = Column(String, nullable=True)
    insurance_provider = Column(String, nullable=True)
    insurance_policy_number = Column(String, nullable=True)
    insurance_expiry = Column(DateTime, nullable=True)
    purchase_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    service_tasks = relationship("ServiceTaskModel", back_populates="motorcycle")
    service_records = relationship("ServiceRecordModel", back_populates="motorcycle")
    todo_tasks = relationship("TodoTaskModel", back_populates="motorcycle")


class ServiceTaskModel(Base):
    __tablename__ = "service_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    motorcycle_id = Column(UUID(as_uuid=True), ForeignKey("motorcycles.id"), nullable=False)
    task_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    mileage_interval = Column(Integer, nullable=True)
    time_interval_months = Column(Integer, nullable=True)
    last_completed_mileage = Column(Integer, nullable=True)
    last_completed_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    motorcycle = relationship("MotorcycleModel", back_populates="service_tasks")


class ServiceRecordModel(Base):
    __tablename__ = "service_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    motorcycle_id = Column(UUID(as_uuid=True), ForeignKey("motorcycles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    mileage_at_service = Column(Integer, nullable=False)
    service_date = Column(DateTime, nullable=False)
    cost = Column(Float, nullable=True)
    service_location = Column(String, nullable=True)
    mechanic_name = Column(String, nullable=True)
    parts_used = Column(Text, nullable=True)  # JSON string
    completed_service_task_ids = Column(Text, nullable=True)  # JSON string
    completed_todo_task_ids = Column(Text, nullable=True)  # JSON string
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    motorcycle = relationship("MotorcycleModel", back_populates="service_records")


class TodoTaskModel(Base):
    __tablename__ = "todo_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    motorcycle_id = Column(UUID(as_uuid=True), ForeignKey("motorcycles.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, nullable=False, default="medium")
    status = Column(String, nullable=False, default="open")
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    motorcycle = relationship("MotorcycleModel", back_populates="todo_tasks")