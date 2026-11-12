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
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parsePdfText, ExtractedPdfPayload, ExtractedSubjectCandidate, ExtractedExamCandidate } from '../utils/pdfExtractor';

interface PdfImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PdfImportModal: React.FC<PdfImportModalProps> = ({ isOpen, onClose }) => {
  const { importExtractedPayload, t } = useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<ExtractedPdfPayload | null>(null);
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

      const extracted = parsePdfText(res.text, res.filename || 'Syllabus.pdf');
      setPayload(extracted);
    } catch (err: any) {
      console.error('Failed to parse PDF:', err);
      setError(err.message || 'Failed to parse PDF document.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!payload) return;
    try {
      setLoading(true);
      const res = await importExtractedPayload(payload);
      setSuccessInfo(res);
      setPayload(null);
    } catch (err: any) {
      setError(err.message || 'Failed to import extracted syllabus data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSubject = (idx: number) => {
    if (!payload) return;
    const updated = {
      ...payload,
      subjects: payload.subjects.filter((_, i) => i !== idx),
    };
    setPayload(updated);
  };

  const handleRemoveExam = (idx: number) => {
    if (!payload) return;
    const updated = {
      ...payload,
      exams: payload.exams.filter((_, i) => i !== idx),
    };
    setPayload(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-app-surface border border-app-line rounded-modal w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 border-b border-app-line flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-app-ink">
                Intelligent PDF Syllabus & Exam Timetable Importer
              </h2>
              <p className="text-[11px] text-app-muted font-mono">
                Extracts courses, modules, discrete topics, and dates locally
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
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-app-danger/10 border border-app-danger/30 rounded-component text-xs text-app-danger flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-4 bg-app-live/10 border border-app-live/30 rounded-component text-xs text-app-live flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Successfully imported <strong>{successInfo.subjectsAdded} subjects</strong> and{' '}
                  <strong>{successInfo.examsAdded} exam timetable dates</strong> into STUDY COMMAND!
                </span>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-app-live text-black font-semibold rounded-component text-xs transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </div>
          )}

          {!payload && !successInfo && (
            <div className="border-2 border-dashed border-app-line rounded-modal p-10 flex flex-col items-center justify-center text-center space-y-4 bg-app-bg/50 hover:bg-app-bg transition-colors">
              <div className="w-14 h-14 rounded-full bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent shadow-inner">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-app-ink">Select Syllabus or Timetable PDF</h3>
                <p className="text-xs text-app-muted mt-1 max-w-sm">
                  Upload any University syllabus or exam timetable PDF. The intelligent parser will extract subjects, modules, topics, and dates for review before saving.
                </p>
              </div>
              <button
                onClick={handleSelectFile}
                disabled={loading}
                className="px-5 py-2.5 bg-app-accent hover:bg-app-accent/90 text-white font-semibold rounded-component text-xs shadow-panel flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>{loading ? 'Analyzing PDF Content...' : 'Choose PDF File'}</span>
              </button>
            </div>
          )}

          {payload && (
            <div className="space-y-4">
              {/* Document Overview Bar */}
              <div className="p-3 bg-app-bg border border-app-line rounded-component flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-app-muted">File:</span>{' '}
                  <span className="text-app-ink font-semibold">{payload.filename}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-app-accent/10 border border-app-accent/25 text-app-accent text-[10px]">
                    Type: {payload.detectedType}
                  </span>
                  <span className="text-app-muted">
                    {payload.subjects.length} Subjects | {payload.exams.length} Exams
                  </span>
                </div>
              </div>

              {/* Extracted Subjects & Modules List */}
              {payload.subjects.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-app-ink flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <BookOpen className="w-3.5 h-3.5 text-app-accent" />
                    <span>Extracted Syllabus Subjects ({payload.subjects.length})</span>
                  </h4>

                  {payload.subjects.map((sub, sidx) => (
                    <div
                      key={sidx}
                      className="p-3.5 bg-app-bg border border-app-line rounded-component space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-app-accent/15 text-app-accent border border-app-accent/30">
                            {sub.courseCode || sub.code}
                          </span>
                          <span className="text-xs font-bold text-app-ink">{sub.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveSubject(sidx)}
                          className="text-app-muted hover:text-app-danger p-1 rounded transition-colors"
                          title="Exclude this subject"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Modules preview */}
                      <div className="space-y-1.5 pl-2 border-l border-app-line">
                        {sub.modules.map((m, midx) => (
                          <div key={midx} className="text-[11px] text-app-muted font-mono">
                            <span className="text-app-ink font-medium">{m.name}:</span>{' '}
                            <span>{m.topics.length} discrete topics identified</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Exam Timetable Dates */}
              {payload.exams.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-app-ink flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <Calendar className="w-3.5 h-3.5 text-app-accent" />
                    <span>Extracted Exam Timetable Dates ({payload.exams.length})</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {payload.exams.map((ex, eidx) => (
                      <div
                        key={eidx}
                        className="p-2.5 bg-app-bg border border-app-line rounded-component flex items-center justify-between text-xs font-mono"
                      >
                        <div>
                          <div className="font-bold text-app-ink">{ex.subjectCode}</div>
                          <div className="text-[10px] text-app-muted truncate max-w-[200px]">
                            {ex.subjectName}
                          </div>
                          <div className="text-[10px] text-app-accent mt-0.5">
                            {new Date(ex.date).toLocaleDateString()} ({ex.session || 'FN'})
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveExam(eidx)}
                          className="text-app-muted hover:text-app-danger p-1 rounded transition-colors"
                          title="Exclude this exam date"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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

          {payload && (
            <button
              onClick={handleConfirmImport}
              disabled={loading}
              className="px-5 py-2 bg-app-accent hover:bg-app-accent/90 text-white font-semibold rounded-component text-xs shadow-panel flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Importing Data...' : 'Confirm & Import to Study Command'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
