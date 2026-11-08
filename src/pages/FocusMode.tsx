import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Brain,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Edit3,
  ArrowLeft,
  BookOpen,
  Layers,
  HelpCircle,
  Calculator,
  Zap,
  MessageSquare,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CircularProgress } from '../components/CircularProgress';
import { formatSecondsToTimer } from '../utils/time';
import { soundSynth } from '../utils/audio';
import {
  generateStudyPrompt,
  PromptCustomizationOptions,
  DEFAULT_PROMPT_OPTIONS,
  STUDY_GOAL_METADATA,
  StudyGoal,
  AnswerLength
} from '../utils/promptGenerator';
import { TopicStatus, Subject, Module, Topic } from '../types';

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
type ScreenView = 'PREPARATION' | 'ACTIVE_TIMER';

export const FocusMode: React.FC = () => {
  const {
    data,
    focusPreload,
    clearFocusPreload,
    logFocusSession,
    markSessionCompleted,
    setTopicStatus,
    triggerConfetti,
  } = useApp();

  const settings = data?.settings;
  const focusMin = settings?.focusDuration || 30;
  const shortBreakMin = settings?.shortBreakDuration || 15;
  const longBreakMin = settings?.longBreakDuration || 30;
  const longBreakInterval = settings?.longBreakInterval || 4;

  // View state: 'PREPARATION' screen vs 'ACTIVE_TIMER' screen
  const [screenView, setScreenView] = useState<ScreenView>('PREPARATION');

  // Topic selection state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    focusPreload?.subjectId || data?.subjects[0]?.id || 'sub-cn'
  );
  const [selectedModuleId, setSelectedModuleId] = useState<string>(
    focusPreload?.moduleId || ''
  );
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    focusPreload?.topicId || ''
  );
  const [customTopicTitle, setCustomTopicTitle] = useState<string>(
    focusPreload?.topicTitle || ''
  );

  // Prompt customization options & state
  const [promptOptions, setPromptOptions] = useState<PromptCustomizationOptions>({
    ...DEFAULT_PROMPT_OPTIONS,
  });
  const [editablePrompt, setEditablePrompt] = useState<string>('');
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);

  // Completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState<boolean>(false);

  // Timer state
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(focusMin * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(focusMin * 60);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const targetEndTimeRef = useRef<number | null>(null);

  // Current Subject object
  const currentSubject = useMemo<Subject | undefined>(() => {
    return data?.subjects.find((s) => s.id === selectedSubjectId) || data?.subjects[0];
  }, [data?.subjects, selectedSubjectId]);

  // Current Module object
  const currentModule = useMemo<Module | undefined>(() => {
    if (!currentSubject) return undefined;
    if (selectedModuleId) {
      const found = currentSubject.modules.find((m) => m.id === selectedModuleId);
      if (found) return found;
    }
    return currentSubject.modules[0];
  }, [currentSubject, selectedModuleId]);

  // Current Topic object
  const currentTopic = useMemo<Topic | undefined>(() => {
    if (!currentModule) return undefined;
    if (selectedTopicId) {
      const found = currentModule.topics.find((t) => t.id === selectedTopicId);
      if (found) return found;
    }
    if (customTopicTitle) {
      const foundByTitle = currentModule.topics.find(
        (t) => t.title.toLowerCase() === customTopicTitle.toLowerCase()
      );
      if (foundByTitle) return foundByTitle;
    }
    return currentModule.topics[0];
  }, [currentModule, selectedTopicId, customTopicTitle]);

  // Synchronize when focusPreload arrives from Study Planner or Dashboard
  useEffect(() => {
    if (focusPreload) {
      if (focusPreload.subjectId) {
        setSelectedSubjectId(focusPreload.subjectId);
      }
      if (focusPreload.moduleId) {
        setSelectedModuleId(focusPreload.moduleId);
      }
      if (focusPreload.topicId) {
        setSelectedTopicId(focusPreload.topicId);
      }
      if (focusPreload.topicTitle) {
        setCustomTopicTitle(focusPreload.topicTitle);
      }

      // Automatically open the Preparation screen
      setScreenView('PREPARATION');
      setIsActive(false);
      targetEndTimeRef.current = null;
      setMode('FOCUS');
      setRemainingSeconds(focusMin * 60);
      setTotalSeconds(focusMin * 60);
    }
  }, [focusPreload, focusMin]);

  // Auto-generate prompt whenever selected topic, module, subject, or prompt options change
  useEffect(() => {
    if (currentSubject && currentModule && currentTopic) {
      const prompt = generateStudyPrompt(currentSubject, currentModule, currentTopic, promptOptions);
      setEditablePrompt(prompt);
    }
  }, [currentSubject, currentModule, currentTopic, promptOptions]);

  // Switch between Focus, Short Break, and Long Break
  const switchMode = (newMode: TimerMode) => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    setMode(newMode);
    let mins = focusMin;
    if (newMode === 'SHORT_BREAK') mins = shortBreakMin;
    if (newMode === 'LONG_BREAK') mins = longBreakMin;
    setRemainingSeconds(mins * 60);
    setTotalSeconds(mins * 60);
  };

  // Timer interval ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      if (!targetEndTimeRef.current) {
        targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
      }

      interval = setInterval(() => {
        if (!targetEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.round((targetEndTimeRef.current - now) / 1000));
        setRemainingSeconds(diff);

        if (diff <= 0) {
          handleTimerComplete();
        }
      }, 500);
    } else {
      targetEndTimeRef.current = null;
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingSeconds]);

  // Handle completion of timer
  const handleTimerComplete = async () => {
    setIsActive(false);
    targetEndTimeRef.current = null;

    if (mode === 'FOCUS') {
      soundSynth.playCompleteFanfare();
      triggerConfetti();

      if (window.electronAPI) {
        window.electronAPI.showNotification({
          title: 'Focus Sprint Complete!',
          body: `Great work on ${currentTopic?.title || 'Study Topic'}! Ready for a recovery break?`,
          playSound: data?.settings.notificationSoundEnabled,
        });
      }

      // Log session with topic associations
      await logFocusSession({
        type: 'FOCUS',
        durationMinutes: focusMin,
        subjectId: currentSubject?.id,
        subjectCode: currentSubject?.code,
        moduleId: currentModule?.id,
        topicId: currentTopic?.id,
        topicTitle: currentTopic?.title || customTopicTitle || 'Focused Study Sprint',
        completed: true,
      });

      if (focusPreload?.recordId) {
        await markSessionCompleted(focusPreload.recordId);
        clearFocusPreload();
      }

      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);

      // Show completion modal to ask user for topic status update
      setShowCompletionModal(true);

      // Queue break mode
      if (nextCycle % longBreakInterval === 0) {
        switchMode('LONG_BREAK');
      } else {
        switchMode('SHORT_BREAK');
      }
    } else {
      soundSynth.playBreakChime();

      if (window.electronAPI) {
        window.electronAPI.showNotification({
          title: 'Break Concluded!',
          body: 'Recharge complete. Ready to initiate the next focus sprint?',
          playSound: data?.settings.notificationSoundEnabled,
        });
      }

      await logFocusSession({
        type: mode,
        durationMinutes: mode === 'SHORT_BREAK' ? shortBreakMin : longBreakMin,
        subjectId: currentSubject?.id,
        subjectCode: currentSubject?.code,
        topicTitle: 'Recovery Break',
        completed: true,
      });

      switchMode('FOCUS');
    }
  };

  // Start Focus Session from Preparation Screen
  const handleStartSession = () => {
    setScreenView('ACTIVE_TIMER');
    setMode('FOCUS');
    setRemainingSeconds(focusMin * 60);
    setTotalSeconds(focusMin * 60);
    targetEndTimeRef.current = Date.now() + focusMin * 60 * 1000;
    setIsActive(true);

    if (data?.settings.notificationSoundEnabled) {
      soundSynth.playStudyChime();
    }
  };

  const handlePause = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
  };

  const handleResume = () => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
    let mins = focusMin;
    if (mode === 'SHORT_BREAK') mins = shortBreakMin;
    if (mode === 'LONG_BREAK') mins = longBreakMin;
    setRemainingSeconds(mins * 60);
    setTotalSeconds(mins * 60);
  };

  const handleSkip = () => {
    if (mode === 'FOCUS') {
      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);
      if (nextCycle % longBreakInterval === 0) {
        switchMode('LONG_BREAK');
      } else {
        switchMode('SHORT_BREAK');
      }
    } else {
      switchMode('FOCUS');
    }
  };

  // Copy Prompt to Clipboard
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(editablePrompt);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2800);
    } catch (err) {
      console.error('Failed to copy prompt to clipboard:', err);
    }
  };

  // Open External AI Chat
  const handleOpenAi = (url: string = 'https://chatgpt.com') => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else if (window.electronAPI?.openPath) {
      window.electronAPI.openPath(url);
    } else {
      window.open(url, '_blank');
    }
  };

  // Topic Status Assignment from Completion Modal
  const handleAssignTopicStatus = async (status: TopicStatus) => {
    if (currentSubject && currentModule && currentTopic) {
      await setTopicStatus(currentSubject.id, currentModule.id, currentTopic.id, status);
    }
    setShowCompletionModal(false);
  };

  const progressPct = totalSeconds > 0
    ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
    : 0;

  // Word count helper
  const wordCount = useMemo(() => {
    return editablePrompt.trim() ? editablePrompt.trim().split(/\s+/).length : 0;
  }, [editablePrompt]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 1. PREPARATION SCREEN (Topic-Aware AI Prompt Customizer & Launchpad) */}
      {/* ========================================================================= */}
      {screenView === 'PREPARATION' ? (
        <div className="space-y-6 max-w-4xl mx-auto w-full animate-fade-in">
          {/* Header */}
          <div className="border-b border-app-line pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
                <Brain className="w-4 h-4" />
                <span>TOPIC-AWARE FOCUS SESSION PREPARATION</span>
              </div>
              <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">
                AI Study Prompt & Sprint Launchpad
              </h2>
              <p className="text-xs text-app-muted">
                Review your topic curriculum, customize the exam-oriented prompt, and start your 30-minute study block.
              </p>
            </div>

            {/* Quick launch directly if timer already configured */}
            <button
              onClick={handleStartSession}
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-component bg-app-accent hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-panel transition-all transform hover:-translate-y-0.5 shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START FOCUS SESSION</span>
            </button>
          </div>

          {/* Section 1: Target Subject, Module & Topic Selector */}
          <div className="card-kopy p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-app-accent" />
                Selected Syllabus Topic
              </span>
              {currentSubject && (
                <span
                  className="text-[11px] font-mono px-2 py-0.5 rounded font-bold"
                  style={{
                    backgroundColor: `${currentSubject.color}20`,
                    color: currentSubject.color,
                  }}
                >
                  {currentSubject.code} • {currentSubject.courseCode}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Subject Selector */}
              <div>
                <label className="text-[11px] font-mono uppercase text-app-muted block mb-1">
                  1. Subject
                </label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const sub = data?.subjects.find(s => s.id === e.target.value);
                    if (sub && sub.modules.length > 0) {
                      setSelectedModuleId(sub.modules[0].id);
                      if (sub.modules[0].topics.length > 0) {
                        setSelectedTopicId(sub.modules[0].topics[0].id);
                        setCustomTopicTitle(sub.modules[0].topics[0].title);
                      }
                    }
                  }}
                  className="input-kopy w-full px-3 py-2 text-xs font-semibold"
                >
                  {data?.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} – {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Module Selector */}
              <div>
                <label className="text-[11px] font-mono uppercase text-app-muted block mb-1">
                  2. Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => {
                    setSelectedModuleId(e.target.value);
                    const mod = currentSubject?.modules.find(m => m.id === e.target.value);
                    if (mod && mod.topics.length > 0) {
                      setSelectedTopicId(mod.topics[0].id);
                      setCustomTopicTitle(mod.topics[0].title);
                    }
                  }}
                  className="input-kopy w-full px-3 py-2 text-xs font-medium"
                >
                  {currentSubject?.modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic Selector */}
              <div>
                <label className="text-[11px] font-mono uppercase text-app-muted block mb-1">
                  3. Specific Topic
                </label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => {
                    setSelectedTopicId(e.target.value);
                    const top = currentModule?.topics.find(t => t.id === e.target.value);
                    if (top) setCustomTopicTitle(top.title);
                  }}
                  className="input-kopy w-full px-3 py-2 text-xs font-medium"
                >
                  {currentModule?.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic Details Badge Bar */}
            {currentTopic && (
              <div className="p-3.5 bg-app-bg rounded-component border border-app-line space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-app-ink">{currentTopic.title}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${
                        currentTopic.priority === 'HIGH'
                          ? 'bg-app-danger/10 text-app-danger border-app-danger/25'
                          : 'bg-app-warn/10 text-app-warn border-app-warn/25'
                      }`}
                    >
                      {currentTopic.priority} PRIORITY
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-app-surface text-app-muted border border-app-line uppercase">
                      STATUS: {currentTopic.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-app-muted">
                    Module: {currentModule?.name}
                  </span>
                </div>

                {/* Subtopics Checklist Pills */}
                {currentTopic.subtopics && currentTopic.subtopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentTopic.subtopics.map((sub, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-app-surface text-app-muted px-2 py-0.5 rounded border border-app-line"
                      >
                        • {sub}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Prompt Customization Controls */}
          <div className="card-kopy p-5 space-y-4">
            <span className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-app-accent" />
              Prompt Customization & Study Goal
            </span>

            {/* Study Goal Grid */}
            <div>
              <label className="text-[11px] font-mono text-app-muted block mb-2 uppercase">
                Select Study Goal / Explanation Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(Object.keys(STUDY_GOAL_METADATA) as StudyGoal[]).map((goalKey) => {
                  const meta = STUDY_GOAL_METADATA[goalKey];
                  const isSelected = promptOptions.goal === goalKey;
                  return (
                    <button
                      key={goalKey}
                      type="button"
                      onClick={() => setPromptOptions(prev => ({ ...prev, goal: goalKey }))}
                      className={`p-2.5 rounded-component border text-left transition-all ${
                        isSelected
                          ? 'bg-app-accent text-white border-app-accent shadow-panel ring-1 ring-app-accent'
                          : 'bg-app-surface text-app-ink border-app-line hover:border-app-line2'
                      }`}
                    >
                      <div className="font-bold text-xs">{meta.label}</div>
                      <div className={`text-[10px] mt-0.5 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-app-muted'}`}>
                        {meta.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Depth & Content Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-app-line">
              {/* Answer Length */}
              <div>
                <label className="text-[11px] font-mono text-app-muted block mb-2 uppercase">
                  Target Answer Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['SHORT', 'MEDIUM', 'DETAILED'] as AnswerLength[]).map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setPromptOptions(prev => ({ ...prev, length: len }))}
                      className={`py-1.5 px-3 rounded-component text-xs font-semibold text-center border transition-all ${
                        promptOptions.length === len
                          ? 'bg-app-accent text-white border-app-accent shadow-sm'
                          : 'bg-app-surface text-app-muted border-app-line hover:text-app-ink'
                      }`}
                    >
                      {len === 'SHORT' ? 'Short (~250w)' : len === 'MEDIUM' ? 'Medium (~600w)' : 'Detailed (1000w+)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checkbox Options */}
              <div>
                <label className="text-[11px] font-mono text-app-muted block mb-2 uppercase">
                  Include in Study Prompt
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-app-ink">
                    <input
                      type="checkbox"
                      checked={promptOptions.includeExamples}
                      onChange={(e) => setPromptOptions(prev => ({ ...prev, includeExamples: e.target.checked }))}
                      className="rounded text-app-accent focus:ring-app-accent"
                    />
                    <span>Examples & Cases</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-app-ink">
                    <input
                      type="checkbox"
                      checked={promptOptions.includeFormulas}
                      onChange={(e) => setPromptOptions(prev => ({ ...prev, includeFormulas: e.target.checked }))}
                      className="rounded text-app-accent focus:ring-app-accent"
                    />
                    <span>Key Formulas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-app-ink">
                    <input
                      type="checkbox"
                      checked={promptOptions.includeExamQuestions}
                      onChange={(e) => setPromptOptions(prev => ({ ...prev, includeExamQuestions: e.target.checked }))}
                      className="rounded text-app-accent focus:ring-app-accent"
                    />
                    <span>Exam Q&A (KTU)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-app-ink">
                    <input
                      type="checkbox"
                      checked={promptOptions.includeScoringTips}
                      onChange={(e) => setPromptOptions(prev => ({ ...prev, includeScoringTips: e.target.checked }))}
                      className="rounded text-app-accent focus:ring-app-accent"
                    />
                    <span>Scoring Tips</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Generated Study Prompt Review & Editor */}
          <div className="card-kopy p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-app-line pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-app-accent" />
                <span className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider">
                  Generated Exam-Oriented Study Prompt
                </span>
                <span className="text-[10px] font-mono text-app-muted bg-app-bg px-2 py-0.5 rounded border border-app-line">
                  {wordCount} words
                </span>
              </div>

              {/* Action Buttons: Copy, Open ChatGPT, Regenerate */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (currentSubject && currentModule && currentTopic) {
                      setEditablePrompt(generateStudyPrompt(currentSubject, currentModule, currentTopic, promptOptions));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line text-xs font-medium transition-colors"
                  title="Reset to default auto-generated prompt"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Prompt</span>
                </button>

                <button
                  onClick={handleCopyPrompt}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-component font-semibold text-xs transition-all shadow-sm ${
                    copiedToast
                      ? 'bg-app-live text-white'
                      : 'bg-app-accent text-white hover:opacity-90'
                  }`}
                  title="Copy Prompt to Clipboard"
                >
                  {copiedToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
                </button>
              </div>
            </div>

            {/* Editable Prompt Textarea */}
            <div className="relative">
              <textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                rows={12}
                className="w-full p-3.5 rounded-component border border-app-line text-xs font-mono leading-relaxed bg-app-surface text-app-ink focus:outline-none focus:ring-1 focus:ring-app-accent resize-y"
                placeholder="AI Study Prompt will be generated here..."
              />
            </div>

            {/* External AI Launch Bar & Start Session Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-app-muted">Open in AI:</span>
                <button
                  onClick={() => {
                    handleCopyPrompt();
                    handleOpenAi('https://chatgpt.com');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-semibold transition-colors"
                >
                  <span>Open ChatGPT</span>
                  <ExternalLink className="w-3 h-3 text-app-accent" />
                </button>

                <button
                  onClick={() => {
                    handleCopyPrompt();
                    handleOpenAi('https://claude.ai');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line text-xs font-medium transition-colors"
                >
                  <span>Claude</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => {
                    handleCopyPrompt();
                    handleOpenAi('https://gemini.google.com');
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line text-xs font-medium transition-colors"
                >
                  <span>Gemini</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Start Focus Session Primary CTA */}
              <button
                onClick={handleStartSession}
                className="flex items-center justify-center space-x-2 px-8 py-3 rounded-component bg-app-accent hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-panel transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START FOCUS SESSION ({focusMin}M)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. ACTIVE FOCUS SESSION SCREEN (30-Minute Sprint with Visible Topic)      */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col items-center justify-between space-y-6 max-w-2xl mx-auto w-full animate-fade-in">
          {/* Top persistent Topic Card */}
          <div className="w-full card-kopy p-4 space-y-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${currentSubject?.color || '#8b5cf6'}25`,
                    color: currentSubject?.color || '#8b5cf6',
                  }}
                >
                  {currentSubject?.code} • {currentSubject?.courseCode}
                </span>
                <span className="text-xs font-mono text-app-muted">
                  {currentModule?.name}
                </span>
              </div>

              {/* View Study Prompt during session */}
              <button
                onClick={() => setShowPromptModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-medium transition-colors"
                title="View or copy the generated study prompt"
              >
                <Sparkles className="w-3.5 h-3.5 text-app-accent" />
                <span>View Prompt</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-app-ink">
                {currentTopic?.title || customTopicTitle || 'Focused Study Session'}
              </h3>
            </div>

            {/* Subtopics pill trail */}
            {currentTopic?.subtopics && currentTopic.subtopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentTopic.subtopics.map((sub, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono bg-app-bg text-app-muted px-2 py-0.5 rounded border border-app-line"
                  >
                    • {sub}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mode Selector Tabs (Focus, Short Break, Long Break) */}
          <div className="flex items-center p-1.5 rounded-component bg-app-surface border border-app-line shadow-panel">
            <button
              onClick={() => switchMode('FOCUS')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-component text-xs font-mono font-semibold transition-all ${
                mode === 'FOCUS'
                  ? 'bg-app-accent text-white shadow-sm'
                  : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span>FOCUS ({focusMin}M)</span>
            </button>

            <button
              onClick={() => switchMode('SHORT_BREAK')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-component text-xs font-mono font-semibold transition-all ${
                mode === 'SHORT_BREAK'
                  ? 'bg-app-live text-white shadow-sm'
                  : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>SHORT BREAK ({shortBreakMin}M)</span>
            </button>

            <button
              onClick={() => switchMode('LONG_BREAK')}
              className={`flex items-center space-x-2 px-5 py-2 rounded-component text-xs font-mono font-semibold transition-all ${
                mode === 'LONG_BREAK'
                  ? 'bg-app-accent text-white shadow-sm'
                  : 'text-app-muted hover:text-app-ink'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>LONG BREAK ({longBreakMin}M)</span>
            </button>
          </div>

          {/* Centerpiece: Circular Progress Countdown Timer */}
          <div className="relative my-2 flex flex-col items-center">
            <CircularProgress
              percentage={progressPct}
              size={320}
              strokeWidth={12}
              color={
                mode === 'FOCUS'
                  ? (currentSubject?.color || 'rgb(var(--c-accent))')
                  : mode === 'SHORT_BREAK'
                  ? 'rgb(var(--c-live))'
                  : 'rgb(var(--c-accent))'
              }
              glowColor={
                mode === 'FOCUS'
                  ? (currentSubject?.color || 'rgba(139, 92, 246, 0.35)')
                  : mode === 'SHORT_BREAK'
                  ? 'rgba(22, 101, 52, 0.35)'
                  : 'rgba(139, 92, 246, 0.35)'
              }
            >
              {/* Inner timer content */}
              <div className="text-center">
                <span className="text-[11px] font-mono uppercase tracking-wider text-app-muted font-semibold">
                  {mode === 'FOCUS' ? 'FOCUS SPRINT' : mode === 'SHORT_BREAK' ? 'SHORT RECOVERY' : 'LONG RECOVERY'}
                </span>
                <div className="text-6xl font-extrabold text-app-ink font-mono tracking-tighter my-1">
                  {formatSecondsToTimer(remainingSeconds)}
                </div>
                <div className="flex items-center justify-center space-x-1.5 text-xs text-app-accent font-mono font-medium max-w-[220px] truncate mx-auto">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: currentSubject?.color || '#8b5cf6' }}
                  ></span>
                  <span className="truncate">
                    {currentTopic?.title || currentSubject?.name || 'Study Block'}
                  </span>
                </div>
              </div>
            </CircularProgress>
          </div>

          {/* Main Timer Controls */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={handleReset}
              className="p-3.5 rounded-component bg-app-surface hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors shadow-sm"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {!isActive ? (
              <button
                onClick={handleResume}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-component bg-app-accent hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-panel transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>RESUME SPRINT</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center space-x-2 px-8 py-3.5 rounded-component bg-app-warn hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-panel transition-all"
              >
                <Pause className="w-5 h-5 fill-current" />
                <span>PAUSE TIMER</span>
              </button>
            )}

            <button
              onClick={handleSkip}
              className="p-3.5 rounded-component bg-app-surface hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors shadow-sm"
              title="Skip Interval"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Cycle Indicators & Return to Prep Button */}
          <div className="w-full max-w-md flex items-center justify-between text-xs font-mono text-app-muted">
            <button
              onClick={() => setScreenView('PREPARATION')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-component bg-app-surface hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Prompt & Topic Settings</span>
            </button>

            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-app-accent" />
              <span>CYCLE: <strong className="text-app-ink">{completedCycles}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL: VIEW PROMPT DURING ACTIVE SESSION                               */}
      {/* ========================================================================= */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-app-surface border border-app-line rounded-card shadow-panel overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-app-line bg-app-bg/50">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-app-accent" />
                <h3 className="text-sm font-bold text-app-ink">
                  Active Study Prompt: {currentTopic?.title}
                </h3>
              </div>
              <button
                onClick={() => setShowPromptModal(false)}
                className="p-1 rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <textarea
                value={editablePrompt}
                onChange={(e) => setEditablePrompt(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-component border border-app-line text-xs font-mono leading-relaxed bg-app-bg text-app-ink focus:outline-none focus:ring-1 focus:ring-app-accent resize-y"
              />
            </div>

            <div className="px-6 py-3 border-t border-app-line bg-app-bg/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-component font-semibold transition-all ${
                    copiedToast ? 'bg-app-live text-white' : 'bg-app-accent text-white hover:opacity-90'
                  }`}
                >
                  {copiedToast ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToast ? 'Copied!' : 'Copy Prompt'}</span>
                </button>

                <button
                  onClick={() => {
                    handleCopyPrompt();
                    handleOpenAi('https://chatgpt.com');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-component bg-app-surface text-app-ink border border-app-line hover:bg-app-hover font-semibold"
                >
                  <span>Open ChatGPT</span>
                  <ExternalLink className="w-3 h-3 text-app-accent" />
                </button>
              </div>

              <button
                onClick={() => setShowPromptModal(false)}
                className="px-4 py-1.5 rounded-component bg-app-bg hover:bg-app-hover border border-app-line text-app-ink font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: POST-SESSION TOPIC STATUS TRACKER                               */}
      {/* ========================================================================= */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-app-surface border border-app-line rounded-card shadow-panel p-6 space-y-4">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-app-live/15 text-app-live mx-auto flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-app-ink font-sans">
                Focus Sprint Completed!
              </h3>
              <p className="text-xs text-app-muted">
                30 minutes logged for <strong className="text-app-ink">{currentTopic?.title || 'Study Topic'}</strong>.
              </p>
            </div>

            <div className="p-3 bg-app-bg rounded-component border border-app-line text-xs space-y-1 text-center font-mono">
              <div className="text-app-muted">Subject: {currentSubject?.name} ({currentSubject?.code})</div>
              <div className="text-app-accent font-semibold">How would you like to update this topic's syllabus status?</div>
            </div>

            {/* Options to update status: Does not automatically mark completed! */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleAssignTopicStatus('COMPLETED')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-component bg-app-live/15 hover:bg-app-live/25 text-app-live border border-app-live/30 text-xs font-bold transition-all text-left"
              >
                <span>Mark Topic as Completed</span>
                <Check className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAssignTopicStatus('NEEDS_REVISION')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-component bg-app-warn/15 hover:bg-app-warn/25 text-app-warn border border-app-warn/30 text-xs font-bold transition-all text-left"
              >
                <span>Flag for Spaced Revision</span>
                <Sparkles className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleAssignTopicStatus('IN_PROGRESS')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-component bg-app-accent/15 hover:bg-app-accent/25 text-app-accent border border-app-accent/30 text-xs font-bold transition-all text-left"
              >
                <span>Keep In Progress (More Practice Needed)</span>
                <Brain className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowCompletionModal(false)}
                className="w-full py-2.5 rounded-component bg-app-bg hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line text-xs font-medium transition-all text-center"
              >
                Leave Status Unchanged
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
