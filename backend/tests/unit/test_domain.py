import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from app.domain import (
    Motorcycle, ServiceTask, ServiceRecord, TodoTask,
    ServiceTaskType, ServiceTaskStatus, TodoTaskPriority, TodoTaskStatus
)


class TestMotorcycle:
    def test_create_motorcycle(self):
        motorcycle = Motorcycle.create(
            name="Test Bike",
            make="suzuki",
            model="sv650",
            year=2020,
            current_mileage=1000
        )
        
        assert motorcycle.name == "Test Bike"
        assert motorcycle.make == "suzuki"
        assert motorcycle.model == "sv650"
        assert motorcycle.year == 2020
        assert motorcycle.current_mileage == 1000
        assert motorcycle.id is not None
    
    def test_update_mileage(self):
        motorcycle = Motorcycle.create(
            name="Test Bike",
            make="suzuki", 
            model="sv650",
            year=2020,
            current_mileage=1000
        )
        
        motorcycle.update_mileage(2000)
        assert motorcycle.current_mileage == 2000
    
    def test_update_mileage_validation(self):
        motorcycle = Motorcycle.create(
            name="Test Bike",
            make="suzuki",
            model="sv650", 
            year=2020,
            current_mileage=2000
        )
        
        with pytest.raises(ValueError):
            motorcycle.update_mileage(1000)  # Cannot go backwards


class TestServiceTask:
    def test_create_service_task(self):
        motorcycle_id = uuid4()
        task = ServiceTask.create(
            motorcycle_id=motorcycle_id,
            task_type=ServiceTaskType.OIL_CHANGE,
            name="Oil Change",
            description="Change engine oil",
            mileage_interval=3000,
            time_interval_months=6
        )
        
        assert task.motorcycle_id == motorcycle_id
        assert task.task_type == ServiceTaskType.OIL_CHANGE
        assert task.name == "Oil Change"
        assert task.mileage_interval == 3000
        assert task.time_interval_months == 6
    
    def test_service_task_status_pending(self):
        task = ServiceTask.create(
            motorcycle_id=uuid4(),
            task_type=ServiceTaskType.OIL_CHANGE,
            name="Oil Change",
            description="Change engine oil",
            mileage_interval=3000
        )
        
        status = task.get_status(1000)
        assert status == ServiceTaskStatus.PENDING
    
    def test_service_task_status_overdue_mileage(self):
        task = ServiceTask.create(
            motorcycle_id=uuid4(),
            task_type=ServiceTaskType.OIL_CHANGE,
            name="Oil Change", 
            description="Change engine oil",
            mileage_interval=3000
        )
        
        # Mark as completed at 1000 miles
        task.mark_completed(1000, datetime.utcnow())
        
        # Check status at 5000 miles (should be overdue)
        status = task.get_status(5000)
        assert status == ServiceTaskStatus.OVERDUE
    
    def test_service_task_status_overdue_time(self):
        task = ServiceTask.create(
            motorcycle_id=uuid4(),
            task_type=ServiceTaskType.OIL_CHANGE,
            name="Oil Change",
            description="Change engine oil",
            time_interval_months=6
        )
        
        # Mark as completed 8 months ago
        completed_date = datetime.utcnow() - timedelta(days=240)
        task.mark_completed(1000, completed_date)
        
        # Should be overdue
        status = task.get_status(1000)
        assert status == ServiceTaskStatus.OVERDUE


class TestServiceRecord:
    def test_create_service_record(self):
        motorcycle_id = uuid4()
        service_date = datetime.utcnow()
        
        record = ServiceRecord.create(
            motorcycle_id=motorcycle_id,
            title="Oil Change",
            description="Changed engine oil",
            mileage_at_service=3000,
            service_date=service_date,
            cost=50.00
        )
        
        assert record.motorcycle_id == motorcycle_id
        assert record.title == "Oil Change"
        assert record.mileage_at_service == 3000
        assert record.cost == 50.00
    
    def test_add_completed_tasks(self):
        record = ServiceRecord.create(
            motorcycle_id=uuid4(),
            title="Maintenance",
            description="Regular maintenance",
            mileage_at_service=5000,
            service_date=datetime.utcnow()
        )
        
        service_task_id = uuid4()
        todo_task_id = uuid4()
        
        record.add_completed_service_task(service_task_id)
        record.add_completed_todo_task(todo_task_id)
        
        assert service_task_id in record.completed_service_task_ids
        assert todo_task_id in record.completed_todo_task_ids


class TestTodoTask:
    def test_create_todo_task(self):
        motorcycle_id = uuid4()
        task = TodoTask.create(
            motorcycle_id=motorcycle_id,
            title="Fix headlight",
            description="Replace burnt out headlight bulb",
            priority=TodoTaskPriority.HIGH
        )
        
        assert task.motorcycle_id == motorcycle_id
        assert task.title == "Fix headlight"
        assert task.priority == TodoTaskPriority.HIGH
        assert task.status == TodoTaskStatus.OPEN
    
    def test_task_status_changes(self):
        task = TodoTask.create(
            motorcycle_id=uuid4(),
            title="Test task",
            description="Test description"
        )
        
        # Start as open
        assert task.status == TodoTaskStatus.OPEN
        
        # Mark in progress
        task.mark_in_progress()
        assert task.status == TodoTaskStatus.IN_PROGRESS
        
        # Mark completed
        task.mark_completed()
        assert task.status == TodoTaskStatus.COMPLETED
        assert task.completed_at is not None
        
        # Reopen
        task.reopen()
        assert task.status == TodoTaskStatus.OPEN
        assert task.completed_at is None
    
    def test_overdue_task(self):
        # Task due yesterday
        due_date = datetime.utcnow() - timedelta(days=1)
        task = TodoTask.create(
            motorcycle_id=uuid4(),
            title="Overdue task",
            description="This should be overdue",
            due_date=due_date
        )
        
        assert task.is_overdue() is True
        
        # Complete the task
        task.mark_completed()
        assert task.is_overdue() is False