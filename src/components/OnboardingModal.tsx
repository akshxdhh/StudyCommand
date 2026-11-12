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
  GraduationCap,
  Globe,
  BookOpen,
  FileText,
  Mic,
  Camera,
  Play,
  Check,
  X,
  Volume2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupportedLanguage, AcademicInfo, TimetableSlot, Exam } from '../types';
import { BUILT_IN_PRESETS } from '../utils/presets';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const {
    completeOnboarding,
    setLanguage,
    language,
    updateAppearance,
    updateTimetable,
    updateExams,
    importExtractedPayload,
    t,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form states:
  // Step 1: Identity
  const [name, setName] = useState<string>('Scholar');
  const [avatar, setAvatar] = useState<string>('⚡');

  // Step 2: Language (controlled via setLanguage)

  // Step 3: Education Level
  const [eduLevel, setEduLevel] = useState<string>('undergraduate');

  // Step 4: Academic Details
  const [institution, setInstitution] = useState<string>('');
  const [course, setCourse] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [semester, setSemester] = useState<string>('Semester 5');
  const [examSystem, setExamSystem] = useState<string>('Semester System');

  // Step 5: Study Rhythm
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-pomodoro');
  const [customFocusMins, setCustomFocusMins] = useState<number>(30);
  const [customBreakMins, setCustomBreakMins] = useState<number>(5);

  // Step 6: Timetable Choice
  const [timetableChoice, setTimetableChoice] = useState<'template' | 'empty'>('template');

  // Step 7: Syllabus PDF Choice
  const [importedPdfName, setImportedPdfName] = useState<string | null>(null);
  const [pdfParsing, setPdfParsing] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Step 8: Exam Dates
  const [examSubject, setExamSubject] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');

  // Step 9: Voice & Camera permissions
  const [enableVoice, setEnableVoice] = useState<boolean>(true);
  const [enableCamera, setEnableCamera] = useState<boolean>(false);
  const [micTested, setMicTested] = useState<boolean>(false);

  // Step 10: Theme & Launch choice
  const [selectedThemeMode, setSelectedThemeMode] = useState<'dark' | 'light'>('dark');
  const [selectedPalette, setSelectedPalette] = useState<'violet' | 'cyan' | 'emerald'>('violet');

  if (!isOpen) return null;

  const avatars = ['⚡', '🚀', '🎯', '🔥', '🧠', '💻', '📚', '⭐', '🔬', '💡'];

  const handleSelectPdf = async () => {
    if (!window.electronAPI) return;
    setPdfParsing(true);
    setPdfError(null);
    try {
      const selected = await window.electronAPI.selectPdfFile();
      if (!selected) {
        setPdfParsing(false);
        return;
      }
      const parsed = await window.electronAPI.parsePdfFile(selected);
      if (parsed.success && parsed.text) {
        const { parsePdfText } = await import('../utils/pdfExtractor');
        const payload = parsePdfText(parsed.text, parsed.filename || 'Syllabus.pdf');
        await importExtractedPayload(payload);
        setImportedPdfName(parsed.filename || 'Syllabus.pdf');
      } else {
        setPdfError(parsed.error || 'Failed to read PDF text. Make sure it is not image-only.');
      }
    } catch (err: any) {
      setPdfError(err.message || 'Error parsing PDF');
    } finally {
      setPdfParsing(false);
    }
  };

  const handleTestMic = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.start();
        rec.onstart = () => {
          setMicTested(true);
          rec.stop();
        };
        rec.onerror = () => {
          setMicTested(true);
        };
      } else {
        setMicTested(true);
      }
    } catch {
      setMicTested(true);
    }
  };

  const handleFinish = async (launchTutorial: boolean) => {
    // 1. Configure Appearance
    await updateAppearance({
      themeMode: selectedThemeMode,
      accentPalette: selectedPalette,
    });

    // 2. Configure Timetable if template chosen
    if (timetableChoice === 'template') {
      const defaultSlots: TimetableSlot[] = [
        { id: 'slot-1', sessionNumber: 1, label: 'Morning Sprint', startTime: '09:00', endTime: '10:30', type: 'STUDY' },
        { id: 'slot-2', sessionNumber: 2, label: 'Midday Focus', startTime: '11:00', endTime: '12:30', type: 'STUDY' },
        { id: 'slot-3', label: 'Lunch Break', startTime: '13:00', endTime: '14:00', type: 'LUNCH' },
        { id: 'slot-4', sessionNumber: 3, label: 'Afternoon Deep Work', startTime: '14:30', endTime: '16:00', type: 'STUDY' },
        { id: 'slot-5', sessionNumber: 4, label: 'Evening Review', startTime: '17:00', endTime: '18:30', type: 'STUDY' },
      ];
      await updateTimetable(defaultSlots);
    } else {
      await updateTimetable([]);
    }

    // 3. Configure Exam if entered
    if (examSubject && examDate) {
      const newExam: Exam = {
        id: `exam-${Date.now()}`,
        subjectCode: examSubject.slice(0, 6).toUpperCase(),
        subjectName: examSubject,
        date: new Date(examDate).toISOString(),
        color: '#8b5cf6',
      };
      await updateExams([newExam]);
    }

    // 4. Save Academic Info & Profile
    const academic: AcademicInfo = {
      level: eduLevel,
      institution: institution || undefined,
      course: course || undefined,
      department: department || undefined,
      semester: semester || undefined,
      examSystem: examSystem || undefined,
    };

    await completeOnboarding(
      {
        name: name.trim() || 'Scholar',
        avatar,
        academicInfo: academic,
        majorOrCourse: course ? `${course} (${semester})` : undefined,
        targetExamDate: examDate || undefined,
        language,
        focusSettings: {
          fullscreenOnStart: false,
          distractionShield: true,
          engagementMonitor: enableCamera,
          soundscape: 'none',
          voiceAssistantEnabled: enableVoice,
        },
      },
      selectedPresetId,
      launchTutorial
    );

    onClose();
  };

  const handleSkipAll = async () => {
    await handleFinish(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-app-surface border border-app-line rounded-card w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-app-line bg-app-bg/50 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-component bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 truncate">
              <h2 className="text-sm font-bold text-app-ink truncate">STUDY COMMAND V3 Setup</h2>
              <p className="text-[11px] text-app-muted font-mono">Step {step} of 10</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language switch */}
            <div className="flex items-center bg-app-surface p-0.5 rounded-component border border-app-line text-xs font-mono">
              {(['en', 'es', 'ml', 'hi'] as SupportedLanguage[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                    language === l ? 'bg-app-accent text-white' : 'text-app-muted hover:text-app-ink'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Skip Setup button */}
            <button
              onClick={handleSkipAll}
              className="text-xs text-app-muted hover:text-app-ink px-2.5 py-1 rounded-component hover:bg-app-hover border border-transparent hover:border-app-line transition-all"
            >
              Skip Setup
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-app-line h-1">
          <div
            className="bg-app-accent h-1 transition-all duration-300"
            style={{ width: `${(step / 10) * 100}%` }}
          />
        </div>

        {/* Step Content (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-app-ink">
          {/* STEP 1: WELCOME & IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Welcome to STUDY COMMAND</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Your offline, high-yield exam command center. Keep complete accountability over syllabus topics, exam countdowns, and distraction-free study sprints.
                </p>
              </div>

              <div>
                <label className="text-xs font-mono text-app-muted block mb-1.5">Choose Your Scholar Avatar</label>
                <div className="flex flex-wrap items-center gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`w-9 h-9 rounded-component text-lg flex items-center justify-center transition-all ${
                        avatar === a
                          ? 'bg-app-accent/20 border-2 border-app-accent scale-105 shadow-panel'
                          : 'bg-app-bg border border-app-line hover:border-app-accent/40'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">Your Name / Handle</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold focus:outline-none focus:border-app-accent"
                  placeholder="e.g. Commander Alex"
                />
              </div>
            </div>
          )}

          {/* STEP 2: PREFERRED LANGUAGE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Preferred Language</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Select your primary language for navigation, alerts, and AI prompts. You can switch this anytime.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { code: 'en', label: 'English', native: 'English', desc: 'Global technical & exam standard' },
                  { code: 'es', label: 'Spanish', native: 'Español', desc: 'Completo con interfaz traducida' },
                  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', desc: 'കേരള സർവ്വകലാശാലാ സിലബസ്' },
                  { code: 'hi', label: 'Hindi', native: 'हिन्दी', desc: 'भारतीय राष्ट्रीय परीक्षा मानक' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setLanguage(item.code as SupportedLanguage)}
                    className={`p-4 rounded-component border text-left transition-all ${
                      language === item.code
                        ? 'bg-app-accent/15 border-app-accent shadow-panel'
                        : 'bg-app-bg border-app-line hover:border-app-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-app-ink">{item.native}</span>
                      {language === item.code && <CheckCircle2 className="w-4 h-4 text-app-accent" />}
                    </div>
                    <div className="text-[11px] text-app-muted mt-1">{item.label} &bull; {item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: EDUCATION LEVEL */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Education Level</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Help STUDY COMMAND tailor your study planning algorithms and time allocation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'high_school', label: 'High School / Senior Secondary', desc: '10th, 11th, 12th grade / CBSE / State' },
                  { id: 'undergraduate', label: 'Undergraduate Degree', desc: 'B.Tech, B.E., B.Sc., B.Com, MBBS, etc.' },
                  { id: 'postgraduate', label: 'Postgraduate Degree', desc: 'M.Tech, M.S., M.Sc., MBA, PhD' },
                  { id: 'competitive_exam', label: 'Competitive Examinations', desc: 'GATE, UPSC, CAT, JEE, NEET, GRE' },
                  { id: 'other', label: 'Professional / Self-Directed', desc: 'Certification, Coding Bootcamp, Independent Study' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => setEduLevel(lvl.id)}
                    className={`p-3.5 rounded-component border text-left transition-all ${
                      eduLevel === lvl.id
                        ? 'bg-app-accent/15 border-app-accent shadow-panel'
                        : 'bg-app-bg border-app-line hover:border-app-accent/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-app-ink">{lvl.label}</span>
                      {eduLevel === lvl.id && <CheckCircle2 className="w-4 h-4 text-app-accent" />}
                    </div>
                    <div className="text-[11px] text-app-muted mt-1">{lvl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: ACADEMIC CONTEXT */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Academic Context</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Specify your academic institution, course, and examination system.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Institution / University</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                    placeholder="e.g. APJ Abdul Kalam Technological University"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Course / Degree Program</label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                    placeholder="e.g. B.Tech Computer Science & Engineering"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Department / Branch</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                    placeholder="e.g. CSE / Information Technology"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Semester / Year</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                    placeholder="e.g. Semester 5 / Year 3"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono text-app-muted block mb-1">Examination System</label>
                  <select
                    value={examSystem}
                    onChange={(e) => setExamSystem(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                  >
                    <option value="Semester System">Semester System (End-Sem Exams + Internals)</option>
                    <option value="Trimester / Term System">Trimester / Term System</option>
                    <option value="Annual Board Exam">Annual Board Exam System</option>
                    <option value="Competitive Exam Cycle">Competitive Exam Window</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: STUDY & BREAK RHYTHM */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Preferred Study Rhythm</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Choose a proven cognitive sprint interval. You can fine-tune this in Focus Mode at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      {selectedPresetId === preset.id && <CheckCircle2 className="w-4 h-4 text-app-accent" />}
                    </div>
                    <div className="text-[11px] text-app-muted font-mono mt-1">
                      {preset.focusMinutes} min Focus + {preset.breakMinutes} min Recovery
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: DAILY TIMETABLE CONFIGURATION */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Daily Timetable</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Would you like to start with a structured 4-block daily schedule, or configure it later from scratch?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setTimetableChoice('template')}
                  className={`p-4 rounded-component border text-left transition-all ${
                    timetableChoice === 'template'
                      ? 'bg-app-accent/15 border-app-accent shadow-panel'
                      : 'bg-app-bg border-app-line hover:border-app-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-ink">Recommended 4-Block Routine</span>
                    {timetableChoice === 'template' && <CheckCircle2 className="w-4 h-4 text-app-accent" />}
                  </div>
                  <p className="text-[11px] text-app-muted mt-1 leading-relaxed">
                    Loads 4 daily study sprint blocks (09:00, 11:00, 14:30, 17:00) with automatic missed-session rescheduling.
                  </p>
                </button>

                <button
                  onClick={() => setTimetableChoice('empty')}
                  className={`p-4 rounded-component border text-left transition-all ${
                    timetableChoice === 'empty'
                      ? 'bg-app-accent/15 border-app-accent shadow-panel'
                      : 'bg-app-bg border-app-line hover:border-app-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-app-ink">Start with Empty Timetable</span>
                    {timetableChoice === 'empty' && <CheckCircle2 className="w-4 h-4 text-app-accent" />}
                  </div>
                  <p className="text-[11px] text-app-muted mt-1 leading-relaxed">
                    Starts with no predefined slots. You can add your custom college or study hours later.
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: SYLLABUS PDF IMPORT */}
          {step === 7 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Syllabus PDF Import</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Import your university syllabus PDF now to automatically extract subjects, modules, and topics into the Study Planner, or proceed with an empty planner.
                </p>
              </div>

              <div className="p-4 rounded-component bg-app-bg border border-app-line text-center space-y-3">
                <FileText className="w-8 h-8 text-app-accent mx-auto" />
                <div>
                  <p className="text-xs font-bold text-app-ink">
                    {importedPdfName ? `Imported: ${importedPdfName}` : 'Select a Syllabus PDF Document'}
                  </p>
                  <p className="text-[11px] text-app-muted mt-0.5">
                    Supports KTU, Mumbai, Delhi, VTU, Anna University, and standard university PDFs.
                  </p>
                </div>

                {pdfError && (
                  <p className="text-[11px] text-app-danger font-mono bg-app-danger/10 p-2 rounded">
                    {pdfError}
                  </p>
                )}

                <div className="flex justify-center gap-2">
                  <button
                    onClick={handleSelectPdf}
                    disabled={pdfParsing}
                    className="px-4 py-2 bg-app-accent text-white font-bold text-xs rounded-component hover:opacity-90 shadow-panel transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{pdfParsing ? 'Parsing PDF Text...' : importedPdfName ? 'Import Another PDF' : 'Select PDF from Computer'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: UPCOMING EXAMINATION DATE */}
          {step === 8 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Upcoming Examination Date</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Configure your primary upcoming exam date to activate real-time countdowns on the dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Subject / Examination Title</label>
                  <input
                    type="text"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink focus:outline-none focus:border-app-accent"
                    placeholder="e.g. Computer Networks (End-Sem)"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-mono focus:outline-none focus:border-app-accent"
                  />
                </div>
              </div>
              <p className="text-[11px] text-app-muted">
                Tip: You can add more exam dates at any time from the Exam Countdown page.
              </p>
            </div>
          )}

          {/* STEP 9: VOICE ASSISTANT & FOCUS SHIELD */}
          {step === 9 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Voice Assistant & Focus Engagement</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Configure smart features. Microphones enable offline voice queries. Webcams enable presence monitoring processed strictly on your machine with zero recording.
                </p>
              </div>

              <div className="space-y-3">
                {/* Voice Assistant Toggle */}
                <div className="p-3.5 rounded-component bg-app-bg border border-app-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-app-accent/20 flex items-center justify-center text-app-accent">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-ink">Voice Assistant & Speech Commands</div>
                      <div className="text-[11px] text-app-muted">Hands-free focus timer control & prompt narration</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableVoice}
                    onChange={(e) => setEnableVoice(e.target.checked)}
                    className="w-4 h-4 accent-app-accent"
                  />
                </div>

                {/* Camera Engagement Toggle */}
                <div className="p-3.5 rounded-component bg-app-bg border border-app-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-app-live/20 flex items-center justify-center text-app-live">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-app-ink">Camera Engagement Monitor (Optional)</div>
                      <div className="text-[11px] text-app-muted">Detects presence via local frame diffs. Zero frames recorded or stored.</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableCamera}
                    onChange={(e) => setEnableCamera(e.target.checked)}
                    className="w-4 h-4 accent-app-accent"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleTestMic}
                    className="px-3 py-1.5 border border-app-line rounded-component text-xs text-app-ink hover:bg-app-hover flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-app-accent" />
                    <span>{micTested ? 'Microphone Verified' : 'Test Microphone Access'}</span>
                    {micTested && <Check className="w-3 h-3 text-app-live" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: READY & TOUR CHOICE */}
          {step === 10 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-app-ink">Setup Complete!</h3>
                <p className="text-xs text-app-muted mt-1 leading-relaxed">
                  Your command center is configured and ready. Would you like a brief interactive tour of the key features, or dive straight in?
                </p>
              </div>

              {/* Theme choice */}
              <div className="p-3.5 rounded-component bg-app-bg border border-app-line space-y-3">
                <div className="text-xs font-bold text-app-ink">Theme Mode & Glow</div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedThemeMode('dark')}
                    className={`p-2.5 rounded-component text-xs font-bold border ${
                      selectedThemeMode === 'dark' ? 'border-app-accent bg-app-accent/20 text-app-ink' : 'border-app-line text-app-muted'
                    }`}
                  >
                    Futuristic Dark (OLED)
                  </button>
                  <button
                    onClick={() => setSelectedThemeMode('light')}
                    className={`p-2.5 rounded-component text-xs font-bold border ${
                      selectedThemeMode === 'light' ? 'border-app-accent bg-app-accent/20 text-app-ink' : 'border-app-line text-app-muted'
                    }`}
                  >
                    Crisp Light (Paper)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleFinish(true)}
                  className="p-4 rounded-component border-2 border-app-accent bg-app-accent/15 hover:bg-app-accent/25 text-left transition-all shadow-panel"
                >
                  <div className="flex items-center gap-2 text-app-accent font-bold text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>Start Interactive Tour</span>
                  </div>
                  <p className="text-[11px] text-app-muted mt-1">
                    Guided 9-stop walkthrough of Dashboard, Planner, PDF Import, and Focus Mode.
                  </p>
                </button>

                <button
                  onClick={() => handleFinish(false)}
                  className="p-4 rounded-component border border-app-line hover:border-app-accent/50 bg-app-bg hover:bg-app-hover text-left transition-all"
                >
                  <div className="flex items-center gap-2 text-app-ink font-bold text-xs">
                    <Play className="w-4 h-4 text-app-live" />
                    <span>Enter Dashboard Directly</span>
                  </div>
                  <p className="text-[11px] text-app-muted mt-1">
                    Skip tour and open your customized workspace right now.
                  </p>
                </button>
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
            <div />
          )}

          {step < 10 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-5 py-2 bg-app-accent hover:opacity-90 text-white font-semibold rounded-component text-xs shadow-panel flex items-center gap-1.5 transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
