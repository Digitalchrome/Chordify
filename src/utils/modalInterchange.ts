import { Scale, Note } from 'tonal';
import { NOTES } from './chordDatabase';

interface ModalSuggestion {
  chord: string;
  mode: string;
  explanation: string;
}

const MODAL_SCALES = {
  major: ['ionian', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'],
  minor: ['aeolian', 'dorian', 'phrygian', 'harmonic minor', 'melodic minor'],
};

export const getModalInterchangeChords = (
  chord: string,
  currentScale: string
): ModalSuggestion[] => {
  const suggestions: ModalSuggestion[] = [];
  const root = chord.match(/^[A-G][#b]?/)?.[0];
  if (!root) return suggestions;

  const scaleType = currentScale.includes('minor') ? 'minor' : 'major';
  const modes = MODAL_SCALES[scaleType as keyof typeof MODAL_SCALES];

  modes.forEach(mode => {
    const scale = Scale.get(`${root} ${mode}`);
    if (!scale.notes.length) return;

    // Get the characteristic chord for this mode
    const chordSuggestion = getCharacteristicChord(root, mode);
    if (chordSuggestion && chordSuggestion !== chord) {
      suggestions.push({
        chord: chordSuggestion,
        mode,
        explanation: getModalExplanation(mode),
      });
    }
  });

  return suggestions;
};

const getCharacteristicChord = (root: string, mode: string): string => {
  switch (mode) {
    case 'ionian':
      return `${root}maj7`;
    case 'dorian':
      return `${root}m7`;
    case 'phrygian':
      return `${root}m7b9`;
    case 'lydian':
      return `${root}maj7#11`;
    case 'mixolydian':
      return `${root}7`;
    case 'aeolian':
      return `${root}m7`;
    case 'locrian':
      return `${root}m7b5`;
    case 'harmonic minor':
      return `${root}mM7`;
    case 'melodic minor':
      return `${root}m6`;
    default:
      return `${root}`;
  }
};

const getModalExplanation = (mode: string): string => {
  switch (mode) {
    case 'ionian':
      return 'Bright, stable major sound';
    case 'dorian':
      return 'Minor with raised 6th';
    case 'phrygian':
      return 'Dark, Spanish flavor';
    case 'lydian':
      return 'Bright, raised 4th';
    case 'mixolydian':
      return 'Dominant, bluesy sound';
    case 'aeolian':
      return 'Natural minor sound';
    case 'locrian':
      return 'Diminished, unstable sound';
    case 'harmonic minor':
      return 'Exotic, raised 7th';
    case 'melodic minor':
      return 'Jazz minor sound';
    default:
      return '';
  }
};