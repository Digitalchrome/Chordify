import { VoicingOptions } from '../types/music';
import { NOTES } from './chordDatabase';
import { Chord, Note } from 'tonal';

interface ChordTones {
  root: string;
  third: string;
  fifth: string;
  seventh?: string;
  ninth?: string;
  eleventh?: string;
  thirteenth?: string;
}

export const parseChord = (chord: string): ChordTones => {
  try {
    // Handle special cases first
    if (chord.includes('ø')) {
      // Half-diminished chord (e.g., Fø7)
      const root = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
      const rootIndex = NOTES.indexOf(root);
      return {
        root,
        third: NOTES[(rootIndex + 3) % 12], // Minor third
        fifth: NOTES[(rootIndex + 6) % 12], // Diminished fifth
        seventh: NOTES[(rootIndex + 10) % 12], // Minor seventh
      };
    }

    // Parse using Tonal.js
    const parsed = Chord.get(chord);
    if (!parsed.notes.length) {
      console.warn(`Could not parse chord: ${chord}`);
      return defaultChordTones(chord);
    }
    
    const tones: ChordTones = {
      root: parsed.notes[0],
      third: parsed.notes[1] || parsed.notes[0],
      fifth: parsed.notes[2] || parsed.notes[0],
    };

    if (parsed.notes[3]) tones.seventh = parsed.notes[3];
    if (parsed.notes[4]) tones.ninth = parsed.notes[4];
    if (parsed.notes[5]) tones.eleventh = parsed.notes[5];
    if (parsed.notes[6]) tones.thirteenth = parsed.notes[6];

    return tones;
  } catch (error) {
    console.warn(`Error parsing chord: ${chord}`, error);
    return defaultChordTones(chord);
  }
};

const defaultChordTones = (chord: string): ChordTones => {
  const root = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
  const rootIndex = NOTES.indexOf(root);

  // Handle different chord qualities
  if (chord.includes('dim') || chord.includes('°')) {
    return {
      root,
      third: NOTES[(rootIndex + 3) % 12], // Minor third
      fifth: NOTES[(rootIndex + 6) % 12], // Diminished fifth
    };
  } else if (chord.includes('aug')) {
    return {
      root,
      third: NOTES[(rootIndex + 4) % 12], // Major third
      fifth: NOTES[(rootIndex + 8) % 12], // Augmented fifth
    };
  } else if (chord.includes('m')) {
    return {
      root,
      third: NOTES[(rootIndex + 3) % 12], // Minor third
      fifth: NOTES[(rootIndex + 7) % 12], // Perfect fifth
    };
  }

  // Default to major
  return {
    root,
    third: NOTES[(rootIndex + 4) % 12], // Major third
    fifth: NOTES[(rootIndex + 7) % 12], // Perfect fifth
  };
};

export const createVoicing = (
  chord: string,
  options: VoicingOptions,
  previousVoicing?: string[]
): string[] => {
  const tones = parseChord(chord);
  const notes = Object.values(tones).filter(Boolean);
  
  switch (options.style) {
    case 'close':
      return createCloseVoicing(notes, options.extensions);
    case 'spread':
      return createSpreadVoicing(notes, options.extensions);
    case 'drop2':
      return createDrop2Voicing(notes, options.extensions);
    case 'quartal':
      return createQuartalVoicing(notes);
    default:
      return createCloseVoicing(notes, options.extensions);
  }
};

const createCloseVoicing = (notes: string[], useExtensions: boolean = false): string[] => {
  const voicing = [...notes];
  if (useExtensions && notes.length > 4) {
    // Add extensions in close position
    voicing.push(...notes.slice(4));
  }
  return voicing;
};

const createSpreadVoicing = (notes: string[], useExtensions: boolean = false): string[] => {
  const voicing = [notes[0]]; // Root
  if (notes.length > 2) voicing.push(notes[2]); // Fifth
  if (notes.length > 1) voicing.push(notes[1]); // Third
  if (notes.length > 3) voicing.push(notes[3]); // Seventh
  
  if (useExtensions) {
    notes.slice(4).forEach(note => {
      const midi = Note.midi(note + '4') || 60;
      voicing.push(Note.fromMidi(midi + 12)); // Add extensions up an octave
    });
  }
  
  return voicing;
};

const createDrop2Voicing = (notes: string[], useExtensions: boolean = false): string[] => {
  if (notes.length < 4) return createCloseVoicing(notes, useExtensions);
  
  const voicing = [
    notes[1], // Drop the second highest note to the bottom
    notes[0],
    notes[2],
    notes[3],
  ];
  
  if (useExtensions) {
    notes.slice(4).forEach(note => {
      const midi = Note.midi(note + '4') || 60;
      voicing.push(Note.fromMidi(midi + 12));
    });
  }
  
  return voicing;
};

const createQuartalVoicing = (notes: string[]): string[] => {
  const root = notes[0];
  const rootIndex = NOTES.indexOf(root);
  
  return [
    root,
    NOTES[(rootIndex + 5) % 12], // Perfect fourth up
    NOTES[(rootIndex + 10) % 12], // Perfect fourth up again
    NOTES[(rootIndex + 3) % 12], // Perfect fourth up again
  ];
};

export const getSecondaryDominant = (chord: string): string | null => {
  const tones = parseChord(chord);
  const fifth = NOTES[(NOTES.indexOf(tones.fifth) + 7) % 12];
  return `${fifth}7`;
};

export const getTritoneSubstitution = (chord: string): string | null => {
  if (!chord.includes('7')) return null;
  
  const root = chord.match(/^[A-G][#b]?/)?.[0];
  if (!root) return null;
  
  const tritoneRoot = NOTES[(NOTES.indexOf(root) + 6) % 12];
  return `${tritoneRoot}7`;
};