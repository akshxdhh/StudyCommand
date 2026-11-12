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
  ThemeMode,
  UserProfile,
  SessionPreset,
  FocusV3Settings,
  DisplayInfo,
  SupportedLanguage
} from '../types';
import { getTodayDateString } from '../utils/time';
import { soundSynth } from '../utils/audio';
import { applyTheme } from '../utils/theme';
import { generateSmartRecommendations, SmartRecommendation } from '../utils/recommendations';
import { translate, TranslationKey, LanguageCode } from '../i18n';
import { getPresetById } from '../utils/presets';
import { ExtractedPdfPayload } from '../utils/pdfExtractor';

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
  
  // i18n
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  t: (key: TranslationKey, fallback?: string) => string;

  // Profiles
  activeProfile: UserProfile;
  createProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => Promise<void>;
  switchProfile: (profileId: string) => Promise<void>;
  updateProfile: (profileId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;

  // Presets
  activePreset: SessionPreset;
  selectPreset: (presetId: string) => Promise<void>;
  updatePreset: (presetId: string, updates: Partial<SessionPreset>) => Promise<void>;

  // Focus V3
  isFullScreen: boolean;
  toggleFullScreen: () => Promise<boolean>;
  displays: DisplayInfo[];
  moveToDisplay: (displayId: number) => Promise<boolean>;
  updateFocusV3: (settings: Partial<FocusV3Settings>) => Promise<void>;

  // Sidebar & Onboarding
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => Promise<void>;
  showOnboarding: boolean;
  setShowOnboarding: (val: boolean) => void;
  completeOnboarding: (profileData?: Partial<UserProfile>, presetId?: string) => Promise<void>;

  // PDF Syllabus / Timetable Import
  importExtractedPayload: (extracted: ExtractedPdfPayload) => Promise<{ subjectsAdded: number; examsAdded: number }>;

  // Routine & Session Actions
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
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [displays, setDisplays] = useState<DisplayInfo[]>([]);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      if (window.electronAPI) {
        const store = await window.electronAPI.getStoreData();
        setData(store);
        if (store.settings?.appearance) {
          applyTheme(store.settings.appearance);
        }
        if (store.settings?.onboarding && !store.settings.onboarding.completed) {
          setShowOnboarding(true);
        }
        try {
          const ds = await window.electronAPI.getDisplays();
          setDisplays(ds || []);
          const fs = await window.electronAPI.isFullScreen();
          setIsFullScreen(fs);
        } catch {}
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

  // i18n
  const language: SupportedLanguage = data?.settings?.language || 'en';

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      return translate(key, language as LanguageCode, fallback);
    },
    [language]
  );

  const setLanguage = async (newLang: SupportedLanguage) => {
    if (!data) return;
    await updateSettings({ language: newLang });
  };

  // Profiles
  const activeProfile: UserProfile = useMemo(() => {
    if (!data?.settings?.profiles || data.settings.profiles.length === 0) {
      return {
        id: 'profile-default',
        name: 'Commander',
        avatar: '⚡',
        majorOrCourse: 'Computer Science (KTU S5)',
        targetExamDate: '2026-11-23',
        dailyGoalHours: 6,
        language: 'en',
        createdAt: new Date().toISOString(),
      };
    }
    const match = data.settings.profiles.find((p) => p.id === data.settings.activeProfileId);
    return match || data.settings.profiles[0];
  }, [data]);

  const switchProfile = async (profileId: string) => {
    if (!data) return;
    const profile = data.settings.profiles.find((p) => p.id === profileId);
    if (profile) {
      await updateSettings({
        activeProfileId: profileId,
        language: profile.language || data.settings.language,
      });
    }
  };

  const createProfile = async (profileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    if (!data) return;
    const newProfile: UserProfile = {
      ...profileData,
      id: `profile-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...data.settings.profiles, newProfile];
    await updateSettings({
      profiles: updated,
      activeProfileId: newProfile.id,
      language: newProfile.language,
    });
  };

  const updateProfile = async (profileId: string, updates: Partial<UserProfile>) => {
    if (!data) return;
    const updated = data.settings.profiles.map((p) => (p.id === profileId ? { ...p, ...updates } : p));
    await updateSettings({ profiles: updated });
  };

  const deleteProfile = async (profileId: string) => {
    if (!data || data.settings.profiles.length <= 1) return;
    const updated = data.settings.profiles.filter((p) => p.id !== profileId);
    const nextActive = updated[0].id;
    await updateSettings({ profiles: updated, activeProfileId: nextActive });
  };

  // Presets
  const activePreset: SessionPreset = useMemo(() => {
    return getPresetById(data?.settings?.presets, data?.settings?.activePresetId || 'preset-pomodoro');
  }, [data]);

  const selectPreset = async (presetId: string) => {
    if (!data) return;
    const preset = getPresetById(data.settings.presets, presetId);
    await updateSettings({
      activePresetId: presetId,
      focusDuration: preset.focusMinutes,
      shortBreakDuration: preset.breakMinutes,
    });
  };

  const updatePreset = async (presetId: string, updates: Partial<SessionPreset>) => {
    if (!data) return;
    const presets = data.settings.presets.map((p) => (p.id === presetId ? { ...p, ...updates } : p));
    await updateSettings({ presets });
  };

  // Focus V3
  const updateFocusV3 = async (settings: Partial<FocusV3Settings>) => {
    if (!data) return;
    const newFocusV3 = { ...data.settings.focusV3, ...settings };
    await updateSettings({ focusV3: newFocusV3 });
  };

  const toggleFullScreen = async () => {
    const next = !isFullScreen;
    if (window.electronAPI) {
      try {
        const res = await window.electronAPI.setFullScreen(next);
        setIsFullScreen(res);
        return res;
      } catch {}
    }
    // HTML5 Fullscreen Fallback
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullScreen(true);
        return true;
      } else {
        await document.exitFullscreen();
        setIsFullScreen(false);
        return false;
      }
    } catch {
      setIsFullScreen(next);
      return next;
    }
  };

  const moveToDisplay = async (displayId: number) => {
    if (window.electronAPI) {
      return await window.electronAPI.moveToDisplay(displayId);
    }
    return false;
  };

  // Sidebar & Onboarding
  const sidebarCollapsed = data?.settings?.sidebarCollapsed ?? false;

  const toggleSidebarCollapsed = async () => {
    if (!data) return;
    const next = !sidebarCollapsed;
    await updateSettings({ sidebarCollapsed: next });
  };

  const completeOnboarding = async (profileData?: Partial<UserProfile>, presetId?: string) => {
    if (!data) return;
    let profiles = [...data.settings.profiles];
    if (profileData) {
      profiles = profiles.map((p) => (p.id === activeProfile.id ? { ...p, ...profileData } : p));
    }
    await updateSettings({
      profiles,
      activePresetId: presetId || data.settings.activePresetId,
      onboarding: { completed: true, step: 0 },
    });
    setShowOnboarding(false);
    triggerConfetti();
  };

  // PDF Syllabus & Timetable Import
  const importExtractedPayload = async (extracted: ExtractedPdfPayload) => {
    if (!data) return { subjectsAdded: 0, examsAdded: 0 };
    let subjectsAdded = 0;
    let examsAdded = 0;

    const existingSubjects = [...data.subjects];
    const existingExams = [...data.exams];

    // Merge Subjects
    for (const cand of extracted.subjects) {
      const matchIdx = existingSubjects.findIndex(
        (s) => s.code.toLowerCase() === cand.code.toLowerCase() || s.name.toLowerCase() === cand.name.toLowerCase()
      );
      if (matchIdx !== -1) {
        // Merge modules if not already present
        const currentSub = existingSubjects[matchIdx];
        const newModules = [...currentSub.modules];
        for (const modCand of cand.modules) {
          const modExists = newModules.some((m) => m.name.toLowerCase() === modCand.name.toLowerCase());
          if (!modExists) {
            newModules.push({
              id: `mod-${cand.code.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              moduleNumber: newModules.length + 1,
              name: modCand.name,
              topics: modCand.topics.map((t, tidx) => ({
                id: `top-${cand.code.toLowerCase()}-${Date.now()}-${tidx}`,
                title: t.title,
                priority: t.priority,
                status: 'NOT_STARTED',
                completed: false,
                subtopics: t.subtopics,
              })),
            });
          }
        }
        existingSubjects[matchIdx] = { ...currentSub, modules: newModules };
      } else {
        // Add as brand new subject
        existingSubjects.push({
          id: `sub-${cand.code.toLowerCase()}-${Date.now()}`,
          code: cand.code,
          name: cand.name,
          courseCode: cand.courseCode,
          semester: cand.semester,
          credits: cand.credits,
          color: cand.color,
          modules: cand.modules.map((m, midx) => ({
            id: `mod-${cand.code.toLowerCase()}-${Date.now()}-${midx}`,
            moduleNumber: m.moduleNumber,
            name: m.name,
            topics: m.topics.map((t, tidx) => ({
              id: `top-${cand.code.toLowerCase()}-${Date.now()}-${midx}-${tidx}`,
              title: t.title,
              priority: t.priority,
              status: 'NOT_STARTED',
              completed: false,
              subtopics: t.subtopics,
            })),
          })),
        });
        subjectsAdded++;
      }
    }

    // Merge Exams
    for (const examCand of extracted.exams) {
      const examExists = existingExams.some(
        (e) => e.subjectCode.toLowerCase() === examCand.subjectCode.toLowerCase()
      );
      if (!examExists) {
        existingExams.push({
          id: `exam-${examCand.subjectCode.toLowerCase()}-${Date.now()}`,
          subjectCode: examCand.subjectCode,
          subjectName: examCand.subjectName,
          date: examCand.date,
          color: '#8b5cf6',
          isLab: examCand.isLab,
        });
        examsAdded++;
      }
    }

    await saveData({ subjects: existingSubjects, exams: existingExams });
    triggerConfetti();
    return { subjectsAdded, examsAdded };
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
        language,
        setLanguage,
        t,
        activeProfile,
        createProfile,
        switchProfile,
        updateProfile,
        deleteProfile,
        activePreset,
        selectPreset,
        updatePreset,
        isFullScreen,
        toggleFullScreen,
        displays,
        moveToDisplay,
        updateFocusV3,
        sidebarCollapsed,
        toggleSidebarCollapsed,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        importExtractedPayload,
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
