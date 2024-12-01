import { Chord, Note } from 'tonal';
import { NOTES } from './chordDatabase';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying: boolean = false;

  async initialize() {
    if (!this.audioContext) {
      // Create audio context only after user interaction
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.1;
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private parseChordSymbol(chordName: string): string[] {
    try {
      // Handle special cases first
      if (chordName.includes('ø') || chordName.includes('m7b5')) {
        const root = chordName.match(/^[A-G][#b]?/)?.[0];
        if (!root) return [];
        
        const rootIndex = NOTES.indexOf(root);
        return [
          root,
          NOTES[(rootIndex + 3) % 12], // Minor third
          NOTES[(rootIndex + 6) % 12], // Diminished fifth
          NOTES[(rootIndex + 10) % 12], // Minor seventh
        ];
      }

      if (chordName.includes('°') || chordName.includes('dim')) {
        const root = chordName.match(/^[A-G][#b]?/)?.[0];
        if (!root) return [];
        
        const rootIndex = NOTES.indexOf(root);
        return [
          root,
          NOTES[(rootIndex + 3) % 12], // Minor third
          NOTES[(rootIndex + 6) % 12], // Diminished fifth
          NOTES[(rootIndex + 9) % 12], // Diminished seventh
        ];
      }

      // Use Tonal.js for other chords
      const chord = Chord.get(chordName);
      return chord.notes;
    } catch (error) {
      console.warn(`Error parsing chord: ${chordName}`, error);
      return [];
    }
  }

  private noteToFrequency(noteName: string, octave: number = 4): number {
    try {
      const freq = Note.freq(`${noteName}${octave}`);
      return freq || 440;
    } catch {
      return 440;
    }
  }

  private createOscillator(
    frequency: number,
    type: OscillatorType = 'triangle',
    gainValue: number = 0.1
  ): OscillatorNode {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    const oscillator = this.audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    const noteGain = this.audioContext.createGain();
    noteGain.gain.value = gainValue;
    noteGain.connect(this.gainNode);
    
    oscillator.connect(noteGain);
    return oscillator;
  }

  public async playChord(chordName: string, duration: number = 1): Promise<void> {
    try {
      await this.initialize();
      if (!this.audioContext || !this.gainNode) return;

      this.stopAll();
      const startTime = this.audioContext.currentTime;

      // Parse the chord using the new method
      const notes = this.parseChordSymbol(chordName);
      if (!notes.length) {
        console.warn(`Invalid chord: ${chordName}`);
        return;
      }

      // Add octave numbers to notes for better voicing
      const baseOctave = 4;
      const voicedNotes = notes.map((note, index) => {
        const octave = baseOctave + Math.floor(index / 3);
        return { note, octave };
      });

      // Play bass note
      const bassNote = { note: notes[0], octave: baseOctave - 1 };
      const bassOsc = this.createOscillator(
        this.noteToFrequency(bassNote.note, bassNote.octave),
        'sine',
        0.15
      );
      bassOsc.start(startTime);
      bassOsc.stop(startTime + duration);
      this.oscillators.push(bassOsc);

      // Play chord notes with slight delay and different waveforms
      voicedNotes.forEach(({ note, octave }, index) => {
        const osc = this.createOscillator(
          this.noteToFrequency(note, octave),
          index % 2 === 0 ? 'triangle' : 'sine',
          0.1 - (index * 0.01) // Slightly decrease volume for higher notes
        );
        const noteStartTime = startTime + (index * 0.02);
        osc.start(noteStartTime);
        osc.stop(noteStartTime + duration);
        this.oscillators.push(osc);
      });

      // Wait for the chord to finish
      await new Promise(resolve => setTimeout(resolve, duration * 1000));
    } catch (error) {
      console.error('Error playing chord:', error);
    }
  }

  public async playProgression(
    chords: string[],
    tempo: number = 120
  ): Promise<void> {
    try {
      await this.initialize();
      if (!this.audioContext) return;

      if (this.isPlaying) {
        this.stopAll();
        return;
      }

      this.isPlaying = true;
      const secondsPerBeat = 60 / tempo;
      const beatsPerChord = 4;
      const chordDuration = secondsPerBeat * beatsPerChord;

      for (let i = 0; i < chords.length && this.isPlaying; i++) {
        await this.playChord(chords[i], chordDuration - 0.1);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error playing progression:', error);
    } finally {
      this.isPlaying = false;
    }
  }

  public stopAll(): void {
    this.isPlaying = false;
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors if oscillator is already stopped
      }
    });
    this.oscillators = [];
  }
}

export const audioEngine = new AudioEngine();