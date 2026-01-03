import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyStats {
  date: string; // YYYY-MM-DD
  pomodorosCompleted: number;
  focusMinutes: number;
  tasksCompleted: number;
}

const STATS_STORAGE_KEY = '@pomodoro_stats';

export function useStats() {
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const saved = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (saved) {
        const loadedStats: DailyStats[] = JSON.parse(saved);
        setStats(loadedStats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveStats = async (updatedStats: DailyStats[]) => {
    try {
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updatedStats));
      setStats(updatedStats);
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  };

  const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getTodayStats = useCallback((): DailyStats => {
    const today = getTodayDate();
    const todayStats = stats.find(s => s.date === today);
    return todayStats || {
      date: today,
      pomodorosCompleted: 0,
      focusMinutes: 0,
      tasksCompleted: 0,
    };
  }, [stats]);

  const getWeekStats = useCallback((): DailyStats[] => {
    const today = new Date();
    const weekStats: DailyStats[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayStats = stats.find(s => s.date === dateStr) || {
        date: dateStr,
        pomodorosCompleted: 0,
        focusMinutes: 0,
        tasksCompleted: 0,
      };
      
      weekStats.push(dayStats);
    }
    
    return weekStats;
  }, [stats]);

  const getTotalStats = useCallback(() => {
    return stats.reduce(
      (acc, day) => ({
        totalPomodoros: acc.totalPomodoros + day.pomodorosCompleted,
        totalMinutes: acc.totalMinutes + day.focusMinutes,
        totalTasks: acc.totalTasks + day.tasksCompleted,
      }),
      { totalPomodoros: 0, totalMinutes: 0, totalTasks: 0 }
    );
  }, [stats]);

  const recordPomodoro = useCallback(async () => {
    const today = getTodayDate();
    const existingIndex = stats.findIndex(s => s.date === today);
    
    let updatedStats: DailyStats[];
    if (existingIndex >= 0) {
      updatedStats = [...stats];
      updatedStats[existingIndex] = {
        ...updatedStats[existingIndex],
        pomodorosCompleted: updatedStats[existingIndex].pomodorosCompleted + 1,
        focusMinutes: updatedStats[existingIndex].focusMinutes + 25,
      };
    } else {
      const newDayStats: DailyStats = {
        date: today,
        pomodorosCompleted: 1,
        focusMinutes: 25,
        tasksCompleted: 0,
      };
      updatedStats = [newDayStats, ...stats];
    }
    
    await saveStats(updatedStats);
  }, [stats]);

  const recordTaskCompletion = useCallback(async () => {
    const today = getTodayDate();
    const existingIndex = stats.findIndex(s => s.date === today);
    
    let updatedStats: DailyStats[];
    if (existingIndex >= 0) {
      updatedStats = [...stats];
      updatedStats[existingIndex] = {
        ...updatedStats[existingIndex],
        tasksCompleted: updatedStats[existingIndex].tasksCompleted + 1,
      };
    } else {
      const newDayStats: DailyStats = {
        date: today,
        pomodorosCompleted: 0,
        focusMinutes: 0,
        tasksCompleted: 1,
      };
      updatedStats = [newDayStats, ...stats];
    }
    
    await saveStats(updatedStats);
  }, [stats]);

  return {
    loading,
    getTodayStats,
    getWeekStats,
    getTotalStats,
    recordPomodoro,
    recordTaskCompletion,
  };
}
