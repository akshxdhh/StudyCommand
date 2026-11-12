// Web Audio API Ambient Soundscape Generator (100% Offline, Pure Synthesized Audio)

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: string = 'none';
  private nodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public stop() {
    for (const node of this.nodes) {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          (node as any).stop?.();
          node.disconnect();
        } catch {}
      }
    }
    this.nodes = [];
    this.currentType = 'none';
  }

  public play(type: 'none' | 'whitenoise' | 'rain' | 'binaural', volume: number = 0.25) {
    this.stop();
    if (type === 'none') return;
    this.initContext();
    if (!this.ctx) return;

    this.currentType = type;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    masterGain.connect(this.ctx.destination);
    this.nodes.push(masterGain);

    if (type === 'whitenoise') {
      this.createWhiteNoise(masterGain);
    } else if (type === 'rain') {
      this.createRainSound(masterGain);
    } else if (type === 'binaural') {
      this.createBinauralBeat(masterGain);
    }
  }

  private createWhiteNoise(output: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to pink/brown noise for comfortable listening
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(output);
    noise.start();
    this.nodes.push(noise, filter);
  }

  private createRainSound(output: GainNode) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // boost rain body
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(output);
    noise.start();
    this.nodes.push(noise, filter);
  }

  private createBinauralBeat(output: GainNode) {
    if (!this.ctx) return;
    // Base 200 Hz carrier, left 200 Hz, right 240 Hz = 40 Hz Gamma Focus Wave
    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscR.type = 'sine';
    oscL.frequency.setValueAtTime(200, this.ctx.currentTime);
    oscR.frequency.setValueAtTime(240, this.ctx.currentTime);

    const merger = this.ctx.createChannelMerger(2);
    oscL.connect(merger, 0, 0);
    oscR.connect(merger, 0, 1);

    merger.connect(output);
    oscL.start();
    oscR.start();
    this.nodes.push(oscL, oscR, merger);
  }

  public getCurrentType(): string {
    return this.currentType;
  }
}

export const soundscapeEngine = new SoundscapeEngine();
