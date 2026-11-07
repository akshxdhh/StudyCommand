import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Brain,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CircularProgress } from '../components/CircularProgress';
import { formatSecondsToTimer } from '../utils/time';
import { soundSynth } from '../utils/audio';

type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

export const FocusMode: React.FC = () => {
  const {
    data,
    focusPreload,
    clearFocusPreload,
    logFocusSession,
    markSessionCompleted,
    triggerConfetti,
  } = useApp();

  const settings = data?.settings;
  const focusMin = settings?.focusDuration || 30;
  const shortBreakMin = settings?.shortBreakDuration || 15;
  const longBreakMin = settings?.longBreakDuration || 30;
  const longBreakInterval = settings?.longBreakInterval || 4;

  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(focusMin * 60);
  const [totalSeconds, setTotalSeconds] = useState<number>(focusMin * 60);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    focusPreload?.subjectId || data?.subjects[0]?.id || 'sub-cn'
  );
  const [selectedTopicTitle, setSelectedTopicTitle] = useState<string>(
    focusPreload?.topicTitle || ''
  );

  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const targetEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (focusPreload) {
      if (focusPreload.subjectId) setSelectedSubjectId(focusPreload.subjectId);
      if (focusPreload.topicTitle) setSelectedTopicTitle(focusPreload.topicTitle);
      setMode('FOCUS');
      setRemainingSeconds(focusMin * 60);
      setTotalSeconds(focusMin * 60);
      setIsActive(false);
      targetEndTimeRef.current = null;
    }
  }, [focusPreload, focusMin]);

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

  const handleTimerComplete = async () => {
    setIsActive(false);
    targetEndTimeRef.current = null;

    const currentSubj = data?.subjects.find(s => s.id === selectedSubjectId);

    if (mode === 'FOCUS') {
      soundSynth.playCompleteFanfare();
      triggerConfetti();

      if (window.electronAPI) {
        window.electronAPI.showNotification({
          title: 'Focus Sprint Complete!',
          body: `Great work on ${currentSubj?.name || 'Study'}! Time for a well-deserved ${shortBreakMin}-minute break.`,
          playSound: data?.settings.notificationSoundEnabled,
        });
      }

      await logFocusSession({
        type: 'FOCUS',
        durationMinutes: focusMin,
        subjectId: selectedSubjectId,
        subjectCode: currentSubj?.code,
        topicTitle: selectedTopicTitle || 'Focused Study Sprint',
        completed: true,
      });

      if (focusPreload?.recordId) {
        await markSessionCompleted(focusPreload.recordId);
        clearFocusPreload();
      }

      const nextCycle = completedCycles + 1;
      setCompletedCycles(nextCycle);

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
        subjectId: selectedSubjectId,
        subjectCode: currentSubj?.code,
        topicTitle: 'Recovery Break',
        completed: true,
      });

      switchMode('FOCUS');
    }
  };

  const handleStart = () => {
    targetEndTimeRef.current = Date.now() + remainingSeconds * 1000;
    setIsActive(true);
    if (mode === 'FOCUS' && data?.settings.notificationSoundEnabled) {
      soundSynth.playStudyChime();
    }
  };

  const handlePause = () => {
    setIsActive(false);
    targetEndTimeRef.current = null;
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

  const progressPct = totalSeconds > 0
    ? Math.round(((totalSeconds - remainingSeconds) / totalSeconds) * 100)
    : 0;

  const currentSubject = data?.subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-between space-y-6">
      {/* Top Mode Selector Tabs */}
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

      {/* Target Subject & Topic Selector */}
      <div className="w-full max-w-lg card-kopy p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="text-[10px] font-mono uppercase text-app-muted block mb-1">
            TARGET SUBJECT
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isActive}
            className="input-kopy w-full px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
          >
            {data?.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} – {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[10px] font-mono uppercase text-app-muted block mb-1">
            SPECIFIC TOPIC
          </label>
          <input
            type="text"
            placeholder="e.g. Master Theorem & Recurrence Relations"
            value={selectedTopicTitle}
            onChange={(e) => setSelectedTopicTitle(e.target.value)}
            disabled={isActive}
            className="input-kopy w-full px-3 py-1.5 text-xs disabled:opacity-60"
          />
        </div>
      </div>

      {/* Centerpiece: Glowing Circular Progress Timer */}
      <div className="relative my-4 flex flex-col items-center">
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
              ? 'rgba(74, 222, 128, 0.35)'
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
                {selectedTopicTitle || currentSubject?.name || 'Study Block'}
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
            onClick={handleStart}
            className="flex items-center space-x-2 px-8 py-3.5 rounded-component bg-app-accent hover:opacity-90 text-white font-bold text-sm tracking-wide shadow-panel transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>START SPRINT</span>
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

      {/* Bottom Cycle Progress Indicators */}
      <div className="w-full max-w-md card-kopy p-3.5 flex items-center justify-between text-xs font-mono text-app-muted">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-app-accent" />
          <span>CYCLES COMPLETED: <strong className="text-app-ink">{completedCycles}</strong></span>
        </div>

        <div className="flex items-center space-x-1.5">
          {Array.from({ length: longBreakInterval }).map((_, i) => {
            const isFilled = (completedCycles % longBreakInterval) > i;
            return (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isFilled ? 'bg-app-accent shadow-sm' : 'bg-app-bg border border-app-line'
                }`}
                title={`Interval ${i + 1}`}
              ></span>
            );
          })}
        </div>

        <span className="text-[11px] text-app-muted">
          {(longBreakInterval - (completedCycles % longBreakInterval))} until long break
        </span>
      </div>
    </div>
  );
};
