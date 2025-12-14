/**
 * Procedural chiptune music generator using Web Audio API
 */
export class MusicManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private stepIndex: number = 0;
  private tempo: number = 140; // BPM
  private schedulerTimer: number | null = null;
  
  // Musical scales (pentatonic for pleasant sound)
  private scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C pentatonic
  private bassScale = [65.41, 73.42, 82.41, 98.00, 110.00]; // Lower octave
  
  // Patterns for different game states
  private patterns = {
    normal: [0, 2, 4, 2, 0, 4, 2, 4],
    tense: [0, 0, 3, 3, 5, 5, 3, 3],
    danger: [0, 5, 0, 5, 0, 5, 0, 5],
  };
  
  private currentMood: 'normal' | 'tense' | 'danger' = 'normal';
  private volume: number = 0.15; // Low by default
  
  constructor() {
    // Audio context created on first user interaction
  }
  
  /**
   * Initialize audio (must be called after user gesture)
   */
  init(): void {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }
  
  /**
   * Start playing music
   */
  start(): void {
    if (!this.audioContext || this.isPlaying) return;
    
    this.isPlaying = true;
    this.stepIndex = 0;
    this.scheduleNotes();
  }
  
  /**
   * Stop music
   */
  stop(): void {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      clearTimeout(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }
  
  /**
   * Set mood (affects pattern)
   */
  setMood(mood: 'normal' | 'tense' | 'danger'): void {
    this.currentMood = mood;
  }
  
  /**
   * Set volume (0-1)
   */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }
  
  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }
  
  /**
   * Toggle mute
   */
  toggleMute(): void {
    if (this.masterGain) {
      this.masterGain.gain.value = this.masterGain.gain.value > 0 ? 0 : this.volume;
    }
  }
  
  /**
   * Schedule next notes
   */
  private scheduleNotes(): void {
    if (!this.audioContext || !this.isPlaying) return;
    
    const pattern = this.patterns[this.currentMood];
    const noteIndex = pattern[this.stepIndex % pattern.length];
    
    // Play lead note
    this.playNote(this.scale[noteIndex], 0.1, 'square');
    
    // Play bass on beats 0 and 4
    if (this.stepIndex % 4 === 0) {
      this.playNote(this.bassScale[noteIndex % this.bassScale.length], 0.15, 'sawtooth');
    }
    
    // Play percussion
    if (this.stepIndex % 2 === 0) {
      this.playNoise(0.03);
    }
    
    this.stepIndex++;
    
    // Schedule next step
    const stepTime = (60 / this.tempo) * 1000 / 2; // 8th notes
    this.schedulerTimer = window.setTimeout(() => this.scheduleNotes(), stepTime);
  }
  
  /**
   * Play a single note
   */
  private playNote(freq: number, duration: number, type: OscillatorType): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }
  
  /**
   * Play noise (percussion)
   */
  private playNoise(duration: number): void {
    if (!this.audioContext || !this.masterGain) return;
    
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    // High-pass filter for hi-hat sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    
    noise.start();
  }
  
  /**
   * Play a sound effect
   */
  playEffect(type: 'collect' | 'hit' | 'win' | 'lose'): void {
    if (!this.audioContext || !this.masterGain) return;
    
    switch (type) {
      case 'collect':
        this.playNote(880, 0.1, 'square');
        setTimeout(() => this.playNote(1100, 0.1, 'square'), 50);
        break;
      case 'hit':
        this.playNote(150, 0.2, 'sawtooth');
        break;
      case 'win':
        this.playNote(523, 0.15, 'square');
        setTimeout(() => this.playNote(659, 0.15, 'square'), 100);
        setTimeout(() => this.playNote(784, 0.2, 'square'), 200);
        break;
      case 'lose':
        this.playNote(300, 0.3, 'sawtooth');
        setTimeout(() => this.playNote(200, 0.4, 'sawtooth'), 200);
        break;
    }
  }
}

// Singleton instance
export const musicManager = new MusicManager();
