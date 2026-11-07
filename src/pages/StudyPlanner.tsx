import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Calendar,
  FileText,
  Trash2,
  Layers,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Edit2,
  RotateCcw,
  Sparkles,
  Bookmark,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TopicStatus, Topic } from '../types';
import { SyllabusReferenceModal } from '../components/SyllabusReferenceModal';
import { SYLLABUS_METADATA } from '../data/syllabusMetadata';

export const StudyPlanner: React.FC = () => {
  const {
    data,
    addModule,
    addTopic,
    editTopic,
    setTopicStatus,
    deleteTopic,
    recommendations,
    startFocusSessionWithPreload,
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-cn');
  const [newModuleName, setNewModuleName] = useState<string>('');
  const [isAddingModule, setIsAddingModule] = useState<boolean>(false);

  // New topic form state
  const [activeModuleForTopic, setActiveModuleForTopic] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState<string>('');
  const [topicPriority, setTopicPriority] = useState<Priority>('HIGH');
  const [topicTargetDate, setTopicTargetDate] = useState<string>('');
  const [topicNotes, setTopicNotes] = useState<string>('');
  const [topicSubtopics, setTopicSubtopics] = useState<string>('');

  // Editing topic state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');

  // Collapsed modules state
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});

  // PDF Syllabus modal
  const [syllabusModalSubjectId, setSyllabusModalSubjectId] = useState<string | null>(null);

  if (!data) return null;

  const currentSubject = data.subjects.find(s => s.id === selectedSubjectId) || data.subjects[0];

  // Subject Stats
  let totalTopics = 0;
  let completedTopics = 0;
  let inProgressTopics = 0;
  let needsRevisionTopics = 0;

  currentSubject?.modules.forEach(m => {
    totalTopics += m.topics.length;
    completedTopics += m.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
    inProgressTopics += m.topics.filter(t => t.status === 'IN_PROGRESS').length;
    needsRevisionTopics += m.topics.filter(t => t.status === 'NEEDS_REVISION' || t.needsRevision).length;
  });

  const subjectProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const pendingTopics = totalTopics - completedTopics;

  // Overall syllabus stats
  let overallTotal = 0;
  let overallCompleted = 0;
  data.subjects.forEach(s => {
    s.modules.forEach(m => {
      overallTotal += m.topics.length;
      overallCompleted += m.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
    });
  });
  const overallProgress = overallTotal > 0 ? Math.round((overallCompleted / overallTotal) * 100) : 0;

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim() || !currentSubject) return;
    await addModule(currentSubject.id, newModuleName.trim());
    setNewModuleName('');
    setIsAddingModule(false);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !currentSubject || !activeModuleForTopic) return;
    const subtopicsList = topicSubtopics
      ? topicSubtopics.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    await addTopic(currentSubject.id, activeModuleForTopic, {
      title: topicTitle.trim(),
      priority: topicPriority,
      status: 'NOT_STARTED',
      completed: false,
      targetDate: topicTargetDate || undefined,
      notes: topicNotes.trim() || undefined,
      subtopics: subtopicsList,
    });
    setTopicTitle('');
    setTopicPriority('HIGH');
    setTopicTargetDate('');
    setTopicNotes('');
    setTopicSubtopics('');
    setActiveModuleForTopic(null);
  };

  const handleStartEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditTitle(topic.title);
    setEditNotes(topic.notes || '');
  };

  const handleSaveEditTopic = async (modId: string, topicId: string) => {
    if (!currentSubject || !editTitle.trim()) return;
    await editTopic(currentSubject.id, modId, topicId, {
      title: editTitle.trim(),
      notes: editNotes.trim() || undefined,
    });
    setEditingTopicId(null);
  };

  const toggleModuleCollapse = (modId: string) => {
    setCollapsedModules(prev => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-line pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
            <BookOpen className="w-3.5 h-3.5" />
            <span>INTELLIGENT SYLLABUS PLANNER</span>
          </div>
          <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">
            Syllabus & Curriculum Command
          </h2>
          <p className="text-xs text-app-muted">
            Official KTU curriculum integration across all 6 examination courses with module tracking and revision management.
          </p>
        </div>

        {/* Overall progress indicator */}
        <div className="flex items-center space-x-4 card-kopy px-4 py-2.5">
          <div>
            <div className="text-[10px] font-mono uppercase text-app-muted">OVERALL PROGRESS</div>
            <div className="text-base font-bold text-app-accent font-mono">
              {overallProgress}% <span className="text-xs text-app-muted font-normal">({overallCompleted}/{overallTotal})</span>
            </div>
          </div>
          <div className="w-24 bg-app-bg rounded-full h-2 overflow-hidden border border-app-line">
            <div
              className="bg-app-accent h-2 rounded-full transition-all duration-500 shadow-panel"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Six Subjects Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {data.subjects.map((subj) => {
          const isSelected = subj.id === selectedSubjectId;
          let sTot = 0;
          let sDone = 0;
          subj.modules.forEach(m => {
            sTot += m.topics.length;
            sDone += m.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
          });
          const sPct = sTot > 0 ? Math.round((sDone / sTot) * 100) : 0;

          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`p-3.5 rounded-card border text-left transition-all ${
                isSelected
                  ? 'bg-app-surface border-app-accent shadow-panel ring-1 ring-app-accent/40'
                  : 'bg-app-surface/60 border-app-line hover:border-app-line2 hover:bg-app-surface'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: subj.color }}
                ></span>
                <span className="text-[10px] font-mono text-app-muted">{sPct}%</span>
              </div>
              <div className="text-xs font-bold text-app-ink mt-2 truncate font-sans">
                {subj.name}
              </div>
              <div className="text-[11px] font-mono text-app-muted mt-0.5">
                {subj.courseCode} • {sTot} topics
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Section */}
      {currentSubject && (
        <div className="space-y-4">
          {/* Subject Header Bar */}
          <div className="card-kopy p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div
                className="w-11 h-11 rounded-component flex items-center justify-center font-mono font-bold text-sm shadow-sm"
                style={{
                  backgroundColor: `${currentSubject.color}20`,
                  color: currentSubject.color,
                  border: `1px solid ${currentSubject.color}40`,
                }}
              >
                {currentSubject.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-app-ink font-sans">
                    {currentSubject.name}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-app-bg border border-app-line text-app-muted">
                    {currentSubject.courseCode} • Semester {currentSubject.semester}
                  </span>
                </div>
                <div className="text-xs text-app-muted flex flex-wrap items-center gap-2 mt-1 font-mono">
                  <span>{currentSubject.modules.length} Modules</span>
                  <span>•</span>
                  <span>{totalTopics} Topics</span>
                  <span>•</span>
                  <span className="text-app-live font-semibold">{completedTopics} Completed</span>
                  <span>•</span>
                  <span>{pendingTopics} Pending</span>
                  {needsRevisionTopics > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-app-warn font-semibold">{needsRevisionTopics} Needs Revision</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSyllabusModalSubjectId(currentSubject.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-medium transition-all"
                title="View Course Objectives, Textbooks, Reference Books & Video Links"
              >
                <Bookmark className="w-3.5 h-3.5 text-app-accent" />
                <span>Reference</span>
              </button>

              <button
                onClick={() => {
                  const meta = SYLLABUS_METADATA[currentSubject.id];
                  if (meta?.pdfPath) {
                    window.electronAPI?.openPath?.(meta.pdfPath);
                  }
                }}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-component bg-app-bg hover:bg-app-hover text-app-ink border border-app-line text-xs font-medium transition-all"
                title="Open original official syllabus PDF in your default PDF reader"
              >
                <FileText className="w-3.5 h-3.5 text-app-accent" />
                <span>Open PDF</span>
              </button>

              <button
                onClick={() => setIsAddingModule(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-component bg-app-accent hover:opacity-90 text-white text-xs font-semibold shadow-panel transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          {/* Add Module inline form */}
          {isAddingModule && (
            <form
              onSubmit={handleCreateModule}
              className="p-4 rounded-card bg-app-surface border border-app-accent/40 flex items-center gap-3 animate-fade-in"
            >
              <input
                type="text"
                placeholder="Module Name (e.g. Module 5: Advanced Optimization Techniques)"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                autoFocus
                className="flex-1 input-kopy px-3 py-2 text-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-app-accent text-white font-semibold text-xs rounded-component hover:opacity-90 shadow-panel transition-all"
              >
                Save Module
              </button>
              <button
                type="button"
                onClick={() => setIsAddingModule(false)}
                className="px-3 py-2 text-app-muted hover:text-app-ink text-xs"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Modules List */}
          <div className="space-y-3.5">
            {currentSubject.modules.map((mod) => {
              const isCollapsed = !!collapsedModules[mod.id];
              const modTotal = mod.topics.length;
              const modDone = mod.topics.filter(t => t.status === 'COMPLETED' || t.completed).length;
              const modPct = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;

              return (
                <div
                  key={mod.id}
                  className="card-kopy overflow-hidden"
                >
                  {/* Module Header Bar */}
                  <div className="p-3.5 bg-app-bg/50 border-b border-app-line flex items-center justify-between">
                    <button
                      onClick={() => toggleModuleCollapse(mod.id)}
                      className="flex items-center space-x-2 text-left"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-app-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-app-accent" />
                      )}
                      <span className="text-xs font-bold text-app-ink font-sans">
                        {mod.name}
                      </span>
                      <span className="text-[11px] text-app-muted font-mono">
                        ({modDone}/{modTotal} completed • {modPct}%)
                        {mod.contactHours ? ` • ${mod.contactHours} Contact Hrs` : ''}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveModuleForTopic(mod.id)}
                      className="flex items-center space-x-1 text-xs px-2.5 py-1 rounded-component bg-app-surface hover:bg-app-hover text-app-muted hover:text-app-ink border border-app-line transition-colors"
                    >
                      <Plus className="w-3 h-3 text-app-accent" />
                      <span>Add Topic</span>
                    </button>
                  </div>

                  {/* Topics List */}
                  {!isCollapsed && (
                    <div className="p-3.5 space-y-2">
                      {mod.topics.length === 0 ? (
                        <div className="text-xs text-app-muted py-2 italic font-mono">
                          No topics added in this module yet.
                        </div>
                      ) : (
                        mod.topics.map((topic) => {
                          const isEditing = editingTopicId === topic.id;
                          const status: TopicStatus = topic.status || (topic.completed ? 'COMPLETED' : 'NOT_STARTED');

                          return (
                            <div
                              key={topic.id}
                              className={`p-3 rounded-component border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                                status === 'COMPLETED'
                                  ? 'bg-app-live/5 border-app-live/25'
                                  : status === 'NEEDS_REVISION'
                                  ? 'bg-app-warn/5 border-app-warn/30'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-app-accent/5 border-app-accent/30'
                                  : 'bg-app-bg/50 border-app-line hover:border-app-line2'
                              }`}
                            >
                              {/* Left: Checkbox / Status + Topic Info */}
                              <div className="flex items-start space-x-3 flex-1">
                                <div>
                                  {isEditing ? (
                                    <div className="space-y-2 w-full max-w-lg">
                                      <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="input-kopy w-full px-2 py-1 text-xs font-semibold"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Add notes / key insights"
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        className="input-kopy w-full px-2 py-1 text-[11px]"
                                      />
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleSaveEditTopic(mod.id, topic.id)}
                                          className="p-1 rounded bg-app-live/20 text-app-live hover:bg-app-live/30 text-xs"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingTopicId(null)}
                                          className="p-1 rounded bg-app-bg text-app-muted hover:text-app-ink text-xs"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex items-center space-x-2">
                                        <span
                                          className={`text-xs font-semibold ${
                                            status === 'COMPLETED' ? 'text-app-muted line-through' : 'text-app-ink'
                                          }`}
                                        >
                                          {topic.title}
                                        </span>
                                        {topic.tags?.map((t, idx) => (
                                          <span
                                            key={idx}
                                            className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-app-bg border border-app-line text-app-muted"
                                          >
                                            {t}
                                          </span>
                                        ))}
                                      </div>

                                      {/* Subtopics pill trail */}
                                      {topic.subtopics && topic.subtopics.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {topic.subtopics.map((sub, sIdx) => (
                                            <span
                                              key={sIdx}
                                              className="text-[10px] font-mono text-app-muted/90 bg-app-bg/80 px-1.5 py-0.5 rounded border border-app-line"
                                            >
                                              • {sub}
                                            </span>
                                          ))}
                                        </div>
                                      )}

                                      {topic.notes && (
                                        <div className="text-[11px] text-app-muted mt-1 flex items-center gap-1">
                                          <FileText className="w-3 h-3 text-app-accent" />
                                          <span>{topic.notes}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Status Dropdown & Action Controls */}
                              <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                                {/* 4-Status Selector */}
                                <select
                                  value={status}
                                  onChange={(e) => setTopicStatus(currentSubject.id, mod.id, topic.id, e.target.value as TopicStatus)}
                                  className={`text-[11px] font-mono px-2.5 py-1 rounded-component border font-medium uppercase cursor-pointer focus:outline-none ${
                                    status === 'COMPLETED'
                                      ? 'bg-app-live/15 text-app-live border-app-live/30'
                                      : status === 'NEEDS_REVISION'
                                      ? 'bg-app-warn/15 text-app-warn border-app-warn/30'
                                      : status === 'IN_PROGRESS'
                                      ? 'bg-app-accent/15 text-app-accent border-app-accent/30'
                                      : 'bg-app-bg text-app-muted border-app-line'
                                  }`}
                                >
                                  <option value="NOT_STARTED">Not Started</option>
                                  <option value="IN_PROGRESS">In Progress</option>
                                  <option value="COMPLETED">Completed</option>
                                  <option value="NEEDS_REVISION">Needs Revision</option>
                                </select>

                                {/* Priority Badge */}
                                <span
                                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                                    topic.priority === 'HIGH'
                                      ? 'bg-app-danger/10 text-app-danger border-app-danger/25'
                                      : topic.priority === 'MEDIUM'
                                      ? 'bg-app-warn/10 text-app-warn border-app-warn/25'
                                      : 'bg-app-bg text-app-muted border-app-line'
                                  }`}
                                >
                                  {topic.priority}
                                </span>

                                {/* Quick Focus Session Action */}
                                <button
                                  onClick={() => {
                                    startFocusSessionWithPreload({
                                      subjectId: currentSubject.id,
                                      topicTitle: topic.title,
                                    });
                                  }}
                                  className="p-1 rounded-component hover:bg-app-hover text-app-accent"
                                  title="Launch Focus Session for Topic"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>

                                {/* Edit Button */}
                                <button
                                  onClick={() => handleStartEditTopic(topic)}
                                  className="p-1 rounded-component hover:bg-app-hover text-app-muted hover:text-app-ink"
                                  title="Edit Topic"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Topic */}
                                <button
                                  onClick={() => deleteTopic(currentSubject.id, mod.id, topic.id)}
                                  className="p-1 rounded-component hover:bg-app-danger/10 text-app-muted hover:text-app-danger"
                                  title="Delete Topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {activeModuleForTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-app-surface border border-app-line rounded-card shadow-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-app-line pb-3">
              <h3 className="text-sm font-bold text-app-ink font-sans flex items-center gap-2">
                <Layers className="w-4 h-4 text-app-accent" />
                ADD SYLLABUS TOPIC
              </h3>
              <button
                onClick={() => setActiveModuleForTopic(null)}
                className="text-app-muted hover:text-app-ink text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Theorem & Recurrence Relations"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="input-kopy w-full px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">
                  Subtopics (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Case 1, Case 2, Case 3, Proof intuition"
                  value={topicSubtopics}
                  onChange={(e) => setTopicSubtopics(e.target.value)}
                  className="input-kopy w-full px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">
                    Priority
                  </label>
                  <select
                    value={topicPriority}
                    onChange={(e) => setTopicPriority(e.target.value as Priority)}
                    className="input-kopy w-full px-3 py-2 text-xs"
                  >
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MEDIUM">MEDIUM Priority</option>
                    <option value="LOW">LOW Priority</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-app-muted block mb-1">
                    Target Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={topicTargetDate}
                    onChange={(e) => setTopicTargetDate(e.target.value)}
                    className="input-kopy w-full px-3 py-2 text-xs"
                  >
                  </input>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-app-muted block mb-1">
                  Personal Notes / Key Points
                </label>
                <textarea
                  placeholder="e.g. Focus on asymptotic limits and standard gate exam problems"
                  rows={2}
                  value={topicNotes}
                  onChange={(e) => setTopicNotes(e.target.value)}
                  className="input-kopy w-full px-3 py-2 text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-app-line">
                <button
                  type="button"
                  onClick={() => setActiveModuleForTopic(null)}
                  className="px-3 py-1.5 text-xs text-app-muted hover:text-app-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-app-accent hover:opacity-90 text-white font-semibold text-xs rounded-component shadow-panel transition-all"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus PDF Reference Modal */}
      <SyllabusReferenceModal
        subjectId={syllabusModalSubjectId}
        isOpen={!!syllabusModalSubjectId}
        onClose={() => setSyllabusModalSubjectId(null)}
      />
    </div>
  );
};
