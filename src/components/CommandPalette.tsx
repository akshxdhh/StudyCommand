import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Brain,
  Sparkles,
  LayoutDashboard,
  CalendarClock,
  Timer,
  History,
  Settings,
  X,
  ArrowRight,
  Command
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Subject, Module, Topic } from '../types';

interface SearchResult {
  type: 'TOPIC' | 'NAV';
  subject?: Subject;
  module?: Module;
  topic?: Topic;
  navId?: string;
  label: string;
  sublabel?: string;
}

export const CommandPalette: React.FC = () => {
  const { data, setActiveTab, startFocusSessionWithPreload } = useApp();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Navigation targets
  const navTargets: SearchResult[] = [
    { type: 'NAV', navId: 'dashboard', label: 'Dashboard', sublabel: 'View today\'s study timetable & telemetry' },
    { type: 'NAV', navId: 'planner', label: 'Study Planner', sublabel: 'Browse 6 subjects, 24 modules & 83 topics' },
    { type: 'NAV', navId: 'countdown', label: 'Exam Countdown', sublabel: 'Live countdowns for theory & lab exams' },
    { type: 'NAV', navId: 'focus', label: 'Focus Mode', sublabel: 'Pomodoro timer & AI study prompt engine' },
    { type: 'NAV', navId: 'history', label: 'Session History', sublabel: 'Analytics & completed study logs' },
    { type: 'NAV', navId: 'settings', label: 'Settings', sublabel: 'Appearance, timetable, and Windows startup' },
  ];

  // Search results
  const filteredResults = useMemo<SearchResult[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return navTargets;
    }

    const topicResults: SearchResult[] = [];
    if (data?.subjects) {
      for (const subj of data.subjects) {
        for (const mod of subj.modules) {
          for (const top of mod.topics) {
            const matchesTitle = top.title.toLowerCase().includes(trimmed);
            const matchesSubtopics = top.subtopics?.some((s) => s.toLowerCase().includes(trimmed));
            const matchesSubj = subj.name.toLowerCase().includes(trimmed) || subj.code.toLowerCase().includes(trimmed);

            if (matchesTitle || matchesSubtopics || matchesSubj) {
              topicResults.push({
                type: 'TOPIC',
                subject: subj,
                module: mod,
                topic: top,
                label: top.title,
                sublabel: `${subj.code} • ${mod.name}`,
              });
            }
          }
        }
      }
    }

    const matchedNavs = navTargets.filter(
      (n) => n.label.toLowerCase().includes(trimmed) || n.sublabel?.toLowerCase().includes(trimmed)
    );

    return [...topicResults.slice(0, 15), ...matchedNavs];
  }, [query, data?.subjects]);

  // Keyboard navigation inside list
  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredResults[selectedIndex];
      if (selected) handleSelect(selected);
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'NAV' && result.navId) {
      setActiveTab(result.navId);
    } else if (result.type === 'TOPIC' && result.subject && result.module && result.topic) {
      startFocusSessionWithPreload({
        subjectId: result.subject.id,
        moduleId: result.module.id,
        topicId: result.topic.id,
        topicTitle: result.topic.title,
      });
    }
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-app-surface border border-app-line rounded-card shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onKeyDown={handleListKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-app-line bg-app-surface">
          <Search className="w-5 h-5 text-app-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search 83 syllabus topics, navigate pages, launch AI study sessions... (Ctrl+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-app-ink placeholder:text-app-muted/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-app-bg text-app-muted border border-app-line">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto space-y-1">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-app-muted">
              <BookOpen className="w-8 h-8 mx-auto text-app-muted/40 mb-2" />
              <p className="font-semibold text-app-ink">No syllabus topics found for "{query}"</p>
              <p className="mt-1">Try searching by topic keyword, algorithm, or course code (e.g., "CIDR", "Dijkstra", "SVM", "ARM").</p>
            </div>
          ) : (
            filteredResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-component cursor-pointer transition-colors ${
                    isSelected ? 'bg-app-accent/15 text-app-ink' : 'hover:bg-app-hover text-app-ink'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {item.type === 'NAV' ? (
                      <div className="w-7 h-7 rounded-component bg-app-bg border border-app-line flex items-center justify-center shrink-0 text-app-accent">
                        {item.navId === 'dashboard' && <LayoutDashboard className="w-3.5 h-3.5" />}
                        {item.navId === 'planner' && <BookOpen className="w-3.5 h-3.5" />}
                        {item.navId === 'countdown' && <CalendarClock className="w-3.5 h-3.5" />}
                        {item.navId === 'focus' && <Timer className="w-3.5 h-3.5" />}
                        {item.navId === 'history' && <History className="w-3.5 h-3.5" />}
                        {item.navId === 'settings' && <Settings className="w-3.5 h-3.5" />}
                      </div>
                    ) : (
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{
                          backgroundColor: `${item.subject?.color || '#8b5cf6'}20`,
                          color: item.subject?.color || '#8b5cf6',
                        }}
                      >
                        {item.subject?.code}
                      </span>
                    )}

                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-app-ink truncate">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[10px] text-app-muted truncate font-mono">{item.sublabel}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.type === 'TOPIC' && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-app-accent px-2 py-0.5 rounded bg-app-accent/10 border border-app-accent/20">
                        <Sparkles className="w-3 h-3" />
                        <span>Start Focus</span>
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 text-app-muted" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2 border-t border-app-line bg-app-bg/50 flex items-center justify-between text-[11px] font-mono text-app-muted">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-app-accent font-semibold">STUDY COMMAND Universal Search</span>
        </div>
      </div>
    </div>
  );
};
