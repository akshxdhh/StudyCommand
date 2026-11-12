// Offline AI Voice Assistant Engine using Web Speech API (STT & TTS)

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
  | 'TIME_CHECK';

export interface VoiceCommandMatch {
  action: VoiceCommandAction;
  rawText: string;
  response: string;
}

export class VoiceAssistant {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private onCommandCallback: ((cmd: VoiceCommandMatch) => void) | null = null;
  private onStatusChangeCallback: ((status: { isListening: boolean; isSpeaking: boolean; transcript: string; error?: string }) => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

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
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

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

  private handleTranscript(transcript: string) {
    const lower = transcript.toLowerCase();
    this.notifyStatus(transcript);

    let match: VoiceCommandMatch | null = null;

    if (lower.includes('start focus') || lower.includes('start study') || lower.includes('start session')) {
      match = { action: 'START_FOCUS', rawText: transcript, response: 'Starting focus session now.' };
    } else if (lower.includes('pause timer') || lower.includes('pause')) {
      match = { action: 'PAUSE_TIMER', rawText: transcript, response: 'Timer paused.' };
    } else if (lower.includes('resume timer') || lower.includes('resume')) {
      match = { action: 'RESUME_TIMER', rawText: transcript, response: 'Resuming focus timer.' };
    } else if (lower.includes('reset timer') || lower.includes('reset')) {
      match = { action: 'RESET_TIMER', rawText: transcript, response: 'Timer reset to initial duration.' };
    } else if (lower.includes('finish early') || lower.includes('finish session') || lower.includes('complete session')) {
      match = { action: 'FINISH_EARLY', rawText: transcript, response: 'Completing session.' };
    } else if (lower.includes('read prompt') || lower.includes('read notes') || lower.includes('read study prompt')) {
      match = { action: 'READ_PROMPT', rawText: transcript, response: 'Reading your exam study prompt.' };
    } else if (lower.includes('time left') || lower.includes('how much time') || lower.includes('remaining time')) {
      match = { action: 'TIME_CHECK', rawText: transcript, response: 'Checking remaining time.' };
    } else if (lower.includes('dashboard') || lower.includes('home')) {
      match = { action: 'NAV_DASHBOARD', rawText: transcript, response: 'Opening Dashboard.' };
    } else if (lower.includes('planner') || lower.includes('syllabus')) {
      match = { action: 'NAV_PLANNER', rawText: transcript, response: 'Opening Study Planner.' };
    } else if (lower.includes('timetable') || lower.includes('schedule')) {
      match = { action: 'NAV_TIMETABLE', rawText: transcript, response: 'Opening Timetable.' };
    } else if (lower.includes('analytics') || lower.includes('stats')) {
      match = { action: 'NAV_ANALYTICS', rawText: transcript, response: 'Opening Analytics.' };
    } else if (lower.includes('settings')) {
      match = { action: 'NAV_SETTINGS', rawText: transcript, response: 'Opening Settings.' };
    }

    if (match) {
      this.speak(match.response);
      this.onCommandCallback?.(match);
    }
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
