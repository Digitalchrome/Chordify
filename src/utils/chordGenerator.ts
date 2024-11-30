import { ChordMode, ProgressionLength, VoicingOptions, ScaleType } from '../types/music';
import { SCALES, CADENCE_PATTERNS, NOTES, PROGRESSION_PATTERNS } from './chordDatabase';
import { getSecondaryDominant, getTritoneSubstitution, createVoicing } from './musicTheory';

// Helper function to get a random element from an array
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

const SMART_PATTERNS = {
  tension: [
    ['I', 'vi', 'IV', 'V7'],
    ['I', 'iii', 'vi', 'V7'],
    ['Imaj7', 'vi7', 'ii7', 'V7'],
  ],
  resolution: [
    ['ii7', 'V7', 'Imaj7'],
    ['iiø7', 'V7b9', 'i'],
    ['iv7', 'bVII7', 'Imaj7'],
  ],
  modal: [
    ['i7', 'IV7', 'i7', 'bVII7'],
    ['Imaj7', 'IVmaj7', 'bVIImaj7'],
    ['i7', 'bVI7', 'bVII7', 'i7'],
  ],
};

// Helper function to convert roman numeral to number
const getRomanNumeralValue = (roman: string): number => {
  const values: Record<string, number> = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7 };
  return values[roman.toLowerCase()] || 1;
};

// Helper function to translate scale degrees to actual chords
const translateDegreeToChord = (
  degree: string,
  mode: ChordMode,
  key: string
): { chord: string; numeral: string } => {
  const scalePattern = SCALES[mode === 'minor' ? 'minor' : 'major'];
  const rootIndex = NOTES.indexOf(key);
  
  // Parse the degree (e.g., "ii7", "V7", "i")
  const match = degree.match(/([b#])?([iv]+)(.*)/i);
  if (!match) return { chord: `${key}`, numeral: 'I' };
  
  const [_, accidental, roman, quality] = match;
  const degreeNumber = getRomanNumeralValue(roman);
  const scaleStep = (rootIndex + scalePattern[degreeNumber - 1]) % 12;
  const root = NOTES[scaleStep];
  
  // Determine chord quality based on mode
  let chordQuality = '';
  if (mode === 'jazz' || mode === 'smart') {
    chordQuality = quality || (roman === roman.toLowerCase() ? 'm7' : 'maj7');
  } else if (mode === 'contemporary') {
    chordQuality = quality || (roman === roman.toLowerCase() ? 'm9' : 'maj9');
  } else {
    chordQuality = quality || (roman === roman.toLowerCase() ? 'm' : '');
  }

  return {
    chord: `${root}${chordQuality}`,
    numeral: `${accidental || ''}${roman}${quality || ''}`,
  };
};

export const generateProgression = (
  mode: ChordMode,
  length: ProgressionLength,
  options: {
    selectedCadence?: string;
    useExtendedVoicings?: boolean;
    useSecondaryDominants?: boolean;
    useTritoneSubstitutions?: boolean;
    voicingOptions?: VoicingOptions;
    key?: string;
    scale?: ScaleType;
  } = {}
): { chords: string[]; voicings: string[][]; romanNumerals: string[] } => {
  const progression: string[] = [];
  const voicings: string[][] = [];
  const romanNumerals: string[] = [];
  
  let pattern: string[] = [];
  
  if (mode === 'smart') {
    // Smart mode uses a combination of patterns based on tension and resolution
    const tensionPattern = getRandomElement(SMART_PATTERNS.tension);
    const resolutionPattern = getRandomElement(SMART_PATTERNS.resolution);
    const modalPattern = getRandomElement(SMART_PATTERNS.modal);
    
    pattern = [...tensionPattern];
    if (length > 4) {
      pattern = [...pattern, ...resolutionPattern];
    }
    if (length > 8) {
      pattern = [...pattern, ...modalPattern];
    }
  } else if (options.selectedCadence && CADENCE_PATTERNS[mode]) {
    const cadence = CADENCE_PATTERNS[mode].find(c => c.name === options.selectedCadence);
    pattern = cadence ? cadence.pattern : getRandomElement(PROGRESSION_PATTERNS[mode]);
  } else {
    pattern = getRandomElement(PROGRESSION_PATTERNS[mode]);
  }

  // Fill progression to desired length
  while (progression.length < length) {
    pattern.forEach(degree => {
      if (progression.length >= length) return;

      const { chord, numeral } = translateDegreeToChord(degree, mode, options.key || 'C');
      let finalChord = chord;

      // Apply secondary dominants and tritone substitutions with higher probability in smart mode
      const shouldApplySecondary = mode === 'smart' ? Math.random() > 0.6 : Math.random() > 0.7;
      const shouldApplyTritone = mode === 'smart' ? Math.random() > 0.7 : Math.random() > 0.8;

      if (options.useSecondaryDominants && shouldApplySecondary) {
        const secondaryDom = getSecondaryDominant(chord);
        if (secondaryDom) {
          finalChord = secondaryDom;
          romanNumerals.push(`V7/${numeral}`);
        } else {
          romanNumerals.push(numeral);
        }
      } else if (options.useTritoneSubstitutions && shouldApplyTritone) {
        const tritone = getTritoneSubstitution(chord);
        if (tritone) {
          finalChord = tritone;
          romanNumerals.push(`bII7/${numeral}`);
        } else {
          romanNumerals.push(numeral);
        }
      } else {
        romanNumerals.push(numeral);
      }

      // Create voicing if enabled
      let voicing: string[] = [];
      if (options.useExtendedVoicings && options.voicingOptions) {
        voicing = createVoicing(finalChord, options.voicingOptions);
      }

      progression.push(finalChord);
      voicings.push(voicing);
    });

    // Get new pattern for next iteration if needed
    if (mode === 'smart') {
      pattern = getRandomElement(SMART_PATTERNS.resolution);
    } else {
      pattern = getRandomElement(PROGRESSION_PATTERNS[mode]);
    }
  }

  return {
    chords: progression.slice(0, length),
    voicings: voicings.slice(0, length),
    romanNumerals: romanNumerals.slice(0, length),
  };
};