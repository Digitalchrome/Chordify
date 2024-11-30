import { Chord, Note } from 'tonal';

export interface VoicingStyle {
  name: string;
  description: string;
  category: string;
  complexity: number;
}

export interface VoicingResult {
  notes: string[];
  style: VoicingStyle;
  bassNote: string;
  tensions: string[];
  range: 'low' | 'medium' | 'high' | 'wide';
}

const BASE_OCTAVE = 3; // Starting from a lower octave for better range

// Helper function to get all inversions of a chord
const getInversions = (notes: string[]): string[][] => {
  const inversions: string[][] = [];
  for (let i = 0; i < notes.length; i++) {
    const inversion = [...notes.slice(i), ...notes.slice(0, i)];
    inversions.push(inversion);
  }
  return inversions;
};

// Helper function to add octave numbers to notes with proper voice leading
const addOctaves = (notes: string[], baseOctave: number, offsets: number[] = []): string[] => {
  return notes.map((note, i) => {
    const octave = baseOctave + (offsets[i] || 0);
    return `${note}${octave}`;
  });
};

// Helper to create doubled notes
const createDoubling = (notes: string[], noteToDouble: number): string[] => {
  const result = [...notes];
  result.push(notes[noteToDouble]);
  return result;
};

export const generateVoicings = (chord: string): VoicingResult[] => {
  const chordInfo = Chord.get(chord);
  const results: VoicingResult[] = [];

  results.push(...generateCloseVoicings(chordInfo));
  results.push(...generateDropVoicings(chordInfo));
  results.push(...generateSpreadVoicings(chordInfo));
  results.push(...generateQuartalVoicings(chordInfo));
  results.push(...generateShellVoicings(chordInfo));
  results.push(...generateClusterVoicings(chordInfo));

  return results;
};

const generateCloseVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  // Generate all inversions
  const inversions = getInversions(notes);
  inversions.forEach((inversion, index) => {
    // Basic close position
    results.push({
      notes: addOctaves(inversion, BASE_OCTAVE),
      style: {
        name: `Close Position (${index === 0 ? 'Root' : `${index}${['st', 'nd', 'rd', 'th'][Math.min(3, index - 1)]} Inversion`})`,
        description: 'Compact voicing with minimal spacing',
        category: 'Traditional',
        complexity: 1
      },
      bassNote: inversion[0],
      tensions: [],
      range: 'medium'
    });

    // Close position with doubled root
    if (notes.length <= 4) {
      const doubledRoot = createDoubling(inversion, 0);
      results.push({
        notes: addOctaves(doubledRoot, BASE_OCTAVE, [0, 0, 0, 0, 1]), // Last note one octave up
        style: {
          name: `Close Position Doubled Root (${index === 0 ? 'Root' : `${index}${['st', 'nd', 'rd', 'th'][Math.min(3, index - 1)]} Inversion`})`,
          description: 'Close position with doubled root',
          category: 'Traditional',
          complexity: 1
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'medium'
      });
    }
  });

  return results;
};

const generateDropVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  if (notes.length >= 4) {
    const inversions = getInversions(notes);
    
    inversions.forEach((inversion, invIndex) => {
      // Drop 2
      const drop2Octaves = [0, 0, 0, -1]; // Second from top dropped
      results.push({
        notes: addOctaves(inversion, BASE_OCTAVE, drop2Octaves),
        style: {
          name: `Drop 2 (${invIndex === 0 ? 'Root' : `${invIndex}${['st', 'nd', 'rd', 'th'][Math.min(3, invIndex - 1)]} Inversion`})`,
          description: 'Second note from top dropped an octave',
          category: 'Jazz',
          complexity: 2
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'medium'
      });

      // Drop 3
      const drop3Octaves = [0, 0, -1, 0]; // Third from top dropped
      results.push({
        notes: addOctaves(inversion, BASE_OCTAVE, drop3Octaves),
        style: {
          name: `Drop 3 (${invIndex === 0 ? 'Root' : `${invIndex}${['st', 'nd', 'rd', 'th'][Math.min(3, invIndex - 1)]} Inversion`})`,
          description: 'Third note from top dropped an octave',
          category: 'Jazz',
          complexity: 2
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'medium'
      });

      // Drop 2+4 (for 5+ note chords)
      if (inversion.length >= 4) {
        const drop24Octaves = Array(inversion.length).fill(0);
        drop24Octaves[1] = -1; // Drop second note
        drop24Octaves[3] = -1; // Drop fourth note
        results.push({
          notes: addOctaves(inversion, BASE_OCTAVE, drop24Octaves),
          style: {
            name: `Drop 2+4 (${invIndex === 0 ? 'Root' : `${invIndex}${['st', 'nd', 'rd', 'th'][Math.min(3, invIndex - 1)]} Inversion`})`,
            description: 'Second and fourth notes from top dropped an octave',
            category: 'Jazz',
            complexity: 3
          },
          bassNote: inversion[0],
          tensions: [],
          range: 'wide'
        });
      }

      // Drop 2+3
      const drop23Octaves = [0, -1, -1, 0]; // Second and third from top dropped
      results.push({
        notes: addOctaves(inversion, BASE_OCTAVE, drop23Octaves),
        style: {
          name: `Drop 2+3 (${invIndex === 0 ? 'Root' : `${invIndex}${['st', 'nd', 'rd', 'th'][Math.min(3, invIndex - 1)]} Inversion`})`,
          description: 'Second and third notes from top dropped an octave',
          category: 'Jazz',
          complexity: 3
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'wide'
      });

      // Drop 2 with doubled root
      const drop2Doubled = createDoubling(inversion, 0);
      const drop2DoubledOctaves = [0, 0, 0, -1, 1]; // Regular drop 2 plus doubled root up octave
      results.push({
        notes: addOctaves(drop2Doubled, BASE_OCTAVE, drop2DoubledOctaves),
        style: {
          name: `Drop 2 Doubled Root (${invIndex === 0 ? 'Root' : `${invIndex}${['st', 'nd', 'rd', 'th'][Math.min(3, invIndex - 1)]} Inversion`})`,
          description: 'Drop 2 voicing with doubled root',
          category: 'Jazz',
          complexity: 2
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'wide'
      });
    });
  }

  return results;
};

const generateSpreadVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  if (notes.length >= 3) {
    // Generate all inversions
    const inversions = getInversions(notes);
    
    inversions.forEach((inversion, index) => {
      // Wide spread voicing
      const spreadOctaves = inversion.map((_, i) => Math.floor(i / 2)); // Spread notes across octaves
      results.push({
        notes: addOctaves(inversion, BASE_OCTAVE, spreadOctaves),
        style: {
          name: `Spread (${index === 0 ? 'Root' : `${index}${['st', 'nd', 'rd', 'th'][Math.min(3, index - 1)]} Inversion`})`,
          description: 'Notes spread across multiple octaves',
          category: 'Modern',
          complexity: 2
        },
        bassNote: inversion[0],
        tensions: [],
        range: 'wide'
      });
    });
  }

  return results;
};

const generateQuartalVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  if (notes.length >= 3) {
    // Stack notes in fourths
    const quartal = [
      `${notes[0]}${BASE_OCTAVE}`,     // Root
      `${notes[2]}${BASE_OCTAVE}`,     // Fifth
      `${notes[1]}${BASE_OCTAVE + 1}`, // Third up an octave
      ...(notes[3] ? [`${notes[3]}${BASE_OCTAVE + 1}`] : []) // Seventh up an octave if exists
    ];

    results.push({
      notes: quartal,
      style: {
        name: 'Quartal',
        description: 'Notes stacked in fourths',
        category: 'Modern',
        complexity: 3
      },
      bassNote: notes[0],
      tensions: [],
      range: 'medium'
    });
  }

  return results;
};

const generateShellVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  if (notes.length >= 3) {
    // Shell voicing (root, third, seventh if available)
    const shell = [
      `${notes[0]}${BASE_OCTAVE}`,     // Root
      `${notes[1]}${BASE_OCTAVE}`,     // Third
      ...(notes[3] ? [`${notes[3]}${BASE_OCTAVE + 1}`] : []) // Seventh up an octave if exists
    ];

    results.push({
      notes: shell,
      style: {
        name: 'Shell',
        description: 'Minimal voicing with root, third, and seventh',
        category: 'Jazz',
        complexity: 1
      },
      bassNote: notes[0],
      tensions: [],
      range: 'medium'
    });
  }

  return results;
};

const generateClusterVoicings = (chordInfo: any): VoicingResult[] => {
  const results: VoicingResult[] = [];
  const notes = chordInfo.notes;

  if (notes.length >= 3) {
    // Cluster voicing (notes very close together)
    const cluster = [
      `${notes[0]}${BASE_OCTAVE}`,     // Root
      `${notes[1]}${BASE_OCTAVE}`,     // Third
      `${notes[2]}${BASE_OCTAVE}`,     // Fifth
      ...(notes[3] ? [`${notes[3]}${BASE_OCTAVE}`] : []) // Seventh if exists
    ];

    results.push({
      notes: cluster,
      style: {
        name: 'Cluster',
        description: 'Notes packed closely together',
        category: 'Modern',
        complexity: 2
      },
      bassNote: notes[0],
      tensions: [],
      range: 'medium'
    });
  }

  return results;
};