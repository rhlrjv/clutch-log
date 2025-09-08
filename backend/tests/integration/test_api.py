import pytest
from datetime import datetime
from uuid import UUID


class TestMotorcycleAPI:
    def test_get_available_makes(self, client):
        response = client.get("/api/motorcycles/makes")
        assert response.status_code == 200
        
        makes = response.json()
        assert "suzuki" in makes
        assert "ducati" in makes
    
    def test_get_available_models(self, client):
        response = client.get("/api/motorcycles/makes/suzuki/models")
        assert response.status_code == 200
        
        models = response.json()
        assert "sv650" in models
    
    def test_create_motorcycle_with_service_schedule(self, client, sample_motorcycle_data):
        response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        assert response.status_code == 200
        
        motorcycle = response.json()
        assert motorcycle["name"] == "My SV650"
        assert motorcycle["make"] == "suzuki"
        assert motorcycle["model"] == "sv650"
        assert "id" in motorcycle
        
        motorcycle_id = motorcycle["id"]
        
        # Check that service tasks were created
        response = client.get(f"/api/service-tasks/motorcycle/{motorcycle_id}")
        assert response.status_code == 200
        
        service_tasks = response.json()
        assert len(service_tasks) > 0
        
        # Should have oil change task
        oil_tasks = [t for t in service_tasks if "oil" in t["name"].lower()]
        assert len(oil_tasks) > 0
    
    def test_create_motorcycle_without_service_schedule(self, client, sample_motorcycle_data):
        # Disable service schedule creation
        sample_motorcycle_data["create_service_schedule"] = False
        
        response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        assert response.status_code == 200
        
        motorcycle = response.json()
        motorcycle_id = motorcycle["id"]
        
        # Check that no service tasks were created
        response = client.get(f"/api/service-tasks/motorcycle/{motorcycle_id}")
        assert response.status_code == 200
        
        service_tasks = response.json()
        assert len(service_tasks) == 0
    
    def test_get_all_motorcycles(self, client, sample_motorcycle_data):
        # Create a motorcycle first
        client.post("/api/motorcycles/", json=sample_motorcycle_data)
        
        response = client.get("/api/motorcycles/")
        assert response.status_code == 200
        
        motorcycles = response.json()
        assert len(motorcycles) >= 1
        assert motorcycles[0]["name"] == "My SV650"
    
    def test_get_motorcycle_by_id(self, client, sample_motorcycle_data):
        # Create a motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        response = client.get(f"/api/motorcycles/{motorcycle_id}")
        assert response.status_code == 200
        
        motorcycle = response.json()
        assert motorcycle["name"] == "My SV650"
    
    def test_update_motorcycle_mileage(self, client, sample_motorcycle_data):
        # Create a motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        response = client.put(f"/api/motorcycles/{motorcycle_id}/mileage?new_mileage=6000")
        assert response.status_code == 200
        
        motorcycle = response.json()
        assert motorcycle["current_mileage"] == 6000


class TestServiceTaskAPI:
    def test_create_service_task(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        task_data = {
            "motorcycle_id": motorcycle_id,
            "task_type": "oil_change",
            "name": "Custom Oil Change",
            "description": "Custom oil change task",
            "mileage_interval": 4000,
            "time_interval_months": 8
        }
        
        response = client.post("/api/service-tasks/", json=task_data)
        assert response.status_code == 200
        
        task = response.json()
        assert task["name"] == "Custom Oil Change"
        assert task["mileage_interval"] == 4000
    
    def test_get_due_service_tasks(self, client, sample_motorcycle_data):
        # Create motorcycle with high mileage
        sample_motorcycle_data["current_mileage"] = 10000
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        response = client.get(f"/api/service-tasks/motorcycle/{motorcycle_id}/due")
        assert response.status_code == 200
        
        due_tasks = response.json()
        # With high mileage, should have some overdue tasks
        assert len(due_tasks) > 0


class TestServiceRecordAPI:
    def test_create_service_record(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        record_data = {
            "motorcycle_id": motorcycle_id,
            "title": "Oil Change Service",
            "description": "Changed engine oil and filter",
            "mileage_at_service": 5500,
            "service_date": datetime.utcnow().isoformat(),
            "cost": 75.50,
            "service_location": "Local Shop",
            "parts_used": ["Oil Filter", "Engine Oil"]
        }
        
        response = client.post("/api/service-records/", json=record_data)
        assert response.status_code == 200
        
        record = response.json()
        assert record["title"] == "Oil Change Service"
        assert record["cost"] == 75.50
        assert record["parts_used"] == ["Oil Filter", "Engine Oil"]
    
    def test_get_service_records(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        # Create a service record
        record_data = {
            "motorcycle_id": motorcycle_id,
            "title": "Test Service",
            "description": "Test service record",
            "mileage_at_service": 5000,
            "service_date": datetime.utcnow().isoformat()
        }
        client.post("/api/service-records/", json=record_data)
        
        response = client.get(f"/api/service-records/motorcycle/{motorcycle_id}")
        assert response.status_code == 200
        
        records = response.json()
        assert len(records) >= 1
        assert records[0]["title"] == "Test Service"


class TestTodoTaskAPI:
    def test_create_todo_task(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        task_data = {
            "motorcycle_id": motorcycle_id,
            "title": "Fix brake light",
            "description": "Replace burnt out brake light bulb",
            "priority": "high"
        }
        
        response = client.post("/api/todo-tasks/", json=task_data)
        assert response.status_code == 200
        
        task = response.json()
        assert task["title"] == "Fix brake light"
        assert task["priority"] == "high"
        assert task["status"] == "open"
    
    def test_update_todo_task_status(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        # Create todo task
        task_data = {
            "motorcycle_id": motorcycle_id,
            "title": "Test Task",
            "description": "Test task description"
        }
        create_task_response = client.post("/api/todo-tasks/", json=task_data)
        task_id = create_task_response.json()["id"]
        
        # Update status to completed
        response = client.put(f"/api/todo-tasks/{task_id}/status?status=completed")
        assert response.status_code == 200
        
        task = response.json()
        assert task["status"] == "completed"
        assert task["completed_at"] is not None
    
    def test_get_open_todo_tasks(self, client, sample_motorcycle_data):
        # Create motorcycle first
        create_response = client.post("/api/motorcycles/", json=sample_motorcycle_data)
        motorcycle_id = create_response.json()["id"]
        
        # Create todo task
        task_data = {
            "motorcycle_id": motorcycle_id,
            "title": "Open Task",
            "description": "This should remain open"
        }
        client.post("/api/todo-tasks/", json=task_data)
        
        response = client.get(f"/api/todo-tasks/motorcycle/{motorcycle_id}/open")
        assert response.status_code == 200
        
        tasks = response.json()
        assert len(tasks) >= 1
        assert all(task["status"] != "completed" for task in tasks)


class TestHealthEndpoints:
    def test_root_endpoint(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
    
    def test_health_endpoint(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}