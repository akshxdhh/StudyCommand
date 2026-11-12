// Local Camera Engagement Monitor: Presence & Motion Detection on 32x24 Offscreen Canvas
// Zero storage, zero transmission, 100% local processing.

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
  private videoEl: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private prevFrameData: Uint8ClampedArray | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private lastMotionTimestamp: number = Date.now();
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
    this.videoEl = videoElement;
    this.onStateChange = onStateChange;
    this.setState('starting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err: CameraErrorDetails = {
        type: 'UNSUPPORTED',
        message: 'Webcam access is not supported on this device/runtime.',
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

      if (this.videoEl) {
        this.videoEl.srcObject = this.stream;
        await this.videoEl.play().catch(() => {});
      }

      this.lastMotionTimestamp = Date.now();
      this.prevFrameData = null;
      this.setState('active', 'Camera active & monitoring focus');
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

    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }

    this.prevFrameData = null;
    this.setState('idle');
  }

  private startMotionAnalysis(): void {
    if (this.intervalId) clearInterval(this.intervalId);

    // Analyze lightweight frame differences every 2.5 seconds
    this.intervalId = setInterval(() => {
      this.checkPresenceDifference();
    }, 2500);
  }

  private checkPresenceDifference(): void {
    if (!this.videoEl || !this.ctx || !this.canvas || !this.stream) return;
    if (this.videoEl.readyState < 2) return; // HAVE_CURRENT_DATA

    try {
      this.ctx.drawImage(this.videoEl, 0, 0, 32, 24);
      const imgData = this.ctx.getImageData(0, 0, 32, 24);
      const data = imgData.data;

      if (this.prevFrameData) {
        let diffScore = 0;
        const totalPixels = 32 * 24;

        // Sample grayscale differences across RGB components
        for (let i = 0; i < data.length; i += 4) {
          const rDiff = Math.abs(data[i] - this.prevFrameData[i]);
          const gDiff = Math.abs(data[i + 1] - this.prevFrameData[i + 1]);
          const bDiff = Math.abs(data[i + 2] - this.prevFrameData[i + 2]);
          diffScore += (rDiff + gDiff + bDiff) / 3;
        }

        const avgDiff = diffScore / totalPixels;

        // Micro-motions (eye, breathing, head adjustments) produce avgDiff >= 2.0
        if (avgDiff >= 2.0) {
          this.lastMotionTimestamp = Date.now();
          if (this.state !== 'active') {
            this.setState('active', 'Focus detected');
          }
        } else {
          // If no difference for over 50 seconds
          const idleSeconds = (Date.now() - this.lastMotionTimestamp) / 1000;
          if (idleSeconds > 50 && this.state !== 'away') {
            this.setState('away', 'No presence detected in frame');
          }
        }
      }

      this.prevFrameData = new Uint8ClampedArray(data);
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
