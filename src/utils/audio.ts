// Web Audio API Synthesizer and Game FX Engine (Glitch Version)
import { Track } from '../types';

export const DUMMY_TRACKS: Track[] = [
  {
    id: 'cyberpunk',
    title: 'SYS://KERN_OVERDRIVE_0x00F',
    artist: 'COGNITIVE_CORE_01',
    genre: 'INDUSTRIAL_GLITCH',
    duration: 120,
    bpm: 135,
    description: 'MACHINE_STATE: HEAVY DRIVING SYNTH BASS. RANDOMIZED REGISTER CHIP SOUNDS ACTIVATED.',
    color: 'pink-500',
    glowColor: '#ff007f', // Magenta/Pink
  },
  {
    id: 'retro-dreamwave',
    title: 'INIT://BUFFER_OVERFLOW.SYS',
    artist: 'DECAYING_SECTOR_7',
    genre: 'CHROMATIC_DECAY',
    duration: 154,
    bpm: 110,
    description: 'MACHINE_STATE: CHROMATIC WAVE DECAY. CHROMOTRONIC ARPEGGIATORS DETUNED BY +14 CENTS.',
    color: 'cyan-400',
    glowColor: '#00f0ff', // Vivid Cyan
  },
  {
    id: 'lofi-chill',
    title: 'HALT://MEMORY_LEAK_CORRUPT',
    artist: 'STALE_PROCESS_X',
    genre: 'VAPOR_NOISE',
    duration: 180,
    bpm: 90,
    description: 'MACHINE_STATE: SLOW STATIC WAVEFORMS. MODULATED VOLTAGE DRIFTS UNDER SYSTEM COMPRESSION.',
    color: 'yellow-400',
    glowColor: '#eab308', // Machine Amber/Yellow
  },
];

class AudioEngine {
  public ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private isPlaying: boolean = false;
  private currentTrack: Track = DUMMY_TRACKS[0];
  private currentStep: number = 0;
  private nextNoteTime: number = 0.0;
  private schedulerIntervalId: any = null;
  private onTimeUpdate: ((seconds: number) => void) | null = null;
  private elapsedTime: number = 0;
  private elapsedSecondsIntervalId: any = null;

  // Sound effects Volume and Node
  private fxGain: GainNode | null = null;

  constructor() {
    // Initial construction
  }

