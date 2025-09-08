from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from ..domain import Motorcycle, ServiceTask, ServiceRecord, TodoTask


class MotorcycleRepository(ABC):
    @abstractmethod
    def save(self, motorcycle: Motorcycle) -> Motorcycle:
        pass

    @abstractmethod
    def find_by_id(self, motorcycle_id: UUID) -> Optional[Motorcycle]:
        pass

    @abstractmethod
    def find_all(self) -> List[Motorcycle]:
        pass

    @abstractmethod
    def delete(self, motorcycle_id: UUID) -> bool:
        pass


class ServiceTaskRepository(ABC):
    @abstractmethod
    def save(self, service_task: ServiceTask) -> ServiceTask:
        pass

    @abstractmethod
    def find_by_id(self, task_id: UUID) -> Optional[ServiceTask]:
        pass

    @abstractmethod
    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[ServiceTask]:
        pass

    @abstractmethod
    def delete(self, task_id: UUID) -> bool:
        pass


class ServiceRecordRepository(ABC):
    @abstractmethod
    def save(self, service_record: ServiceRecord) -> ServiceRecord:
        pass

    @abstractmethod
    def find_by_id(self, record_id: UUID) -> Optional[ServiceRecord]:
        pass

    @abstractmethod
    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[ServiceRecord]:
        pass

    @abstractmethod
    def delete(self, record_id: UUID) -> bool:
        pass


class TodoTaskRepository(ABC):
    @abstractmethod
    def save(self, todo_task: TodoTask) -> TodoTask:
        pass

    @abstractmethod
    def find_by_id(self, task_id: UUID) -> Optional[TodoTask]:
        pass

    @abstractmethod
    def find_by_motorcycle_id(self, motorcycle_id: UUID) -> List[TodoTask]:
        pass

    @abstractmethod
    def delete(self, task_id: UUID) -> bool:
        pass