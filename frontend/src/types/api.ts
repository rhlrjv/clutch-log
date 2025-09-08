// API Type Definitions for Clutch Log

export interface Motorcycle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  current_mileage: number;
  vin?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  purchase_date?: string;
  created_at: string;
  updated_at: string;
}

export interface MotorcycleCreate {
  name: string;
  make: string;
  model: string;
  year: number;
  current_mileage: number;
  vin?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  insurance_expiry?: string;
  purchase_date?: string;
  create_service_schedule: boolean;
}

export enum ServiceTaskType {
  OIL_CHANGE = 'oil_change',
  CHAIN_MAINTENANCE = 'chain_maintenance',
  AIR_FILTER = 'air_filter',
  SPARK_PLUGS = 'spark_plugs',
  BRAKE_PADS = 'brake_pads',
  BRAKE_FLUID = 'brake_fluid',
  COOLANT = 'coolant',
  TIRE_ROTATION = 'tire_rotation',
  VALVE_ADJUSTMENT = 'valve_adjustment',
  DESMODROMIC_SERVICE = 'desmodromic_service'
}

export enum ServiceTaskStatus {
  PENDING = 'pending',
  OVERDUE = 'overdue',
  COMPLETED = 'completed'
}

export interface ServiceTask {
  id: string;
  motorcycle_id: string;
  task_type: ServiceTaskType;
  name: string;
  description: string;
  mileage_interval?: number;
  time_interval_months?: number;
  last_completed_mileage?: number;
  last_completed_date?: string;
  next_due_mileage?: number;
  next_due_date?: string;
  status: ServiceTaskStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecord {
  id: string;
  motorcycle_id: string;
  service_task_id?: string;
  name: string;
  description: string;
  service_date: string;
  mileage_at_service: number;
  cost?: number;
  service_provider?: string;
  parts_used?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRecordCreate {
  motorcycle_id: string;
  service_task_id?: string;
  name: string;
  description: string;
  service_date: string;
  mileage_at_service: number;
  cost?: number;
  service_provider?: string;
  parts_used?: string[];
  notes?: string;
}

export enum TodoTaskStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

export enum TodoTaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TodoTask {
  id: string;
  motorcycle_id: string;
  title: string;
  description?: string;
  status: TodoTaskStatus;
  priority: TodoTaskPriority;
  due_date?: string;
  completed_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TodoTaskCreate {
  motorcycle_id: string;
  title: string;
  description?: string;
  status: TodoTaskStatus;
  priority: TodoTaskPriority;
  due_date?: string;
}

export interface TodoTaskUpdate {
  title?: string;
  description?: string;
  status?: TodoTaskStatus;
  priority?: TodoTaskPriority;
  due_date?: string;
}

export interface ApiError {
  detail: string;
}