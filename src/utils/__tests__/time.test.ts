import { describe, it, expect } from 'vitest';
import {
  formatSecondsToTimer,
  formatTime24to12,
  getGreeting,
  calculateExamCountdown
} from '../time';

describe('time utilities unit tests', () => {
  it('formats seconds to MM:SS string correctly', () => {
    expect(formatSecondsToTimer(0)).toBe('00:00');
    expect(formatSecondsToTimer(30)).toBe('00:30');
    expect(formatSecondsToTimer(60)).toBe('01:00');
    expect(formatSecondsToTimer(1500)).toBe('25:00');
    expect(formatSecondsToTimer(1800)).toBe('30:00');
    expect(formatSecondsToTimer(3665)).toBe('61:05');
  });

  it('formats 24-hour time string to 12-hour AM/PM correctly', () => {
    expect(formatTime24to12('00:00')).toBe('12:00 AM');
    expect(formatTime24to12('10:30')).toBe('10:30 AM');
    expect(formatTime24to12('12:00')).toBe('12:00 PM');
    expect(formatTime24to12('14:30')).toBe('2:30 PM');
    expect(formatTime24to12('21:00')).toBe('9:00 PM');
    expect(formatTime24to12('23:59')).toBe('11:59 PM');
  });

  it('returns appropriate greetings based on hour of day', () => {
    const morningDate = new Date('2026-11-08T09:00:00');
    expect(getGreeting(morningDate)).toBe('Good morning');

    const afternoonDate = new Date('2026-11-08T14:00:00');
    expect(getGreeting(afternoonDate)).toBe('Good afternoon');

    const eveningDate = new Date('2026-11-08T19:00:00');
    expect(getGreeting(eveningDate)).toBe('Good evening');

    const nightDate = new Date('2026-11-08T23:30:00');
    expect(getGreeting(nightDate)).toBe('Late night shift');
  });

  it('calculates countdown accurately to future exam dates', () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString();
    const countdown = calculateExamCountdown(futureDate);
    expect(countdown.isPast).toBe(false);
    expect(countdown.days).toBeGreaterThanOrEqual(4);
    expect(countdown.days).toBeLessThanOrEqual(6);
  });
});
