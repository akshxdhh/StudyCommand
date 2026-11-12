import React, { useState } from 'react';
import {
  Info,
  Github,
  Coffee,
  ShieldCheck,
  Cpu,
  FileCode,
  ExternalLink,
  Heart,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const [showLicense, setShowLicense] = useState<boolean>(false);
  const { t } = useApp();

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
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="border-b border-app-line pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
            <Info className="w-3.5 h-3.5" />
            <span>APPLICATION SPECIFICATION & LICENSING</span>
          </div>
          <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">
            About STUDY COMMAND v3.0.0
          </h2>
          <p className="text-xs text-app-muted">
            Personal Exam Preparation and Accountability Desktop Command Center.
          </p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Hero Card */}
        <div className="card-kopy p-6 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-app-accent/15 border border-app-accent/30 mx-auto flex items-center justify-center text-app-accent shadow-panel">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-app-ink font-sans tracking-tight">
            STUDY <span className="text-app-accent">COMMAND</span>
          </h1>
          <p className="text-xs text-app-muted max-w-lg mx-auto leading-relaxed">
            Engineered as an autonomous, offline-first personal academic accountability system. Integrates university course syllabi, local AI prompt generation, Web Speech voice assistant, and focused study routines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 font-mono text-[10px]">
            <span className="px-2.5 py-1 rounded-full bg-app-accent/15 border border-app-accent/30 text-app-accent font-bold">
              VERSION 3.0.0
            </span>
            <span className="px-2.5 py-1 rounded-full bg-app-live/15 border border-app-live/30 text-app-live font-bold">
              100% OFFLINE LOCAL FIRST
            </span>
            <span className="px-2.5 py-1 rounded-full bg-app-bg border border-app-line text-app-muted">
              MIT LICENSED
            </span>
          </div>
        </div>

        {/* Offline Privacy Guarantee */}
        <div className="card-kopy p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-app-live font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Offline-First Privacy Guarantee</span>
          </div>
          <p className="text-xs text-app-muted leading-relaxed">
            Your university syllabi, examination dates, webcam engagement analysis, speech recognition commands, and study logs never leave your personal computer. Everything is persisted locally in your application directory without telemetry or cloud tracking.
          </p>
        </div>

        {/* Engine Architecture */}
        <div className="card-kopy p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-app-ink font-mono uppercase">
            <Cpu className="w-4 h-4 text-app-accent" />
            <span>Core Technical Architecture</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-3 bg-app-bg rounded-component border border-app-line">
              <span className="text-app-muted block text-[10px]">Framework</span>
              <span className="text-app-ink font-semibold">Electron 33 + React 18</span>
            </div>
            <div className="p-3 bg-app-bg rounded-component border border-app-line">
              <span className="text-app-muted block text-[10px]">Bundler & Styling</span>
              <span className="text-app-ink font-semibold">Vite 6 + Tailwind 3</span>
            </div>
            <div className="p-3 bg-app-bg rounded-component border border-app-line">
              <span className="text-app-muted block text-[10px]">Speech & Audio</span>
              <span className="text-app-ink font-semibold">Web Speech & Web Audio</span>
            </div>
            <div className="p-3 bg-app-bg rounded-component border border-app-line">
              <span className="text-app-muted block text-[10px]">PDF Intelligence</span>
              <span className="text-app-ink font-semibold">pdf-parse Local Extractor</span>
            </div>
          </div>
        </div>

        {/* Official Links */}
        <div className="card-kopy p-5 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-app-ink font-mono uppercase">
            <Heart className="w-4 h-4 text-app-accent" />
            <span>Open Source Project & Support</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => handleOpenUrl('https://github.com/akshxdhh/StudyCommand.git')}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-app-bg hover:bg-app-hover border border-app-line rounded-component text-xs font-semibold text-app-ink transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Official GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-app-muted" />
            </button>

            <button
              onClick={() => handleOpenUrl('https://www.buymeacoffee.com')}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-app-accent/10 hover:bg-app-accent/20 border border-app-accent/30 rounded-component text-xs font-semibold text-app-accent transition-colors"
            >
              <Coffee className="w-4 h-4" />
              <span>Buy Me a Coffee / Sponsor</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* MIT License Section */}
        <div className="card-kopy p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-app-ink font-mono uppercase flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-app-accent" />
              <span>MIT License Documentation</span>
            </span>
            <button
              onClick={() => setShowLicense(!showLicense)}
              className="text-xs text-app-accent hover:underline font-mono"
            >
              {showLicense ? 'Collapse License' : 'Expand Full License'}
            </button>
          </div>

          {showLicense && (
            <pre className="p-4 bg-app-bg border border-app-line rounded-component text-[11px] text-app-muted font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {mitLicenseText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
