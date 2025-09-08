import pytest
import tempfile
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

from app.main import app
from app.infrastructure.database import get_db, Base


@pytest.fixture
def test_db():
    """Create a test database"""
    # Create a temporary database file
    db_fd, db_path = tempfile.mkstemp()
    database_url = f"sqlite:///{db_path}"
    
    engine = create_engine(
        database_url,
        connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        try:
            db = TestingSessionLocal()
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield TestingSessionLocal
    
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)
    app.dependency_overrides.clear()


@pytest.fixture
def client(test_db):
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def sample_motorcycle_data():
    """Sample motorcycle data for testing"""
    return {
        "name": "My SV650",
        "make": "suzuki",
        "model": "sv650",
        "year": 2020,
        "current_mileage": 5000,
        "vin": "ABC123456789",
        "insurance_provider": "Test Insurance",
        "create_service_schedule": True
    }


@pytest.fixture
def sample_ducati_data():
    """Sample Ducati data for testing"""
    return {
        "name": "My Monster",
        "make": "ducati", 
        "model": "monster 796",
        "year": 2019,
        "current_mileage": 8000,
        "create_service_schedule": True
    }