import React from 'react';
import { X, BookOpen, ExternalLink, Video, Bookmark, Layers, CheckCircle2, FileText } from 'lucide-react';
import { SYLLABUS_METADATA } from '../data/syllabusMetadata';

interface SyllabusReferenceModalProps {
  subjectId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SyllabusReferenceModal: React.FC<SyllabusReferenceModalProps> = ({
  subjectId,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !subjectId) return null;

  const metadata = SYLLABUS_METADATA[subjectId];
  if (!metadata) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-app-surface border border-app-line rounded-card shadow-panel overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-app-line bg-app-bg/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 border border-app-accent/30 flex items-center justify-center text-app-accent">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-app-ink tracking-tight">
                {metadata.courseName}
              </h3>
              <p className="text-[11px] font-mono text-app-muted">
                Course Code: <span className="text-app-accent font-semibold">{metadata.courseCode}</span> • Semester {metadata.semester} • Credits: {metadata.credits}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-app-ink">
          {/* Examination & Evaluation Scheme */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-app-bg rounded-component border border-app-line text-center">
            <div>
              <span className="text-[10px] font-mono uppercase text-app-muted block">CIE Internal</span>
              <span className="text-base font-bold text-app-accent font-mono">{metadata.cieMarks} Marks</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-app-muted block">ESE University</span>
              <span className="text-base font-bold text-app-accent font-mono">{metadata.eseMarks} Marks</span>
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-app-muted block">Duration</span>
              <span className="text-xs font-semibold text-app-ink font-mono">{metadata.examHours}</span>
            </div>
          </div>

          {/* Course Objectives */}
          <div>
            <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-app-accent" />
              Course Objectives
            </h4>
            <ul className="space-y-1.5 pl-1">
              {metadata.courseObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-app-muted leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-app-live shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prescribed Textbooks */}
          <div>
            <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-app-accent" />
              Prescribed Textbooks
            </h4>
            <div className="space-y-2">
              {metadata.textBooks.map((book, i) => (
                <div key={i} className="p-2.5 rounded-component bg-app-bg border border-app-line">
                  <div className="font-semibold text-app-ink">{book.title}</div>
                  <div className="text-[11px] text-app-muted mt-0.5 font-mono">
                    Author(s): {book.authors} • Publisher: {book.publisher} {book.editionYear ? `(${book.editionYear})` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescribed Reference Books */}
          {metadata.referenceBooks && metadata.referenceBooks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-app-accent" />
                Reference Books
              </h4>
              <div className="space-y-2">
                {metadata.referenceBooks.map((ref, i) => (
                  <div key={i} className="p-2.5 rounded-component bg-app-bg border border-app-line">
                    <div className="font-medium text-app-ink">{ref.title}</div>
                    <div className="text-[11px] text-app-muted mt-0.5 font-mono">
                      {ref.authors} — {ref.publisher} {ref.editionYear ? `(${ref.editionYear})` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video & NPTEL Links */}
          {metadata.videoLinks && metadata.videoLinks.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-app-ink font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-app-accent" />
                Recommended Video Resources (NPTEL / Coursera / Web)
              </h4>
              <div className="space-y-1.5">
                {metadata.videoLinks.map((link, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-component bg-app-bg border border-app-line">
                    <span className="text-[11px] font-mono text-app-muted truncate max-w-[450px]">
                      {link.moduleNo ? `Module ${link.moduleNo}: ` : ''}{link.url}
                    </span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-app-accent hover:underline shrink-0 ml-2"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-app-line bg-app-bg/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-app-muted text-[11px]">
              Original Syllabus Reference • Official KTU Scheme
            </span>
            {metadata.pdfPath && (
              <button
                onClick={() => window.electronAPI?.openPath?.(metadata.pdfPath)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-component bg-app-surface border border-app-line hover:border-app-accent/50 text-app-ink hover:text-app-accent text-[11px] font-medium transition-colors shadow-sm ml-2"
                title="Open original KTU syllabus PDF in Windows default viewer"
              >
                <FileText className="w-3.5 h-3.5 text-app-accent" />
                <span>Open Original PDF</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-component bg-app-accent text-white font-semibold shadow-panel hover:opacity-90 transition-opacity"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
