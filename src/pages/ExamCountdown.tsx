import React, { useState, useEffect } from 'react';
import {
  CalendarClock,
  Clock,
  Calendar,
  Play,
  Edit2,
  Check,
  X,
  Target,
  Sparkles,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateExamCountdown } from '../utils/time';
import { Exam } from '../types';

export const ExamCountdown: React.FC = () => {
  const { data, updateExams, startFocusSessionWithPreload } = useApp();
  const [, setTick] = useState<number>(0);

  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [isAddingExam, setIsAddingExam] = useState<boolean>(false);
  const [newExamCode, setNewExamCode] = useState<string>('');
  const [newExamName, setNewExamName] = useState<string>('');
  const [newExamDate, setNewExamDate] = useState<string>('');
  const [newExamIsLab, setNewExamIsLab] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  // Separate lab exams and theory exams
  const labExams = data.exams.filter(e => e.isLab);
  const theoryExams = [...data.exams.filter(e => !e.isLab)].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const nextTheoryExam = theoryExams.find(
    e => new Date(e.date).getTime() > Date.now()
  ) || theoryExams[0];

  const heroCountdown = nextTheoryExam ? calculateExamCountdown(nextTheoryExam.date) : null;

  const handleStartEdit = (exam: Exam) => {
    setEditingExamId(exam.id);
    const isoDate = exam.date.split('T')[0];
    setEditDate(isoDate);
  };

  const handleSaveEdit = async (examId: string) => {
    if (!editDate) return;
    const updated = data.exams.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          date: `${editDate}T09:30:00`,
        };
      }
      return e;
    });
    await updateExams(updated);
    setEditingExamId(null);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamDate) return;
    const newEx: Exam = {
      id: `exam-${Date.now()}`,
      subjectCode: newExamCode.trim() || newExamName.slice(0, 6).toUpperCase(),
      subjectName: newExamName.trim(),
      date: `${newExamDate}T09:30:00`,
      color: '#8b5cf6',
      isLab: newExamIsLab,
    };
    await updateExams([...data.exams, newEx]);
    setNewExamCode('');
    setNewExamName('');
    setNewExamDate('');
    setNewExamIsLab(false);
    setIsAddingExam(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-app-line pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>EXAMINATION TARGETS & TIMELINES</span>
          </div>
          <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">
            Exam Countdown Command
          </h2>
          <p className="text-xs text-app-muted">
            Live telemetry, days countdown, and syllabus preparation readiness for all theory and lab examinations.
          </p>
        </div>

        <button
          onClick={() => setIsAddingExam(true)}
          className="px-3.5 py-2 bg-app-accent hover:opacity-90 text-white rounded-component text-xs font-bold shadow-panel flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam Target</span>
        </button>
      </div>

      {/* Add Exam Modal */}
      {isAddingExam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form onSubmit={handleAddExam} className="bg-app-surface border border-app-line rounded-card p-5 max-w-md w-full space-y-4 shadow-panel">
            <div className="flex items-center justify-between border-b border-app-line pb-2">
              <h3 className="text-xs font-bold text-app-ink uppercase font-mono tracking-wider">Add Examination Target</h3>
              <button type="button" onClick={() => setIsAddingExam(false)} className="text-app-muted hover:text-app-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="text-xs font-mono text-app-muted block mb-1">Subject Code</label>
              <input
                type="text"
                value={newExamCode}
                onChange={(e) => setNewExamCode(e.target.value)}
                placeholder="e.g. PCCST501"
                className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink uppercase font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-app-muted block mb-1">Subject Name *</label>
              <input
                type="text"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                placeholder="e.g. Computer Networks"
                required
                className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-semibold"
              />
            </div>
            <div>
              <label className="text-xs font-mono text-app-muted block mb-1">Examination Date *</label>
              <input
                type="date"
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-app-bg border border-app-line rounded-component text-xs text-app-ink font-mono"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isLabCheck"
                checked={newExamIsLab}
                onChange={(e) => setNewExamIsLab(e.target.checked)}
                className="w-4 h-4 accent-app-accent"
              />
              <label htmlFor="isLabCheck" className="text-xs text-app-ink">
                This is a Practical / Lab / Viva Exam
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-app-line">
              <button
                type="button"
                onClick={() => setIsAddingExam(false)}
                className="px-3 py-1.5 text-xs text-app-muted hover:text-app-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-app-accent hover:opacity-90 text-white font-bold text-xs rounded-component shadow-panel"
              >
                Save Exam Target
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State when zero exams */}
      {data.exams.length === 0 && (
        <div className="card-kopy p-12 border-2 border-dashed border-app-line text-center space-y-4 max-w-xl mx-auto my-12 animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent mx-auto">
            <CalendarClock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-app-ink">No Examination Dates Configured</h3>
            <p className="text-xs text-app-muted mt-1 max-w-md mx-auto leading-relaxed">
              Add upcoming semester or competitive examination dates to activate live countdown telemetry and target readiness metrics.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => setIsAddingExam(true)}
              className="px-5 py-2.5 bg-app-accent hover:opacity-90 text-white font-bold text-xs rounded-component shadow-panel flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Exam Target</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero: Nearest Upcoming Theory Exam */}
      {nextTheoryExam && heroCountdown && (
        <div className="card-kopy p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono text-app-accent mb-2">
                <Target className="w-3.5 h-3.5 animate-pulse" />
                <span>PRIMARY THEORY TARGET</span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-app-ink tracking-tight flex items-center gap-3 font-sans">
                <span>{nextTheoryExam.subjectName}</span>
                <span
                  className="text-xs font-mono px-2.5 py-1 rounded-md"
                  style={{
                    backgroundColor: `${nextTheoryExam.color}20`,
                    color: nextTheoryExam.color,
                    border: `1px solid ${nextTheoryExam.color}40`,
                  }}
                >
                  {nextTheoryExam.subjectCode}
                </span>
              </h3>
              <p className="text-xs text-app-muted mt-1.5 flex items-center gap-2 font-mono">
                <Calendar className="w-4 h-4 text-app-accent" />
                {new Date(nextTheoryExam.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Countdown Display Blocks */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-app-bg border border-app-line rounded-component px-4 py-3 text-center min-w-[70px] shadow-sm">
                <div className="text-3xl font-extrabold text-app-accent font-mono">
                  {heroCountdown.days}
                </div>
                <div className="text-[10px] font-mono text-app-muted uppercase mt-0.5">Days</div>
              </div>

              <div className="text-xl font-mono text-app-muted">:</div>

              <div className="bg-app-bg border border-app-line rounded-component px-4 py-3 text-center min-w-[70px] shadow-sm">
                <div className="text-3xl font-extrabold text-app-accent font-mono">
                  {String(heroCountdown.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-mono text-app-muted uppercase mt-0.5">Hours</div>
              </div>

              <div className="text-xl font-mono text-app-muted">:</div>

              <div className="bg-app-bg border border-app-line rounded-component px-4 py-3 text-center min-w-[70px] shadow-sm">
                <div className="text-3xl font-extrabold text-app-accent font-mono">
                  {String(heroCountdown.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-mono text-app-muted uppercase mt-0.5">Mins</div>
              </div>

              <div className="text-xl font-mono text-app-muted">:</div>

              <div className="bg-app-bg border border-app-line rounded-component px-4 py-3 text-center min-w-[70px] shadow-sm">
                <div className="text-3xl font-extrabold text-app-accent font-mono">
                  {String(heroCountdown.seconds).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-mono text-app-muted uppercase mt-0.5">Secs</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tentative Lab Examinations Section */}
      {labExams.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-app-accent" />
              Tentative Practical / Lab Examinations (November 10 & 11)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labExams.map((exam) => {
              const cd = calculateExamCountdown(exam.date);
              const isEditing = editingExamId === exam.id;

              return (
                <div
                  key={exam.id}
                  className="card-kopy p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-app-accent/15 text-app-accent font-bold">
                        {exam.subjectCode}
                      </span>
                      <h5 className="text-sm font-bold text-app-ink mt-1 font-sans">
                        {exam.subjectName}
                      </h5>
                    </div>

                    <button
                      onClick={() => handleStartEdit(exam)}
                      className="p-1 rounded text-app-muted hover:text-app-ink hover:bg-app-hover"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="input-kopy px-2 py-1 text-xs font-mono"
                      />
                      <button
                        onClick={() => handleSaveEdit(exam.id)}
                        className="p-1 rounded bg-app-live/20 text-app-live"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingExamId(null)}
                        className="p-1 rounded bg-app-bg text-app-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-app-muted font-mono flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-app-accent" />
                      <span>{new Date(exam.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  )}

                  <div className="p-2.5 bg-app-bg rounded-component border border-app-line flex items-center justify-between text-xs font-mono">
                    <span className="text-app-muted">Countdown:</span>
                    <span className="text-app-accent font-bold">
                      {cd.days}d {cd.hours}h {cd.minutes}m {cd.seconds}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid of All Theory Exams */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider">
          Semester Theory Examinations
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {theoryExams.map((exam) => {
            const cd = calculateExamCountdown(exam.date);
            const isEditing = editingExamId === exam.id;

            const matchedSubj = data.subjects.find(
              s => s.code.toLowerCase() === exam.subjectCode.toLowerCase() ||
                   s.name.toLowerCase().includes(exam.subjectCode.toLowerCase())
            );

            let sTot = 0;
            let sDone = 0;
            if (matchedSubj) {
              matchedSubj.modules.forEach(m => {
                sTot += m.topics.length;
                sDone += m.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
              });
            }
            const prepPct = sTot > 0 ? Math.round((sDone / sTot) * 100) : 0;

            return (
              <div
                key={exam.id}
                className="card-kopy p-5 flex flex-col justify-between hover:border-app-line2 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded text-xs font-mono font-bold"
                      style={{
                        backgroundColor: `${exam.color}20`,
                        color: exam.color,
                        border: `1px solid ${exam.color}40`,
                      }}
                    >
                      {exam.subjectCode}
                    </span>

                    <button
                      onClick={() => handleStartEdit(exam)}
                      className="p-1 rounded text-app-muted hover:text-app-ink hover:bg-app-hover transition-colors"
                      title="Edit Exam Date"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-bold text-app-ink mt-2.5 font-sans">
                    {exam.subjectName}
                  </h4>

                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="input-kopy px-2 py-1 text-xs font-mono"
                      />
                      <button
                        onClick={() => handleSaveEdit(exam.id)}
                        className="p-1 rounded bg-app-live/20 text-app-live"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingExamId(null)}
                        className="p-1 rounded bg-app-bg text-app-muted"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-app-muted font-mono flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-app-accent" />
                      {new Date(exam.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>

                {/* Countdown Ticker Box */}
                <div className="bg-app-bg rounded-component p-3 border border-app-line">
                  <div className="text-[10px] font-mono text-app-muted mb-1 flex items-center justify-between">
                    <span>TIME REMAINING</span>
                    <Clock className="w-3 h-3 text-app-accent" />
                  </div>
                  {cd.isPast ? (
                    <div className="text-sm font-bold text-app-danger font-mono">
                      EXAM CONCLUDED
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-app-ink font-mono tracking-wide">
                      {cd.days}d {String(cd.hours).padStart(2, '0')}h {String(cd.minutes).padStart(2, '0')}m {String(cd.seconds).padStart(2, '0')}s
                    </div>
                  )}
                </div>

                {/* Syllabus Readiness & Quick Start */}
                <div>
                  <div className="flex items-center justify-between text-xs text-app-muted mb-1.5 font-mono">
                    <span>Syllabus Covered</span>
                    <span className="text-app-accent font-bold">{prepPct}%</span>
                  </div>
                  <div className="w-full bg-app-bg rounded-full h-1.5 overflow-hidden border border-app-line">
                    <div
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${prepPct}%`,
                        backgroundColor: exam.color,
                      }}
                    ></div>
                  </div>

                  <button
                    onClick={() => {
                      startFocusSessionWithPreload({
                        subjectId: matchedSubj?.id,
                        topicTitle: `${exam.subjectCode} Revision Sprint`,
                      });
                    }}
                    className="mt-3.5 w-full flex items-center justify-center space-x-1.5 py-2 rounded-component bg-app-bg hover:bg-app-hover text-app-ink text-xs font-semibold border border-app-line transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Preparation Sprint</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
