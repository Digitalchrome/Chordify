import { ChordMode, ChordProgression } from '../types/music';
import { Chord, Scale } from 'tonal';

interface ProgressionOptions {
  key: string;
  scale: string;
  cadence?: string;
  useExtendedVoicings?: boolean;
  voicingType?: string;
}

const jazzProgressions = {
  'ii-V-I': ['Dm7', 'G7', 'Cmaj7'],
  'iii-vi-ii-V': ['Em7', 'Am7', 'Dm7', 'G7'],
  'I-vi-ii-V': ['Cmaj7', 'Am7', 'Dm7', 'G7'],
};

const classicalProgressions = {
  'I-IV-V-I': ['C', 'F', 'G', 'C'],
  'I-V-vi-IV': ['C', 'G', 'Am', 'F'],
  'I-vi-IV-V': ['C', 'Am', 'F', 'G'],
};

const generateChordProgression = async (
  mode: ChordMode,
  length: number,
  options: ProgressionOptions
): Promise<ChordProgression> => {
  const { key, scale, cadence, useExtendedVoicings = false, voicingType = 'basic' } = options;
  
  // Get scale notes for the key
  const scaleNotes = Scale.get(`${key} ${scale}`).notes;
  
  let chords: string[];
  
  if (cadence && mode === 'jazz') {
    chords = [...jazzProgressions[cadence as keyof typeof jazzProgressions]];
  } else if (cadence && mode === 'classical') {
    chords = [...classicalProgressions[cadence as keyof typeof classicalProgressions]];
  } else {
    // Generate a random progression based on mode
    const progressionPool = mode === 'jazz' ? Object.values(jazzProgressions) : Object.values(classicalProgressions);
    const randomIndex = Math.floor(Math.random() * progressionPool.length);
    chords = [...progressionPool[randomIndex]];
  }
  
  // Transpose chords to the selected key if needed
  if (key !== 'C') {
    const semitones = Chord.get('C').semitones[0] - Chord.get(key).semitones[0];
    chords = chords.map(chord => {
      const { tonic, type } = Chord.get(chord);
      if (!tonic) return chord;
      const newTonic = scaleNotes[(scaleNotes.indexOf(tonic) + semitones) % scaleNotes.length];
      return newTonic + type;
    });
  }
  
  // Add extended voicings if requested
  if (useExtendedVoicings) {
    chords = chords.map(chord => {
      const { type } = Chord.get(chord);
      if (type === 'M' || type === '') return chord + 'maj7';
      if (type === 'm') return chord + 'm7';
      return chord;
    });
  }
  
  // Ensure we have the requested length
  while (chords.length < length) {
    chords = [...chords, ...chords].slice(0, length);
  }
  if (chords.length > length) {
    chords = chords.slice(0, length);
  }
  
  return {
    chords,
    mode,
    length,
    key,
    scale,
    voicingType
  };
};

export { generateChordProgression };
