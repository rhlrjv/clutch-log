import React, { useState, useEffect } from 'react';
import { Motorcycle, ServiceTask, ServiceTaskStatus } from '../types/api';
import { motorcycleApi } from '../services/api';
import { formatServiceTaskType, formatMileage, formatDate } from '../utils/formatters';
import { 
  calculateTaskStatus, 
  getTasksGroupedByStatus,
  getMileageUntilService,
  getDaysUntilService,
  getTaskUrgency
} from '../utils/serviceTaskUtils';

interface ServiceTasksProps {
  motorcycle: Motorcycle;
}

type TaskFilter = 'due' | 'completed' | 'all';

const ServiceTasks: React.FC<ServiceTasksProps> = ({ motorcycle }) => {
  const [tasks, setTasks] = useState<ServiceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('due');
  const [completingTask, setCompletingTask] = useState<string | null>(null);

  useEffect(() => {
    loadServiceTasks();
  }, [motorcycle.id]);

  const loadServiceTasks = async () => {
    try {
      setLoading(true);
      const data = await motorcycleApi.getServiceTasks(motorcycle.id);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      setCompletingTask(taskId);
      const updatedTask = await motorcycleApi.completeServiceTask(taskId, motorcycle.current_mileage);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    } finally {
      setCompletingTask(null);
    }
  };

  const getFilteredTasks = () => {
    const groupedTasks = getTasksGroupedByStatus(tasks, motorcycle.current_mileage);
    
    switch (activeFilter) {
      case 'due':
        return groupedTasks.due;
      case 'completed':
        return groupedTasks.completed;
      case 'all':
        return groupedTasks.total;
      default:
        return [];
    }
  };

  const getTaskStats = () => {
    const groupedTasks = getTasksGroupedByStatus(tasks, motorcycle.current_mileage);
    return {
      due: groupedTasks.due.length,
      completed: groupedTasks.completed.length,
      total: groupedTasks.total.length
    };
  };

  if (loading) {
    return (
      <div className="service-tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading service tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="service-tasks-error">
        <p>{error}</p>
        <button onClick={loadServiceTasks}>Try Again</button>
      </div>
    );
  }

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="service-tasks">
      <div className="service-tasks-header">
        <h2>Service Tasks</h2>
        <p>Track maintenance intervals for {motorcycle.name}</p>
      </div>

      <div className="task-summary">
        <div className="summary-stats">
          <div className="stat due">
            <span className="stat-number">{stats.due}</span>
            <span className="stat-label">Due</span>
          </div>
          <div className="stat total">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat completed">
            <span className="stat-number">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="task-filters">
        <button 
          className={activeFilter === 'due' ? 'active' : ''}
          onClick={() => setActiveFilter('due')}
        >
          Due ({stats.due})
        </button>
        <button 
          className={activeFilter === 'all' ? 'active' : ''}
          onClick={() => setActiveFilter('all')}
        >
          All ({stats.total})
        </button>
        <button 
          className={activeFilter === 'completed' ? 'active' : ''}
          onClick={() => setActiveFilter('completed')}
        >
          Completed ({stats.completed})
        </button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="empty-tasks">
          {activeFilter === 'due' ? (
            <>
              <h3>No maintenance due!</h3>
              <p>Your motorcycle is up to date with scheduled maintenance.</p>
            </>
          ) : activeFilter === 'completed' ? (
            <>
              <h3>No completed tasks yet</h3>
              <p>Complete some service tasks to see them here.</p>
            </>
          ) : (
            <>
              <h3>No service tasks found</h3>
              <p>Service tasks will appear here when you add a motorcycle with predefined schedules.</p>
            </>
          )}
        </div>
      ) : (
        <div className="service-tasks-list">
          {filteredTasks.map(task => (
            <ServiceTaskCard
              key={task.id}
              task={task}
              motorcycle={motorcycle}
              onComplete={handleCompleteTask}
              isCompleting={completingTask === task.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ServiceTaskCardProps {
  task: ServiceTask;
  motorcycle: Motorcycle;
  onComplete: (taskId: string) => void;
  isCompleting: boolean;
}

const ServiceTaskCard: React.FC<ServiceTaskCardProps> = ({
  task,
  motorcycle,
  onComplete,
  isCompleting
}) => {
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const status = calculateTaskStatus(task, motorcycle.current_mileage);
  const urgency = getTaskUrgency(task, motorcycle.current_mileage);
  const mileageUntil = getMileageUntilService(task, motorcycle.current_mileage);
  const daysUntil = getDaysUntilService(task);

  const handleComplete = () => {
    onComplete(task.id);
    setShowCompleteForm(false);
  };

  const getStatusColor = (status: ServiceTaskStatus) => {
    switch (status) {
      case ServiceTaskStatus.COMPLETED:
        return 'completed';
      case ServiceTaskStatus.OVERDUE:
        return 'overdue';
      case ServiceTaskStatus.PENDING:
      default:
        return 'pending';
    }
  };

  return (
    <div className={`service-task-card ${getStatusColor(status)}`}>
      <div className="task-header">
        <div className="task-title">
          <h3>{task.name}</h3>
          <div className="task-type">{formatServiceTaskType(task.task_type)}</div>
        </div>
        <div className="task-badges">
          <span className={`task-status-badge ${getStatusColor(status)}`}>
            {status === ServiceTaskStatus.OVERDUE ? 'Overdue' : 
             status === ServiceTaskStatus.COMPLETED ? 'Completed' : 'Due'}
          </span>
        </div>
      </div>

      <div className="task-description">
        {task.description}
      </div>

      <div className="task-intervals">
        <h4>Service Intervals:</h4>
        <div className="intervals">
          {task.mileage_interval && (
            <span className="interval mileage">
              Every {formatMileage(task.mileage_interval).replace(' miles', '')} miles
            </span>
          )}
          {task.time_interval_months && (
            <span className="interval time">
              Every {task.time_interval_months} month{task.time_interval_months > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {task.last_completed_mileage && (
        <div className="last-service-info">
          <strong>Last Service:</strong>
          <div className="last-service">
            <span>Mileage: {formatMileage(task.last_completed_mileage)}</span>
            {task.last_completed_date && (
              <span>Date: {formatDate(task.last_completed_date)}</span>
            )}
          </div>
        </div>
      )}

      {status !== ServiceTaskStatus.COMPLETED && (
        <div className="next-service-info">
          <strong>Next Service:</strong>
          <div className="next-service">
            {task.next_due_mileage && (
              <span>
                At {formatMileage(task.next_due_mileage)}
                {mileageUntil !== null && mileageUntil > 0 && (
                  <span> ({formatMileage(mileageUntil)} to go)</span>
                )}
              </span>
            )}
            {task.next_due_date && (
              <span>
                By {formatDate(task.next_due_date)}
                {daysUntil !== null && daysUntil > 0 && (
                  <span> ({daysUntil} days)</span>
                )}
              </span>
            )}
          </div>
        </div>
      )}

      {status !== ServiceTaskStatus.COMPLETED && (
        <div className="task-actions">
          {!showCompleteForm ? (
            <button 
              className="complete-task-btn btn-primary"
              onClick={() => setShowCompleteForm(true)}
              disabled={isCompleting}
            >
              {isCompleting ? 'Completing...' : 'Mark as Complete'}
            </button>
          ) : (
            <div className="complete-task-form">
              <p>Mark this task as completed at current mileage ({formatMileage(motorcycle.current_mileage)})?</p>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowCompleteForm(false)}
                  disabled={isCompleting}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={handleComplete}
                  disabled={isCompleting}
                >
                  {isCompleting ? 'Completing...' : 'Yes, Complete'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ServiceTasks;