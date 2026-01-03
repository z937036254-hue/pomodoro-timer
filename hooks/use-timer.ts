import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export interface TimerSettings {
  workDuration: number; // 分钟
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // 多少个番茄钟后长休息
}

export interface TimerState {
  mode: TimerMode;
  timeLeft: number; // 秒
  isRunning: boolean;
  completedPomodoros: number;
  currentTask: string;
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
};

const STORAGE_KEY = '@pomodoro_timer_state';
const SETTINGS_KEY = '@pomodoro_timer_settings';

export function useTimer() {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // 加载设置和状态
  useEffect(() => {
    loadSettings();
    loadState();
  }, []);

  // 保存状态
  useEffect(() => {
    saveState();
  }, [mode, timeLeft, isRunning, completedPomodoros, currentTask]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) {
        const loadedSettings = JSON.parse(saved);
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadState = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state: TimerState = JSON.parse(saved);
        setMode(state.mode);
        setTimeLeft(state.timeLeft);
        setCompletedPomodoros(state.completedPomodoros);
        setCurrentTask(state.currentTask);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  };

  const saveState = async () => {
    try {
      const state: TimerState = {
        mode,
        timeLeft,
        isRunning,
        completedPomodoros,
        currentTask,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const updateSettings = useCallback(async (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const getDuration = useCallback((timerMode: TimerMode) => {
    switch (timerMode) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  }, [settings]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [getDuration]);

  const sendNotification = async (title: string, body: string) => {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const onTimerComplete = useCallback(async () => {
    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      await sendNotification(
        '番茄钟完成！',
        `恭喜完成一个番茄钟！已完成 ${newCount} 个番茄钟。`
      );

      // 决定下一个模式
      const nextMode = newCount % settings.longBreakInterval === 0 
        ? 'longBreak' 
        : 'shortBreak';
      switchMode(nextMode);
    } else {
      await sendNotification(
        '休息结束！',
        '休息时间到，准备开始下一个番茄钟吧！'
      );
      switchMode('work');
    }
  }, [mode, completedPomodoros, settings.longBreakInterval, switchMode]);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = timeLeft;

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
      const remaining = pausedTimeRef.current - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onTimerComplete();
      } else {
        setTimeLeft(remaining);
      }
    }, 100);
  }, [isRunning, timeLeft, onTimerComplete]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(getDuration(mode));
  }, [mode, getDuration]);

  const selectTask = useCallback((task: string) => {
    setCurrentTask(task);
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    mode,
    timeLeft,
    isRunning,
    completedPomodoros,
    currentTask,
    settings,
    start,
    pause,
    reset,
    switchMode,
    selectTask,
    updateSettings,
  };
}
