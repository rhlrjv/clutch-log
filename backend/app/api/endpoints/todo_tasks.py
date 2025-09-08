from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...infrastructure.database import get_db
from ...infrastructure.repository_impl import SQLAlchemyTodoTaskRepository
from ...core.services import TodoTaskService
from ...domain import TodoTask, TodoTaskStatus
from ..schemas import TodoTaskCreate, TodoTaskUpdate, TodoTaskResponse

router = APIRouter()


def get_todo_task_service(db: Session = Depends(get_db)) -> TodoTaskService:
    todo_task_repo = SQLAlchemyTodoTaskRepository(db)
    return TodoTaskService(todo_task_repo)


@router.post("/", response_model=TodoTaskResponse)
def create_todo_task(
    task_data: TodoTaskCreate,
    service: TodoTaskService = Depends(get_todo_task_service)
):
    task = TodoTask.create(**task_data.dict())
    created_task = service.create_todo_task(task)
    return TodoTaskResponse.from_orm(created_task)


@router.get("/motorcycle/{motorcycle_id}", response_model=List[TodoTaskResponse])
def get_todo_tasks_for_motorcycle(
    motorcycle_id: UUID,
    service: TodoTaskService = Depends(get_todo_task_service)
):
    tasks = service.get_todo_tasks_for_motorcycle(motorcycle_id)
    return [TodoTaskResponse.from_orm(task) for task in tasks]


@router.get("/motorcycle/{motorcycle_id}/open", response_model=List[TodoTaskResponse])
def get_open_todo_tasks(
    motorcycle_id: UUID,
    service: TodoTaskService = Depends(get_todo_task_service)
):
    tasks = service.get_open_todo_tasks(motorcycle_id)
    return [TodoTaskResponse.from_orm(task) for task in tasks]


@router.put("/{task_id}/status", response_model=TodoTaskResponse)
def update_todo_task_status(
    task_id: UUID,
    status: TodoTaskStatus,
    service: TodoTaskService = Depends(get_todo_task_service)
):
    task = service.update_todo_task_status(task_id, status)
    if not task:
        raise HTTPException(status_code=404, detail="Todo task not found")
    return TodoTaskResponse.from_orm(task)