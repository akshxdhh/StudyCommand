import React, { useState } from 'react';
import {
  Info,
  X,
  Github,
  Coffee,
  ShieldCheck,
  Code2,
  Cpu,
  FileCode,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [showLicense, setShowLicense] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleOpenUrl = (url: string) => {
    if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const mitLicenseText = `MIT License

Copyright (c) 2026 STUDY COMMAND Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-app-surface border border-app-line rounded-modal w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between bg-app-bg/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">About STUDY COMMAND</h2>
              <p className="text-[11px] text-app-muted font-mono">Release v3.0.0 (Production Desktop Edition)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Hero Identity */}
          <div className="text-center space-y-1.5 pb-4 border-b border-app-line">
            <h1 className="text-xl font-bold tracking-tight text-app-ink font-sans">
              STUDY <span className="text-app-accent">COMMAND</span>
            </h1>
            <p className="text-xs text-app-muted max-w-md mx-auto">
              Personal Exam Preparation and Study Accountability Command Center. Engineered for deep focus, structured university syllabus mastery, and absolute reliability.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-accent/15 border border-app-accent/30 text-app-accent font-mono">
                v3.0.0
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-live/15 border border-app-live/30 text-app-live font-mono">
                100% Offline Capable
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-app-bg border border-app-line text-app-muted font-mono">
                MIT Licensed
              </span>
            </div>
          </div>

          {/* Privacy & Architecture Guarantee */}
          <div className="p-3.5 bg-app-bg rounded-component border border-app-line space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-app-live font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Offline-First & Local Privacy Pledge</span>
            </div>
            <p className="text-[11px] text-app-muted leading-relaxed">
              Your syllabus documents, notes, webcam engagement calculations, voice assistant processing, and study logs never leave your personal computer. All data resides safely in your encrypted local application storage.
            </p>
          </div>

          {/* Technology Specifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-app-ink uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-app-accent" />
              <span>Engine Architecture</span>
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                <span className="text-app-muted block text-[10px]">Framework</span>
                <span className="text-app-ink font-semibold">Electron 33 + React 18</span>
              </div>
              <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                <span className="text-app-muted block text-[10px]">Bundler & Styling</span>
                <span className="text-app-ink font-semibold">Vite 6 + Tailwind CSS</span>
              </div>
              <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                <span className="text-app-muted block text-[10px]">Speech & Audio Engine</span>
                <span className="text-app-ink font-semibold">Web Speech & Web Audio APIs</span>
              </div>
              <div className="p-2.5 bg-app-bg rounded-component border border-app-line">
                <span className="text-app-muted block text-[10px]">PDF Intelligence</span>
                <span className="text-app-ink font-semibold">pdf-parse Local Extractor</span>
              </div>
            </div>
          </div>

          {/* Community & Links */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-app-ink uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-app-accent" />
              <span>Open Source & Community</span>
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleOpenUrl('https://github.com/akshxdhh/StudyCommand.git')}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-app-bg hover:bg-app-hover border border-app-line rounded-component text-xs font-semibold text-app-ink transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-app-muted" />
              </button>

              <button
                onClick={() => handleOpenUrl('https://www.buymeacoffee.com')}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 bg-app-accent/10 hover:bg-app-accent/20 border border-app-accent/30 rounded-component text-xs font-semibold text-app-accent transition-colors"
              >
                <Coffee className="w-4 h-4 text-app-accent" />
                <span>Buy Me a Coffee</span>
                <ExternalLink className="w-3 h-3 text-app-accent" />
              </button>
            </div>
          </div>

          {/* License Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowLicense(!showLicense)}
              className="text-xs text-app-accent hover:underline font-mono flex items-center gap-1"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{showLicense ? 'Hide MIT License' : 'View Full MIT License'}</span>
            </button>

            {showLicense && (
              <pre className="mt-2 p-3 bg-app-bg border border-app-line rounded-component text-[10px] text-app-muted font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {mitLicenseText}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-app-line bg-app-bg flex justify-between items-center text-xs font-mono text-app-muted">
          <span>Crafted for high performance students</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-app-surface hover:bg-app-hover border border-app-line text-app-ink rounded-component transition-colors font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
