import json
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from ..core.repositories import (
    MotorcycleRepository, ServiceTaskRepository,
    ServiceRecordRepository, TodoTaskRepository
)
from ..domain import (
    Motorcycle, ServiceTask, ServiceRecord, TodoTask,
    ServiceTaskType, TodoTaskPriority, TodoTaskStatus
)
from .models import (
    MotorcycleModel, ServiceTaskModel,
    ServiceRecordModel, TodoTaskModel
)


class SQLAlchemyMotorcycleRepository(MotorcycleRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, motorcycle: Motorcycle) -> Motorcycle:
        db_motorcycle = self.db.query(MotorcycleModel).filter(
            MotorcycleModel.id == motorcycle.id
        ).first()

        if db_motorcycle:
            # Update existing
            for attr, value in motorcycle.__dict__.items():
                setattr(db_motorcycle, attr, value)
        else:
            # Create new
            db_motorcycle = MotorcycleModel(**motorcycle.__dict__)
            self.db.add(db_motorcycle)

        self.db.commit()
        self.db.refresh(db_motorcycle)
        return self._to_domain(db_motorcycle)

    def find_by_id(self, motorcycle_id: UUID) -> Optional[Motorcycle]:
        db_motorcycle = self.db.query(MotorcycleModel).filter(
            MotorcycleModel.id == motorcycle_id
        ).first()
        return self._to_domain(db_motorcycle) if db_motorcycle else None

    def find_all(self) -> List[Motorcycle]:
        db_motorcycles = self.db.query(MotorcycleModel).all()
        return [self._to_domain(db_motorcycle) for db_motorcycle in db_motorcycles]

    def delete(self, motorcycle_id: UUID) -> bool:
        db_motorcycle = self.db.query(MotorcycleModel).filter(
            MotorcycleModel.id == motorcycle_id
        ).first()
        if db_motorcycle:
            self.db.delete(db_motorcycle)
            self.db.commit()
            return True
        return False

    def _to_domain(self, db_motorcycle: MotorcycleModel) -> Motorcycle:
        return Motorcycle(**{
            attr: getattr(db_motorcycle, attr) 
            for attr in Motorcycle.__dataclass_fields__.keys()
        })


class SQLAlchemyServiceTaskRepository(ServiceTaskRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, service_task: ServiceTask) -> ServiceTask:
        db_task = self.db.query(ServiceTaskModel).filter(
            ServiceTaskModel.id == service_task.id
        ).first()

        task_data = service_task.__dict__.copy()
        task_data['task_type'] = service_task.task_type.value

        if db_task:
            for attr, value in task_data.items():
                setattr(db_task, attr, value)
        else:
            db_task = ServiceTaskModel(**task_data)
            self.db.add(db_task)

        self.db.commit()
        self.db.refresh(db_task)
        return self._to_domain(db_task)

    def find_by_id(self, task_id: UUID) -> Optional[ServiceTask]:
        db_task = self.db.query(ServiceTaskModel).filter(
            ServiceTaskModel.id == task_id
        ).first()
        return self._to_domain(db_task) if db_task else None

    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[ServiceTask]:
        db_tasks = self.db.query(ServiceTaskModel).filter(
            ServiceTaskModel.motorcycle_id == motorcycle_id
        ).all()
        return [self._to_domain(db_task) for db_task in db_tasks]

    def delete(self, task_id: UUID) -> bool:
        db_task = self.db.query(ServiceTaskModel).filter(
            ServiceTaskModel.id == task_id
        ).first()
        if db_task:
            self.db.delete(db_task)
            self.db.commit()
            return True
        return False

    def _to_domain(self, db_task: ServiceTaskModel) -> ServiceTask:
        task_data = {attr: getattr(db_task, attr) for attr in ServiceTask.__dataclass_fields__.keys()}
        task_data['task_type'] = ServiceTaskType(db_task.task_type)
        return ServiceTask(**task_data)


