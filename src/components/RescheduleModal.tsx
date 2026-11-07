import React, { useState } from 'react';
import { X, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DailySessionRecord } from '../types';
import { isTimeInSleepRange, formatTime24to12 } from '../utils/time';

interface RescheduleModalProps {
  session: DailySessionRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (recordId: string, newStartTime: string, newEndTime: string) => Promise<void>;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  session,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !session) return null;

  // Pre-fill with a reasonable time
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  const initialStart = `${String(nextHour).padStart(2, '0')}:00`;
  const initialEnd = `${String(nextHour).padStart(2, '0')}:30`;

  const [startTime, setStartTime] = useState<string>(initialStart);
  const [endTime, setEndTime] = useState<string>(initialEnd);
  const [loading, setLoading] = useState<boolean>(false);

  const handleStartChange = (val: string) => {
    setStartTime(val);
    // Auto-calculate +30 minutes
    if (val.includes(':')) {
      const [h, m] = val.split(':').map(Number);
      const total = h * 60 + m + 30;
      const endH = Math.floor(total / 60) % 24;
      const endM = total % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  };

  const isSleepConflict = isTimeInSleepRange(startTime) || isTimeInSleepRange(endTime);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(session.id, startTime, endTime);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const quickSlots = [
    { label: 'In 15 Mins', time: () => {
      const d = new Date(Date.now() + 15 * 60000);
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }},
    { label: 'Tonight 8:30 PM', time: () => '20:30' },
    { label: 'Tonight 9:30 PM', time: () => '21:30' },
    { label: 'Tonight 10:00 PM', time: () => '22:00' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0f141f] border border-cyan-500/30 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#080a0f]">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100 font-mono">
              RESCHEDULE SESSION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-[#141b2a] border border-slate-800">
            <div className="text-xs text-slate-400">Target Session</div>
            <div className="text-sm font-semibold text-slate-100 mt-0.5">
              {session.label} – {session.topicTitle || 'Study Session'}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono">
              Original slot: {formatTime24to12(session.startTime)} – {formatTime24to12(session.endTime)}
            </div>
          </div>

          {/* Quick slot shortcuts */}
          <div>
            <label className="text-xs font-mono text-slate-400 block mb-1.5">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickSlots.map((qs, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStartChange(qs.time())}
                  className="px-2.5 py-1.5 text-xs rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 transition-colors text-left"
                >
                  {qs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                New Start Time (24h)
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => handleStartChange(e.target.value)}
                required
                className="w-full bg-[#080a0f] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {formatTime24to12(startTime)}
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1">
                New End Time (24h)
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-[#080a0f] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                {formatTime24to12(endTime)}
              </span>
            </div>
          </div>

          {/* Sleep hours conflict warning */}
          {isSleepConflict && (
            <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold">Sleep Window Warning:</span> This slot falls within your 12:30 AM – 10:00 AM rest window. Consistent rest is critical for exam retention.
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-glow-cyan transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{loading ? 'Rescheduling...' : 'Confirm Reschedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
