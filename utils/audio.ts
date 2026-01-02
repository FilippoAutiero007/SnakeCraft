
// Simple Web Audio API Synthesizer for Retro SFX
// No external assets required.

class AudioController {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = false;

  constructor() {
    try {
      // @ts-ignore - Handle browser differences
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3; // Default volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  // Must be called after a user interaction (click/tap)
  async init() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.enabled = true;
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol: number = 1) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playNoise(duration: number) {
    if (!this.ctx || !this.masterGain || !this.enabled) return;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 1000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }

  // --- SFX PRESETS ---

  playSound(name: 'MOVE' | 'BREAK' | 'EAT' | 'DAMAGE' | 'POWERUP' | 'BOSS_HIT' | 'LASER') {
    switch (name) {
      case 'MOVE':
        // Very subtle click
        // this.playTone(100, 'triangle', 0.05, 0.05); // Optional: Can be annoying if too loud
        break;
      case 'EAT':
        this.playTone(600, 'sine', 0.1, 0.5);
        setTimeout(() => this.playTone(800, 'sine', 0.1, 0.5), 50);
        break;
      case 'BREAK':
        this.playNoise(0.1);
        this.playTone(100, 'square', 0.1, 0.4);
        break;
      case 'DAMAGE':
        this.playTone(150, 'sawtooth', 0.3, 0.8);
        this.playTone(100, 'sawtooth', 0.3, 0.8);
        break;
      case 'POWERUP':
        this.playTone(400, 'sine', 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.1), 100);
        setTimeout(() => this.playTone(1000, 'sine', 0.2), 200);
        break;
      case 'BOSS_HIT':
        this.playNoise(0.2);
        this.playTone(50, 'sawtooth', 0.4, 0.8);
        break;
      case 'LASER':
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
        break;
    }
  }
}

export const audio = new AudioController();
