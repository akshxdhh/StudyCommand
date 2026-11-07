import React, { useState } from 'react';
import {
  History,
  Clock,
  Calendar,
  CheckCircle2,
  Filter,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SessionHistory: React.FC = () => {
  const { data } = useApp();
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  if (!data) return null;

  const logs = data.focusLogs || [];

  const filteredLogs = logs.filter(log => {
    if (selectedSubjectFilter !== 'ALL' && log.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (selectedTypeFilter !== 'ALL' && log.type !== selectedTypeFilter) {
      return false;
    }
    return true;
  });

  const totalFocusMinutes = logs
    .filter(l => l.type === 'FOCUS' && l.completed)
    .reduce((acc, curr) => acc + curr.durationMinutes, 0);

  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const completedFocusSessions = logs.filter(l => l.type === 'FOCUS' && l.completed).length;

  const uniqueDates = new Set(logs.map(l => l.timestamp.split('T')[0]));
  const activeDaysCount = uniqueDates.size || 1;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-app-line pb-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-app-accent">
            <History className="w-3.5 h-3.5" />
            <span>SESSION ANALYTICS & LOG ARCHIVE</span>
          </div>
          <h2 className="text-xl font-bold text-app-ink mt-1 font-sans">Session History</h2>
          <p className="text-xs text-app-muted">
            Audit trail of completed study sessions, Pomodoro intervals, and focus discipline.
          </p>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-kopy p-4">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>TOTAL FOCUS TIME</span>
            <Clock className="w-4 h-4 text-app-accent" />
          </div>
          <div className="text-2xl font-bold text-app-ink font-mono mt-2">
            {totalFocusHours} <span className="text-xs font-normal text-app-muted">HOURS</span>
          </div>
          <div className="text-[11px] text-app-muted font-mono mt-1">
            {totalFocusMinutes} minutes logged
          </div>
        </div>

        <div className="card-kopy p-4">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>COMPLETED SPRINTS</span>
            <CheckCircle2 className="w-4 h-4 text-app-live" />
          </div>
          <div className="text-2xl font-bold text-app-ink font-mono mt-2">
            {completedFocusSessions}
          </div>
          <div className="text-[11px] text-app-muted font-mono mt-1">
            Verified study blocks completed
          </div>
        </div>

        <div className="card-kopy p-4">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>ACTIVE STUDY DAYS</span>
            <Calendar className="w-4 h-4 text-app-accent" />
          </div>
          <div className="text-2xl font-bold text-app-ink font-mono mt-2">
            {activeDaysCount} <span className="text-xs font-normal text-app-muted">DAYS</span>
          </div>
          <div className="text-[11px] text-app-muted font-mono mt-1">
            Recorded in local study logs
          </div>
        </div>

        <div className="card-kopy p-4">
          <div className="flex items-center justify-between text-xs font-mono text-app-muted">
            <span>SPRINT INTERVAL</span>
            <TrendingUp className="w-4 h-4 text-app-accent" />
          </div>
          <div className="text-2xl font-bold text-app-ink font-mono mt-2">
            {data.settings.focusDuration} <span className="text-xs font-normal text-app-muted">MINS</span>
          </div>
          <div className="text-[11px] text-app-muted font-mono mt-1">
            Standard high-retention interval
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="card-kopy p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-mono text-app-muted">
          <Filter className="w-3.5 h-3.5 text-app-accent" />
          <span>FILTER LOGS:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="input-kopy px-3 py-1.5 text-xs"
          >
            <option value="ALL">All Subjects</option>
            {data.subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code} – {s.name}</option>
            ))}
          </select>

          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="input-kopy px-3 py-1.5 text-xs"
          >
            <option value="ALL">All Types</option>
            <option value="FOCUS">Focus Sprints</option>
            <option value="SHORT_BREAK">Short Breaks</option>
            <option value="LONG_BREAK">Long Breaks</option>
          </select>
        </div>
      </div>

      {/* History Log Table */}
      <div className="card-kopy overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-app-muted">
            <Brain className="w-10 h-10 mx-auto text-app-muted/60 mb-2" />
            <p className="text-sm font-semibold text-app-ink">No session logs found</p>
            <p className="text-xs text-app-muted mt-1">
              Start a focus session from the Dashboard or Focus Mode to begin accumulating performance telemetry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-app-bg/60 border-b border-app-line font-mono text-[11px] text-app-muted">
                <tr>
                  <th className="py-3 px-4">TIMESTAMP</th>
                  <th className="py-3 px-4">TYPE</th>
                  <th className="py-3 px-4">SUBJECT</th>
                  <th className="py-3 px-4">TOPIC / SPRINT</th>
                  <th className="py-3 px-4">DURATION</th>
                  <th className="py-3 px-4 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-line font-sans">
                {filteredLogs.map((log) => {
                  const subject = data.subjects.find(s => s.id === log.subjectId);
                  const dateObj = new Date(log.timestamp);
                  const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-app-hover/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-app-ink">
                        <div>{formattedTime}</div>
                        <div className="text-[10px] text-app-muted">{formattedDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-full uppercase font-semibold ${
                            log.type === 'FOCUS'
                              ? 'bg-app-accent/15 text-app-accent border border-app-accent/30'
                              : 'bg-app-live/15 text-app-live border border-app-live/30'
                          }`}
                        >
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {subject ? (
                          <span
                            className="font-mono text-[10px] px-2 py-0.5 rounded-md font-bold"
                            style={{
                              backgroundColor: `${subject.color}20`,
                              color: subject.color,
                            }}
                          >
                            {subject.code}
                          </span>
                        ) : (
                          <span className="text-app-muted font-mono text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-app-ink">
                        {log.topicTitle || 'General Study Session'}
                      </td>
                      <td className="py-3 px-4 font-mono text-app-ink">
                        {log.durationMinutes} mins
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center space-x-1 text-app-live font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