  private initCtx() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.32, this.ctx.currentTime); // Standardized clear output

    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 64; // Low size for ultra sharp visual representation

    // FX gain node
    this.fxGain = this.ctx.createGain();
    this.fxGain.gain.setValueAtTime(0.45, this.ctx.currentTime);

    // Route audio: Source -> masterGain -> analyser -> destination
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    
    // Connect fxGain directly to destination
    this.fxGain.connect(this.ctx.destination);
  }

  public getAnalyser(): AnalyserNode | null {
    this.initCtx();
    return this.analyser;
  }

  public setVolume(val: number) {
    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        Math.max(0.0001, val), 
        this.ctx.currentTime
      );
    }
  }

  // Chiptune coin collected with bit reduction timbre
  public triggerAppleFX() {
    this.initCtx();
    if (!this.ctx || !this.fxGain) return;
    
    const t = this.ctx.currentTime;
    
    // Dual square wave pulses to simulate old-school NES register glitches
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(987.77, t); // B5 register
    osc1.frequency.setValueAtTime(1567.98, t + 0.06); // G6 register
    
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(990.0, t);
    osc2.frequency.exponentialRampToValueAtTime(1600.0, t + 0.12);

    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    
    osc1.connect(gain1);
    osc2.connect(gain1);
    gain1.connect(this.fxGain);
    
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.18);
    osc2.stop(t + 0.18);
  }

  // Harsh crash glitch out synthesizer response
  public triggerCrashFX() {
    this.initCtx();
    if (!this.ctx || !this.fxGain) return;

    const t = this.ctx.currentTime;
    
    // Low rumble with random white noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.setValueAtTime(60, t + 0.1);
    osc.frequency.linearRampToValueAtTime(10, t + 0.5);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.Q.value = 15;

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.fxGain);
    
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // Synthesize detuned glitch waveforms
  private playSequenceNote(frequency: number, type: 'sawtooth' | 'triangle' | 'square', duration: number, time: number, level: number = 0.1) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Detuned sawtooth / square logic
    osc.type = type;
    // Add artificial detune for rusty, analog machine feel
    osc.frequency.setValueAtTime(frequency * 0.992, time); 
    osc.frequency.linearRampToValueAtTime(frequency * 1.008, time + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency * 1.8, time);
    filter.frequency.exponentialRampToValueAtTime(frequency * 0.9, time + duration);
    filter.Q.setValueAtTime(5.0, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(level, time + 0.012);
    gain.gain.setValueAtTime(level, time + duration - 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  // Machine static background noise
  private playBeatTick(time: number, isSnare: boolean = false) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    // Square or sawtooth to simulate extreme bitcrushed hardware hit
    osc.type = isSnare ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(isSnare ? 120 : 12000, time);
    if (isSnare) {
      osc.frequency.setValueAtTime(600, time);
      osc.frequency.exponentialRampToValueAtTime(30, time + 0.07);
    }
    
    gain.gain.setValueAtTime(isSnare ? 0.09 : 0.03, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + (isSnare ? 0.08 : 0.025));
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(time);
    osc.stop(time + 0.1);
  }

  private scheduleNotes() {
    if (!this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.triggerStep(this.currentStep, this.nextNoteTime);
      const stepDuration = 60.0 / this.currentTrack.bpm / 4.0; 
      this.nextNoteTime += stepDuration;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  private triggerStep(step: number, time: number) {
    if (this.currentTrack.id === 'cyberpunk') {
      // Industrial Overdrive scale (E1, B1, G1)
      const bassNotes = [41.20, 41.20, 82.41, 82.41, 48.99, 48.99, 98.00, 98.00]; 
      const bassFreq = bassNotes[Math.floor(step / 2) % bassNotes.length];
      this.playSequenceNote(bassFreq, 'sawtooth', 0.08, time, 0.12);

      // Raw chromatic arpeggiator (Dissonant / Hardcore synth)
      const melodyPattern = [
        164.81, 0, 196.00, 220.00, 
        246.94, 277.18, 220.00, 0, 
        329.63, 311.13, 293.66, 0, 
        220.00, 196.00, 164.81, 329.63
      ]; 
      const melodyFreq = melodyPattern[step];
      if (melodyFreq > 0) {
        this.playSequenceNote(melodyFreq, 'square', 0.12, time, 0.06);
      }

      // Bitcrushed beats
      if (step % 4 === 0) {
        this.playSequenceNote(55, 'triangle', 0.09, time, 0.28); // Low Core pulse
      } else if (step % 4 === 2) {
        this.playBeatTick(time, true); 
      } else if (step % 2 === 1) {
        this.playBeatTick(time, false);
      }

    } else if (this.currentTrack.id === 'retro-dreamwave') {
      // Detuned chip arpeggio logic
      const bassProgressions = [55.00, 55.00, 110.00, 48.99, 43.65, 43.65, 87.31, 48.99]; 
      const bassFreq = bassProgressions[Math.floor(step / 2) % bassProgressions.length];
      this.playSequenceNote(bassFreq, 'square', 0.14, time, 0.07);

      const arpNodes = [
        110.00, 146.83, 164.81, 220.00, 
        261.63, 293.66, 329.63, 440.00,
        392.00, 329.63, 293.66, 261.63,
        220.00, 164.81, 146.83, 110.00
      ]; 
      const arpFreq = arpNodes[step];
      this.playSequenceNote(arpFreq, 'sawtooth', 0.06, time, 0.04);

      if (step === 0 || step === 8) {
        const chordFrequencies = step === 0 ? [220, 293, 329] : [174, 220, 293]; 
        chordFrequencies.forEach(freq => {
          this.playSequenceNote(freq, 'sawtooth', 0.6, time, 0.02);
        });
      }

      if (step % 4 === 0) {
        this.playSequenceNote(45, 'triangle', 0.05, time, 0.15);
      } else if (step % 2 === 1) {
        this.playBeatTick(time, false);
      }

    } else {
      // Memory Leak slow static decay
      const chillBass = [65.41, 65.41, 130.81, 0, 58.27, 58.27, 116.54, 0]; 
      const bassFreq = chillBass[Math.floor(step / 2) % chillBass.length];
      if (bassFreq > 0) {
        this.playSequenceNote(bassFreq, 'triangle', 0.25, time, 0.1);
      }

      const chillMelody = [
        523.25, 0, 0, 587.33, 
        659.25, 0, 783.99, 0, 
        880.00, 830.61, 783.99, 0, 
        587.33, 0, 523.25, 0
      ]; 
      const noteFreq = chillMelody[step];
      if (noteFreq > 0) {
        this.playSequenceNote(noteFreq, 'square', 0.28, time, 0.04);
      }

      if (step === 0 || step === 8) {
        this.playSequenceNote(40, 'triangle', 0.2, time, 0.25); 
      }
      if (step === 4 || step === 12) {
        this.playBeatTick(time, true);
      }
    }
  }

  public play(track: Track, onTimeUpdate?: (seconds: number) => void) {
    this.initCtx();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      if (this.currentTrack.id === track.id) {
        return;
      } else {
        this.stop();
      }
    }

    this.isPlaying = true;
    this.currentTrack = track;
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime;
    
    if (onTimeUpdate) {
      this.onTimeUpdate = onTimeUpdate;
    }

    this.schedulerIntervalId = setInterval(() => {
      this.scheduleNotes();
    }, 25);

    this.elapsedSecondsIntervalId = setInterval(() => {
      this.elapsedTime += 1;
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.elapsedTime % (this.currentTrack.duration + 1));
      }
    }, 1000);
  }

  public pause() {
    this.stopPlaybackIntervals();
    this.isPlaying = false;
  }

  public stop() {
    this.stopPlaybackIntervals();
    this.isPlaying = false;
    this.elapsedTime = 0;
    this.currentStep = 0;
    if (this.onTimeUpdate) {
      this.onTimeUpdate(0);
    }
  }

  private stopPlaybackIntervals() {
    if (this.schedulerIntervalId) {
      clearInterval(this.schedulerIntervalId);
      this.schedulerIntervalId = null;
    }
    if (this.elapsedSecondsIntervalId) {
      clearInterval(this.elapsedSecondsIntervalId);
      this.elapsedSecondsIntervalId = null;
    }
  }

  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  public getActiveTrack(): Track {
    return this.currentTrack;
  }

  public isEnginePlaying(): boolean {
    return this.isPlaying;
  }
}

// Export singleton instance
export const synthEngine = new AudioEngine();