class SQLAlchemyServiceRecordRepository(ServiceRecordRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, service_record: ServiceRecord) -> ServiceRecord:
        db_record = self.db.query(ServiceRecordModel).filter(
            ServiceRecordModel.id == service_record.id
        ).first()

        record_data = service_record.__dict__.copy()
        record_data['parts_used'] = json.dumps(service_record.parts_used)
        record_data['completed_service_task_ids'] = json.dumps([str(id) for id in service_record.completed_service_task_ids])
        record_data['completed_todo_task_ids'] = json.dumps([str(id) for id in service_record.completed_todo_task_ids])

        if db_record:
            for attr, value in record_data.items():
                setattr(db_record, attr, value)
        else:
            db_record = ServiceRecordModel(**record_data)
            self.db.add(db_record)

        self.db.commit()
        self.db.refresh(db_record)
        return self._to_domain(db_record)

    def find_by_id(self, record_id: UUID) -> Optional[ServiceRecord]:
        db_record = self.db.query(ServiceRecordModel).filter(
            ServiceRecordModel.id == record_id
        ).first()
        return self._to_domain(db_record) if db_record else None

    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[ServiceRecord]:
        db_records = self.db.query(ServiceRecordModel).filter(
            ServiceRecordModel.motorcycle_id == motorcycle_id
        ).all()
        return [self._to_domain(db_record) for db_record in db_records]

    def delete(self, record_id: UUID) -> bool:
        db_record = self.db.query(ServiceRecordModel).filter(
            ServiceRecordModel.id == record_id
        ).first()
        if db_record:
            self.db.delete(db_record)
            self.db.commit()
            return True
        return False

    def _to_domain(self, db_record: ServiceRecordModel) -> ServiceRecord:
        record_data = {attr: getattr(db_record, attr) for attr in ServiceRecord.__dataclass_fields__.keys() if attr not in ['parts_used', 'completed_service_task_ids', 'completed_todo_task_ids']}
        
        record_data['parts_used'] = json.loads(db_record.parts_used or '[]')
        record_data['completed_service_task_ids'] = [UUID(id) for id in json.loads(db_record.completed_service_task_ids or '[]')]
        record_data['completed_todo_task_ids'] = [UUID(id) for id in json.loads(db_record.completed_todo_task_ids or '[]')]
        
        return ServiceRecord(**record_data)


class SQLAlchemyTodoTaskRepository(TodoTaskRepository):
    def __init__(self, db: Session):
        self.db = db

    def save(self, todo_task: TodoTask) -> TodoTask:
        db_task = self.db.query(TodoTaskModel).filter(
            TodoTaskModel.id == todo_task.id
        ).first()

        task_data = todo_task.__dict__.copy()
        task_data['priority'] = todo_task.priority.value
        task_data['status'] = todo_task.status.value

        if db_task:
            for attr, value in task_data.items():
                setattr(db_task, attr, value)
        else:
            db_task = TodoTaskModel(**task_data)
            self.db.add(db_task)

        self.db.commit()
        self.db.refresh(db_task)
        return self._to_domain(db_task)

    def find_by_id(self, task_id: UUID) -> Optional[TodoTask]:
        db_task = self.db.query(TodoTaskModel).filter(
            TodoTaskModel.id == task_id
        ).first()
        return self._to_domain(db_task) if db_task else None

    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[TodoTask]:
        db_tasks = self.db.query(TodoTaskModel).filter(
            TodoTaskModel.motorcycle_id == motorcycle_id
        ).all()
        return [self._to_domain(db_task) for db_task in db_tasks]

    def delete(self, task_id: UUID) -> bool:
        db_task = self.db.query(TodoTaskModel).filter(
            TodoTaskModel.id == task_id
        ).first()
        if db_task:
            self.db.delete(db_task)
            self.db.commit()
            return True
        return False

    def _to_domain(self, db_task: TodoTaskModel) -> TodoTask:
        task_data = {attr: getattr(db_task, attr) for attr in TodoTask.__dataclass_fields__.keys() if attr not in ['priority', 'status']}
        task_data['priority'] = TodoTaskPriority(db_task.priority)
        task_data['status'] = TodoTaskStatus(db_task.status)
        return TodoTask(**task_data)