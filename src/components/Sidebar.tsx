import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CalendarClock,
  Timer,
  BarChart2,
  Settings,
  Info,
  Power,
  Clock,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime24to12 } from '../utils/time';

interface NavItem {
  id: string;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    data,
    toggleThemeMode,
    updateAppearance,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    t,
    activeProfile,
  } = useApp();
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

  const today = data ? data.dailyRecords[data.lastActiveDate] || [] : [];
  const missedCount = today.filter((r) => r.status === 'MISSED').length;
  const pendingCount = today.filter((r) => r.status === 'PENDING').length;

  let totalTopics = 0;
  let completedTopics = 0;
  data?.subjects?.forEach((s) => {
    s.modules?.forEach((m) => {
      totalTopics += m.topics.length;
      completedTopics += m.topics.filter((t) => t.status === 'COMPLETED' || t.completed).length;
    });
  });

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelKey: 'nav.dashboard',
      defaultLabel: 'Dashboard',
      icon: LayoutDashboard,
      badge: missedCount > 0 ? `${missedCount} Missed` : undefined,
    },
    {
      id: 'planner',
      labelKey: 'nav.planner',
      defaultLabel: 'Study Planner',
      icon: BookOpen,
      badge: `${completedTopics}/${totalTopics}`,
    },
    {
      id: 'countdown',
      labelKey: 'timetable.title',
      defaultLabel: 'Timetable',
      icon: CalendarClock,
      badge: data?.exams?.length ? `${data.exams.length} Exams` : undefined,
    },
    {
      id: 'focus',
      labelKey: 'nav.focus',
      defaultLabel: 'Focus Mode',
      icon: Timer,
      badge: pendingCount > 0 ? `${pendingCount} Left` : undefined,
    },
    {
      id: 'history',
      labelKey: 'nav.analytics',
      defaultLabel: 'Analytics',
      icon: BarChart2,
    },
    {
      id: 'settings',
      labelKey: 'nav.settings',
      defaultLabel: 'Settings',
      icon: Settings,
    },
    {
      id: 'about',
      labelKey: 'nav.about',
      defaultLabel: 'About',
      icon: Info,
    },
  ];

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const nextSession = today.find((r) => {
    if (r.status !== 'PENDING') return false;
    const [h, m] = r.startTime.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  return (
    <aside
      className={`${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-app-surface border-r border-app-line flex flex-col justify-between shrink-0 select-none transition-all duration-300 ease-in-out relative z-30`}
    >
      {/* Top Section */}
      <div>
        {/* App Title & Header with Collapse Toggle */}
        <div className="p-3.5 border-b border-app-line flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center shrink-0 shadow-panel">
              <Timer className="w-4 h-4 text-app-accent" />
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="text-xs font-bold tracking-tight text-app-ink truncate font-sans">
                  STUDY <span className="text-app-accent">COMMAND</span>
                </h1>
                <p className="text-[10px] text-app-muted font-mono flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-app-live animate-pulse"></span>
                  <span>{activeProfile.name}</span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => toggleSidebarCollapsed()}
            className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Station Clock (Expanded only) */}
        {!sidebarCollapsed && (
          <div className="px-3.5 py-1.5 bg-app-bg/60 border-b border-app-line flex items-center justify-between text-[11px] font-mono text-app-muted">
            <span className="flex items-center gap-1 text-app-accent">
              <Clock className="w-3 h-3" />
              TIME
            </span>
            <span className="text-app-ink font-semibold">{currentTimeStr}</span>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const label = t(item.labelKey as any, item.defaultLabel);

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-between px-3'
                  } py-2 rounded-component text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-app-accent text-white shadow-panel'
                      : 'text-app-muted hover:text-app-ink hover:bg-app-hover border border-transparent'
                  }`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-app-muted group-hover:text-app-ink'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{label}</span>}
                  </div>
                  {!sidebarCollapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
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

                {/* Floating Tooltip when Collapsed */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-app-surface border border-app-line text-app-ink text-xs rounded-component shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-medium flex items-center gap-1.5">
                    <span>{label}</span>
                    {item.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-app-bg text-app-accent rounded border border-app-line">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: Next Session Widget, Theme Switcher & Exit */}
      <div className="p-2.5 border-t border-app-line space-y-2">
        {/* Next Session Box (Only if not collapsed) */}
        {!sidebarCollapsed && nextSession && (
          <div className="p-2.5 rounded-component bg-app-bg border border-app-line">
            <div className="flex items-center justify-between text-[10px] text-app-accent font-mono">
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
        {!sidebarCollapsed ? (
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
          className={`w-full flex items-center ${
            sidebarCollapsed ? 'justify-center' : 'justify-center space-x-2'
          } px-2 py-1.5 rounded-component text-xs font-mono text-app-muted hover:text-app-danger hover:bg-app-danger/10 border border-transparent transition-all`}
          title="Exit Application"
        >
          <Power className="w-3.5 h-3.5" />
          {!sidebarCollapsed && <span>Exit App</span>}
        </button>
      </div>
    </aside>
  );
};
