import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  Mic,
  Settings as SettingsIcon,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InteractiveTutorial: React.FC = () => {
  const { showTutorial, completeTutorial, setActiveTab, t } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!showTutorial) return null;

  interface TourStop {
    step: number;
    title: string;
    targetTab?: string;
    icon: React.ReactNode;
    subtitle: string;
    content: string;
    keyHighlight: string;
  }

  const tourStops: TourStop[] = [
    {
      step: 1,
      title: 'Dashboard Overview',
      targetTab: 'dashboard',
      icon: <LayoutDashboard className="w-5 h-5 text-app-accent" />,
      subtitle: 'Your Daily Accountability Command Center',
      content:
        'The Dashboard summarizes your study momentum: today’s completed sprint sessions, upcoming exam countdowns, active subjects, and intelligent AI study recommendations.',
      keyHighlight: 'Track daily progress & next action in one glance.',
    },
    {
      step: 2,
      title: 'Study Planner & Syllabus Navigation',
      targetTab: 'planner',
      icon: <BookOpen className="w-5 h-5 text-app-accent" />,
      subtitle: 'Hierarchical Exam Coverage & Prioritization',
      content:
        'Every subject is organized into modules, topics, and priority tags (High, Medium, Low). Mark topics completed or flagged for revision to maintain complete syllabus mastery.',
      keyHighlight: 'Click "Start Focus" on any topic to prepare an exam prompt.',
    },
    {
      step: 3,
      title: 'PDF Intelligence & Syllabus Import',
      targetTab: 'planner',
      icon: <FileText className="w-5 h-5 text-app-accent" />,
      subtitle: 'Universal University PDF Extraction',
      content:
        'Import raw university syllabus PDFs or timetable sheets. STUDY COMMAND automatically extracts course codes, modules, topics, and dates with selective review before merging.',
      keyHighlight: 'No manual copy-pasting required.',
    },
    {
      step: 4,
      title: 'Daily Timetable & Routine',
      targetTab: 'timetable',
      icon: <Calendar className="w-5 h-5 text-app-accent" />,
      subtitle: 'Structured Study & Recovery Blocks',
      content:
        'Organize your day into study sprints, lunch, and recovery blocks. The intelligent scheduler tracks pending sessions and automatically reschedules missed study slots.',
      keyHighlight: 'Never lose study momentum after schedule disruptions.',
    },
    {
      step: 5,
      title: 'Focus Mode & Cognitive Timers',
      targetTab: 'focus',
      icon: <Clock className="w-5 h-5 text-app-accent" />,
      subtitle: 'Distraction-Free Deep Study Environment',
      content:
        'Features topic-aware exam study prompts, distraction shield alerts, multi-display controls, and focus soundscapes (rain, white noise, binaural beats).',
      keyHighlight: 'Full-screen mode with built-in exam prompts.',
    },
    {
      step: 6,
      title: 'One-Click Rhythm Presets',
      targetTab: 'focus',
      icon: <Zap className="w-5 h-5 text-app-accent" />,
      subtitle: 'Adaptive Focus Intervals',
      content:
        'Switch between classic Pomodoro (25/5), Sprint (30/5), Lecture Block (45/10), or Deep Work (50/10) with one click from any screen or header preset menu.',
      keyHighlight: 'Preset intervals adapt to your mental stamina.',
    },
    {
      step: 7,
      title: 'Analytics & Accountability',
      targetTab: 'analytics',
      icon: <BarChart3 className="w-5 h-5 text-app-accent" />,
      subtitle: 'Syllabus Velocity & Study Distribution',
      content:
        'Inspect your daily study hours, completion streaks, subject balance charts, and syllabus velocity to ensure all examination modules are covered in time.',
      keyHighlight: 'Objective proof of your preparation consistency.',
    },
    {
      step: 8,
      title: 'Offline Voice Assistant',
      targetTab: 'dashboard',
      icon: <Mic className="w-5 h-5 text-app-accent" />,
      subtitle: 'Hands-Free Control & Spoken Countdown',
      content:
        'Ask questions, check remaining timer duration ("How much time is left?"), navigate pages, or listen to exam-oriented study guidelines spoken aloud.',
      keyHighlight: 'Includes instant text-fallback bar for quiet study libraries.',
    },
    {
      step: 9,
      title: 'Settings & Theme Customization',
      targetTab: 'settings',
      icon: <SettingsIcon className="w-5 h-5 text-app-accent" />,
      subtitle: 'Color Themes, Data Isolation & Storage',
      content:
        'Switch between Futuristic Dark and Clean Light modes, select Electric Violet, Cyan, or Emerald accent glows, manage multi-user profiles, clear cache, or export backups.',
      keyHighlight: 'Complete local control with zero telemetry.',
    },
  ];

  const stop = tourStops[currentStep - 1];

  const handleNext = () => {
    if (currentStep < tourStops.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextStop = tourStops[nextStep - 1];
      if (nextStop.targetTab) {
        setActiveTab(nextStop.targetTab);
      }
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      const prevStop = tourStops[prevStep - 1];
      if (prevStop.targetTab) {
        setActiveTab(prevStop.targetTab);
      }
    }
  };

  const handleFinish = async () => {
    await completeTutorial();
    setActiveTab('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
      <div className="pointer-events-auto bg-app-surface border border-app-accent/60 rounded-card w-full max-w-lg p-5 sm:p-6 shadow-2xl relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-app-line">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-component bg-app-accent/20 border border-app-accent/50 flex items-center justify-center text-app-accent shrink-0">
              {stop.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-app-ink">{stop.title}</h3>
                <span className="text-[10px] font-mono font-bold bg-app-accent/20 text-app-accent px-1.5 py-0.5 rounded">
                  {currentStep} / {tourStops.length}
                </span>
              </div>
              <p className="text-[11px] text-app-muted">{stop.subtitle}</p>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="text-app-muted hover:text-app-ink p-1 rounded-component hover:bg-app-hover transition-colors"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-app-line h-1 rounded-full overflow-hidden">
          <div
            className="bg-app-accent h-1 transition-all duration-300"
            style={{ width: `${(currentStep / tourStops.length) * 100}%` }}
          />
        </div>

        {/* Body content */}
        <div className="space-y-3">
          <p className="text-xs text-app-ink leading-relaxed">{stop.content}</p>

          <div className="p-3 rounded-component bg-app-bg border border-app-line flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-app-accent shrink-0 mt-0.5" />
            <div className="text-[11px] text-app-muted">
              <span className="font-semibold text-app-ink">Key Tip: </span>
              {stop.keyHighlight}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleFinish}
            className="text-xs text-app-muted hover:text-app-ink font-mono"
          >
            Skip Tour
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-component border border-app-line text-xs font-semibold text-app-ink hover:bg-app-hover flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-component bg-app-accent hover:opacity-90 text-white font-bold text-xs shadow-panel flex items-center gap-1.5 transition-all"
            >
              <span>{currentStep === tourStops.length ? 'Finish Tour' : 'Next Stop'}</span>
              {currentStep === tourStops.length ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
