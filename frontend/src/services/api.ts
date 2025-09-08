// API Client for Clutch Log

import {
  Motorcycle,
  MotorcycleCreate,
  ServiceTask,
  ServiceRecord,
  ServiceRecordCreate,
  TodoTask,
  TodoTaskCreate,
  TodoTaskUpdate,
  ApiError
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health');
  }

  // Motorcycle endpoints
  async getMotorcycles(): Promise<Motorcycle[]> {
    return this.request('/api/motorcycles');
  }

  async createMotorcycle(motorcycle: MotorcycleCreate): Promise<Motorcycle> {
    return this.request('/api/motorcycles', {
      method: 'POST',
      body: JSON.stringify(motorcycle),
    });
  }

  async getMotorcycle(id: string): Promise<Motorcycle> {
    return this.request(`/api/motorcycles/${id}`);
  }

  async updateMotorcycle(id: string, motorcycle: Partial<MotorcycleCreate>): Promise<Motorcycle> {
    return this.request(`/api/motorcycles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(motorcycle),
    });
  }

  async deleteMotorcycle(id: string): Promise<void> {
    return this.request(`/api/motorcycles/${id}`, {
      method: 'DELETE',
    });
  }

  async updateMotorcycleMileage(id: string, mileage: number): Promise<Motorcycle> {
    return this.request(`/api/motorcycles/${id}/mileage`, {
      method: 'PUT',
      body: JSON.stringify({ mileage }),
    });
  }

  async getAvailableMakes(): Promise<string[]> {
    return this.request('/api/motorcycles/makes');
  }

  async getAvailableModels(make: string): Promise<string[]> {
    return this.request(`/api/motorcycles/makes/${make}/models`);
  }

  // Service Task endpoints
  async getServiceTasks(motorcycleId: string): Promise<ServiceTask[]> {
    return this.request(`/api/motorcycles/${motorcycleId}/service-tasks`);
  }

  async completeServiceTask(taskId: string, mileage: number, completedDate?: string): Promise<ServiceTask> {
    return this.request(`/api/service-tasks/${taskId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        mileage,
        completed_date: completedDate || new Date().toISOString().split('T')[0]
      }),
    });
  }

  // Service Record endpoints
  async getServiceRecords(motorcycleId: string): Promise<ServiceRecord[]> {
    return this.request(`/api/motorcycles/${motorcycleId}/service-records`);
  }

  async createServiceRecord(record: ServiceRecordCreate): Promise<ServiceRecord> {
    return this.request('/api/service-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  }

  // Todo Task endpoints
  async getTodoTasks(motorcycleId: string): Promise<TodoTask[]> {
    return this.request(`/api/motorcycles/${motorcycleId}/todo-tasks`);
  }

  async createTodoTask(task: TodoTaskCreate): Promise<TodoTask> {
    return this.request('/api/todo-tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTodoTask(id: string, task: TodoTaskUpdate): Promise<TodoTask> {
    return this.request(`/api/todo-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }
}

export const motorcycleApi = new ApiClient();