import { describe, it, expect } from 'vitest';
import { BUILT_IN_PRESETS, getPresetById, formatPresetLabel } from '../presets';

describe('Study & Break Session Presets', () => {
  it('should include all required study rhythm presets', () => {
    expect(BUILT_IN_PRESETS.length).toBeGreaterThanOrEqual(6);
    const ids = BUILT_IN_PRESETS.map((p) => p.id);
    expect(ids).toContain('preset-pomodoro');
    expect(ids).toContain('preset-sprint');
    expect(ids).toContain('preset-lecture');
    expect(ids).toContain('preset-deep');
    expect(ids).toContain('preset-ultradeep');
    expect(ids).toContain('preset-custom');
  });

  it('should verify correct focus and break intervals for each preset', () => {
    const pomodoro = getPresetById(BUILT_IN_PRESETS, 'preset-pomodoro');
    expect(pomodoro.focusMinutes).toBe(25);
    expect(pomodoro.breakMinutes).toBe(5);

    const sprint = getPresetById(BUILT_IN_PRESETS, 'preset-sprint');
    expect(sprint.focusMinutes).toBe(30);
    expect(sprint.breakMinutes).toBe(5);

    const lecture = getPresetById(BUILT_IN_PRESETS, 'preset-lecture');
    expect(lecture.focusMinutes).toBe(45);
    expect(lecture.breakMinutes).toBe(10);

    const deep = getPresetById(BUILT_IN_PRESETS, 'preset-deep');
    expect(deep.focusMinutes).toBe(50);
    expect(deep.breakMinutes).toBe(10);

    const ultra = getPresetById(BUILT_IN_PRESETS, 'preset-ultradeep');
    expect(ultra.focusMinutes).toBe(60);
    expect(ultra.breakMinutes).toBe(15);
  });

  it('should format preset labels clearly', () => {
    const pomodoro = getPresetById(BUILT_IN_PRESETS, 'preset-pomodoro');
    expect(formatPresetLabel(pomodoro)).toBe('25m / 5m');
  });

  it('should safely fall back to default preset if id is invalid', () => {
    const fallback = getPresetById(BUILT_IN_PRESETS, 'invalid-id-xyz');
    expect(fallback.id).toBe('preset-pomodoro');
  });
});
