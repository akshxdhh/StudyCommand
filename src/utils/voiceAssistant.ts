// Offline AI Voice Assistant Engine using Web Speech API (STT & TTS) + Context Awareness

export type VoiceCommandAction =
  | 'START_FOCUS'
  | 'PAUSE_TIMER'
  | 'RESUME_TIMER'
  | 'RESET_TIMER'
  | 'FINISH_EARLY'
  | 'READ_PROMPT'
  | 'NAV_DASHBOARD'
  | 'NAV_PLANNER'
  | 'NAV_TIMETABLE'
  | 'NAV_ANALYTICS'
  | 'NAV_SETTINGS'
  | 'EXAM_CHECK'
  | 'SCHEDULE_CHECK'
  | 'TOPIC_EXPLAIN'
  | 'TIME_CHECK'
  | 'GENERAL_QUERY';

export interface VoiceCommandMatch {
  action: VoiceCommandAction;
  rawText: string;
  response: string;
}

export interface AssistantContext {
  currentSubject?: string;
  currentTopic?: string;
  timeLeft?: string;
  nextExam?: string;
  nextSlot?: string;
  language?: string;
}

export class VoiceAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private context: AssistantContext = {};
  private onCommandCallback: ((cmd: VoiceCommandMatch) => void) | null = null;
  private onStatusChangeCallback: ((status: { isListening: boolean; isSpeaking: boolean; transcript: string; error?: string }) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  public setContext(ctx: AssistantContext) {
    this.context = { ...this.context, ...ctx };
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = this.context.language === 'es' ? 'es-ES' : this.context.language === 'ml' ? 'ml-IN' : this.context.language === 'hi' ? 'hi-IN' : 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyStatus('');
        };

        this.recognition.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const transcript = event.results[lastIndex][0].transcript.trim();
          this.handleTranscript(transcript);
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Voice Assistant Error:', event.error);
          this.isListening = false;
          this.notifyStatus('', event.error);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notifyStatus('');
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      window.speechSynthesis
    );
  }

  public startListening(onCommand: (cmd: VoiceCommandMatch) => void, onStatusChange: (status: any) => void) {
    this.onCommandCallback = onCommand;
    this.onStatusChangeCallback = onStatusChange;

    if (!this.recognition) {
      this.initRecognition();
    }

    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        this.notifyStatus('Listening for voice commands...');
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
      this.notifyStatus('Voice Assistant idle');
    }
  }

  public toggle(onCommand: (cmd: VoiceCommandMatch) => void, onStatusChange: (status: any) => void) {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening(onCommand, onStatusChange);
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Locale mapping
      if (this.context.language === 'es') utterance.lang = 'es-ES';
      else if (this.context.language === 'ml') utterance.lang = 'ml-IN';
      else if (this.context.language === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-US';

      this.isSpeaking = true;
      this.notifyStatus(text);

      utterance.onend = () => {
        this.isSpeaking = false;
        this.notifyStatus('');
        onEnd?.();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        this.notifyStatus('');
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('SpeechSynthesis error:', err);
      this.isSpeaking = false;
    }
  }

  public processQuery(input: string, customContext?: AssistantContext): VoiceCommandMatch {
    const ctx = { ...this.context, ...(customContext || {}) };
    const lower = input.toLowerCase();

    let match: VoiceCommandMatch;

    if (lower.includes('start focus') || lower.includes('start study') || lower.includes('start session')) {
      match = { action: 'START_FOCUS', rawText: input, response: 'Starting focus session now.' };
    } else if (lower.includes('pause timer') || lower.includes('pause')) {
      match = { action: 'PAUSE_TIMER', rawText: input, response: 'Timer paused.' };
    } else if (lower.includes('resume timer') || lower.includes('resume')) {
      match = { action: 'RESUME_TIMER', rawText: input, response: 'Resuming focus timer.' };
    } else if (lower.includes('reset timer') || lower.includes('reset')) {
      match = { action: 'RESET_TIMER', rawText: input, response: 'Timer reset to initial duration.' };
    } else if (lower.includes('finish early') || lower.includes('finish session') || lower.includes('complete session')) {
      match = { action: 'FINISH_EARLY', rawText: input, response: 'Completing session.' };
    } else if (lower.includes('read prompt') || lower.includes('read notes') || lower.includes('read study prompt')) {
      match = { action: 'READ_PROMPT', rawText: input, response: 'Reading your exam study prompt.' };
    } else if (lower.includes('next exam') || lower.includes('when is my exam') || lower.includes('upcoming exam')) {
      const resp = ctx.nextExam ? `Your upcoming examination is ${ctx.nextExam}.` : 'No upcoming exam dates are currently configured.';
      match = { action: 'EXAM_CHECK', rawText: input, response: resp };
    } else if (lower.includes('next on my schedule') || lower.includes('next session') || lower.includes('what is next') || lower.includes('schedule')) {
      const resp = ctx.nextSlot ? `Next on your schedule is ${ctx.nextSlot}.` : 'No further study sessions scheduled for today.';
      match = { action: 'SCHEDULE_CHECK', rawText: input, response: resp };
    } else if (lower.includes('explain') || lower.includes('what am i studying') || lower.includes('current topic')) {
      const topic = ctx.currentTopic || 'your selected focus topic';
      const subj = ctx.currentSubject ? `in ${ctx.currentSubject}` : '';
      match = {
        action: 'TOPIC_EXPLAIN',
        rawText: input,
        response: `Studying ${topic} ${subj}. Focus on core definitions, exam patterns, and key formulas.`,
      };
    } else if (lower.includes('time left') || lower.includes('how much time') || lower.includes('remaining time')) {
      const resp = ctx.timeLeft ? `There are ${ctx.timeLeft} remaining in this session.` : 'Timer is currently idle.';
      match = { action: 'TIME_CHECK', rawText: input, response: resp };
    } else if (lower.includes('dashboard') || lower.includes('home')) {
      match = { action: 'NAV_DASHBOARD', rawText: input, response: 'Opening Dashboard.' };
    } else if (lower.includes('planner') || lower.includes('syllabus')) {
      match = { action: 'NAV_PLANNER', rawText: input, response: 'Opening Study Planner.' };
    } else if (lower.includes('timetable') || lower.includes('routine')) {
      match = { action: 'NAV_TIMETABLE', rawText: input, response: 'Opening Timetable.' };
    } else if (lower.includes('analytics') || lower.includes('stats') || lower.includes('history')) {
      match = { action: 'NAV_ANALYTICS', rawText: input, response: 'Opening Analytics & History.' };
    } else if (lower.includes('settings')) {
      match = { action: 'NAV_SETTINGS', rawText: input, response: 'Opening Settings.' };
    } else {
      match = {
        action: 'GENERAL_QUERY',
        rawText: input,
        response: `Command recognized: "${input}". You can say "start focus", "next exam", "time left", or navigate pages.`,
      };
    }

    this.speak(match.response);
    return match;
  }

  private handleTranscript(transcript: string) {
    this.notifyStatus(transcript);
    const match = this.processQuery(transcript);
    this.onCommandCallback?.(match);
  }

  private notifyStatus(transcript: string, error?: string) {
    this.onStatusChangeCallback?.({
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      transcript,
      error,
    });
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const voiceAssistant = new VoiceAssistant();
