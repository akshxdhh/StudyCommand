import React from 'react';
import { Minus, Square, X, Bell, Play, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { setActiveTab, testNotification, data, toggleThemeMode } = useApp();

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

  return (
    <header
      className="h-11 bg-app-surface border-b border-app-line flex items-center justify-between px-3.5 select-none z-50 shrink-0 transition-colors"
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
            v2.0
          </span>
        </span>
      </div>

      {/* Center: System Status Badges */}
      <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono text-app-muted">
        <div className="flex items-center space-x-1.5 text-app-live bg-app-live/10 px-2 py-0.5 rounded-full border border-app-live/20">
          <ShieldCheck className="w-3 h-3" />
          <span>SYLLABUS SYNCED</span>
        </div>
        {data?.settings.launchOnStartup && (
          <div className="flex items-center space-x-1.5 text-app-accent bg-app-accent/10 px-2 py-0.5 rounded-full border border-app-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-app-accent"></span>
            <span>AUTO-START ON</span>
          </div>
        )}
      </div>

      {/* Right: Quick Action Controls & Window Buttons */}
      <div className="flex items-center space-x-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        {/* Quick Theme Switcher Button */}
        <button
          onClick={() => toggleThemeMode()}
          className="w-7 h-7 flex items-center justify-center rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
          title={`Switch Theme (Current: ${data?.settings.appearance.themeMode})`}
        >
          {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-app-warn" />}
        </button>

        <button
          onClick={() => setActiveTab('focus')}
          className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-component bg-app-accent/15 hover:bg-app-accent/25 text-app-accent border border-app-accent/30 transition-all font-semibold"
          title="Start Study Session"
        >
          <Play className="w-3 h-3 fill-current" />
          <span className="hidden sm:inline">Start Focus</span>
        </button>

        <button
          onClick={() => testNotification()}
          className="flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-all"
          title="Test Windows Desktop Notification"
        >
          <Bell className="w-3 h-3 text-app-accent" />
          <span className="hidden sm:inline">Test Alert</span>
        </button>

        {/* Window controls */}
        <div className="flex items-center ml-1.5 border-l border-app-line pl-1.5 space-x-1">
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
            className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-danger/80 text-app-muted hover:text-white transition-colors"
            title="Minimize to Tray"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
