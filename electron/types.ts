export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TopicStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'NEEDS_REVISION';

export type SessionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'MISSED' | 'RESCHEDULED';

export type SlotType = 'STUDY' | 'BREAK' | 'LUNCH' | 'FREE';

export interface Topic {
  id: string;
  title: string;
  priority: Priority;
  status: TopicStatus;
  completed: boolean; // Backwards compatible
  subtopics?: string[];
  completedAt?: string;
  targetDate?: string;
  notes?: string;
  needsRevision?: boolean;
  estimatedMinutes?: number;
  tags?: string[]; // e.g. "Algorithm", "Numerical", "Theory", "Hands-on"
}

export interface Module {
  id: string;
  moduleNumber: number;
  name: string;
  contactHours?: number;
  topics: Topic[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  courseCode: string;
  semester: string;
  color: string;
  credits: number | string;
  modules: Module[];
}

export interface Exam {
  id: string;
  subjectCode: string;
  subjectName: string;
  date: string; // ISO date e.g. 2026-11-23T09:30:00
  color: string;
  isLab?: boolean;
}

export interface TimetableSlot {
  id: string;
  sessionNumber?: number;
  label: string;
  startTime: string; // "HH:MM" 24h
  endTime: string;   // "HH:MM" 24h
  type: SlotType;
  defaultSubjectId?: string;
}

export interface DailySessionRecord {
  id: string;
  date: string; // "YYYY-MM-DD"
  slotId: string;
  sessionNumber?: number;
  label: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  subjectId?: string;
  topicId?: string;
  topicTitle?: string;
  completedAt?: string;
  notes?: string;
  rescheduledTo?: {
    startTime: string;
    endTime: string;
    date: string;
  };
}

export interface FocusSessionLog {
  id: string;
  timestamp: string;
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
  durationMinutes: number;
  subjectId?: string;
  subjectCode?: string;
  moduleId?: string;
  topicId?: string;
  topicTitle?: string;
  completed: boolean;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentPalette = 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'custom';
export type UIDensity = 'comfortable' | 'compact';
export type ComponentStyling = 'rounded' | 'subtle';

export interface AppearanceSettings {
  themeMode: ThemeMode;
  accentPalette: AccentPalette;
  primaryAccent: string;       // Hex or CSS color
  secondaryAccent: string;     // Hex or CSS color
  customBg?: string;           // Custom override if palette is custom
  customSurface?: string;      // Custom override if palette is custom
  customText?: string;         // Custom override if palette is custom
  uiDensity: UIDensity;
  sidebarCollapsed: boolean;
  componentStyling: ComponentStyling;
}

export type SupportedLanguage = 'en' | 'es' | 'ml' | 'hi';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Emoji or preset identifier
  majorOrCourse?: string; // e.g. "B.Tech Computer Science (S5)"
  targetExamDate?: string; // e.g. "2026-11-23"
  dailyGoalHours?: number; // e.g. 6
  language: SupportedLanguage;
  createdAt: string;
}

export interface SessionPreset {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  isCustom?: boolean;
}

export interface FocusV3Settings {
  fullscreenOnStart: boolean;
  distractionShield: boolean;
  engagementMonitor: boolean;
  soundscape: 'none' | 'whitenoise' | 'rain' | 'binaural';
  voiceAssistantEnabled: boolean;
}

export interface OnboardingState {
  completed: boolean;
  step: number;
}

export interface DisplayInfo {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  workArea: { x: number; y: number; width: number; height: number };
  scaleFactor: number;
  isPrimary: boolean;
}

export interface AppSettings {
  launchOnStartup: boolean;
  notificationsEnabled: boolean;
  notificationSoundEnabled: boolean;
  leadTimeMinutes: number;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  theme: 'cyan' | 'blue' | 'purple' | 'emerald'; // Legacy theme key
  appearance: AppearanceSettings;
  minimizeToTrayOnClose: boolean;
  
  // V3 Additions:
  language: SupportedLanguage;
  activeProfileId: string;
  profiles: UserProfile[];
  activePresetId: string;
  presets: SessionPreset[];
  focusV3: FocusV3Settings;
  onboarding: OnboardingState;
  sidebarCollapsed: boolean;
}

export interface AppDataStore {
  version: number;
  subjects: Subject[];
  exams: Exam[];
  timetable: TimetableSlot[];
  dailyRecords: Record<string, DailySessionRecord[]>;
  focusLogs: FocusSessionLog[];
  settings: AppSettings;
  lastActiveDate: string;
}

export interface ElectronAPI {
  getStoreData: () => Promise<AppDataStore>;
  saveStoreData: (data: Partial<AppDataStore>) => Promise<boolean>;
  resetStoreData: () => Promise<AppDataStore>;
  exportData: () => Promise<{ success: boolean; filePath?: string; error?: string }>;
  importData: () => Promise<{ success: boolean; data?: AppDataStore; error?: string }>;
  showNotification: (options: { title: string; body: string; playSound?: boolean }) => Promise<boolean>;
  testNotification: () => Promise<boolean>;
  setStartupSetting: (enable: boolean) => Promise<boolean>;
  getStartupSetting: () => Promise<boolean>;
  openPath?: (targetPath: string) => Promise<boolean>;
  openExternal?: (url: string) => Promise<boolean>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  quitApp: () => void;
  
  // V3 IPC extensions:
  setFullScreen: (flag: boolean) => Promise<boolean>;
  isFullScreen: () => Promise<boolean>;
  getDisplays: () => Promise<DisplayInfo[]>;
  moveToDisplay: (displayId: number) => Promise<boolean>;
  selectPdfFile: () => Promise<string | null>;
  parsePdfFile: (filePath?: string) => Promise<{ success: boolean; text?: string; numpages?: number; error?: string; filename?: string }>;
  
  onNotificationClicked: (callback: () => void) => () => void;
  onStoreUpdated: (callback: (data: AppDataStore) => void) => () => void;
  onDistractionAlert?: (callback: (data: { message: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
