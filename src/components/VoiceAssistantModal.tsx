import React, { useState, useEffect, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  X,
  Sparkles,
  Check,
  HelpCircle,
  Send,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { voiceAssistant, VoiceCommandMatch, AssistantContext } from '../utils/voiceAssistant';
import { useApp } from '../context/AppContext';
import { getTodayDateString } from '../utils/time';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { data, focusPreload, setActiveTab, language, t } = useApp();
  const [status, setStatus] = useState<{
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    audioLevel?: number;
    error?: string;
  }>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    audioLevel: 0,
  });

  const [lastCommand, setLastCommand] = useState<string>('');
  const [typedInput, setTypedInput] = useState<string>('');

  // Assemble dynamic study context
  const assistantContext: AssistantContext = useMemo(() => {
    let nextExamStr = '';
    if (data?.exams && data.exams.length > 0) {
      const sorted = [...data.exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const first = sorted[0];
      const days = Math.max(0, Math.ceil((new Date(first.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
      nextExamStr = `${first.subjectName} (${first.subjectCode}) in ${days} days`;
    }

    let nextSlotStr = '';
    const today = getTodayDateString();
    const records = data?.dailyRecords?.[today] || [];
    const pending = records.find((r) => r.status === 'PENDING');
    if (pending) {
      nextSlotStr = `${pending.label} at ${pending.startTime}`;
    }

    const currentSub = data?.subjects.find((s) => s.id === focusPreload?.subjectId) || data?.subjects[0];
    const currentTopic = focusPreload?.topicTitle || currentSub?.modules[0]?.topics[0]?.title || 'Syllabus Review';

    return {
      currentSubject: currentSub?.name,
      currentTopic,
      nextExam: nextExamStr,
      nextSlot: nextSlotStr,
      language,
    };
  }, [data, focusPreload, language]);

  useEffect(() => {
    voiceAssistant.setContext(assistantContext);
  }, [assistantContext]);

  useEffect(() => {
    if (isOpen) {
      voiceAssistant.startListening(
        (cmd: VoiceCommandMatch) => {
          handleAction(cmd);
        },
        (s) => setStatus(s)
      );
    } else {
      voiceAssistant.stopListening();
    }

    return () => {
      voiceAssistant.stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (cmd: VoiceCommandMatch) => {
    setLastCommand(cmd.response);
    if (cmd.action === 'NAV_DASHBOARD') setActiveTab('dashboard');
    if (cmd.action === 'NAV_PLANNER') setActiveTab('planner');
    if (cmd.action === 'NAV_TIMETABLE') setActiveTab('timetable');
    if (cmd.action === 'NAV_ANALYTICS') setActiveTab('history');
    if (cmd.action === 'NAV_SETTINGS') setActiveTab('settings');
    if (cmd.action === 'START_FOCUS') setActiveTab('focus');
  };

  const handleToggleMic = () => {
    if (status.isListening) {
      voiceAssistant.stopListening();
    } else {
      voiceAssistant.startListening(
        (cmd) => handleAction(cmd),
        (s) => setStatus(s)
      );
    }
  };

  const handleSendTyped = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!typedInput.trim()) return;
    const match = voiceAssistant.processQuery(typedInput.trim(), assistantContext);
    handleAction(match);
    setTypedInput('');
  };

  const sampleCommands = [
    { voice: '"Start focus session"', desc: 'Launches focus mode with current topic' },
    { voice: '"What is my next exam?"', desc: 'Announces nearest examination countdown' },
    { voice: '"Next on my schedule"', desc: 'Checks upcoming timetable study slot' },
    { voice: '"Explain current topic"', desc: 'Briefs core concepts and scoring keywords' },
    { voice: '"How much time left?"', desc: 'Checks remaining focus timer interval' },
    { voice: '"Open planner"', desc: 'Navigates to syllabus modules & topics' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-app-surface border border-app-line rounded-card w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between bg-app-bg/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-component bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">Offline AI Voice Assistant</h2>
              <p className="text-[11px] text-app-muted font-mono">Context-Aware &bull; Local Speech Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visualizer & Mic Button */}
        <div className="p-5 flex flex-col items-center justify-center border-b border-app-line bg-app-bg/30">
          <div className="relative mb-3">
            {status.isListening && (
              <div className="absolute -inset-3 rounded-full bg-app-accent/20 animate-ping" />
            )}
            <button
              onClick={handleToggleMic}
              className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-panel transition-all ${
                status.isListening
                  ? 'bg-app-accent text-white scale-105 shadow-panel'
                  : 'bg-app-surface border border-app-line text-app-muted hover:text-app-ink'
              }`}
            >
              {status.isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          {/* Waveform indicator */}
          <div className="flex items-center space-x-1.5 h-7 mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => {
              const baseHeight = status.isListening
                ? Math.max(4, Math.min(26, ((status.audioLevel || 15) / 100) * 22 + Math.sin(bar * 0.9 + Date.now() / 200) * 6 + 6))
                : 4;
              return (
                <div
                  key={bar}
                  className={`w-1.5 rounded-full transition-all duration-100 ${
                    status.isListening ? 'bg-app-accent' : 'bg-app-line h-1'
                  }`}
                  style={{
                    height: `${baseHeight}px`,
                  }}
                />
              );
            })}
          </div>

          <p className="text-xs font-mono font-medium text-app-ink">
            {status.isListening
              ? `Microphone Active & Listening... (Level: ${status.audioLevel || 0}%)`
              : 'Microphone Paused (Click to speak or type below)'}
          </p>

          {status.transcript && (
            <div className="mt-2.5 px-3 py-1 bg-app-surface border border-app-line rounded-component text-xs text-app-ink font-mono text-center max-w-sm truncate">
              "{status.transcript}"
            </div>
          )}

          {lastCommand && (
            <div className="mt-2 px-3 py-1.5 rounded-component bg-app-live/15 border border-app-live/30 text-xs text-app-live font-medium flex items-center gap-1.5 max-w-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span className="truncate">{lastCommand}</span>
            </div>
          )}

          {status.error && (
            <div className="mt-2 px-3 py-1.5 rounded-component bg-app-danger/10 border border-app-danger/30 text-[11px] text-app-danger font-mono flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{status.error}</span>
            </div>
          )}
        </div>

        {/* Text-based Query Input Fallback */}
        <form onSubmit={handleSendTyped} className="p-3 border-b border-app-line bg-app-surface flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder="Type a query or command (e.g. 'next exam', 'explain topic')..."
              className="w-full pl-3 pr-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent font-medium placeholder:text-app-muted"
            />
          </div>
          <button
            type="submit"
            disabled={!typedInput.trim()}
            className="px-3.5 py-2 bg-app-accent hover:opacity-90 disabled:opacity-40 text-white rounded-component text-xs font-bold transition-all shadow-panel flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>

        {/* Supported Commands Cheat-sheet */}
        <div className="p-4 bg-app-bg/50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-app-ink mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-app-accent" />
            <span>Supported Voice & Quick Commands (Click to test)</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {sampleCommands.map((c, i) => (
              <div
                key={i}
                onClick={() => {
                  const match = voiceAssistant.processQuery(c.voice.replace(/["']/g, ''), assistantContext);
                  handleAction(match);
                }}
                className="flex items-center justify-between p-2 rounded-component bg-app-surface border border-app-line text-xs font-mono cursor-pointer hover:border-app-accent/40 hover:bg-app-accent/5 transition-all"
              >
                <span className="text-app-accent font-semibold">{c.voice}</span>
                <span className="text-app-muted text-[11px]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-app-line bg-app-bg flex justify-between items-center text-[11px] text-app-muted font-mono">
          <span>Processed locally in Electron. Zero cloud recording.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink rounded-component transition-colors font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
