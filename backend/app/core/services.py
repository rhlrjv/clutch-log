from datetime import datetime
from typing import List, Optional
from uuid import UUID

from ..domain import (
    Motorcycle, ServiceTask, ServiceRecord, TodoTask, 
    ServiceTaskStatus, TodoTaskStatus
)
from .repositories import (
    MotorcycleRepository, ServiceTaskRepository, 
    ServiceRecordRepository, TodoTaskRepository
)
from .service_schedules import ServiceScheduleService


class MotorcycleService:
    def __init__(
        self, 
        motorcycle_repo: MotorcycleRepository,
        service_task_repo: Optional[ServiceTaskRepository] = None
    ):
        self.motorcycle_repo = motorcycle_repo
        self.service_task_repo = service_task_repo
        self.service_schedule_service = ServiceScheduleService()

    def create_motorcycle(
        self,
        name: str,
        make: str,
        model: str,
        year: int,
        current_mileage: int,
        create_service_schedule: bool = True,
        **kwargs
    ) -> Motorcycle:
        motorcycle = Motorcycle.create(
            name=name,
            make=make,
            model=model,
            year=year,
            current_mileage=current_mileage,
            **kwargs
        )
        saved_motorcycle = self.motorcycle_repo.save(motorcycle)
        
        # Create predefined service tasks if requested and service task repo is available
        if create_service_schedule and self.service_task_repo:
            service_tasks = self.service_schedule_service.create_service_tasks_for_motorcycle(
                saved_motorcycle.id, make, model
            )
            for task in service_tasks:
                self.service_task_repo.save(task)
        
        return saved_motorcycle

    def get_motorcycle(self, motorcycle_id: UUID) -> Optional[Motorcycle]:
        return self.motorcycle_repo.find_by_id(motorcycle_id)

    def get_all_motorcycles(self) -> List[Motorcycle]:
        return self.motorcycle_repo.find_all()

    def update_mileage(self, motorcycle_id: UUID, new_mileage: int) -> Optional[Motorcycle]:
        motorcycle = self.motorcycle_repo.find_by_id(motorcycle_id)
        if motorcycle:
            motorcycle.update_mileage(new_mileage)
            return self.motorcycle_repo.save(motorcycle)
        return None

    def get_available_makes(self) -> List[str]:
        """Get list of motorcycle makes with predefined service schedules"""
        return self.service_schedule_service.get_available_makes()

    def get_available_models(self, make: str) -> List[str]:
        """Get list of motorcycle models for a specific make"""
        return self.service_schedule_service.get_available_models(make)


class ServiceTaskService:
    def __init__(
        self,
        service_task_repo: ServiceTaskRepository,
        motorcycle_repo: MotorcycleRepository
    ):
        self.service_task_repo = service_task_repo
        self.motorcycle_repo = motorcycle_repo

    def create_service_task(self, service_task: ServiceTask) -> ServiceTask:
        return self.service_task_repo.save(service_task)

    def get_service_tasks_for_motorcycle(self, motorcycle_id: UUID) -> List[ServiceTask]:
        return self.service_task_repo.find_by_motorcycle_id(motorcycle_id)

    def get_due_service_tasks(self, motorcycle_id: UUID) -> List[ServiceTask]:
        motorcycle = self.motorcycle_repo.find_by_id(motorcycle_id)
        if not motorcycle:
            return []

        tasks = self.service_task_repo.find_by_motorcycle_id(motorcycle_id)
        due_tasks = []

        for task in tasks:
            status = task.get_status(motorcycle.current_mileage)
            if status in [ServiceTaskStatus.PENDING, ServiceTaskStatus.OVERDUE]:
                due_tasks.append(task)

        return due_tasks

    def complete_service_task(
        self, 
        task_id: UUID, 
        completed_mileage: int, 
        completed_date: datetime
    ) -> Optional[ServiceTask]:
        task = self.service_task_repo.find_by_id(task_id)
        if task:
            task.mark_completed(completed_mileage, completed_date)
            return self.service_task_repo.save(task)
        return None


class ServiceRecordService:
    def __init__(
        self,
        service_record_repo: ServiceRecordRepository,
        service_task_repo: ServiceTaskRepository,
        todo_task_repo: TodoTaskRepository
    ):
        self.service_record_repo = service_record_repo
        self.service_task_repo = service_task_repo
        self.todo_task_repo = todo_task_repo

    def create_service_record(self, service_record: ServiceRecord) -> ServiceRecord:
        saved_record = self.service_record_repo.save(service_record)
        
        # Complete associated service tasks
        for task_id in service_record.completed_service_task_ids:
            task = self.service_task_repo.find_by_id(task_id)
            if task:
                task.mark_completed(
                    service_record.mileage_at_service,
                    service_record.service_date
                )
                self.service_task_repo.save(task)

        # Complete associated todo tasks
        for task_id in service_record.completed_todo_task_ids:
            task = self.todo_task_repo.find_by_id(task_id)
            if task:
                task.mark_completed()
                self.todo_task_repo.save(task)

        return saved_record

    def get_service_records_for_motorcycle(self, motorcycle_id: UUID) -> List[ServiceRecord]:
        return self.service_record_repo.find_by_motorcycle_id(motorcycle_id)


class TodoTaskService:
    def __init__(self, todo_task_repo: TodoTaskRepository):
        self.todo_task_repo = todo_task_repo

    def create_todo_task(self, todo_task: TodoTask) -> TodoTask:
        return self.todo_task_repo.save(todo_task)

    def get_todo_tasks_for_motorcycle(self, motorcycle_id: UUID) -> List[TodoTask]:
        return self.todo_task_repo.find_by_motorcycle_id(motorcycle_id)

    def get_open_todo_tasks(self, motorcycle_id: UUID) -> List[TodoTask]:
        tasks = self.todo_task_repo.find_by_motorcycle_id(motorcycle_id)
        return [task for task in tasks if task.status != TodoTaskStatus.COMPLETED]

    def update_todo_task_status(self, task_id: UUID, status: TodoTaskStatus) -> Optional[TodoTask]:
        task = self.todo_task_repo.find_by_id(task_id)
        if task:
            if status == TodoTaskStatus.COMPLETED:
                task.mark_completed()
            elif status == TodoTaskStatus.IN_PROGRESS:
                task.mark_in_progress()
            else:
                task.reopen()
            return self.todo_task_repo.save(task)
        return None