import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  Timer,
  History,
  Settings,
  Power,
  Clock,
  ChevronRight,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime24to12 } from '../utils/time';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, data, toggleThemeMode, updateAppearance } = useApp();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const appearance = data?.settings?.appearance;
  const isCollapsed = appearance?.sidebarCollapsed;

  const today = data ? data.dailyRecords[data.lastActiveDate] || [] : [];
  const missedCount = today.filter(r => r.status === 'MISSED').length;
  const pendingCount = today.filter(r => r.status === 'PENDING').length;

  // Total topics & completed across all subjects
  let totalTopics = 0;
  let completedTopics = 0;
  data?.subjects?.forEach(s => {
    s.modules?.forEach(m => {
      totalTopics += m.topics.length;
      completedTopics += m.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
    });
  });

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: missedCount > 0 ? `${missedCount} Missed` : undefined,
    },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: BookOpen,
      badge: `${completedTopics}/${totalTopics}`,
    },
    {
      id: 'countdown',
      label: 'Exam Countdown',
      icon: CalendarClock,
      badge: data?.exams?.length ? `${data.exams.length} Exams` : undefined,
    },
    {
      id: 'focus',
      label: 'Focus Mode',
      icon: Timer,
      badge: pendingCount > 0 ? `${pendingCount} Left` : undefined,
    },
    {
      id: 'history',
      label: 'Session History',
      icon: History,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextSession = today.find(r => {
    if (r.status !== 'PENDING') return false;
    const [h, m] = r.startTime.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  return (
    <aside
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-app-surface border-r border-app-line flex flex-col justify-between shrink-0 select-none transition-all duration-200`}
    >
      {/* Top Section */}
      <div>
        {/* App Title & Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center shrink-0 shadow-panel">
              <Timer className="w-5 h-5 text-app-accent" />
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold tracking-tight text-app-ink truncate font-sans">
                  STUDY <span className="text-app-accent">COMMAND</span>
                </h1>
                <p className="text-[11px] text-app-muted font-mono flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-live animate-pulse"></span>
                  SYLLABUS ACTIVE
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live Station Clock */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-app-bg/60 border-b border-app-line flex items-center justify-between text-xs font-mono text-app-muted">
            <span className="flex items-center gap-1.5 text-app-accent">
              <Clock className="w-3.5 h-3.5" />
              TIME
            </span>
            <span className="text-app-ink font-semibold">{currentTimeStr}</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-component text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-app-accent text-white shadow-panel'
                    : 'text-app-muted hover:text-app-ink hover:bg-app-hover border border-transparent'
                }`}
                title={item.label}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-app-muted group-hover:text-app-ink'
                    }`}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : typeof item.badge === 'string' && item.badge.includes('Missed')
                        ? 'bg-app-danger/15 text-app-danger border border-app-danger/25'
                        : 'bg-app-bg text-app-muted border border-app-line'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Next Session Widget, Theme Switcher & Exit */}
      <div className="p-3 border-t border-app-line space-y-2.5">
        {/* Next Session Box (Only if not collapsed) */}
        {!isCollapsed && nextSession && (
          <div className="p-3 rounded-component bg-app-bg border border-app-line">
            <div className="flex items-center justify-between text-[11px] text-app-accent font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-app-accent"></span>
                NEXT SESSION
              </span>
              <span>{formatTime24to12(nextSession.startTime)}</span>
            </div>
            <div className="text-xs font-semibold text-app-ink mt-1 truncate">
              {nextSession.label}
            </div>
            <div className="text-[11px] text-app-muted truncate mt-0.5">
              {nextSession.topicTitle || 'Scheduled Topic'}
            </div>
            <button
              onClick={() => setActiveTab('focus')}
              className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] py-1 bg-app-surface hover:bg-app-hover text-app-accent rounded-component border border-app-line font-medium transition-colors"
            >
              <span>Launch Focus</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Quick Theme Mode Toggle in Sidebar */}
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-1 bg-app-bg rounded-component border border-app-line">
            <button
              onClick={() => updateAppearance({ themeMode: 'light' })}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-component text-[11px] font-mono transition-colors ${
                appearance?.themeMode === 'light' ? 'bg-app-surface text-app-ink shadow-sm font-bold' : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Sun className="w-3 h-3" />
              <span>Light</span>
            </button>
            <button
              onClick={() => updateAppearance({ themeMode: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-component text-[11px] font-mono transition-colors ${
                appearance?.themeMode === 'dark' ? 'bg-app-surface text-app-ink shadow-sm font-bold' : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Moon className="w-3 h-3" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => updateAppearance({ themeMode: 'system' })}
              className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-component text-[11px] font-mono transition-colors ${
                appearance?.themeMode === 'system' ? 'bg-app-surface text-app-ink shadow-sm font-bold' : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Laptop className="w-3 h-3" />
              <span>Sys</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => toggleThemeMode()}
            className="w-full flex items-center justify-center p-2 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line"
            title="Toggle Theme"
          >
            {appearance?.themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        )}

        {/* Exit Button */}
        <button
          onClick={() => window.electronAPI?.quitApp()}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-component text-xs font-mono text-app-muted hover:text-app-danger hover:bg-app-danger/10 border border-transparent transition-all"
          title="Exit Application"
        >
          <Power className="w-3.5 h-3.5" />
          {!isCollapsed && <span>Exit Application</span>}
        </button>
      </div>
    </aside>
  );
};
