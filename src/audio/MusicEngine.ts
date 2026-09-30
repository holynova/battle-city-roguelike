/**
 * Procedural Dynamic BGM Engine
 * Composes and synthesizes real-time multi-track retro arcade / dieselpunk military music
 * using pure Web Audio API without downloading megabytes of audio files.
 */

export type MusicTrack = 'briefing' | 'battle' | 'boss' | 'none';

export class MusicEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.35;
  public currentTrack: MusicTrack = 'none';

  private isPlaying: boolean = false;
  private step: number = 0;
  private timerId: number | null = null;
  private tempo: number = 132; // BPM

  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy init on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  public playTrack(track: MusicTrack) {
    if (this.currentTrack === track && this.isPlaying) return;
    this.stop();
    this.currentTrack = track;
    if (track === 'none') return;

    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.step = 0;

    if (track === 'briefing') {
      this.tempo = 95;
    } else if (track === 'battle') {
      this.tempo = 135;
    } else if (track === 'boss') {
      this.tempo = 150;
    }

    const intervalMs = (60 / this.tempo / 4) * 1000; // 16th notes
    this.timerId = window.setInterval(() => this.tick(), intervalMs);
  }

  public stop() {
    this.isPlaying = false;
    this.currentTrack = 'none';
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick() {
    if (!this.ctx || !this.masterGain || !this.isPlaying || !this.enabled) return;

    const t = this.ctx.currentTime;
    const s16 = this.step % 16;
    const s32 = this.step % 32;
    const s64 = this.step % 64;

    if (this.currentTrack === 'battle') {
      this.playBattleBeat(t, s16, s32, s64);
    } else if (this.currentTrack === 'boss') {
      this.playBossBeat(t, s16, s32);
    } else if (this.currentTrack === 'briefing') {
      this.playBriefingBeat(t, s16, s32);
    }

    this.step++;
  }

  // -------------------------------------------------------------
  // 1. BATTLE TRACK: "STEEL THUNDER" (Driving Industrial Arcade)
  // -------------------------------------------------------------
  private playBattleBeat(t: number, s16: number, s32: number, s64: number) {
    // Heavy Kick on beats 0, 4, 8, 12 + occasional 14
    if (s16 === 0 || s16 === 4 || s16 === 8 || s16 === 12 || (s32 === 30 && Math.random() < 0.5)) {
      this.synthDrumKick(t, 130, 35, 0.14);
    }

    // Snare / Rimshot on 4, 12
    if (s16 === 4 || s16 === 12) {
      this.synthDrumSnare(t, 220, 0.12);
    }

    // Hi-hats on every odd 16th, open hat on 6 and 14
    if (s16 % 2 === 1) {
      this.synthHiHat(t, s16 === 6 || s16 === 14);
    }

    // 16th-note driving Rolling Bassline (Key of D minor)
    // Scale: D, F, G, A, C
    const bassline = [
      73.42, 73.42, 87.31, 73.42,  // D2, D2, F2, D2
      73.42, 73.42, 98.00, 73.42,  // D2, D2, G2, D2
      73.42, 73.42, 110.0, 73.42,  // D2, D2, A2, D2
      65.41, 65.41, 110.0, 98.00   // C2, C2, A2, G2
    ];
    const bassNote = bassline[s16];
    if (s16 % 2 === 0) {
      this.synthBass(t, bassNote, 0.11, 'sawtooth');
    }

    // Lead Arpeggios (Classic FC style pulse wave)
    const melodyPattern = [
      293.66, 0, 349.23, 0, 440.00, 0, 523.25, 440.00,
      392.00, 0, 349.23, 0, 293.66, 0, 220.00, 261.63
    ];
    const mel = melodyPattern[s16];
    if (mel > 0 && (s64 < 48)) {
      this.synthLead(t, mel, 0.09, 'square');
    }
  }

  // -------------------------------------------------------------
  // 2. BOSS TRACK: "GOLIATH ENCOUNTER" (Frantic Heavy Metal Synth)
  // -------------------------------------------------------------
  private playBossBeat(t: number, s16: number, s32: number) {
    // Double kick
    if (s16 === 0 || s16 === 2 || s16 === 6 || s16 === 8 || s16 === 10 || s16 === 14) {
      this.synthDrumKick(t, 160, 30, 0.12);
    }
    if (s16 === 4 || s16 === 12) {
      this.synthDrumSnare(t, 260, 0.15);
    }
    this.synthHiHat(t, s16 % 4 === 2);

    // Deep Menacing Aggressive Bass (C minor)
    const bossBass = [
      65.41, 65.41, 77.78, 65.41,
      65.41, 98.00, 92.50, 65.41,
      61.74, 61.74, 73.42, 61.74,
      58.27, 58.27, 65.41, 77.78
    ];
    this.synthBass(t, bossBass[s16], 0.09, 'sawtooth', 0.5);

    // Siren alarm chord every 16 beats
    if (s32 === 0 || s32 === 16) {
      this.synthSiren(t, 440, 880, 0.4);
    }
  }

  // -------------------------------------------------------------
  // 3. BRIEFING TRACK: "COMMAND TACTICAL WAR ROOM"
  // -------------------------------------------------------------
  private playBriefingBeat(t: number, s16: number, s32: number) {
    // Subtle low heartbeat pulse on 0 and 8
    if (s16 === 0) {
      this.synthDrumKick(t, 80, 25, 0.22, 0.4);
    } else if (s16 === 6) {
      this.synthDrumKick(t, 70, 22, 0.18, 0.25);
    }

    // Atmospheric radar ping / drone
    if (s32 === 0) {
      this.synthPad(t, 220, 1.2); // A3
    } else if (s32 === 16) {
      this.synthPad(t, 174.61, 1.2); // F3
    }

    // Radar blip
    if (s16 === 14) {
      this.synthRadarPing(t, 1760);
    }
  }

  // -------------------------------------------------------------
  // SYNTHESIS VOICES
  // -------------------------------------------------------------
  private synthDrumKick(t: number, startFreq: number, endFreq: number, dur: number, volMul: number = 1) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.7 * volMul, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private synthDrumSnare(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + dur);
    g1.gain.setValueAtTime(0.4, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g1);
    g1.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);

    // Noise crack
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.4, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(g2);
    g2.connect(this.masterGain);
    noise.start(t);
  }

  private synthHiHat(t: number, isOpen: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const dur = isOpen ? 0.12 : 0.035;
    const bufSize = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(isOpen ? 0.25 : 0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    noise.start(t);
  }

  private synthBass(t: number, freq: number, dur: number, type: OscillatorType = 'sawtooth', vol: number = 0.4) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(filter);
    filter.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private synthLead(t: number, freq: number, dur: number, type: OscillatorType = 'square') {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private synthPad(t: number, freq: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.01, t);
    g.gain.linearRampToValueAtTime(0.2, t + dur * 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }

  private synthRadarPing(t: number, freq: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.15);
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  private synthSiren(t: number, f1: number, f2: number, dur: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.linearRampToValueAtTime(f2, t + dur * 0.5);
    osc.frequency.linearRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + dur);
  }
}

export const bgm = new MusicEngine();
