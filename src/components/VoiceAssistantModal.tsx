import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Check, HelpCircle } from 'lucide-react';
import { voiceAssistant, VoiceCommandMatch } from '../utils/voiceAssistant';
import { useApp } from '../context/AppContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, t } = useApp();
  const [status, setStatus] = useState<{
    isListening: boolean;
    isSpeaking: boolean;
    transcript: string;
    error?: string;
  }>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
  });

  const [lastCommand, setLastCommand] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      voiceAssistant.startListening(
        (cmd: VoiceCommandMatch) => {
          setLastCommand(cmd.response);
          // Handle navigation actions
          if (cmd.action === 'NAV_DASHBOARD') setActiveTab('dashboard');
          if (cmd.action === 'NAV_PLANNER') setActiveTab('planner');
          if (cmd.action === 'NAV_TIMETABLE') setActiveTab('countdown');
          if (cmd.action === 'NAV_ANALYTICS') setActiveTab('history');
          if (cmd.action === 'NAV_SETTINGS') setActiveTab('settings');
          if (cmd.action === 'START_FOCUS') setActiveTab('focus');
        },
        (s) => setStatus(s)
      );
    } else {
      voiceAssistant.stopListening();
    }

    return () => {
      voiceAssistant.stopListening();
    };
  }, [isOpen, setActiveTab]);

  if (!isOpen) return null;

  const handleToggleMic = () => {
    if (status.isListening) {
      voiceAssistant.stopListening();
    } else {
      voiceAssistant.startListening(
        (cmd) => setLastCommand(cmd.response),
        (s) => setStatus(s)
      );
    }
  };

  const sampleCommands = [
    { voice: '"Start focus session"', desc: 'Launches active focus mode' },
    { voice: '"Pause timer" / "Resume"', desc: 'Controls study timer' },
    { voice: '"How much time left?"', desc: 'Checks remaining session time' },
    { voice: '"Read prompt"', desc: 'Reads generated study prompt aloud' },
    { voice: '"Open timetable"', desc: 'Navigates to exam & routine schedule' },
    { voice: '"Open planner"', desc: 'Views KTU syllabus modules & topics' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-app-surface border border-app-line rounded-modal w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">Offline AI Voice Assistant</h2>
              <p className="text-[11px] text-app-muted font-mono">100% Local Web Speech API</p>
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
        <div className="p-6 flex flex-col items-center justify-center border-b border-app-line bg-app-bg/50">
          <div className="relative mb-4">
            {status.isListening && (
              <div className="absolute -inset-3 rounded-full bg-app-accent/20 animate-ping"></div>
            )}
            <button
              onClick={handleToggleMic}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                status.isListening
                  ? 'bg-app-accent text-white scale-105'
                  : 'bg-app-surface border border-app-line text-app-muted hover:text-app-ink'
              }`}
            >
              {status.isListening ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </button>
          </div>

          {/* Waveform indicator */}
          <div className="flex items-center space-x-1 h-6 mb-2">
            {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
              <div
                key={bar}
                className={`w-1 rounded-full transition-all duration-150 ${
                  status.isListening
                    ? 'bg-app-accent animate-pulse'
                    : 'bg-app-line h-1'
                }`}
                style={{
                  height: status.isListening ? `${Math.sin(bar * 0.9) * 12 + 14}px` : '4px',
                }}
              ></div>
            ))}
          </div>

          <p className="text-xs font-mono font-medium text-app-ink">
            {status.isListening ? 'Listening for voice commands...' : 'Microphone Paused (Click to speak)'}
          </p>

          {status.transcript && (
            <div className="mt-3 px-3 py-1.5 bg-app-surface border border-app-line rounded-component text-xs text-app-ink font-mono text-center max-w-xs truncate">
              "{status.transcript}"
            </div>
          )}

          {lastCommand && (
            <div className="mt-2 text-xs text-app-live font-mono flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{lastCommand}</span>
            </div>
          )}

          {status.error && (
            <div className="mt-2 text-xs text-app-danger font-mono">
              Error: {status.error} (Check microphone permissions)
            </div>
          )}
        </div>

        {/* Supported Commands Cheat-sheet */}
        <div className="p-4 bg-app-surface">
          <div className="flex items-center gap-1.5 text-xs font-bold text-app-ink mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-app-accent" />
            <span>Supported Voice Commands</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {sampleCommands.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-component bg-app-bg border border-app-line text-xs font-mono"
              >
                <span className="text-app-accent font-semibold">{c.voice}</span>
                <span className="text-app-muted text-[11px]">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-app-line bg-app-bg flex justify-between items-center text-[11px] text-app-muted font-mono">
          <span>Speech Recognition is processed purely locally in Chromium</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink rounded-component transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
