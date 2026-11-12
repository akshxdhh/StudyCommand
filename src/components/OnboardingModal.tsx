import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Calendar,
  Clock,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage } from '../types';
import { BUILT_IN_PRESETS } from '../utils/presets';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { completeOnboarding, setLanguage, language, updateAppearance, data, t } = useApp();
  const [step, setStep] = useState<number>(1);

  // Form states
  const [name, setName] = useState<string>('Commander');
  const [avatar, setAvatar] = useState<string>('⚡');
  const [majorOrCourse, setMajorOrCourse] = useState<string>('B.Tech Computer Science');
  const [targetExamDate, setTargetExamDate] = useState<string>('2026-11-23');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-pomodoro');
  const [selectedThemeMode, setSelectedThemeMode] = useState<'dark' | 'light'>('dark');
  const [selectedPalette, setSelectedPalette] = useState<'violet' | 'cyan' | 'emerald'>('violet');

  if (!isOpen) return null;

  const handleFinish = async () => {
    await updateAppearance({
      themeMode: selectedThemeMode,
      accentPalette: selectedPalette,
    });
    await completeOnboarding(
      {
        name,
        avatar,
        majorOrCourse,
        targetExamDate,
        language,
      },
      selectedPresetId
    );
  };

  const avatars = ['⚡', '🚀', '🎯', '🔥', '🧠', '💻', '📚', '⭐'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-app-surface border border-app-line rounded-modal w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="p-5 border-b border-app-line bg-app-bg/50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-component bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">STUDY COMMAND V3 Onboarding</h2>
              <p className="text-[11px] text-app-muted font-mono">Step {step} of 3</p>
            </div>
          </div>

          {/* Language selector in onboarding */}
          <div className="flex items-center space-x-1 bg-app-surface p-1 rounded-component border border-app-line text-xs font-mono">
            {(['en', 'es', 'ml', 'hi'] as SupportedLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                  language === l
                    ? 'bg-app-accent text-white'
                    : 'text-app-muted hover:text-app-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Welcome, Scholar.</h3>
                <p className="text-xs text-app-muted mt-0.5">
                  Let's personalize your exam preparation command center.
                </p>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1.5">Choose Call Sign Avatar</label>
                <div className="flex items-center gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`w-9 h-9 rounded-component text-lg flex items-center justify-center transition-all ${
                        avatar === a
                          ? 'bg-app-accent/20 border-2 border-app-accent scale-105'
                          : 'bg-app-bg border border-app-line hover:border-app-accent/40'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                  placeholder="e.g. Alex"
                />
              </div>

              {/* Degree / Course Input */}
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Course / Degree / Major</label>
                <input
                  type="text"
                  value={majorOrCourse}
                  onChange={(e) => setMajorOrCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                  placeholder="e.g. B.Tech Computer Science (S5)"
                />
              </div>

              {/* Target Exam Date */}
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Next Major Exam Date</label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={(e) => setTargetExamDate(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-mono focus:outline-none focus:border-app-accent"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Choose Your Study Rhythm</h3>
                <p className="text-xs text-app-muted mt-0.5">
                  Select a study and break duration preset. You can change this at any time in Focus Mode.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {BUILT_IN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3.5 rounded-component text-left border transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-app-accent/15 border-app-accent shadow-panel'
                        : 'bg-app-bg border-app-line hover:border-app-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-app-ink">{preset.name}</span>
                      {selectedPresetId === preset.id && (
                        <CheckCircle2 className="w-4 h-4 text-app-accent" />
                      )}
                    </div>
                    <div className="text-[11px] text-app-muted font-mono mt-1">
                      {preset.focusMinutes}m Focus + {preset.breakMinutes}m Rest
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Visual Experience</h3>
                <p className="text-xs text-app-muted mt-0.5">
                  Choose your preferred theme mode and accent palette.
                </p>
              </div>

              {/* Mode */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelectedThemeMode('dark')}
                  className={`p-4 rounded-component border text-center transition-all ${
                    selectedThemeMode === 'dark'
                      ? 'bg-neutral-900 border-app-accent text-white shadow-panel'
                      : 'bg-neutral-900/50 border-app-line text-neutral-400'
                  }`}
                >
                  <div className="text-xs font-bold">Futuristic Dark</div>
                  <div className="text-[10px] text-neutral-500 mt-1 font-mono">OLED Charcoal & Glow</div>
                </button>

                <button
                  onClick={() => setSelectedThemeMode('light')}
                  className={`p-4 rounded-component border text-center transition-all ${
                    selectedThemeMode === 'light'
                      ? 'bg-slate-100 border-app-accent text-slate-900 shadow-panel'
                      : 'bg-slate-100/50 border-app-line text-slate-500'
                  }`}
                >
                  <div className="text-xs font-bold">Crisp Clean Light</div>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">High-Contrast Paper</div>
                </button>
              </div>

              {/* Palette */}
              <div>
                <label className="text-xs font-mono text-app-muted block mb-2">Accent Color Palette</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedPalette('violet')}
                    className={`p-2.5 rounded-component border flex items-center justify-center gap-2 text-xs font-semibold ${
                      selectedPalette === 'violet' ? 'border-purple-500 bg-purple-500/15 text-purple-400' : 'border-app-line text-app-muted'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Electric Violet</span>
                  </button>

                  <button
                    onClick={() => setSelectedPalette('cyan')}
                    className={`p-2.5 rounded-component border flex items-center justify-center gap-2 text-xs font-semibold ${
                      selectedPalette === 'cyan' ? 'border-cyan-500 bg-cyan-500/15 text-cyan-400' : 'border-app-line text-app-muted'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span>Cyan Blue</span>
                  </button>

                  <button
                    onClick={() => setSelectedPalette('emerald')}
                    className={`p-2.5 rounded-component border flex items-center justify-center gap-2 text-xs font-semibold ${
                      selectedPalette === 'emerald' ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400' : 'border-app-line text-app-muted'
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span>Emerald Green</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-app-line bg-app-bg flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-component border border-app-line text-xs font-medium text-app-ink hover:bg-app-hover flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-app-accent hover:bg-app-accent/90 text-white font-semibold rounded-component text-xs shadow-panel flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 bg-app-accent hover:bg-app-accent/90 text-white font-bold rounded-component text-xs shadow-panel flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Command Center</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
