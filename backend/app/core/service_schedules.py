from dataclasses import dataclass
from typing import Dict, List, Optional
from uuid import UUID

from ..domain import ServiceTask, ServiceTaskType


@dataclass
class ServiceScheduleTemplate:
    task_type: ServiceTaskType
    name: str
    description: str
    mileage_interval: Optional[int] = None
    time_interval_months: Optional[int] = None


class ServiceScheduleService:
    """Service for managing predefined motorcycle service schedules"""
    
    def __init__(self):
        self.schedules = self._initialize_schedules()
    
    def _initialize_schedules(self) -> Dict[str, Dict[str, List[ServiceScheduleTemplate]]]:
        """Initialize predefined service schedules for various motorcycle models"""
        
        # Suzuki SV650 Service Schedule (applies to most model years)
        sv650_schedule = [
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.OIL_CHANGE,
                name="Engine Oil and Filter Change",
                description="Replace engine oil and oil filter. Use 10W-40 synthetic oil (3.2L capacity).",
                mileage_interval=3000,
                time_interval_months=6
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.AIR_FILTER,
                name="Air Filter Replacement",
                description="Replace air filter element. Clean airbox if necessary.",
                mileage_interval=7500,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.SPARK_PLUGS,
                name="Spark Plug Replacement",
                description="Replace spark plugs with NGK CR8E or equivalent. Check gap (0.7-0.8mm).",
                mileage_interval=7500,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.CHAIN_MAINTENANCE,
                name="Chain and Sprocket Service",
                description="Clean, lubricate, and adjust drive chain. Inspect sprockets for wear.",
                mileage_interval=1000,
                time_interval_months=2
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.BRAKE_FLUID,
                name="Brake Fluid Replacement",
                description="Replace brake fluid (DOT 4). Bleed brake system.",
                mileage_interval=15000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.COOLANT_FLUSH,
                name="Coolant System Service",
                description="Replace coolant and inspect cooling system components.",
                mileage_interval=15000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.VALVE_ADJUSTMENT,
                name="Valve Clearance Check",
                description="Check and adjust valve clearances. Intake: 0.05-0.15mm, Exhaust: 0.20-0.30mm.",
                mileage_interval=15000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.BRAKE_PADS,
                name="Brake Pad Inspection/Replacement",
                description="Inspect brake pads and discs. Replace if worn below minimum thickness.",
                mileage_interval=7500,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.TIRE_REPLACEMENT,
                name="Tire Inspection and Replacement",
                description="Inspect tires for wear, damage, and proper pressure. Replace when worn.",
                mileage_interval=5000,
                time_interval_months=6
            )
        ]
        
        # Ducati Monster Service Schedule (applies to most modern models)
        monster_schedule = [
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.OIL_CHANGE,
                name="Engine Oil and Filter Service",
                description="Replace engine oil and filter. Use Shell Advance Ultra 4T 15W-50 or equivalent (3.5L capacity).",
                mileage_interval=6000,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.AIR_FILTER,
                name="Air Filter Replacement",
                description="Replace air filter element. Clean airbox and inspect intake system.",
                mileage_interval=12000,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.SPARK_PLUGS,
                name="Spark Plug Service",
                description="Replace spark plugs with NGK MAR8B-J or equivalent. Check electrode gap.",
                mileage_interval=12000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.CHAIN_MAINTENANCE,
                name="Drive Belt Inspection",
                description="Inspect drive belt tension and condition. Adjust or replace as needed.",
                mileage_interval=2000,
                time_interval_months=3
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.BRAKE_FLUID,
                name="Brake and Clutch Fluid Service",
                description="Replace brake and clutch fluid (DOT 4). Bleed systems thoroughly.",
                mileage_interval=18000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.COOLANT_FLUSH,
                name="Coolant System Maintenance",
                description="Replace coolant and inspect radiator, hoses, and thermostat.",
                mileage_interval=18000,
                time_interval_months=48
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.VALVE_ADJUSTMENT,
                name="Valve Clearance and Timing Check",
                description="Check valve clearances and timing belt condition. Adjust as necessary.",
                mileage_interval=18000,
                time_interval_months=24
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.BRAKE_PADS,
                name="Brake System Inspection",
                description="Inspect brake pads, discs, and brake lines. Replace worn components.",
                mileage_interval=6000,
                time_interval_months=12
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.TIRE_REPLACEMENT,
                name="Tire and Wheel Inspection",
                description="Check tire wear, pressure, and wheel alignment. Inspect for damage.",
                mileage_interval=3000,
                time_interval_months=3
            ),
            ServiceScheduleTemplate(
                task_type=ServiceTaskType.CUSTOM,
                name="Desmodromic Valve Service",
                description="Complete desmodromic valve service including belt replacement and valve adjustment.",
                mileage_interval=18000,
                time_interval_months=24
            )
        ]
        
        return {
            "suzuki": {
                "sv650": sv650_schedule,
                "sv650s": sv650_schedule,  # Same schedule for S model
                "sv650x": sv650_schedule   # Same schedule for X model
            },
            "ducati": {
                "monster": monster_schedule,
                "monster 696": monster_schedule,
                "monster 796": monster_schedule,
                "monster 1100": monster_schedule,
                "monster 821": monster_schedule,
                "monster 1200": monster_schedule
            }
        }
    
    def get_service_schedule(self, make: str, model: str) -> List[ServiceScheduleTemplate]:
        """Get the predefined service schedule for a motorcycle make/model"""
        make_lower = make.lower()
        model_lower = model.lower()
        
        if make_lower in self.schedules:
            make_schedules = self.schedules[make_lower]
            
            # Try exact model match first
            if model_lower in make_schedules:
                return make_schedules[model_lower]
            
            # Try partial matches for models like "Monster 796" -> "monster"
            for schedule_model, schedule in make_schedules.items():
                if schedule_model in model_lower or model_lower in schedule_model:
                    return schedule
        
        return []
    
    def create_service_tasks_for_motorcycle(
        self, 
        motorcycle_id: UUID, 
        make: str, 
        model: str
    ) -> List[ServiceTask]:
        """Create service tasks for a motorcycle based on its make and model"""
        schedule_templates = self.get_service_schedule(make, model)
        service_tasks = []
        
        for template in schedule_templates:
            task = ServiceTask.create(
                motorcycle_id=motorcycle_id,
                task_type=template.task_type,
                name=template.name,
                description=template.description,
                mileage_interval=template.mileage_interval,
                time_interval_months=template.time_interval_months
            )
            service_tasks.append(task)
        
        return service_tasks
    
    def get_available_makes(self) -> List[str]:
        """Get list of makes with predefined service schedules"""
        return list(self.schedules.keys())
    
    def get_available_models(self, make: str) -> List[str]:
        """Get list of models for a specific make"""
        make_lower = make.lower()
        if make_lower in self.schedules:
            return list(self.schedules[make_lower].keys())
        return []