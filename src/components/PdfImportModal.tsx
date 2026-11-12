import React, { useState } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  BookOpen,
  Calendar,
  Layers,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  CheckSquare,
  Square,
  AlertCircle,
  Copy,
  Clock,
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  parsePdfText,
  checkDuplicates,
  ExtractedPdfPayload,
  ExtractedSubjectCandidate,
  ExtractedExamCandidate,
  ExtractedScheduleSlotCandidate
} from '../utils/pdfExtractor';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({ isOpen, onClose }) => {
  const { data, importExtractedPayload, updateSubjects, updateTimetable, t } = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ExtractedPdfPayload | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [activeTab, setActiveTab] = useState<'subjects' | 'exams' | 'schedule'>('subjects');
  const [editingTitleIdx, setEditingTitleIdx] = useState<number | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ subjectsAdded: number; examsAdded: number } | null>(null);

  if (!isOpen) return null;

  const handleSelectFile = async () => {
    setError(null);
    setSuccessInfo(null);
    if (!window.electronAPI) {
      setError('PDF analysis requires running inside the Study Command desktop app.');
      return;
    }

    try {
      setLoading(true);
      const res = await window.electronAPI.parsePdfFile();
      if (!res.success || !res.text) {
        if (res.error && res.error !== 'File selection canceled') {
          setError(res.error);
        }
        setLoading(false);
        return;
      }

      let extracted = parsePdfText(res.text, res.filename || 'Syllabus.pdf');
      if (data) {
        extracted = checkDuplicates(extracted, data.subjects, data.exams);
      }
      setPayload(extracted);

      // Default active tab based on detected type
      if (extracted.detectedType === 'TIMETABLE') setActiveTab('exams');
      else if (extracted.detectedType === 'SCHEDULE') setActiveTab('schedule');
      else setActiveTab('subjects');
    } catch (err: any) {
      console.error('Failed to parse PDF:', err);
      setError(err.message || 'Failed to parse PDF document.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (sidx: number) => {
    if (!payload) return;
    const updated = [...payload.subjects];
    updated[sidx] = { ...updated[sidx], selected: !updated[sidx].selected };
    setPayload({ ...payload, subjects: updated });
  };

  const toggleExam = (eidx: number) => {
    if (!payload) return;
    const updated = [...payload.exams];
    updated[eidx] = { ...updated[eidx], selected: !updated[eidx].selected };
    setPayload({ ...payload, exams: updated });
  };

  const toggleScheduleSlot = (slotIdx: number) => {
    if (!payload || !payload.scheduleSlots) return;
    const updated = [...payload.scheduleSlots];
    updated[slotIdx] = { ...updated[slotIdx], selected: !updated[slotIdx].selected };
    setPayload({ ...payload, scheduleSlots: updated });
  };

  const handleConfirmImport = async () => {
    if (!payload) return;
    try {
      setLoading(true);

      // If replace mode, clear existing subjects first
      if (importMode === 'replace') {
        await updateSubjects([]);
      }

      // Filter only selected items
      const selectedSubjects = payload.subjects.filter((s) => s.selected !== false);
      const selectedExams = payload.exams.filter((e) => e.selected !== false);

      const res = await importExtractedPayload({
        ...payload,
        subjects: selectedSubjects,
        exams: selectedExams,
      });

      // If schedule slots were extracted and selected, update timetable
      if (payload.scheduleSlots && payload.scheduleSlots.length > 0) {
        const selectedSlots = payload.scheduleSlots.filter((s) => s.selected !== false);
        if (selectedSlots.length > 0) {
          const newSlots = selectedSlots.map((s, idx) => ({
            id: `slot-pdf-${Date.now()}-${idx}`,
            label: s.label,
            startTime: s.startTime,
            endTime: s.endTime,
            type: s.type,
            sessionNumber: s.type === 'STUDY' ? idx + 1 : undefined,
          }));
          await updateTimetable(newSlots);
        }
      }

      setSuccessInfo(res);
      setPayload(null);
    } catch (err: any) {
      setError(err.message || 'Failed to import extracted syllabus data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-app-surface border border-app-line rounded-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between shrink-0 bg-app-bg/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-component bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">
                Intelligent PDF Syllabus & Timetable Importer
              </h2>
              <p className="text-[11px] text-app-muted font-mono">
                Selective import &bull; Duplicate detection &bull; Merge or Replace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-app-danger/10 border border-app-danger/30 rounded-component text-xs text-app-danger flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-4 bg-app-live/15 border border-app-live/30 rounded-component text-xs text-app-live flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Successfully integrated <strong>{successInfo.subjectsAdded} subjects</strong> and{' '}
                  <strong>{successInfo.examsAdded} exam timetable dates</strong> into STUDY COMMAND!
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 bg-app-live text-black font-bold rounded-component text-xs shadow-panel"
              >
                Done
              </button>
            </div>
          )}

          {/* Initial Upload Box */}
          {!payload && !successInfo && (
            <div className="border-2 border-dashed border-app-line rounded-card p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 bg-app-bg/40 hover:bg-app-bg transition-colors">
              <div className="w-14 h-14 rounded-full bg-app-accent/20 border border-app-accent/40 flex items-center justify-center text-app-accent shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-ink">Select University Syllabus or Timetable PDF</h3>
                <p className="text-xs text-app-muted mt-1 max-w-md leading-relaxed">
                  Upload syllabus PDFs, date sheets, or study schedules. The offline parser automatically discovers subjects, module breakdowns, discrete topics, and examination sessions.
                </p>
              </div>
              <button
                onClick={handleSelectFile}
                disabled={loading}
                className="px-5 py-2.5 bg-app-accent hover:opacity-90 text-white font-bold rounded-component text-xs shadow-panel flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{loading ? 'Analyzing Document Content...' : 'Choose PDF File'}</span>
              </button>
            </div>
          )}

          {/* Scanned Document Alert */}
          {payload && payload.isScanned && (
            <div className="p-4 rounded-card bg-app-warn/15 border border-app-warn/40 space-y-2">
              <div className="flex items-center gap-2 text-app-warn font-bold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Scanned / Image-Based PDF Detected</span>
              </div>
              <p className="text-xs text-app-ink leading-relaxed">
                This PDF document has little to no embedded digital text (&lt; 50 characters). It may be a scanned image or photograph. You can manually enter subjects and topics in the Study Planner, or provide a digital text-based syllabus PDF.
              </p>
            </div>
          )}

          {/* Extracted Payload Preview & Selective Controls */}
          {payload && !payload.isScanned && (
            <div className="space-y-4">
              {/* Document Overview Bar */}
              <div className="p-3 bg-app-bg border border-app-line rounded-component flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div>
                  <span className="text-app-muted">Document:</span>{' '}
                  <span className="text-app-ink font-bold">{payload.filename}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-app-accent/15 text-app-accent text-[10px] font-bold">
                    Detected: {payload.detectedType}
                  </span>
                  <span className="text-app-muted">
                    {payload.subjects.length} Subjects &bull; {payload.exams.length} Exams
                  </span>
                </div>
              </div>

              {/* Merge vs Replace Mode Option */}
              <div className="p-3 bg-app-bg/50 border border-app-line rounded-component flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-app-ink">Import Strategy</div>
                  <div className="text-[11px] text-app-muted">Choose how to integrate into your existing syllabus</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setImportMode('merge')}
                    className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                      importMode === 'merge'
                        ? 'bg-app-accent text-white border-app-accent'
                        : 'bg-app-surface border-app-line text-app-muted'
                    }`}
                  >
                    Merge with Existing
                  </button>
                  <button
                    onClick={() => setImportMode('replace')}
                    className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                      importMode === 'replace'
                        ? 'bg-app-danger text-white border-app-danger'
                        : 'bg-app-surface border-app-line text-app-muted'
                    }`}
                  >
                    Replace Syllabus
                  </button>
                </div>
              </div>

              {/* Tab Selector: Subjects vs Exams vs Schedule */}
              <div className="flex items-center border-b border-app-line text-xs font-mono gap-1">
                <button
                  onClick={() => setActiveTab('subjects')}
                  className={`px-3 py-1.5 border-b-2 font-bold transition-colors ${
                    activeTab === 'subjects'
                      ? 'border-app-accent text-app-accent'
                      : 'border-transparent text-app-muted hover:text-app-ink'
                  }`}
                >
                  Subjects ({payload.subjects.length})
                </button>
                <button
                  onClick={() => setActiveTab('exams')}
                  className={`px-3 py-1.5 border-b-2 font-bold transition-colors ${
                    activeTab === 'exams'
                      ? 'border-app-accent text-app-accent'
                      : 'border-transparent text-app-muted hover:text-app-ink'
                  }`}
                >
                  Exams ({payload.exams.length})
                </button>
                {payload.scheduleSlots && payload.scheduleSlots.length > 0 && (
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`px-3 py-1.5 border-b-2 font-bold transition-colors ${
                      activeTab === 'schedule'
                        ? 'border-app-accent text-app-accent'
                        : 'border-transparent text-app-muted hover:text-app-ink'
                    }`}
                  >
                    Schedule Slots ({payload.scheduleSlots.length})
                  </button>
                )}
              </div>

              {/* TAB 1: SUBJECTS */}
              {activeTab === 'subjects' && (
                <div className="space-y-3">
                  {payload.subjects.length === 0 ? (
                    <p className="text-xs text-app-muted italic p-4 text-center">
                      No discrete syllabus subjects detected in this document.
                    </p>
                  ) : (
                    payload.subjects.map((sub, sidx) => (
                      <div
                        key={sidx}
                        className={`p-3.5 rounded-component border transition-all ${
                          sub.selected !== false
                            ? 'bg-app-bg border-app-accent/40 shadow-panel'
                            : 'bg-app-bg/40 border-app-line opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => toggleSubject(sidx)}
                              className="text-app-accent hover:opacity-80 transition-opacity"
                            >
                              {sub.selected !== false ? (
                                <CheckSquare className="w-4 h-4 text-app-accent" />
                              ) : (
                                <Square className="w-4 h-4 text-app-muted" />
                              )}
                            </button>
                            <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-app-accent/15 text-app-accent border border-app-accent/30">
                              {sub.courseCode || sub.code}
                            </span>
                            <span className="text-xs font-bold text-app-ink">{sub.name}</span>
                            {sub.isDuplicate && (
                              <span className="px-1.5 py-0.5 rounded bg-app-warn/15 text-app-warn border border-app-warn/30 text-[9px] font-mono">
                                Already in Planner
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Modules preview */}
                        <div className="space-y-1 pl-6 pt-2 border-l border-app-line mt-2">
                          {sub.modules.map((m, midx) => (
                            <div key={midx} className="text-[11px] text-app-muted font-mono flex items-center justify-between">
                              <span className="text-app-ink font-medium">{m.name}:</span>
                              <span>{m.topics.length} topics</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: EXAMS */}
              {activeTab === 'exams' && (
                <div className="space-y-2.5">
                  {payload.exams.length === 0 ? (
                    <p className="text-xs text-app-muted italic p-4 text-center">
                      No examination dates identified in this document.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {payload.exams.map((ex, eidx) => (
                        <div
                          key={eidx}
                          className={`p-3 rounded-component border flex items-center justify-between gap-2 transition-all ${
                            ex.selected !== false
                              ? 'bg-app-bg border-app-accent/40 shadow-panel'
                              : 'bg-app-bg/40 border-app-line opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExam(eidx)}
                              className="text-app-accent hover:opacity-80"
                            >
                              {ex.selected !== false ? (
                                <CheckSquare className="w-4 h-4 text-app-accent" />
                              ) : (
                                <Square className="w-4 h-4 text-app-muted" />
                              )}
                            </button>
                            <div>
                              <div className="font-bold text-xs text-app-ink flex items-center gap-1.5">
                                <span>{ex.subjectCode}</span>
                                {ex.isDuplicate && (
                                  <span className="text-[9px] font-mono text-app-warn bg-app-warn/10 px-1 rounded">
                                    Already Exists
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-app-muted truncate max-w-[200px]">
                                {ex.subjectName}
                              </div>
                              <div className="text-[10px] text-app-accent font-mono mt-0.5">
                                {new Date(ex.date).toLocaleDateString()} ({ex.session || 'FN'})
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SCHEDULE SLOTS */}
              {activeTab === 'schedule' && payload.scheduleSlots && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {payload.scheduleSlots.map((slot, sidx) => (
                      <div
                        key={sidx}
                        className="p-3 bg-app-bg border border-app-line rounded-component flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <button onClick={() => toggleScheduleSlot(sidx)} className="text-app-accent">
                            {slot.selected !== false ? (
                              <CheckSquare className="w-4 h-4 text-app-accent" />
                            ) : (
                              <Square className="w-4 h-4 text-app-muted" />
                            )}
                          </button>
                          <div>
                            <span className="font-bold text-app-ink">{slot.label}</span>
                            <div className="text-[10px] text-app-accent">
                              {slot.startTime} &ndash; {slot.endTime} ({slot.type})
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-app-line bg-app-bg flex justify-between items-center shrink-0">
          <button
            onClick={() => {
              setPayload(null);
              setError(null);
              setSuccessInfo(null);
            }}
            className="px-3.5 py-1.5 rounded-component text-xs text-app-muted hover:text-app-ink transition-colors font-mono"
          >
            {payload ? 'Select Different PDF' : 'Cancel'}
          </button>

          {payload && !payload.isScanned && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-5 py-2 bg-app-accent hover:opacity-90 text-white font-bold rounded-component text-xs shadow-panel flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Integrating Data...' : 'Confirm & Integrate Selected Data'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
