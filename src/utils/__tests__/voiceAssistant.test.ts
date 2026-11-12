import { describe, it, expect } from 'vitest';
import { VoiceAssistant, AssistantContext } from '../voiceAssistant';

describe('Offline Voice Assistant Query Parser', () => {
  const assistant = new VoiceAssistant();

  it('should recognize start focus commands', () => {
    const res = assistant.processQuery('Please start focus session now');
    expect(res.action).toBe('START_FOCUS');
    expect(res.response).toContain('Starting focus session');
  });

  it('should recognize pause, resume, reset, and finish timer commands', () => {
    expect(assistant.processQuery('pause the timer').action).toBe('PAUSE_TIMER');
    expect(assistant.processQuery('resume timer').action).toBe('RESUME_TIMER');
    expect(assistant.processQuery('reset the timer').action).toBe('RESET_TIMER');
    expect(assistant.processQuery('finish early').action).toBe('FINISH_EARLY');
  });

  it('should recognize prompt reading command', () => {
    const res = assistant.processQuery('read prompt notes');
    expect(res.action).toBe('READ_PROMPT');
  });

  it('should answer upcoming exam queries using injected context', () => {
    const contextWithExam: AssistantContext = {
      nextExam: 'CST305 Compiler Design on 27 Nov',
      language: 'en',
    };
    const res = assistant.processQuery('When is my next exam?', contextWithExam);
    expect(res.action).toBe('EXAM_CHECK');
    expect(res.response).toContain('CST305 Compiler Design on 27 Nov');

    const contextWithoutExam: AssistantContext = {
      nextExam: null,
      language: 'en',
    };
    const resNoExam = assistant.processQuery('When is my upcoming exam?', contextWithoutExam);
    expect(resNoExam.action).toBe('EXAM_CHECK');
    expect(resNoExam.response).toContain('No upcoming exam');
  });

  it('should answer schedule queries using timetable context', () => {
    const contextWithSlot: AssistantContext = {
      nextSlot: 'Algorithms at 14:00',
      language: 'en',
    };
    const res = assistant.processQuery('What is next on my schedule?', contextWithSlot);
    expect(res.action).toBe('SCHEDULE_CHECK');
    expect(res.response).toContain('Algorithms at 14:00');
  });

  it('should fallback gracefully on unhandled questions', () => {
    const res = assistant.processQuery('What is the weather outside?');
    expect(res.action).toBe('GENERAL_QUERY');
    expect(res.response).toContain('You can say');
  });
});
