import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  AppDataStore,
  DailySessionRecord,
  FocusSessionLog,
  Subject,
  Topic,
  TopicStatus,
  AppSettings,
  Exam,
  TimetableSlot,
  AppearanceSettings,
  ThemeMode
} from '../types';
import { getTodayDateString } from '../utils/time';
import { soundSynth } from '../utils/audio';
import { applyTheme } from '../utils/theme';
import { generateSmartRecommendations, SmartRecommendation } from '../utils/recommendations';

export interface FocusPreload {
  subjectId?: string;
  moduleId?: string;
  topicId?: string;
  topicTitle?: string;
  slotId?: string;
  recordId?: string;
}

interface AppContextType {
  data: AppDataStore | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  focusPreload: FocusPreload | null;
  startFocusSessionWithPreload: (preload: FocusPreload) => void;
  clearFocusPreload: () => void;
  recommendations: SmartRecommendation;
  markSessionCompleted: (recordId: string) => Promise<void>;
  markSessionSkipped: (recordId: string) => Promise<void>;
  rescheduleSession: (recordId: string, newStartTime: string, newEndTime: string, newDate?: string) => Promise<void>;
  logFocusSession: (log: Omit<FocusSessionLog, 'id' | 'timestamp'>) => Promise<void>;
  updateSubjects: (subjects: Subject[]) => Promise<void>;
  addModule: (subjectId: string, moduleName: string) => Promise<void>;
  addTopic: (subjectId: string, moduleId: string, topic: Omit<Topic, 'id'>) => Promise<void>;
  editTopic: (subjectId: string, moduleId: string, topicId: string, updates: Partial<Topic>) => Promise<void>;
  setTopicStatus: (subjectId: string, moduleId: string, topicId: string, status: TopicStatus) => Promise<void>;
  deleteTopic: (subjectId: string, moduleId: string, topicId: string) => Promise<void>;
  updateTimetable: (timetable: TimetableSlot[]) => Promise<void>;
  updateExams: (exams: Exam[]) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  updateAppearance: (appearance: Partial<AppearanceSettings>) => Promise<void>;
  toggleThemeMode: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; error?: string }>;
  testNotification: () => Promise<boolean>;
  triggerConfetti: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppDataStore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [focusPreload, setFocusPreload] = useState<FocusPreload | null>(null);

  const loadData = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const store = await window.electronAPI.getStoreData();
        setData(store);
        if (store.settings?.appearance) {
          applyTheme(store.settings.appearance);
        }
      }
    } catch (err) {
      console.error('Failed to load store from Electron:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    if (window.electronAPI) {
      const unsubUpdate = window.electronAPI.onStoreUpdated((updatedData) => {
        setData(updatedData);
        if (updatedData.settings?.appearance) {
          applyTheme(updatedData.settings.appearance);
        }
      });

      const unsubNotif = window.electronAPI.onNotificationClicked(() => {
        setActiveTab('focus');
      });

      return () => {
        unsubUpdate();
        unsubNotif();
      };
    }
  }, [loadData]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#00f0ff', '#10b981', '#f43f5e', '#ffffff'],
      });
    } catch {}
  };

  const saveData = async (partial: Partial<AppDataStore>) => {
    if (!data) return;
    const updated = { ...data, ...partial };
    setData(updated);
    if (window.electronAPI) {
      await window.electronAPI.saveStoreData(partial);
    }
  };

  const recommendations = useMemo(() => {
    if (!data) {
      return {
        nextTopic: null,
        incompleteModules: [],
        revisionQueue: [],
        fallingBehindSubjects: [],
        dailyTarget: { targetSessions: 8, targetTopics: 4, focusGuidance: 'Initialize study plan' }
      };
    }
    return generateSmartRecommendations(data.subjects, data.exams);
  }, [data]);

  const startFocusSessionWithPreload = (preload: FocusPreload) => {
    setFocusPreload(preload);
    setActiveTab('focus');
  };

  const clearFocusPreload = () => {
    setFocusPreload(null);
  };

  const markSessionCompleted = async (recordId: string) => {
    if (!data) return;
    const today = getTodayDateString();
    const records = [...(data.dailyRecords[today] || [])];
    const idx = records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
      const updatedDaily = {
        ...data.dailyRecords,
        [today]: records,
      };
      await saveData({ dailyRecords: updatedDaily });
      triggerConfetti();
      if (data.settings.notificationSoundEnabled) {
        soundSynth.playCompleteFanfare();
      }
    }
  };

  const markSessionSkipped = async (recordId: string) => {
    if (!data) return;
    const today = getTodayDateString();
    const records = [...(data.dailyRecords[today] || [])];
    const idx = records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        status: 'SKIPPED',
      };
      const updatedDaily = {
        ...data.dailyRecords,
        [today]: records,
      };
      await saveData({ dailyRecords: updatedDaily });
    }
  };

  const rescheduleSession = async (
    recordId: string,
    newStartTime: string,
    newEndTime: string,
    newDate?: string
  ) => {
    if (!data) return;
    const today = getTodayDateString();
    const records = [...(data.dailyRecords[today] || [])];
    const idx = records.findIndex(r => r.id === recordId);
    if (idx !== -1) {
      records[idx] = {
        ...records[idx],
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'RESCHEDULED',
        rescheduledTo: {
          startTime: newStartTime,
          endTime: newEndTime,
          date: newDate || today,
        },
      };
      const updatedDaily = {
        ...data.dailyRecords,
        [today]: records,
      };
      await saveData({ dailyRecords: updatedDaily });
    }
  };

  const logFocusSession = async (logData: Omit<FocusSessionLog, 'id' | 'timestamp'>) => {
    if (!data) return;
    const newLog: FocusSessionLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...logData,
    };
    const updatedLogs = [newLog, ...(data.focusLogs || [])];
    await saveData({ focusLogs: updatedLogs });
  };

  const updateSubjects = async (subjects: Subject[]) => {
    await saveData({ subjects });
  };

  const addModule = async (subjectId: string, moduleName: string) => {
    if (!data) return;
    const subjects = data.subjects.map(s => {
      if (s.id === subjectId) {
        const nextModNum = s.modules.length + 1;
        const newMod = {
          id: `mod-${s.code.toLowerCase()}-${Date.now()}`,
          moduleNumber: nextModNum,
          name: moduleName,
          topics: [],
        };
        return { ...s, modules: [...s.modules, newMod] };
      }
      return s;
    });
    await saveData({ subjects });
  };

  const addTopic = async (subjectId: string, moduleId: string, topicData: Omit<Topic, 'id'>) => {
    if (!data) return;
    const subjects = data.subjects.map(s => {
      if (s.id === subjectId) {
        const modules = s.modules.map(m => {
          if (m.id === moduleId) {
            const newTopic: Topic = {
              id: `top-${Date.now()}`,
              ...topicData,
              status: topicData.status || 'NOT_STARTED',
              completed: topicData.status === 'COMPLETED' || topicData.completed || false,
            };
            return { ...m, topics: [...m.topics, newTopic] };
          }
          return m;
        });
        return { ...s, modules };
      }
      return s;
    });
    await saveData({ subjects });
  };

  const editTopic = async (subjectId: string, moduleId: string, topicId: string, updates: Partial<Topic>) => {
    if (!data) return;
    const subjects = data.subjects.map(s => {
      if (s.id === subjectId) {
        const modules = s.modules.map(m => {
          if (m.id === moduleId) {
            const topics = m.topics.map(t => {
              if (t.id === topicId) {
                return { ...t, ...updates };
              }
              return t;
            });
            return { ...m, topics };
          }
          return m;
        });
        return { ...s, modules };
      }
      return s;
    });
    await saveData({ subjects });
  };

  const setTopicStatus = async (subjectId: string, moduleId: string, topicId: string, status: TopicStatus) => {
    if (!data) return;
    const isCompleted = status === 'COMPLETED';
    const needsRevision = status === 'NEEDS_REVISION';

    const subjects = data.subjects.map(s => {
      if (s.id === subjectId) {
        const modules = s.modules.map(m => {
          if (m.id === moduleId) {
            const topics = m.topics.map(t => {
              if (t.id === topicId) {
                return {
                  ...t,
                  status,
                  completed: isCompleted,
                  needsRevision,
                  completedAt: isCompleted ? new Date().toISOString() : undefined,
                };
              }
              return t;
            });
            return { ...m, topics };
          }
          return m;
        });
        return { ...s, modules };
      }
      return s;
    });

    await saveData({ subjects });
    if (isCompleted) {
      triggerConfetti();
      if (data.settings.notificationSoundEnabled) {
        soundSynth.playCompleteFanfare();
      }
    }
  };

  const deleteTopic = async (subjectId: string, moduleId: string, topicId: string) => {
    if (!data) return;
    const subjects = data.subjects.map(s => {
      if (s.id === subjectId) {
        const modules = s.modules.map(m => {
          if (m.id === moduleId) {
            return { ...m, topics: m.topics.filter(t => t.id !== topicId) };
          }
          return m;
        });
        return { ...s, modules };
      }
      return s;
    });
    await saveData({ subjects });
  };

  const updateTimetable = async (timetable: TimetableSlot[]) => {
    await saveData({ timetable });
  };

  const updateExams = async (exams: Exam[]) => {
    await saveData({ exams });
  };

  const updateSettings = async (settings: Partial<AppSettings>) => {
    if (!data) return;
    const newSettings = { ...data.settings, ...settings };
    await saveData({ settings: newSettings });

    if (settings.launchOnStartup !== undefined && window.electronAPI) {
      await window.electronAPI.setStartupSetting(settings.launchOnStartup);
    }
  };

  const updateAppearance = async (appearanceUpdates: Partial<AppearanceSettings>) => {
    if (!data) return;
    const newAppearance = {
      ...data.settings.appearance,
      ...appearanceUpdates,
    };
    applyTheme(newAppearance);
    await updateSettings({ appearance: newAppearance });
  };

  const toggleThemeMode = async () => {
    if (!data) return;
    const current = data.settings.appearance.themeMode;
    let next: ThemeMode = 'dark';
    if (current === 'dark') next = 'light';
    else if (current === 'light') next = 'system';
    else next = 'dark';
    await updateAppearance({ themeMode: next });
  };

  const resetToDefaults = async () => {
    if (window.electronAPI) {
      const resetData = await window.electronAPI.resetStoreData();
      setData(resetData);
      if (resetData.settings?.appearance) {
        applyTheme(resetData.settings.appearance);
      }
    }
  };

  const exportData = async () => {
    if (window.electronAPI) {
      return await window.electronAPI.exportData();
    }
    return { success: false, error: 'Not running in desktop app.' };
  };

  const importData = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.importData();
      if (result.success && result.data) {
        setData(result.data);
        if (result.data.settings?.appearance) {
          applyTheme(result.data.settings.appearance);
        }
      }
      return result;
    }
    return { success: false, error: 'Not running in desktop app.' };
  };

  const testNotification = async () => {
    if (window.electronAPI) {
      return await window.electronAPI.testNotification();
    }
    return false;
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        activeTab,
        setActiveTab,
        focusPreload,
        startFocusSessionWithPreload,
        clearFocusPreload,
        recommendations,
        markSessionCompleted,
        markSessionSkipped,
        rescheduleSession,
        logFocusSession,
        updateSubjects,
        addModule,
        addTopic,
        editTopic,
        setTopicStatus,
        deleteTopic,
        updateTimetable,
        updateExams,
        updateSettings,
        updateAppearance,
        toggleThemeMode,
        resetToDefaults,
        exportData,
        importData,
        testNotification,
        triggerConfetti,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
