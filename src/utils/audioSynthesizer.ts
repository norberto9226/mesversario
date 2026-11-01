/**
 * Romantic Melody Synthesizer using Web Audio API
 * Generates delicate romantic music box / piano arpeggios
 * without requiring external sound files.
 */

export interface SongInfo {
  id: string;
  title: string;
  subtitle: string;
  style: 'piano' | 'musicbox' | 'lofi';
  delay: number;
  filterFreq: number;
}

export class RomanticSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timerId: number | null = null;
  private gainNode: GainNode | null = null;
  private volume: number = 0.6;
  private currentStyle: 'piano' | 'musicbox' | 'lofi' = 'piano';
  private currentSongIndex: number = 0;
  private songChangeListeners: ((song: SongInfo) => void)[] = [];

  // Multi-song romantic catalogue
  public readonly songs: (SongInfo & {
    progressions: { bass: number; arpeggio: number[] }[];
  })[] = [
    {
      id: 'alegria-amarilla',
      title: 'Flores Amarillas & Alegría',
      subtitle: 'Melodía alegre, chispeante y radiante en Sol Mayor',
      style: 'piano',
      delay: 220, // Tempo rápido y alegre para celebrar el amor
      filterFreq: 2800,
      progressions: [
        {
          bass: 98.00, // G2
          arpeggio: [196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 493.88, 392.00], // G3, B3, D4, G4, B4, D5, B4, G4
        },
        {
          bass: 130.81, // C3
          arpeggio: [261.63, 329.63, 392.00, 523.25, 587.33, 659.25, 523.25, 392.00], // C4, E4, G4, C5, D5, E5, C5, G4
        },
        {
          bass: 146.83, // D3
          arpeggio: [293.66, 370.00, 440.00, 587.33, 740.00, 587.33, 440.00, 370.00], // D4, F#4, A4, D5, F#5, D5, A4, F#4
        },
        {
          bass: 82.41, // E2
          arpeggio: [164.81, 246.94, 329.63, 392.00, 493.88, 392.00, 329.63, 246.94], // Em7
        },
        {
          bass: 130.81, // C3
          arpeggio: [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 659.25], // Cmaj7 chispeante
        },
        {
          bass: 146.83, // D3
          arpeggio: [293.66, 370.00, 440.00, 523.25, 587.33, 659.25, 587.33, 440.00], // D7 festivo
        },
      ],
    },
    {
      id: 'primer-mes',
      title: 'Melodía de Nuestro 1er Mes',
      subtitle: 'Arpegio suave de piano en C mayor',
      style: 'piano',
      delay: 340,
      filterFreq: 1900,
      progressions: [
        {
          bass: 130.81, // C3
          arpeggio: [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63, 261.63], // C4, E4, G4, B4, C5...
        },
        {
          bass: 110.00, // A2
          arpeggio: [220.00, 261.63, 329.63, 392.00, 440.00, 329.63, 261.63, 220.00], // A3, C4, E4, G4...
        },
        {
          bass: 87.31, // F2
          arpeggio: [174.61, 261.63, 329.63, 349.23, 440.00, 329.63, 261.63, 174.61], // F3, C4, E4, F4...
        },
        {
          bass: 98.00, // G2
          arpeggio: [196.00, 246.94, 293.66, 370.00, 392.00, 293.66, 246.94, 196.00], // G3, B3, D4, F#4...
        },
      ],
    },
    {
      id: 'promesa-eterna',
      title: 'Promesa Eterna & Flores Amarillas',
      subtitle: 'Balada apasionada y profunda en D mayor & B menor',
      style: 'piano',
      delay: 310,
      filterFreq: 2400,
      progressions: [
        {
          bass: 123.47, // B2
          arpeggio: [246.94, 293.66, 370.00, 440.00, 493.88, 370.00, 293.66, 246.94], // Bm7 (profundo y romántico)
        },
        {
          bass: 98.00, // G2
          arpeggio: [196.00, 246.94, 293.66, 370.00, 392.00, 440.00, 370.00, 293.66], // Gmaj7 (esperanza)
        },
        {
          bass: 146.83, // D3
          arpeggio: [293.66, 370.00, 440.00, 554.37, 587.33, 440.00, 370.00, 293.66], // Dmaj7 (amor cálido)
        },
        {
          bass: 110.00, // A2
          arpeggio: [220.00, 277.18, 329.63, 440.00, 493.88, 329.63, 277.18, 220.00], // A sus4 / A
        },
        {
          bass: 87.31, // F#2 / 92.50
          arpeggio: [185.00, 220.00, 277.18, 370.00, 440.00, 370.00, 277.18, 220.00], // F#m7
        },
        {
          bass: 98.00, // G2
          arpeggio: [196.00, 246.94, 293.66, 392.00, 493.88, 587.33, 493.88, 392.00], // G clímax
        },
      ],
    },
    {
      id: 'caja-magica',
      title: 'Destellos de Luz & Ternura',
      subtitle: 'Campanas y caja musical celestial',
      style: 'musicbox',
      delay: 380,
      filterFreq: 3400,
      progressions: [
        {
          bass: 130.81, // C3
          arpeggio: [261.63, 392.00, 523.25, 659.25, 783.99, 659.25, 523.25, 392.00],
        },
        {
          bass: 164.81, // E3
          arpeggio: [329.63, 392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 392.00],
        },
        {
          bass: 174.61, // F3
          arpeggio: [349.23, 440.00, 523.25, 698.46, 783.99, 698.46, 523.25, 440.00],
        },
        {
          bass: 196.00, // G3
          arpeggio: [392.00, 493.88, 587.33, 783.99, 880.00, 783.99, 587.33, 493.88],
        },
      ],
    },
  ];

  private currentChordIndex = 0;
  private currentNoteIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSong(): SongInfo {
    const s = this.songs[this.currentSongIndex];
    return {
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      style: s.style,
      delay: s.delay,
      filterFreq: s.filterFreq,
    };
  }

  public onSongChange(callback: (song: SongInfo) => void) {
    this.songChangeListeners.push(callback);
    return () => {
      this.songChangeListeners = this.songChangeListeners.filter((cb) => cb !== callback);
    };
  }

  private notifySongChange() {
    const info = this.getCurrentSong();
    this.songChangeListeners.forEach((cb) => cb(info));
  }

  public setSong(songIdOrIndex: string | number) {
    let nextIdx = 0;
    if (typeof songIdOrIndex === 'number') {
      nextIdx = Math.max(0, Math.min(this.songs.length - 1, songIdOrIndex));
    } else {
      const found = this.songs.findIndex((s) => s.id === songIdOrIndex);
      if (found !== -1) nextIdx = found;
    }

    this.currentSongIndex = nextIdx;
    this.currentStyle = this.songs[nextIdx].style;
    this.currentChordIndex = 0;
    this.currentNoteIndex = 0;
    this.notifySongChange();

    // If already playing, keep playing new song immediately; if not, ensure initialized
    if (this.isPlaying) {
      if (this.timerId) {
        clearTimeout(this.timerId);
      }
      this.scheduleNextNote();
    }
  }

  public nextSong(): SongInfo {
    const nextIdx = (this.currentSongIndex + 1) % this.songs.length;
    this.setSong(nextIdx);
    if (!this.isPlaying) {
      this.start();
    }
    return this.getCurrentSong();
  }

  public setStyle(style: 'piano' | 'musicbox' | 'lofi') {
    this.currentStyle = style;
  }

  public getStyle() {
    return this.currentStyle;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.scheduleNextNote();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private scheduleNextNote = () => {
    if (!this.isPlaying || !this.ctx || !this.gainNode) return;

    const currentSong = this.songs[this.currentSongIndex];
    const progressions = currentSong.progressions;
    const chord = progressions[this.currentChordIndex];
    const freq = chord.arpeggio[this.currentNoteIndex];

    // If starting a chord, play warm bass note
    if (this.currentNoteIndex === 0) {
      this.playTone(chord.bass, 2.4, 0.32, 'sine', currentSong.filterFreq);
    }

    // Play melody note
    if (this.currentStyle === 'musicbox') {
      this.playTone(freq * 1.5, 1.8, 0.22, 'triangle', currentSong.filterFreq);
      this.playTone(freq * 3, 0.8, 0.06, 'sine', currentSong.filterFreq);
    } else if (this.currentStyle === 'lofi') {
      this.playTone(freq, 1.5, 0.26, 'triangle', currentSong.filterFreq);
      this.playTone(freq * 0.5, 1.8, 0.15, 'sine', currentSong.filterFreq);
    } else {
      // Warm piano
      this.playTone(freq, 1.7, 0.26, 'sine', currentSong.filterFreq);
      this.playTone(freq * 2, 0.9, 0.08, 'triangle', currentSong.filterFreq);
    }

    this.currentNoteIndex++;
    if (this.currentNoteIndex >= chord.arpeggio.length) {
      this.currentNoteIndex = 0;
      this.currentChordIndex = (this.currentChordIndex + 1) % progressions.length;
    }

    this.timerId = window.setTimeout(this.scheduleNextNote, currentSong.delay);
  };

  private playTone(
    freq: number,
    duration: number,
    gainAmount: number,
    type: OscillatorType,
    customFilterFreq?: number
  ) {
    if (!this.ctx || !this.gainNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(
        customFilterFreq || (this.currentStyle === 'musicbox' ? 3200 : 1900),
        this.ctx.currentTime
      );

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(gainAmount, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio node failure fallback
    }
  }

  // Play romantic chime sound when unlocking or opening the secret note
  public playChime() {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6 (sparkle)
    notes.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 2.2, 0.35, 'sine', 3500);
        this.playTone(freq * 1.5, 1.2, 0.12, 'triangle', 4000);
      }, index * 90);
    });
  }

  // Play delicate rustle or paper unfold sound
  public playPaperSound() {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;

    const notes = [320, 480, 640];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.4, 0.12, 'triangle', 1800);
      }, idx * 60);
    });
  }
}

export const romanticAudio = new RomanticSynthesizer();

