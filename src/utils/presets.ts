import { SessionPreset } from '../types';

export const BUILT_IN_PRESETS: SessionPreset[] = [
  { id: 'preset-pomodoro', name: 'Pomodoro (25/5)', focusMinutes: 25, breakMinutes: 5 },
  { id: 'preset-sprint', name: 'Sprint (30/5)', focusMinutes: 30, breakMinutes: 5 },
  { id: 'preset-lecture', name: 'Lecture Block (45/10)', focusMinutes: 45, breakMinutes: 10 },
  { id: 'preset-deep', name: 'Extended Focus (50/10)', focusMinutes: 50, breakMinutes: 10 },
  { id: 'preset-ultradeep', name: 'Deep Work (60/15)', focusMinutes: 60, breakMinutes: 15 },
  { id: 'preset-custom', name: 'Custom Preset', focusMinutes: 30, breakMinutes: 5, isCustom: true },
];

export function getPresetById(presets: SessionPreset[] | undefined, id: string): SessionPreset {
  const list = presets && presets.length > 0 ? presets : BUILT_IN_PRESETS;
  return list.find((p) => p.id === id) || list[0];
}

export function formatPresetLabel(preset: SessionPreset): string {
  return `${preset.focusMinutes}m / ${preset.breakMinutes}m`;
}
