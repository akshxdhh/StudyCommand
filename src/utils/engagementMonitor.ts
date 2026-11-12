// Local Camera Engagement Monitor: Dual-Signal (Motion + Center ROI Skin/Silhouette) Detection on 32x24 Canvas
// 100% offline, zero storage, zero network transmission.

export type CameraErrorType =
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'IN_USE'
  | 'UNSUPPORTED'
  | 'UNKNOWN';

export interface CameraErrorDetails {
  type: CameraErrorType;
  message: string;
}

export type EngagementState = 'idle' | 'starting' | 'active' | 'away' | 'error';

export class EngagementMonitor {
  private stream: MediaStream | null = null;
  private internalVideoEl: HTMLVideoElement | null = null;
  private externalVideoEl: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private intervalId: any = null;
  private lastPresenceTimestamp: number = 0;
  private consecutivePresentFrames: number = 0;
  private consecutiveAwayFrames: number = 0;
  private state: EngagementState = 'idle';
  private onStateChange: ((state: EngagementState, msg?: string) => void) | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.width = 32;
      this.canvas.height = 24;
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    }
  }

  public async start(
    videoElement: HTMLVideoElement | null,
    onStateChange: (state: EngagementState, msg?: string) => void
  ): Promise<{ success: boolean; error?: CameraErrorDetails }> {
    this.externalVideoEl = videoElement;
    this.onStateChange = onStateChange;
    this.setState('starting', 'Calibrating camera & scanning for presence...');
    this.consecutivePresentFrames = 0;
    this.consecutiveAwayFrames = 0;
    this.lastPresenceTimestamp = Date.now();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err: CameraErrorDetails = {
        type: 'UNSUPPORTED',
        message: 'Camera access is not supported on this platform/runtime.',
      };
      this.setState('error', err.message);
      return { success: false, error: err };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 160 },
          height: { ideal: 120 },
          frameRate: { ideal: 10, max: 15 },
        },
        audio: false,
      });

      // Ensure internal rendered video element exists and is playing
      if (typeof document !== 'undefined' && !this.internalVideoEl) {
        this.internalVideoEl = document.createElement('video');
        this.internalVideoEl.playsInline = true;
        this.internalVideoEl.muted = true;
        this.internalVideoEl.style.position = 'fixed';
        this.internalVideoEl.style.top = '-9999px';
        this.internalVideoEl.style.left = '-9999px';
        this.internalVideoEl.style.width = '160px';
        this.internalVideoEl.style.height = '120px';
        this.internalVideoEl.style.opacity = '0';
        this.internalVideoEl.style.pointerEvents = 'none';
        document.body.appendChild(this.internalVideoEl);
      }

      if (this.internalVideoEl) {
        this.internalVideoEl.srcObject = this.stream;
        await this.internalVideoEl.play().catch(() => {});
      }

      if (this.externalVideoEl) {
        this.externalVideoEl.srcObject = this.stream;
        await this.externalVideoEl.play().catch(() => {});
      }

      this.prevFrameData = null;
      this.startMotionAnalysis();
      return { success: true };
    } catch (err: any) {
      const errorDetails = this.classifyError(err);
      this.setState('error', errorDetails.message);
      this.stop();
      return { success: false, error: errorDetails };
    }
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      this.stream = null;
    }

    if (this.internalVideoEl) {
      this.internalVideoEl.srcObject = null;
      try {
        if (this.internalVideoEl.parentNode) {
          this.internalVideoEl.parentNode.removeChild(this.internalVideoEl);
        }
      } catch {}
      this.internalVideoEl = null;
    }

    if (this.externalVideoEl) {
      this.externalVideoEl.srcObject = null;
    }

    this.prevFrameData = null;
    this.consecutivePresentFrames = 0;
    this.consecutiveAwayFrames = 0;
    this.setState('idle');
  }

  private startMotionAnalysis(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    // Sample video frame every 1.0 second for responsive presence detection
    this.intervalId = setInterval(() => {
      this.checkPresenceDifference();
    }, 1000);
  }

  private checkPresenceDifference(): void {
    const video = this.internalVideoEl || this.externalVideoEl;
    if (!video || !this.ctx || !this.canvas || !this.stream) return;
    if (video.readyState < 2) return; // HAVE_CURRENT_DATA

    try {
      this.ctx.drawImage(video, 0, 0, 32, 24);
      const imgData = this.ctx.getImageData(0, 0, 32, 24);
      const data = imgData.data;

      // 1. Detect Human Skin Chrominance in Center ROI (x: 4..27, y: 3..20)
      let skinPixelCount = 0;
      let centerTotal = 0;

      for (let y = 3; y < 21; y++) {
        for (let x = 4; x < 28; x++) {
          const idx = (y * 32 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          centerTotal++;

          // Human skin chromatic distribution in typical room lighting
          const isSkin =
            r > 42 &&
            g > 32 &&
            b > 20 &&
            r >= g &&
            g >= b &&
            r - g >= 8 &&
            r - b >= 10;

          if (isSkin) {
            skinPixelCount++;
          }
        }
      }

      const skinRatio = skinPixelCount / (centerTotal || 1);

      // 2. Optical Flow / Inter-Frame Motion Differential
      let avgMotionDiff = 0;
      if (this.prevFrameData) {
        let totalDiff = 0;
        for (let i = 0; i < data.length; i += 4) {
          const rDiff = Math.abs(data[i] - this.prevFrameData[i]);
          const gDiff = Math.abs(data[i + 1] - this.prevFrameData[i + 1]);
          const bDiff = Math.abs(data[i + 2] - this.prevFrameData[i + 2]);
          totalDiff += (rDiff + gDiff + bDiff) / 3;
        }
        avgMotionDiff = totalDiff / (32 * 24);
      }
      this.prevFrameData = new Uint8ClampedArray(data);

      // 3. Human Presence Evaluation
      // A person is present if center face/skin tones are detected (skinRatio >= 0.03)
      // OR natural micro-motion/movement is ongoing (avgMotionDiff >= 1.0)
      const hasPresence = skinRatio >= 0.03 || avgMotionDiff >= 1.1;

      if (hasPresence) {
        this.consecutivePresentFrames++;
        this.consecutiveAwayFrames = 0;
        this.lastPresenceTimestamp = Date.now();

        if (this.consecutivePresentFrames >= 2 && this.state !== 'active') {
          this.setState('active', 'Human presence engaged & detected in frame');
        }
      } else {
        this.consecutiveAwayFrames++;
        this.consecutivePresentFrames = 0;

        const secondsAway = (Date.now() - this.lastPresenceTimestamp) / 1000;
        if ((secondsAway >= 6 || this.consecutiveAwayFrames >= 5) && this.state !== 'away') {
          this.setState('away', 'No human presence detected in frame');
        }
      }
    } catch {
      // Ignore transient frame grab errors
    }
  }

  private classifyError(err: any): CameraErrorDetails {
    const name = err?.name || '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return {
        type: 'PERMISSION_DENIED',
        message: 'Camera permission denied. Please allow camera in Windows Privacy Settings.',
      };
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return {
        type: 'NOT_FOUND',
        message: 'No camera hardware found on this computer.',
      };
    }
    if (name === 'NotReadableError' || name === 'TrackStartError') {
      return {
        type: 'IN_USE',
        message: 'Camera is currently in use by another application (e.g. Zoom, Teams).',
      };
    }
    if (name === 'OverconstrainedError') {
      return {
        type: 'UNSUPPORTED',
        message: 'Requested camera resolution is not supported by this device.',
      };
    }
    return {
      type: 'UNKNOWN',
      message: err?.message || 'Unable to access camera device.',
    };
  }

  private setState(state: EngagementState, msg?: string): void {
    this.state = state;
    this.onStateChange?.(state, msg);
  }

  public getState(): EngagementState {
    return this.state;
  }
}

export const engagementMonitor = new EngagementMonitor();
