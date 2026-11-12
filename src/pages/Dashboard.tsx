import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Brain,
  AlertTriangle,
  Lightbulb,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getGreeting,
  formatTime24to12,
  calculateExamCountdown,
  getTodayDateString
} from '../utils/time';
import { DailySessionRecord } from '../types';
import { RescheduleModal } from '../components/RescheduleModal';

export const Dashboard: React.FC = () => {
  const {
    data,
    setActiveTab,
    startFocusSessionWithPreload,
    markSessionCompleted,
    markSessionSkipped,
    rescheduleSession,
    recommendations,
    activeProfile,
  } = useApp();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [rescheduleTarget, setRescheduleTarget] = useState<DailySessionRecord | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!data) return null;

  const today = getTodayDateString();
  const todayRecords: DailySessionRecord[] = data.dailyRecords[today] || [];
  const studySessions = todayRecords.filter(r => r.sessionNumber !== undefined);

  // Stats
  const totalStudySessions = studySessions.length || 8;
  const completedCount = studySessions.filter(r => r.status === 'COMPLETED').length;
  const missedCount = studySessions.filter(r => r.status === 'MISSED').length;
  const remainingCount = studySessions.filter(
    r => r.status === 'PENDING' || r.status === 'RESCHEDULED' || r.status === 'IN_PROGRESS'
  ).length;
  const progressPercent = Math.round((completedCount / (totalStudySessions || 1)) * 100);

  const nowMin = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Find active / next session
  const activeSession = studySessions.find(r => {
    const [startH, startM] = r.startTime.split(':').map(Number);
    const [endH, endM] = r.endTime.split(':').map(Number);
    const sMin = startH * 60 + startM;
    const eMin = endH * 60 + endM;
    return nowMin >= sMin && nowMin <= eMin;
  });

  const nextSession = studySessions.find(r => {
    if (r.status !== 'PENDING' && r.status !== 'RESCHEDULED') return false;
    const [startH, startM] = r.startTime.split(':').map(Number);
    return startH * 60 + startM > nowMin;
  }) || activeSession || studySessions[0];

  const currentSubject = nextSession
    ? data.subjects.find(s => s.id === nextSession.subjectId)
    : null;

  // Closest upcoming theory exam
  const theoryExams = [...data.exams.filter(e => !e.isLab)].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextExam = theoryExams.find(e => new Date(e.date).getTime() > currentTime.getTime()) || theoryExams[0];
  const examCountdown = nextExam ? calculateExamCountdown(nextExam.date) : null;

  const missedSessions = studySessions.filter(r => r.status === 'MISSED');

  const handleStartSession = (session?: DailySessionRecord) => {
    const target = session || nextSession;
    if (target) {
      startFocusSessionWithPreload({
        subjectId: target.subjectId,
        topicTitle: target.topicTitle,
        slotId: target.slotId,
        recordId: target.id,
      });
    } else {
      setActiveTab('focus');
    }
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Top Banner: Greeting, Date & Main Call to Action */}
      <div className="card-kopy p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-app-accent mb-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-bold text-app-ink tracking-tight font-sans flex items-center gap-2">
              <span>{getGreeting(currentTime)}, {activeProfile.name}.</span>
              <span className="text-lg">{activeProfile.avatar || '⚡'}</span>
            </h2>
            <p className="text-xs text-app-muted mt-1 max-w-xl leading-relaxed">
              {activeProfile.majorOrCourse ? `${activeProfile.majorOrCourse} • ` : ''}
              {nextExam ? (
                <>
                  Upcoming core target: <strong className="text-app-ink">{nextExam.subjectName} ({nextExam.subjectCode})</strong> in {examCountdown?.days ?? 0} days. Maintain consistent high-focus blocks.
                </>
              ) : (
                'Configure your syllabus and upcoming exam dates to activate tracking.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleStartSession(activeSession || nextSession)}
              className="flex items-center space-x-2 px-5 py-3 rounded-component bg-app-accent hover:opacity-90 text-white font-semibold text-xs tracking-wide shadow-panel transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START STUDY SESSION</span>
            </button>
          </div>
        </div>
      </div>

      {/* Empty State Banner (If zero subjects in planner) */}
      {data.subjects.length === 0 && (
        <div className="card-kopy p-6 border-2 border-dashed border-app-accent/40 bg-app-accent/5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-app-accent/20 flex items-center justify-center text-app-accent shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-app-ink">Your Study Planner is Clean & Empty</h3>
              <p className="text-xs text-app-muted mt-0.5">
                Ready to prepare for your exams? Import a university syllabus PDF or add subjects manually to get started.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('planner')}
              className="px-4 py-2 bg-app-accent hover:opacity-90 text-white font-bold text-xs rounded-component shadow-panel flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Syllabus / Add Subject</span>
            </button>
          </div>
        </div>
      )}

      {/* Lab Exam Alert Card (If Upcoming) */}
      {recommendations.labAlert && (
        <div className="p-4 rounded-card bg-app-surface border border-app-accent/30 shadow-panel flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-component bg-app-accent/15 flex items-center justify-center text-app-accent shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-app-ink font-mono uppercase">
                  {recommendations.labAlert.title}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-app-accent/15 text-app-accent font-semibold">
                  Scheduled: {recommendations.labAlert.date}
                </span>
              </div>
              <div className="text-[11px] text-app-muted mt-1 space-y-0.5">
                {recommendations.labAlert.focusAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-app-accent"></span>
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('planner')}
            className="text-xs font-mono text-app-accent hover:underline shrink-0 flex items-center gap-1"
          >
            <span>View Syllabus</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Smart Recommendations Card */}
      {recommendations.nextTopic && (
        <div className="card-kopy p-5 border-l-4 border-l-app-accent space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold font-mono text-app-accent">
              <Brain className="w-4 h-4" />
              <span>SMART STUDY RECOMMENDATION: WHAT TO STUDY NEXT</span>
            </div>
            <span className="text-[10px] font-mono text-app-muted">
              AI Study Advisor
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-app-bg rounded-component border border-app-line">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${recommendations.nextTopic.subject.color}25`,
                    color: recommendations.nextTopic.subject.color,
                  }}
                >
                  {recommendations.nextTopic.subject.code}
                </span>
                <span className="text-xs font-bold text-app-ink">
                  {recommendations.nextTopic.topic.title}
                </span>
              </div>
              <div className="text-[11px] text-app-muted mt-1">
                {recommendations.nextTopic.module.name} • {recommendations.nextTopic.reason}
              </div>
            </div>

            <button
              onClick={() => {
                startFocusSessionWithPreload({
                  subjectId: recommendations.nextTopic?.subject.id,
                  moduleId: recommendations.nextTopic?.module.id,
                  topicId: recommendations.nextTopic?.topic.id,
                  topicTitle: recommendations.nextTopic?.topic.title,
                });
              }}
              className="flex items-center justify-center space-x-1.5 px-4 py-2 rounded-component bg-app-accent text-white font-semibold text-xs shadow-panel hover:opacity-90 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Recommended Topic</span>
            </button>
          </div>

          {/* Daily Guidance & Revision Queue */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-app-muted pt-1">
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-app-warn shrink-0" />
              <span>{recommendations.dailyTarget.focusGuidance}</span>
            </div>
            {recommendations.revisionQueue.length > 0 && (
              <span className="text-app-warn font-mono font-medium shrink-0">
                {recommendations.revisionQueue.length} topic(s) marked for revision
              </span>
            )}
          </div>
        </div>
      )}

      {/* Missed Sessions Warning Banner */}
      {missedSessions.length > 0 && (
        <div className="p-4 rounded-card bg-app-danger/10 border border-app-danger/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-app-danger font-mono text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              <span>{missedSessions.length} SCHEDULED SESSION(S) MISSED</span>
            </div>
            <span className="text-[11px] text-app-danger/80 font-mono">
              Action Required
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {missedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-app-surface border border-app-danger/25 rounded-component p-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-app-ink">
                      {session.label}
                    </span>
                    <span className="text-[10px] font-mono text-app-danger">
                      {formatTime24to12(session.startTime)}
                    </span>
                  </div>
                  <div className="text-[11px] text-app-muted truncate mt-0.5">
                    {session.topicTitle || 'Study Session'}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-app-line">
                  <button
                    onClick={() => setRescheduleTarget(session)}
                    className="flex-1 flex items-center justify-center gap-1 text-[11px] py-1 bg-app-bg hover:bg-app-hover text-app-accent rounded-component border border-app-line transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => markSessionCompleted(session.id)}
                    className="px-2.5 py-1 text-[11px] bg-app-live/15 hover:bg-app-live/25 text-app-live rounded-component border border-app-live/30 transition-colors"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => markSessionSkipped(session.id)}
                    className="px-2.5 py-1 text-[11px] bg-app-bg hover:bg-app-hover text-app-muted rounded-component border border-app-line transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Row: Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Progress */}
        <div className="card-kopy p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>TODAY'S SESSIONS</span>
            <Sparkles className="w-3.5 h-3.5 text-app-accent" />
          </div>
          <div className="my-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-app-ink font-mono">
                {progressPercent}%
              </span>
              <span className="text-xs text-app-muted">
                ({completedCount}/{totalStudySessions} completed)
              </span>
            </div>
            <div className="w-full bg-app-bg rounded-full h-1.5 mt-2.5 overflow-hidden border border-app-line">
              <div
                className="bg-app-accent h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-app-muted font-mono">
            {remainingCount} study blocks left today
          </div>
        </div>

        {/* Card 2: Current / Next Session */}
        <div className="card-kopy p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>{activeSession ? 'CURRENT SESSION' : 'UPCOMING SESSION'}</span>
            <Clock className="w-3.5 h-3.5 text-app-accent" />
          </div>
          <div className="my-2">
            <div className="flex items-center space-x-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: currentSubject?.color || '#8b5cf6' }}
              ></span>
              <span className="text-sm font-bold text-app-ink truncate">
                {currentSubject?.name || 'General Focus'}
              </span>
            </div>
            <div className="text-xs text-app-muted mt-1 truncate">
              {nextSession?.topicTitle || 'Scheduled Topic'}
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-app-accent">
            <span>{nextSession ? `${formatTime24to12(nextSession.startTime)} – ${formatTime24to12(nextSession.endTime)}` : '--:--'}</span>
            <span>30m sprint</span>
          </div>
        </div>

        {/* Card 3: Next Exam Countdown */}
        <div className="card-kopy p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>CORE EXAM TARGET</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono"
              style={{ backgroundColor: `${nextExam?.color}20`, color: nextExam?.color }}
            >
              {nextExam?.subjectCode}
            </span>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-app-ink font-mono">
              {examCountdown?.days ?? 0} <span className="text-xs font-normal text-app-muted">DAYS</span> {examCountdown?.hours ?? 0} <span className="text-xs font-normal text-app-muted">HRS</span>
            </div>
            <div className="text-xs text-app-muted mt-1 truncate">
              {nextExam?.subjectName}
            </div>
          </div>
          <div className="text-[11px] text-app-muted font-mono">
            {nextExam ? new Date(nextExam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No exam scheduled'}
          </div>
        </div>

        {/* Card 4: Daily Session Stats */}
        <div className="card-kopy p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>DAILY STATUS</span>
            <BookOpen className="w-3.5 h-3.5 text-app-accent" />
          </div>
          <div className="grid grid-cols-3 gap-2 my-2 text-center">
            <div className="p-2 rounded-component bg-app-bg border border-app-line">
              <div className="text-base font-bold text-app-live font-mono">{completedCount}</div>
              <div className="text-[10px] text-app-muted">Done</div>
            </div>
            <div className="p-2 rounded-component bg-app-bg border border-app-line">
              <div className="text-base font-bold text-app-accent font-mono">{remainingCount}</div>
              <div className="text-[10px] text-app-muted">Pending</div>
            </div>
            <div className="p-2 rounded-component bg-app-bg border border-app-line">
              <div className="text-base font-bold text-app-danger font-mono">{missedCount}</div>
              <div className="text-[10px] text-app-muted">Missed</div>
            </div>
          </div>
          <div className="text-[11px] text-app-muted font-mono text-right">
            Daily focus goal: 240m
          </div>
        </div>
      </div>

      {/* Today's Study Schedule Timeline */}
      <div className="card-kopy p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-app-line pb-3">
          <div>
            <h3 className="text-sm font-bold text-app-ink font-sans flex items-center gap-2">
              <Clock className="w-4 h-4 text-app-accent" />
              TODAY'S SCHEDULE TIMELINE
            </h3>
            <p className="text-xs text-app-muted mt-0.5">
              Personal daily rhythm: 10:30 AM start, 30m concentration blocks with structured recovery breaks.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="text-xs font-mono text-app-accent hover:underline flex items-center gap-1"
          >
            <span>Edit Routine</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Timeline List */}
        <div className="space-y-2">
          {data.timetable.map((slot) => {
            const isStudy = slot.type === 'STUDY';
            const record = todayRecords.find(r => r.slotId === slot.id);
            const status = record?.status || 'PENDING';
            const subject = data.subjects.find(s => s.id === (record?.subjectId || slot.defaultSubjectId));

            if (!isStudy) {
              return (
                <div
                  key={slot.id}
                  className="flex items-center justify-between px-4 py-2 rounded-component bg-app-bg/60 border border-app-line text-app-muted text-xs"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-app-muted w-36">
                      {formatTime24to12(slot.startTime)} – {formatTime24to12(slot.endTime)}
                    </span>
                    <span className="text-app-muted italic">
                      {slot.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-app-surface text-app-muted border border-app-line">
                    {slot.type}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={slot.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-component border transition-all ${
                  status === 'COMPLETED'
                    ? 'bg-app-live/5 border-app-live/30'
                    : status === 'MISSED'
                    ? 'bg-app-danger/5 border-app-danger/30'
                    : status === 'SKIPPED'
                    ? 'bg-app-bg/40 border-app-line opacity-60'
                    : 'bg-app-surface border-app-line hover:border-app-accent/40'
                }`}
              >
                {/* Left: Time & Subject Info */}
                <div className="flex items-center space-x-4">
                  <div className="w-36 shrink-0 font-mono text-xs font-semibold text-app-ink">
                    {formatTime24to12(record?.startTime || slot.startTime)} – {formatTime24to12(record?.endTime || slot.endTime)}
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold"
                      style={{
                        backgroundColor: `${subject?.color || '#8b5cf6'}20`,
                        color: subject?.color || '#8b5cf6',
                        border: `1px solid ${subject?.color || '#8b5cf6'}40`,
                      }}
                    >
                      {subject?.code || 'STUDY'}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-app-ink">
                        {record?.label || slot.label}
                      </div>
                      <div className="text-[11px] text-app-muted truncate max-w-md">
                        {record?.topicTitle || (subject ? subject.name : 'Focus Session')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge & Action buttons */}
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <span
                    className={`text-[10px] font-mono px-2.5 py-1 rounded-full uppercase font-medium ${
                      status === 'COMPLETED'
                        ? 'bg-app-live/15 text-app-live border border-app-live/30'
                        : status === 'MISSED'
                        ? 'bg-app-danger/15 text-app-danger border border-app-danger/30'
                        : status === 'SKIPPED'
                        ? 'bg-app-bg text-app-muted border border-app-line'
                        : status === 'RESCHEDULED'
                        ? 'bg-app-accent/15 text-app-accent border border-app-accent/30'
                        : 'bg-app-accent/10 text-app-accent border border-app-accent/25'
                    }`}
                  >
                    {status}
                  </span>

                  {record && status !== 'COMPLETED' && (
                    <div className="flex items-center space-x-1 pl-2 border-l border-app-line">
                      <button
                        onClick={() => handleStartSession(record)}
                        className="p-1.5 rounded-component hover:bg-app-hover text-app-accent transition-colors"
                        title="Start Focus"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => markSessionCompleted(record.id)}
                        className="p-1.5 rounded-component hover:bg-app-hover text-app-live transition-colors"
                        title="Mark Completed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setRescheduleTarget(record)}
                        className="p-1.5 rounded-component hover:bg-app-hover text-app-accent transition-colors"
                        title="Reschedule"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => markSessionSkipped(record.id)}
                        className="p-1.5 rounded-component hover:bg-app-hover text-app-muted transition-colors"
                        title="Skip"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {record && status === 'COMPLETED' && (
                    <div className="flex items-center space-x-1 text-app-live text-xs font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Done</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={!!rescheduleTarget}
        session={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onConfirm={rescheduleSession}
      />
    </div>
  );
};
