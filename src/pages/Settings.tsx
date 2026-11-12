import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Power,
  Volume2,
  Clock,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Timer,
  Palette,
  Eye,
  Sliders,
  Globe,
  Users,
  Plus,
  Trash2,
  Edit2,
  Info,
  Check,
  ShieldCheck,
  HelpCircle,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ThemeMode,
  AccentPalette,
  UIDensity,
  ComponentStyling,
  AppearanceSettings,
  SupportedLanguage,
  UserProfile,
  SessionPreset
} from '../types';
import { PALETTE_COLORS, applyTheme } from '../utils/theme';
import { AboutModal } from '../components/AboutModal';

export const Settings: React.FC = () => {
  const {
    data,
    updateSettings,
    updateAppearance,
    updateTimetable,
    resetToDefaults,
    exportData,
    importData,
    testNotification,
    language,
    setLanguage,
    activeProfile,
    switchProfile,
    createProfile,
    deleteProfile,
    activePreset,
    selectPreset,
    updatePreset,
    startTutorial,
    getCacheSize,
    clearCache,
    clearCurrentProfileData,
    clearAllProfilesData,
    factoryResetApp,
  } = useApp();

  const [notificationStatusMsg, setNotificationStatusMsg] = useState<string>('');
  const [dataStatusMsg, setDataStatusMsg] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // Storage and cache state
  const [cacheBytes, setCacheBytes] = useState<number | null>(null);
  const [showClearProfileConfirm, setShowClearProfileConfirm] = useState<boolean>(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState<boolean>(false);
  const [showFactoryResetStep1, setShowFactoryResetStep1] = useState<boolean>(false);
  const [showFactoryResetStep2, setShowFactoryResetStep2] = useState<boolean>(false);

  // New Profile Form
  const [showNewProfileForm, setShowNewProfileForm] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newProfileCourse, setNewProfileCourse] = useState<string>('');
  const [newProfileDate, setNewProfileDate] = useState<string>('');

  // Live preview state for Appearance
  const [previewAppearance, setPreviewAppearance] = useState<AppearanceSettings | null>(null);

  if (!data) return null;
  const { settings, timetable } = data;
  const appearance = previewAppearance || settings.appearance;

  const handleTestNotification = async () => {
    setNotificationStatusMsg('Triggering desktop alert...');
    const ok = await testNotification();
    if (ok) {
      setNotificationStatusMsg('Notification sent! Check your Windows Action Center.');
    } else {
      setNotificationStatusMsg('Failed to trigger notification. Ensure Windows notification permissions are enabled.');
    }
    setTimeout(() => setNotificationStatusMsg(''), 5000);
  };

  const handleExport = async () => {
    setDataStatusMsg('Exporting data...');
    const res = await exportData();
    if (res.success) {
      setDataStatusMsg(`Backup successfully saved to: ${res.filePath}`);
    } else if (res.error) {
      setDataStatusMsg(`Export failed: ${res.error}`);
    } else {
      setDataStatusMsg('Export cancelled.');
    }
    setTimeout(() => setDataStatusMsg(''), 6000);
  };

  const handleImport = async () => {
    setDataStatusMsg('Importing data...');
    const res = await importData();
    if (res.success) {
      setDataStatusMsg('Data successfully imported and synchronized!');
    } else if (res.error) {
      setDataStatusMsg(`Export failed: ${res.error}`);
    } else {
      setDataStatusMsg('Export cancelled.');
    }
    setTimeout(() => setDataStatusMsg(''), 6000);
  };

  const handleSlotTimeChange = async (slotId: string, field: 'startTime' | 'endTime' | 'label', val: string) => {
    const updated = timetable.map((slot) => {
      if (slot.id === slotId) {
        return { ...slot, [field]: val };
      }
      return slot;
    });
    await updateTimetable(updated);
  };

  // Appearance update with live application
  const handleLiveAppearanceChange = (updates: Partial<AppearanceSettings>) => {
    const next = { ...appearance, ...updates };
    setPreviewAppearance(next);
    applyTheme(next);
  };

  const handleSaveAppearance = async () => {
    if (previewAppearance) {
      await updateAppearance(previewAppearance);
      setPreviewAppearance(null);
    }
  };

  const handleResetAppearance = async () => {
    const defaultApp: AppearanceSettings = {
      themeMode: 'dark',
      accentPalette: 'violet',
      primaryAccent: '#8b5cf6',
      secondaryAccent: '#00f0ff',
      uiDensity: 'comfortable',
      sidebarCollapsed: false,
      componentStyling: 'rounded',
    };
    applyTheme(defaultApp);
    setPreviewAppearance(null);
    await updateAppearance(defaultApp);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-app-line pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>STUDY COMMAND CONFIGURATION</span>
          </div>
          <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">Settings & Appearance</h2>
          <p className="text-xs text-app-muted">
            Customize visual theme, color palettes, Windows background notifications, and daily study timetables.
          </p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* SECTION 0A: USER PROFILES & PERSONALIZATION */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
              <Users className="w-4 h-4 text-app-accent" />
              <span>USER PROFILES & PERSONALIZATION</span>
            </div>
            <button
              onClick={() => setShowNewProfileForm(!showNewProfileForm)}
              className="flex items-center gap-1.5 px-3 py-1 bg-app-accent/15 hover:bg-app-accent/25 border border-app-accent/30 text-app-accent rounded-component text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showNewProfileForm ? 'Cancel' : 'New Profile'}</span>
            </button>
          </div>

          {showNewProfileForm && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newProfileName.trim()) return;
                await createProfile({
                  name: newProfileName.trim(),
                  avatar: '⭐',
                  majorOrCourse: newProfileCourse.trim() || undefined,
                  targetExamDate: newProfileDate.trim() || undefined,
                  language,
                });
                setNewProfileName('');
                setNewProfileCourse('');
                setNewProfileDate('');
                setShowNewProfileForm(false);
              }}
              className="p-3.5 bg-app-bg rounded-component border border-app-line space-y-3"
            >
              <div className="text-xs font-bold text-app-ink font-mono uppercase">Add User Profile</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[10px] font-mono text-app-muted block mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="e.g. Commander"
                    className="w-full px-2.5 py-1.5 bg-app-surface border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-app-muted block mb-1">Degree / Course</label>
                  <input
                    type="text"
                    value={newProfileCourse}
                    onChange={(e) => setNewProfileCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science"
                    className="w-full px-2.5 py-1.5 bg-app-surface border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-app-muted block mb-1">Target Exam Date</label>
                  <input
                    type="date"
                    value={newProfileDate}
                    onChange={(e) => setNewProfileDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-app-surface border border-app-line rounded-component text-xs text-app-ink font-mono focus:outline-none focus:border-app-accent"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-app-accent hover:opacity-90 text-white rounded-component text-xs font-semibold shadow-panel"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {settings?.profiles?.map((p) => {
              const isActive = p.id === activeProfile.id;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-card border transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-app-bg border-app-accent shadow-panel ring-1 ring-app-accent/50'
                      : 'bg-app-bg/50 border-app-line hover:border-app-line2'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-2xl">{p.avatar || '⚡'}</span>
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-app-ink truncate">{p.name}</span>
                        {isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-app-accent text-white font-mono uppercase font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-app-muted truncate">
                        {p.majorOrCourse || 'Personal Study Track'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isActive && (
                      <button
                        onClick={() => switchProfile(p.id)}
                        className="px-2.5 py-1 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink rounded-component text-xs font-medium transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    {settings.profiles.length > 1 && (
                      <button
                        onClick={() => deleteProfile(p.id)}
                        className="p-1 text-app-muted hover:text-app-danger transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 0B: LANGUAGE (i18n) */}
        <div className="card-kopy p-5 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
            <Globe className="w-4 h-4 text-app-accent" />
            <span>APPLICATION LANGUAGE (i18n)</span>
          </div>
          <p className="text-xs text-app-muted">
            Select your preferred display language for all menus, study prompts, voice assistant, and analytics.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {[
              { code: 'en' as SupportedLanguage, label: 'English', native: 'English' },
              { code: 'es' as SupportedLanguage, label: 'Spanish', native: 'Español' },
              { code: 'ml' as SupportedLanguage, label: 'Malayalam', native: 'മലയാളം' },
              { code: 'hi' as SupportedLanguage, label: 'Hindi', native: 'हिन्दी' },
            ].map(({ code, label, native }) => {
              const isSelected = language === code;
              return (
                <button
                  key={code}
                  onClick={() => setLanguage(code)}
                  className={`p-3 rounded-card border text-left transition-all ${
                    isSelected
                      ? 'bg-app-bg border-app-accent ring-1 ring-app-accent shadow-panel'
                      : 'bg-app-bg/50 border-app-line hover:border-app-line2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-ink">{label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-app-accent" />}
                  </div>
                  <div className="text-[11px] text-app-muted font-mono mt-0.5">{native}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 0C: STUDY & BREAK SESSION PRESETS */}
        <div className="card-kopy p-5 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
            <Timer className="w-4 h-4 text-app-accent" />
            <span>STUDY & BREAK SESSION RHYTHM PRESETS</span>
          </div>
          <p className="text-xs text-app-muted">
            Configure default sprint focus and recovery durations.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {settings?.presets?.map((p) => {
              const isSelected = p.id === activePreset.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPreset(p.id)}
                  className={`p-3 rounded-card border text-left transition-all ${
                    isSelected
                      ? 'bg-app-bg border-app-accent ring-1 ring-app-accent shadow-panel'
                      : 'bg-app-bg/50 border-app-line hover:border-app-line2'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-ink">{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-app-accent" />}
                  </div>
                  <div className="text-[11px] text-app-muted font-mono mt-0.5">
                    {p.focusMinutes}m study / {p.breakMinutes}m break
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 1: APPEARANCE & THEME CUSTOMIZATION (kopy.site inspired) */}
        <div className="card-kopy p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
              <Palette className="w-4 h-4 text-app-accent" />
              <span>APPEARANCE & VISUAL IDENTITY</span>
            </div>
            {previewAppearance && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveAppearance}
                  className="px-3 py-1 rounded-component bg-app-accent text-white font-semibold text-xs shadow-sm hover:opacity-90"
                >
                  Apply & Save
                </button>
                <button
                  onClick={() => {
                    applyTheme(settings.appearance);
                    setPreviewAppearance(null);
                  }}
                  className="px-3 py-1 rounded-component bg-app-bg text-app-muted hover:text-app-ink text-xs border border-app-line"
                >
                  Revert
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4 divide-y divide-app-line">
            {/* Theme Mode Selector (Dark, Light, System) */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-app-ink block mb-2">
                Color Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'dark' as ThemeMode, label: 'Dark Mode', icon: Moon, desc: 'Deep charcoal background & violet accents' },
                  { mode: 'light' as ThemeMode, label: 'Light Mode', icon: Sun, desc: 'Crisp white cards, high contrast & clean slate canvas' },
                  { mode: 'system' as ThemeMode, label: 'System Default', icon: Laptop, desc: 'Follows your Windows OS appearance' },
                ].map(({ mode, label, icon: Icon, desc }) => {
                  const isSelected = appearance.themeMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleLiveAppearanceChange({ themeMode: mode })}
                      className={`p-3.5 rounded-card border text-left transition-all ${
                        isSelected
                          ? 'bg-app-bg border-app-accent ring-1 ring-app-accent shadow-panel'
                          : 'bg-app-bg/50 border-app-line hover:border-app-line2'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-app-accent' : 'text-app-muted'}`} />
                        <span className={`text-xs font-bold ${isSelected ? 'text-app-ink' : 'text-app-muted'}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-[10px] text-app-muted mt-1 leading-normal font-mono">
                        {desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accent Palette Selector */}
            <div className="pt-4">
              <label className="text-xs font-semibold text-app-ink block mb-2">
                Predefined Accent Palette
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {(Object.keys(PALETTE_COLORS) as AccentPalette[]).map((paletteKey) => {
                  const pal = PALETTE_COLORS[paletteKey];
                  const isSelected = appearance.accentPalette === paletteKey;
                  const sampleHex =
                    paletteKey === 'violet' ? '#8b5cf6' :
                    paletteKey === 'cyan' ? '#00f0ff' :
                    paletteKey === 'emerald' ? '#10b981' :
                    paletteKey === 'rose' ? '#f43f5e' :
                    paletteKey === 'amber' ? '#f59e0b' : '#a855f7';

                  return (
                    <button
                      key={paletteKey}
                      onClick={() => handleLiveAppearanceChange({ accentPalette: paletteKey })}
                      className={`p-2.5 rounded-component border flex items-center space-x-2.5 transition-all ${
                        isSelected
                          ? 'bg-app-bg border-app-accent shadow-sm'
                          : 'bg-app-bg/60 border-app-line hover:border-app-line2'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 border border-black/20"
                        style={{ backgroundColor: sampleHex }}
                      ></span>
                      <span className="text-xs font-semibold text-app-ink truncate font-mono">
                        {pal.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-app-ink">
                  Fine-Grained Color Customization
                </span>
                <span className="text-[10px] font-mono text-app-muted">Hex format</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                  <label className="text-[10px] font-mono uppercase text-app-muted block mb-1">
                    Primary Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appearance.primaryAccent || '#8b5cf6'}
                      onChange={(e) => handleLiveAppearanceChange({ accentPalette: 'custom', primaryAccent: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-app-ink">{appearance.primaryAccent}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                  <label className="text-[10px] font-mono uppercase text-app-muted block mb-1">
                    Secondary Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appearance.secondaryAccent || '#00f0ff'}
                      onChange={(e) => handleLiveAppearanceChange({ secondaryAccent: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-app-ink">{appearance.secondaryAccent}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                  <label className="text-[10px] font-mono uppercase text-app-muted block mb-1">
                    Custom Background (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={appearance.customBg || '#11110f'}
                      onChange={(e) => handleLiveAppearanceChange({ customBg: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-app-ink">{appearance.customBg || 'Default'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* UI Density & Geometry */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-app-ink block mb-1.5">
                  UI Density
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLiveAppearanceChange({ uiDensity: 'comfortable' })}
                    className={`flex-1 py-1.5 text-xs rounded-component border font-medium ${
                      appearance.uiDensity === 'comfortable'
                        ? 'bg-app-accent text-white border-app-accent'
                        : 'bg-app-bg text-app-muted border-app-line'
                    }`}
                  >
                    Comfortable
                  </button>
                  <button
                    onClick={() => handleLiveAppearanceChange({ uiDensity: 'compact' })}
                    className={`flex-1 py-1.5 text-xs rounded-component border font-medium ${
                      appearance.uiDensity === 'compact'
                        ? 'bg-app-accent text-white border-app-accent'
                        : 'bg-app-bg text-app-muted border-app-line'
                    }`}
                  >
                    Compact
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-app-ink block mb-1.5">
                  Component Geometry
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLiveAppearanceChange({ componentStyling: 'rounded' })}
                    className={`flex-1 py-1.5 text-xs rounded-component border font-medium ${
                      appearance.componentStyling === 'rounded'
                        ? 'bg-app-accent text-white border-app-accent'
                        : 'bg-app-bg text-app-muted border-app-line'
                    }`}
                  >
                    Organic Rounded
                  </button>
                  <button
                    onClick={() => handleLiveAppearanceChange({ componentStyling: 'subtle' })}
                    className={`flex-1 py-1.5 text-xs rounded-component border font-medium ${
                      appearance.componentStyling === 'subtle'
                        ? 'bg-app-accent text-white border-app-accent'
                        : 'bg-app-bg text-app-muted border-app-line'
                    }`}
                  >
                    Subtle Boxed
                  </button>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleResetAppearance}
                  className="w-full py-2 text-xs rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Appearance to Default</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: WINDOWS DESKTOP & SYSTEM TRAY */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
            <Power className="w-4 h-4 text-app-accent" />
            <span>WINDOWS SYSTEM & TRAY INTEGRATION</span>
          </div>

          <div className="divide-y divide-app-line">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-app-ink">
                  Launch at Windows Startup
                </div>
                <div className="text-[11px] text-app-muted">
                  Automatically boot STUDY COMMAND in the system tray when Windows starts.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.launchOnStartup}
                  onChange={(e) => updateSettings({ launchOnStartup: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-app-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
              </label>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-app-ink">
                  Minimize to System Tray on Close
                </div>
                <div className="text-[11px] text-app-muted">
                  Keep running silently in tray when 'X' is clicked so scheduled reminders never stop.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.minimizeToTrayOnClose}
                  onChange={(e) => updateSettings({ minimizeToTrayOnClose: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-app-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
              </label>
            </div>
          </div>
        </div>

        {/* SECTION 3: SMART REMINDER NOTIFICATIONS */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
              <Bell className="w-4 h-4 text-app-accent" />
              <span>SMART REMINDER NOTIFICATIONS</span>
            </div>
            <button
              onClick={handleTestNotification}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-medium transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-app-accent" />
              <span>Send Test Notification</span>
            </button>
          </div>

          {notificationStatusMsg && (
            <div className="p-3 rounded-component bg-app-accent/10 border border-app-accent/30 text-xs text-app-accent font-mono">
              {notificationStatusMsg}
            </div>
          )}

          <div className="divide-y divide-app-line">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-app-ink">
                  Windows Desktop Notifications
                </div>
                <div className="text-[11px] text-app-muted">
                  Deliver native Windows Action Center notifications at study starts and break endings.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-app-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
              </label>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-app-ink">
                  Notification Sound Chimes
                </div>
                <div className="text-[11px] text-app-muted">
                  Play harmonic Web Audio chimes for session start, break over, and task completion.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSoundEnabled}
                  onChange={(e) => updateSettings({ notificationSoundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-app-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
              </label>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-app-ink">
                  Reminder Lead Time
                </div>
                <div className="text-[11px] text-app-muted">
                  How early to alert you before a study block starts.
                </div>
              </div>
              <select
                value={settings.leadTimeMinutes}
                onChange={(e) => updateSettings({ leadTimeMinutes: Number(e.target.value) })}
                className="input-kopy px-3 py-1.5 text-xs"
              >
                <option value={0}>At scheduled time (Exact)</option>
                <option value={2}>2 minutes before</option>
                <option value={5}>5 minutes before</option>
              </select>
            </div>

            <div className="py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-app-ink flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-app-accent" />
                    <span>Quiet Hours (Rest Window Protection)</span>
                  </div>
                  <div className="text-[11px] text-app-muted">
                    Suppress notifications during your 12:30 AM – 10:00 AM sleep schedule.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quietHoursEnabled}
                    onChange={(e) => updateSettings({ quietHoursEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-app-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-app-accent"></div>
                </label>
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-3 pl-4 border-l-2 border-app-accent/40">
                  <div>
                    <label className="text-[11px] font-mono text-app-muted block mb-1">
                      Quiet Period Start (24h)
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursStart}
                      onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                      className="input-kopy px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-app-muted block mb-1">
                      Quiet Period End (24h)
                    </label>
                    <input
                      type="time"
                      value={settings.quietHoursEnd}
                      onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                      className="input-kopy px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: POMODORO FOCUS CONFIGURATION */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
            <Timer className="w-4 h-4 text-app-accent" />
            <span>FOCUS & RECOVERY TIMERS</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-app-bg p-3.5 rounded-component border border-app-line">
              <label className="text-[11px] font-mono text-app-muted block mb-1">
                Focus Duration (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={settings.focusDuration}
                onChange={(e) => updateSettings({ focusDuration: Number(e.target.value) })}
                className="input-kopy w-full px-3 py-1.5 text-sm font-mono font-bold text-app-accent"
              />
            </div>

            <div className="bg-app-bg p-3.5 rounded-component border border-app-line">
              <label className="text-[11px] font-mono text-app-muted block mb-1">
                Short Break (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.shortBreakDuration}
                onChange={(e) => updateSettings({ shortBreakDuration: Number(e.target.value) })}
                className="input-kopy w-full px-3 py-1.5 text-sm font-mono font-bold text-app-live"
              />
            </div>

            <div className="bg-app-bg p-3.5 rounded-component border border-app-line">
              <label className="text-[11px] font-mono text-app-muted block mb-1">
                Long Break (Minutes)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={settings.longBreakDuration}
                onChange={(e) => updateSettings({ longBreakDuration: Number(e.target.value) })}
                className="input-kopy w-full px-3 py-1.5 text-sm font-mono font-bold text-app-accent"
              />
            </div>

            <div className="bg-app-bg p-3.5 rounded-component border border-app-line">
              <label className="text-[11px] font-mono text-app-muted block mb-1">
                Cycles Before Long Break
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={settings.longBreakInterval}
                onChange={(e) => updateSettings({ longBreakInterval: Number(e.target.value) })}
                className="input-kopy w-full px-3 py-1.5 text-sm font-mono font-bold text-app-ink"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: DAILY TIMETABLE ROUTINE (16 SLOTS) */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
              <Clock className="w-4 h-4 text-app-accent" />
              <span>DAILY TIMETABLE ROUTINE (16 SLOTS)</span>
            </div>
          </div>
          <p className="text-xs text-app-muted">
            Edit start and end times for all 16 study blocks and breaks. All edits save immediately to local persistent storage.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {timetable.map((slot) => {
              const isStudy = slot.type === 'STUDY';
              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-component border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isStudy ? 'bg-app-bg border-app-line' : 'bg-app-surface border-app-line/60'
                  }`}
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={slot.label}
                      onChange={(e) => handleSlotTimeChange(slot.id, 'label', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-app-line focus:border-app-accent text-xs font-semibold text-app-ink px-1 py-0.5 focus:outline-none"
                    />
                    <div className="text-[10px] font-mono text-app-muted px-1">
                      {slot.type} {slot.sessionNumber ? `• Session ${slot.sessionNumber}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleSlotTimeChange(slot.id, 'startTime', e.target.value)}
                        className="input-kopy px-2 py-1 text-xs font-mono"
                      />
                    </div>
                    <span className="text-app-muted text-xs font-mono">to</span>
                    <div>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleSlotTimeChange(slot.id, 'endTime', e.target.value)}
                        className="input-kopy px-2 py-1 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 5.5: ABOUT STUDY COMMAND & INTERACTIVE TOUR */}
        <div className="card-kopy p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
              <Info className="w-4 h-4 text-app-accent" />
              <span>ABOUT STUDY COMMAND & INTERACTIVE TOUR</span>
            </div>
            <p className="text-xs text-app-muted mt-0.5">
              Version 3.0.0 Production Release &bull; Offline Architecture &bull; Open Source MIT License
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => startTutorial()}
              className="px-3.5 py-2 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink font-semibold text-xs rounded-component transition-all flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-app-accent" />
              <span>Replay Application Tour</span>
            </button>
            <button
              onClick={() => setShowAboutModal(true)}
              className="px-4 py-2 bg-app-accent hover:opacity-90 text-white font-semibold text-xs rounded-component shadow-panel transition-all"
            >
              View About & License
            </button>
          </div>
        </div>

        {/* SECTION 6: LOCAL STORAGE & DATA MANAGEMENT */}
        <div className="card-kopy p-5 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-app-ink font-sans">
            <HardDrive className="w-4 h-4 text-app-accent" />
            <span>STORAGE, CACHE & DATA MANAGEMENT</span>
          </div>
          <p className="text-xs text-app-muted">
            Manage your offline cache, isolate profile datasets, export secure backups, or perform a clean factory reset.
          </p>

          {dataStatusMsg && (
            <div className="p-3 rounded-component bg-app-accent/10 border border-app-accent/30 text-xs text-app-accent font-mono animate-in fade-in">
              {dataStatusMsg}
            </div>
          )}

          {/* Cache Management Row */}
          <div className="p-4 rounded-component bg-app-bg border border-app-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-app-ink flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-app-accent" />
                <span>Application Cache Management</span>
              </div>
              <p className="text-[11px] text-app-muted mt-0.5">
                {cacheBytes !== null
                  ? `Current Chromium storage cache: ${(cacheBytes / (1024 * 1024)).toFixed(2)} MB`
                  : 'Inspect and purge temporary browser/DOM cache files to reclaim disk space.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const bytes = await getCacheSize();
                  setCacheBytes(bytes);
                  setDataStatusMsg(`Current cache size: ${(bytes / (1024 * 1024)).toFixed(2)} MB (${bytes.toLocaleString()} bytes).`);
                  setTimeout(() => setDataStatusMsg(''), 5000);
                }}
                className="px-3 py-1.5 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink text-xs font-semibold rounded-component transition-colors"
              >
                Inspect Size
              </button>
              <button
                onClick={async () => {
                  setDataStatusMsg('Clearing cache...');
                  const res = await clearCache();
                  if (res.success) {
                    setCacheBytes(0);
                    setDataStatusMsg(`Cache successfully purged! Reclaimed ${(res.bytesCleared / 1024).toFixed(1)} KB.`);
                  } else {
                    setDataStatusMsg('Failed to clear application cache.');
                  }
                  setTimeout(() => setDataStatusMsg(''), 5000);
                }}
                className="px-3 py-1.5 bg-app-accent hover:opacity-90 text-white text-xs font-semibold rounded-component shadow-panel transition-all"
              >
                Clear Cache Now
              </button>
            </div>
          </div>

          {/* Backup & Reset Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 p-3 rounded-component bg-app-bg hover:bg-app-hover text-app-ink text-xs font-semibold border border-app-line transition-colors"
            >
              <Download className="w-4 h-4 text-app-accent" />
              <span>Export Backup (JSON)</span>
            </button>

            <button
              onClick={handleImport}
              className="flex items-center justify-center space-x-2 p-3 rounded-component bg-app-bg hover:bg-app-hover text-app-ink text-xs font-semibold border border-app-line transition-colors"
            >
              <Upload className="w-4 h-4 text-app-live" />
              <span>Import Backup (JSON)</span>
            </button>

            <button
              onClick={() => setShowClearProfileConfirm(true)}
              className="flex items-center justify-center space-x-2 p-3 rounded-component bg-app-warn/10 hover:bg-app-warn/20 text-app-warn text-xs font-semibold border border-app-warn/30 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-app-warn" />
              <span>Clear Profile Data</span>
            </button>

            <button
              onClick={() => setShowFactoryResetStep1(true)}
              className="flex items-center justify-center space-x-2 p-3 rounded-component bg-app-danger/10 hover:bg-app-danger/20 text-app-danger text-xs font-semibold border border-app-danger/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-app-danger" />
              <span>Factory Reset App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear Current Profile Confirmation Dialog */}
      {showClearProfileConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full bg-app-surface border border-app-warn/40 rounded-card p-5 space-y-4 shadow-panel">
            <div className="flex items-center space-x-2.5 text-app-warn font-bold font-mono text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>CLEAR CURRENT PROFILE DATA</span>
            </div>
            <p className="text-xs text-app-ink leading-relaxed">
              Are you sure you want to clear all subjects, syllabus topics, timetable, and study records for <strong>{activeProfile.name}</strong>? Other profiles and global theme settings will remain intact.
            </p>
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-app-line">
              <button
                onClick={() => setShowClearProfileConfirm(false)}
                className="px-3.5 py-1.5 rounded-component text-xs text-app-muted hover:text-app-ink"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await clearCurrentProfileData();
                  setShowClearProfileConfirm(false);
                  setDataStatusMsg(`Cleared all study data for ${activeProfile.name}.`);
                  setTimeout(() => setDataStatusMsg(''), 5000);
                }}
                className="px-4 py-1.5 rounded-component text-xs font-semibold bg-app-warn text-white shadow-panel"
              >
                Yes, Clear Profile Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Step 1: Warning + Backup Offer */}
      {showFactoryResetStep1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full bg-app-surface border border-app-danger/40 rounded-card p-5 space-y-4 shadow-panel">
            <div className="flex items-center space-x-2.5 text-app-danger font-bold font-mono text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>FACTORY RESET: STEP 1 OF 2</span>
            </div>
            <p className="text-xs text-app-ink leading-relaxed">
              Factory reset will permanently delete all user profiles, syllabus data, timetables, study records, and custom appearance settings. The application will restart into the clean first-launch onboarding wizard.
            </p>
            <div className="p-3 rounded-component bg-app-bg border border-app-line flex items-center justify-between">
              <span className="text-xs text-app-muted">Would you like to export a backup JSON first?</span>
              <button
                onClick={handleExport}
                className="px-3 py-1 bg-app-surface border border-app-line hover:bg-app-hover text-app-ink text-xs font-semibold rounded"
              >
                Export Backup
              </button>
            </div>
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-app-line">
              <button
                onClick={() => setShowFactoryResetStep1(false)}
                className="px-3.5 py-1.5 rounded-component text-xs text-app-muted hover:text-app-ink"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowFactoryResetStep1(false);
                  setShowFactoryResetStep2(true);
                }}
                className="px-4 py-1.5 rounded-component text-xs font-semibold bg-app-danger text-white shadow-panel"
              >
                Proceed to Final Confirmation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Factory Reset Step 2: Final Confirmation */}
      {showFactoryResetStep2 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="max-w-md w-full bg-app-surface border-2 border-app-danger rounded-card p-5 space-y-4 shadow-panel">
            <div className="flex items-center space-x-2.5 text-app-danger font-bold font-mono text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
              <span>FINAL CONFIRMATION: COMPLETE FACTORY RESET</span>
            </div>
            <p className="text-xs text-app-ink leading-relaxed font-semibold">
              This action CANNOT be reversed. All data will be purged immediately.
            </p>
            <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-app-line">
              <button
                onClick={() => setShowFactoryResetStep2(false)}
                className="px-3.5 py-1.5 rounded-component text-xs text-app-muted hover:text-app-ink"
              >
                Abort
              </button>
              <button
                onClick={async () => {
                  setShowFactoryResetStep2(false);
                  await factoryResetApp();
                }}
                className="px-5 py-2 rounded-component text-xs font-bold bg-app-danger text-white shadow-panel"
              >
                YES, PERFORM FULL FACTORY RESET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </div>
  );
};
