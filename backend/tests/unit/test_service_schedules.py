import pytest
from uuid import uuid4

from app.core.service_schedules import ServiceScheduleService
from app.domain import ServiceTaskType


class TestServiceScheduleService:
    def test_get_available_makes(self):
        service = ServiceScheduleService()
        makes = service.get_available_makes()
        
        assert "suzuki" in makes
        assert "ducati" in makes
    
    def test_get_available_models_suzuki(self):
        service = ServiceScheduleService()
        models = service.get_available_models("suzuki")
        
        assert "sv650" in models
        assert "sv650s" in models
        assert "sv650x" in models
    
    def test_get_available_models_ducati(self):
        service = ServiceScheduleService()
        models = service.get_available_models("ducati")
        
        assert "monster" in models
        assert "monster 696" in models
        assert "monster 796" in models
        assert "monster 1200" in models
    
    def test_get_service_schedule_sv650(self):
        service = ServiceScheduleService()
        schedule = service.get_service_schedule("suzuki", "sv650")
        
        assert len(schedule) > 0
        
        # Check for key maintenance items
        task_types = [template.task_type for template in schedule]
        assert ServiceTaskType.OIL_CHANGE in task_types
        assert ServiceTaskType.CHAIN_MAINTENANCE in task_types
        assert ServiceTaskType.VALVE_ADJUSTMENT in task_types
    
    def test_get_service_schedule_monster(self):
        service = ServiceScheduleService()
        schedule = service.get_service_schedule("ducati", "monster 796")
        
        assert len(schedule) > 0
        
        # Check for key maintenance items
        task_types = [template.task_type for template in schedule]
        assert ServiceTaskType.OIL_CHANGE in task_types
        assert ServiceTaskType.CUSTOM in task_types  # Desmodromic service
    
    def test_get_service_schedule_case_insensitive(self):
        service = ServiceScheduleService()
        
        schedule1 = service.get_service_schedule("SUZUKI", "SV650")
        schedule2 = service.get_service_schedule("suzuki", "sv650")
        
        assert len(schedule1) == len(schedule2)
    
    def test_get_service_schedule_unknown_make(self):
        service = ServiceScheduleService()
        schedule = service.get_service_schedule("unknown", "model")
        
        assert len(schedule) == 0
    
    def test_create_service_tasks_for_motorcycle(self):
        service = ServiceScheduleService()
        motorcycle_id = uuid4()
        
        tasks = service.create_service_tasks_for_motorcycle(
            motorcycle_id, "suzuki", "sv650"
        )
        
        assert len(tasks) > 0
        
        # All tasks should have the correct motorcycle_id
        for task in tasks:
            assert task.motorcycle_id == motorcycle_id
        
        # Check that we have oil change task with correct intervals
        oil_change_tasks = [t for t in tasks if t.task_type == ServiceTaskType.OIL_CHANGE]
        assert len(oil_change_tasks) == 1
        
        oil_task = oil_change_tasks[0]
        assert oil_task.mileage_interval == 3000
        assert oil_task.time_interval_months == 6
    
    def test_sv650_specific_intervals(self):
        service = ServiceScheduleService()
        schedule = service.get_service_schedule("suzuki", "sv650")
        
        # Find oil change template
        oil_template = next(
            template for template in schedule 
            if template.task_type == ServiceTaskType.OIL_CHANGE
        )
        
        assert oil_template.mileage_interval == 3000
        assert oil_template.time_interval_months == 6
        
        # Find chain maintenance template
        chain_template = next(
            template for template in schedule
            if template.task_type == ServiceTaskType.CHAIN_MAINTENANCE
        )
        
        assert chain_template.mileage_interval == 1000
        assert chain_template.time_interval_months == 2
    
    def test_ducati_specific_intervals(self):
        service = ServiceScheduleService()
        schedule = service.get_service_schedule("ducati", "monster")
        
        # Find oil change template
        oil_template = next(
            template for template in schedule
            if template.task_type == ServiceTaskType.OIL_CHANGE
        )
        
        assert oil_template.mileage_interval == 6000
        assert oil_template.time_interval_months == 12
        
        # Find desmodromic service template
        desmo_template = next(
            template for template in schedule
            if template.task_type == ServiceTaskType.CUSTOM and "desmodromic" in template.name.lower()
        )
        
        assert desmo_template.mileage_interval == 18000
        assert desmo_template.time_interval_months == 24