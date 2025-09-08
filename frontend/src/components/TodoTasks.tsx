import React, { useState, useEffect } from 'react';
import { Motorcycle, TodoTask, TodoTaskCreate, TodoTaskUpdate, TodoTaskStatus, TodoTaskPriority } from '../types/api';
import { motorcycleApi } from '../services/api';
import { formatDate, formatPriority, formatStatus, getDaysUntilDue } from '../utils/formatters';

interface TodoTasksProps {
  motorcycle: Motorcycle;
}

type TaskFilter = 'open' | 'completed' | 'all';

const TodoTasks: React.FC<TodoTasksProps> = ({ motorcycle }) => {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('open');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<TodoTaskCreate>({
    motorcycle_id: motorcycle.id,
    title: '',
    description: '',
    status: TodoTaskStatus.OPEN,
    priority: TodoTaskPriority.MEDIUM,
  });

  useEffect(() => {
    loadTodoTasks();
  }, [motorcycle.id]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, motorcycle_id: motorcycle.id }));
  }, [motorcycle.id]);

  const loadTodoTasks = async () => {
    try {
      setLoading(true);
      const data = await motorcycleApi.getTodoTasks(motorcycle.id);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load todo tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newTask = await motorcycleApi.createTodoTask(formData);
      setTasks(prev => [newTask, ...prev]);
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: TodoTaskUpdate) => {
    try {
      const updatedTask = await motorcycleApi.updateTodoTask(taskId, updates);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const resetForm = () => {
    setFormData({
      motorcycle_id: motorcycle.id,
      title: '',
      description: '',
      status: TodoTaskStatus.OPEN,
      priority: TodoTaskPriority.MEDIUM,
    });
    setError(null);
  };

  const getFilteredTasks = () => {
    switch (activeFilter) {
      case 'open':
        return tasks.filter(task => task.status !== TodoTaskStatus.COMPLETED);
      case 'completed':
        return tasks.filter(task => task.status === TodoTaskStatus.COMPLETED);
      case 'all':
        return tasks;
      default:
        return [];
    }
  };

  const getTaskStats = () => {
    const openTasks = tasks.filter(task => task.status !== TodoTaskStatus.COMPLETED);
    const completedTasks = tasks.filter(task => task.status === TodoTaskStatus.COMPLETED);
    
    return {
      open: openTasks.length,
      completed: completedTasks.length,
      total: tasks.length
    };
  };

  if (loading) {
    return (
      <div className="todo-tasks-loading">
        <div className="loading-spinner"></div>
        <p>Loading todo tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="todo-tasks-error">
        <p>{error}</p>
        <button onClick={loadTodoTasks}>Try Again</button>
      </div>
    );
  }

  const stats = getTaskStats();
  const filteredTasks = getFilteredTasks();

  return (
    <div className="todo-tasks">
      <div className="todo-tasks-header">
        <h2>Todo Tasks</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
          disabled={showAddForm}
        >
          Add Todo Task
        </button>
      </div>

      <div className="task-summary">
        <div className="summary-stats">
          <div className="stat open">
            <span className="stat-number">{stats.open}</span>
            <span className="stat-label">Open</span>
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
          className={activeFilter === 'open' ? 'active' : ''}
          onClick={() => setActiveFilter('open')}
        >
          Open ({stats.open})
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

      {showAddForm && (
        <div className="add-todo-task-form">
          <h3>Add Todo Task</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                placeholder="e.g., Check tire pressure, Clean air filter"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about the task..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TodoTaskPriority }))}
                >
                  <option value={TodoTaskPriority.LOW}>Low</option>
                  <option value={TodoTaskPriority.MEDIUM}>Medium</option>
                  <option value={TodoTaskPriority.HIGH}>High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="due_date">Due Date</label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value || undefined }))}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="empty-tasks">
          {activeFilter === 'open' ? (
            <>
              <h3>No open tasks</h3>
              <p>All your todo tasks are completed!</p>
            </>
          ) : activeFilter === 'completed' ? (
            <>
              <h3>No completed tasks yet</h3>
              <p>Complete some tasks to see them here.</p>
            </>
          ) : (
            <>
              <h3>No todo tasks yet</h3>
              <p>Add todo tasks to keep track of maintenance reminders and custom tasks.</p>
            </>
          )}
        </div>
      ) : (
        <div className="todo-tasks-list">
          {filteredTasks.map(task => (
            <TodoTaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface TodoTaskCardProps {
  task: TodoTask;
  onUpdate: (taskId: string, updates: TodoTaskUpdate) => void;
}

const TodoTaskCard: React.FC<TodoTaskCardProps> = ({ task, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<TodoTaskUpdate>({
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
  });

  const isOverdue = task.due_date && task.status !== TodoTaskStatus.COMPLETED && 
                   getDaysUntilDue(task.due_date) < 0;

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
    });
    setIsEditing(false);
  };

  const toggleStatus = () => {
    const newStatus = task.status === TodoTaskStatus.COMPLETED 
      ? TodoTaskStatus.OPEN 
      : TodoTaskStatus.COMPLETED;
    onUpdate(task.id, { status: newStatus });
  };

  const getStatusColor = () => {
    if (isOverdue) return 'overdue';
    switch (task.status) {
      case TodoTaskStatus.COMPLETED:
        return 'completed';
      case TodoTaskStatus.IN_PROGRESS:
        return 'in_progress';
      case TodoTaskStatus.OPEN:
      default:
        return 'open';
    }
  };

  const getPriorityColor = () => {
    switch (task.priority) {
      case TodoTaskPriority.HIGH:
        return 'high';
      case TodoTaskPriority.MEDIUM:
        return 'medium';
      case TodoTaskPriority.LOW:
      default:
        return 'low';
    }
  };

  return (
    <div className={`todo-task-card ${getStatusColor()}`}>
      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <input
              type="text"
              value={editData.title || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Task title"
            />
          </div>
          
          <div className="form-group">
            <textarea
              value={editData.description || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description"
              rows={2}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <select
                value={editData.status}
                onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as TodoTaskStatus }))}
              >
                <option value={TodoTaskStatus.OPEN}>Open</option>
                <option value={TodoTaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TodoTaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
            
            <div className="form-group">
              <select
                value={editData.priority}
                onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as TodoTaskPriority }))}
              >
                <option value={TodoTaskPriority.LOW}>Low</option>
                <option value={TodoTaskPriority.MEDIUM}>Medium</option>
                <option value={TodoTaskPriority.HIGH}>High</option>
              </select>
            </div>
            
            <div className="form-group">
              <input
                type="date"
                value={editData.due_date || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, due_date: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={handleCancel}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-header">
            <div className="task-title">
              <h3>{task.title}</h3>
            </div>
            <div className="task-badges">
              <span className={`priority-badge ${getPriorityColor()}`}>
                {formatPriority(task.priority)}
              </span>
              <span className={`status-badge ${task.status}`}>
                {formatStatus(task.status)}
              </span>
            </div>
          </div>

          {task.description && (
            <div className="task-description">
              {task.description}
            </div>
          )}

          <div className="task-metadata">
            <div className="metadata-item">
              <label>Priority:</label>
              <span>{formatPriority(task.priority)}</span>
            </div>
            
            <div className="metadata-item">
              <label>Status:</label>
              <span>{formatStatus(task.status)}</span>
            </div>
            
            {task.due_date && (
              <div className={`metadata-item ${isOverdue ? 'overdue' : ''}`}>
                <label>Due Date:</label>
                <span>
                  {formatDate(task.due_date)}
                  {isOverdue && ' (Overdue)'}
                </span>
              </div>
            )}
            
            {task.completed_date && (
              <div className="metadata-item">
                <label>Completed:</label>
                <span>{formatDate(task.completed_date)}</span>
              </div>
            )}
          </div>

          <div className="task-actions">
            <button onClick={toggleStatus} className="btn-secondary">
              Mark as {task.status === TodoTaskStatus.COMPLETED ? 'Open' : 'Complete'}
            </button>
            <button onClick={() => setIsEditing(true)} className="btn-secondary">
              Edit
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TodoTasks;