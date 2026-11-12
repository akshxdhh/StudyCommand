import React, { useState, useRef, useEffect } from 'react';
import {
  Minus,
  Square,
  X,
  Bell,
  Play,
  ShieldCheck,
  Sun,
  Moon,
  Search,
  Maximize2,
  Minimize2,
  Mic,
  Globe,
  User,
  Plus,
  Check,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';
import { VoiceAssistantModal } from './VoiceAssistantModal';

export const Header: React.FC = () => {
  const {
    setActiveTab,
    testNotification,
    data,
    toggleThemeMode,
    isFullScreen,
    toggleFullScreen,
    language,
    setLanguage,
    activeProfile,
    switchProfile,
    createProfile,
    t,
  } = useApp();

  const [voiceOpen, setVoiceOpen] = useState<boolean>(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);
  const [newProfileModalOpen, setNewProfileModalOpen] = useState<boolean>(false);
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [newProfileCourse, setNewProfileCourse] = useState<string>('');

  const profileRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI?.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  const isLight = data?.settings.appearance.themeMode === 'light';

  const handleOpenSearch = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    await createProfile({
      name: newProfileName.trim(),
      avatar: '⭐',
      majorOrCourse: newProfileCourse.trim() || undefined,
      language: language,
    });
    setNewProfileName('');
    setNewProfileCourse('');
    setNewProfileModalOpen(false);
    setProfileDropdownOpen(false);
  };

  const languagesList: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  return (
    <>
      <header
        className="h-11 bg-app-surface border-b border-app-line flex items-center justify-between px-3.5 select-none z-40 shrink-0 transition-colors"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-md bg-app-accent/15 border border-app-accent/40 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-app-accent animate-pulse"></div>
          </div>
          <span className="text-xs font-bold tracking-wider text-app-ink font-sans flex items-center gap-1.5">
            STUDY <span className="text-app-accent">COMMAND</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-app-accent/10 border border-app-accent/25 text-app-accent font-mono font-normal">
              v3.0.0
            </span>
          </span>
        </div>

        {/* Center: Universal Search & Syllabus Active Badge */}
        <div
          className="hidden md:flex items-center space-x-2.5 text-[11px] font-mono text-app-muted"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <button
            onClick={handleOpenSearch}
            className="flex items-center space-x-2 px-3 py-1 rounded-component bg-app-bg hover:bg-app-hover border border-app-line text-app-muted hover:text-app-ink transition-colors cursor-pointer"
          >
            <Search className="w-3 h-3 text-app-accent" />
            <span>Search syllabus & timetable...</span>
            <kbd className="text-[9px] px-1.5 py-0.2 rounded bg-app-surface border border-app-line text-app-muted">
              Ctrl+K
            </kbd>
          </button>

          <div className="flex items-center space-x-1.5 text-app-live bg-app-live/10 px-2 py-0.5 rounded-full border border-app-live/20">
            <ShieldCheck className="w-3 h-3" />
            <span>LOCAL ENGINE ACTIVE</span>
          </div>
        </div>

        {/* Right: Actions, Profile Switcher, Language & Window Buttons */}
        <div className="flex items-center space-x-1.5" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {/* Profile Switcher Popover */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-1.5 px-2 py-1 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-medium transition-colors"
              title="Active Profile"
            >
              <span className="text-xs">{activeProfile.avatar || '⚡'}</span>
              <span className="hidden sm:inline font-mono text-[11px] truncate max-w-[80px]">
                {activeProfile.name}
              </span>
              <ChevronDown className="w-3 h-3 text-app-muted" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-app-surface border border-app-line rounded-modal shadow-2xl p-1.5 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] uppercase text-app-muted font-bold border-b border-app-line mb-1">
                  User Profiles
                </div>
                <div className="space-y-0.5 max-h-40 overflow-y-auto">
                  {data?.settings?.profiles?.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchProfile(p.id);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-component text-left transition-colors ${
                        p.id === activeProfile.id
                          ? 'bg-app-accent/15 text-app-accent font-bold'
                          : 'text-app-ink hover:bg-app-hover'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{p.avatar || '⚡'}</span>
                        <span className="truncate">{p.name}</span>
                      </span>
                      {p.id === activeProfile.id && <Check className="w-3 h-3 text-app-accent" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-app-line mt-1 pt-1">
                  <button
                    onClick={() => {
                      setNewProfileModalOpen(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-1.5 px-2 py-1 rounded-component text-app-accent hover:bg-app-accent/10 transition-colors text-left font-semibold text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Create New Profile</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="w-7 h-7 flex items-center justify-center rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line text-xs font-mono uppercase transition-colors"
              title="Change Language"
            >
              <span className="text-[10px] font-bold">{language}</span>
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-app-surface border border-app-line rounded-modal shadow-2xl p-1 z-50 text-xs font-mono animate-in fade-in zoom-in-95 duration-150">
                {languagesList.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-component text-left transition-colors ${
                      language === l.code
                        ? 'bg-app-accent/15 text-app-accent font-bold'
                        : 'text-app-ink hover:bg-app-hover'
                    }`}
                  >
                    <span>{l.label}</span>
                    {language === l.code && <Check className="w-3 h-3 text-app-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offline AI Voice Assistant Trigger */}
          <button
            onClick={() => setVoiceOpen(true)}
            className="w-7 h-7 flex items-center justify-center rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
            title="Offline AI Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-app-accent" />
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={() => toggleFullScreen()}
            className="w-7 h-7 flex items-center justify-center rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Theme Switcher Button */}
          <button
            onClick={() => toggleThemeMode()}
            className="w-7 h-7 flex items-center justify-center rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
            title={`Switch Theme (Current: ${data?.settings.appearance.themeMode})`}
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-app-warn" />}
          </button>

          {/* Quick Start Focus Button */}
          <button
            onClick={() => setActiveTab('focus')}
            className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-component bg-app-accent/15 hover:bg-app-accent/25 text-app-accent border border-app-accent/30 transition-all font-semibold"
            title="Start Study Session"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Start Focus</span>
          </button>

          {/* Window controls */}
          <div className="flex items-center ml-1 border-l border-app-line pl-1 space-x-1">
            <button
              onClick={handleMinimize}
              className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
              title="Maximize"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-danger hover:text-white text-app-muted transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />

      {/* New Profile Modal */}
      {newProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-app-surface border border-app-line rounded-modal p-5 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-app-ink">Create New Profile</h3>
              <button
                onClick={() => setNewProfileModalOpen(false)}
                className="text-app-muted hover:text-app-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProfile} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Profile Name</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="e.g. Maya"
                  className="w-full px-3 py-1.5 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Degree / Course</label>
                <input
                  type="text"
                  value={newProfileCourse}
                  onChange={(e) => setNewProfileCourse(e.target.value)}
                  placeholder="e.g. Electrical Engineering"
                  className="w-full px-3 py-1.5 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewProfileModalOpen(false)}
                  className="px-3 py-1.5 rounded-component text-xs text-app-muted hover:text-app-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-app-accent text-white font-semibold rounded-component text-xs shadow-panel hover:bg-app-accent/90"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
