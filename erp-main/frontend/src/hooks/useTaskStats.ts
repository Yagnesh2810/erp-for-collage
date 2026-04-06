"use client";

import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '@/lib/api/tasksAPI';
import { useSocket } from './useSocket';

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export const useTaskStats = () => {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    completed: 0,
    overdue: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tasks = await tasksAPI.getAll();
      const now = new Date();
      
      const newStats = {
        total: tasks.length,
        todo: tasks.filter(task => task.status === 'todo').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        review: tasks.filter(task => task.status === 'review').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        overdue: tasks.filter(task => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          return dueDate < now && task.status !== 'completed';
        }).length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0
      };
      
      setStats(newStats);
    } catch (err) {
      console.error('Error fetching task stats:', err);
      setError('Failed to load task statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!socket) return;

    const handleTaskUpdate = () => {
      fetchStats();
    };

    socket.on('task:created', handleTaskUpdate);
    socket.on('task:updated', handleTaskUpdate);
    socket.on('task:deleted', handleTaskUpdate);
    socket.on('task:status-changed', handleTaskUpdate);

    return () => {
      socket.off('task:created', handleTaskUpdate);
      socket.off('task:updated', handleTaskUpdate);
      socket.off('task:deleted', handleTaskUpdate);
      socket.off('task:status-changed', handleTaskUpdate);
    };
  }, [socket, fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};