// Utility functions for service task calculations and filtering

import { ServiceTask, ServiceTaskStatus } from '../types/api';

export const calculateTaskStatus = (task: ServiceTask, currentMileage: number): ServiceTaskStatus => {
  const { next_due_mileage, next_due_date } = task;
  const today = new Date();
  
  // If already completed recently, return completed status
  if (task.status === ServiceTaskStatus.COMPLETED) {
    return ServiceTaskStatus.COMPLETED;
  }
  
  let isOverdueMileage = false;
  let isOverdueDate = false;
  
  // Check mileage-based overdue
  if (next_due_mileage !== null && next_due_mileage !== undefined && currentMileage > next_due_mileage) {
    isOverdueMileage = true;
  }
  
  // Check date-based overdue
  if (next_due_date) {
    const dueDate = new Date(next_due_date);
    if (today > dueDate) {
      isOverdueDate = true;
    }
  }
  
  // If overdue by either metric, return overdue
  if (isOverdueMileage || isOverdueDate) {
    return ServiceTaskStatus.OVERDUE;
  }
  
  return ServiceTaskStatus.PENDING;
};

export const filterTasksByStatus = (tasks: ServiceTask[], status: ServiceTaskStatus, currentMileage: number): ServiceTask[] => {
  return tasks.filter(task => {
    const calculatedStatus = calculateTaskStatus(task, currentMileage);
    return calculatedStatus === status;
  });
};

export const getTasksGroupedByStatus = (tasks: ServiceTask[], currentMileage: number) => {
  const due = filterTasksByStatus(tasks, ServiceTaskStatus.OVERDUE, currentMileage);
  const pending = filterTasksByStatus(tasks, ServiceTaskStatus.PENDING, currentMileage);
  const completed = filterTasksByStatus(tasks, ServiceTaskStatus.COMPLETED, currentMileage);
  
  return {
    due: due.concat(pending), // Combine overdue and pending as "due"
    completed,
    total: tasks
  };
};

export const getNextServiceMileage = (task: ServiceTask, currentMileage: number): number | null => {
  const { mileage_interval, last_completed_mileage } = task;
  
  if (!mileage_interval) return null;
  
  const baseMileage = last_completed_mileage !== null && last_completed_mileage !== undefined 
    ? last_completed_mileage 
    : 0;
    
  return baseMileage + mileage_interval;
};

export const getNextServiceDate = (task: ServiceTask): Date | null => {
  const { time_interval_months, last_completed_date } = task;
  
  if (!time_interval_months) return null;
  
  const baseDate = last_completed_date ? new Date(last_completed_date) : new Date();
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + time_interval_months);
  
  return nextDate;
};

export const getMileageUntilService = (task: ServiceTask, currentMileage: number): number | null => {
  const nextMileage = getNextServiceMileage(task, currentMileage);
  if (!nextMileage) return null;
  
  return Math.max(0, nextMileage - currentMileage);
};

export const getDaysUntilService = (task: ServiceTask): number | null => {
  const nextDate = getNextServiceDate(task);
  if (!nextDate) return null;
  
  const today = new Date();
  const diffInMs = nextDate.getTime() - today.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};

export const isTaskOverdue = (task: ServiceTask, currentMileage: number): boolean => {
  return calculateTaskStatus(task, currentMileage) === ServiceTaskStatus.OVERDUE;
};

export const getTaskUrgency = (task: ServiceTask, currentMileage: number): 'high' | 'medium' | 'low' => {
  if (isTaskOverdue(task, currentMileage)) {
    return 'high';
  }
  
  const mileageUntil = getMileageUntilService(task, currentMileage);
  const daysUntil = getDaysUntilService(task);
  
  // High urgency if within 500 miles or 30 days
  if ((mileageUntil && mileageUntil <= 500) || (daysUntil && daysUntil <= 30)) {
    return 'high';
  }
  
  // Medium urgency if within 1500 miles or 90 days
  if ((mileageUntil && mileageUntil <= 1500) || (daysUntil && daysUntil <= 90)) {
    return 'medium';
  }
  
  return 'low';
};