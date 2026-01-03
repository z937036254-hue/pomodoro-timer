import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  pomodorosCompleted: number;
  createdAt: number;
}

const TASKS_STORAGE_KEY = '@pomodoro_tasks';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载任务
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const saved = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (saved) {
        const loadedTasks: Task[] = JSON.parse(saved);
        setTasks(loadedTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (updatedTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = useCallback(async (name: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name: name.trim(),
      completed: false,
      pomodorosCompleted: 0,
      createdAt: Date.now(),
    };
    const updatedTasks = [newTask, ...tasks];
    await saveTasks(updatedTasks);
  }, [tasks]);

  const deleteTask = useCallback(async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    await saveTasks(updatedTasks);
  }, [tasks]);

  const toggleTaskCompletion = useCallback(async (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await saveTasks(updatedTasks);
  }, [tasks]);

  const incrementTaskPomodoros = useCallback(async (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, pomodorosCompleted: task.pomodorosCompleted + 1 } : task
    );
    await saveTasks(updatedTasks);
  }, [tasks]);

  return {
    tasks,
    loading,
    addTask,
    deleteTask,
    toggleTaskCompletion,
    incrementTaskPomodoros,
  };
}
