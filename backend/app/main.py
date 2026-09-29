import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .infrastructure.database import engine, Base
from .api.endpoints import motorcycles, service_tasks, service_records, todo_tasks

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Clutch Log API",
    description="API for motorcycle maintenance tracking",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(motorcycles.router, prefix="/api/motorcycles", tags=["motorcycles"])
app.include_router(service_tasks.router, prefix="/api/service-tasks", tags=["service-tasks"])
app.include_router(service_records.router, prefix="/api/service-records", tags=["service-records"])
app.include_router(todo_tasks.router, prefix="/api/todo-tasks", tags=["todo-tasks"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Clutch Log API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
