import { NOTES } from './chordDatabase';
import { ChordMode } from '../types/music';

interface ModulationOption {
  targetKey: string;
  type: string;
  chords: string[];
  description: string;
}

export const getModulationOptions = (
  currentKey: string,
  currentChord: string,
  mode: ChordMode
): ModulationOption[] => {
  const options: ModulationOption[] = [];
  const keyIndex = NOTES.indexOf(currentKey);

  // Relative major/minor
  if (mode === 'major' || mode === 'contemporary') {
    const relativeMinor = NOTES[(keyIndex + 9) % 12];
    options.push({
      targetKey: `${relativeMinor}m`,
      type: 'minor',
      chords: [currentChord, `${relativeMinor}m7`],
      description: 'Relative minor modulation',
    });
  } else if (mode === 'minor') {
    const relativeMajor = NOTES[(keyIndex + 3) % 12];
    options.push({
      targetKey: relativeMajor,
      type: 'major',
      chords: [currentChord, `${relativeMajor}maj7`],
      description: 'Relative major modulation',
    });
  }

  // Dominant modulation
  const dominant = NOTES[(keyIndex + 7) % 12];
  options.push({
    targetKey: dominant,
    type: mode === 'minor' ? 'minor' : 'major',
    chords: [currentChord, `${dominant}7`, `${dominant}${mode === 'minor' ? 'm7' : 'maj7'}`],
    description: 'Modulation to the dominant',
  });

  // Subdominant modulation
  const subdominant = NOTES[(keyIndex + 5) % 12];
  options.push({
    targetKey: subdominant,
    type: mode === 'minor' ? 'minor' : 'major',
    chords: [currentChord, `${subdominant}${mode === 'minor' ? 'm7' : 'maj7'}`],
    description: 'Modulation to the subdominant',
  });

  // Parallel major/minor
  options.push({
    targetKey: mode === 'minor' ? currentKey : `${currentKey}m`,
    type: mode === 'minor' ? 'major' : 'minor',
    chords: [currentChord, `${currentKey}${mode === 'minor' ? 'maj7' : 'm7'}`],
    description: `Parallel ${mode === 'minor' ? 'major' : 'minor'} modulation`,
  });

  // Chromatic mediant relationships
  const mediant = NOTES[(keyIndex + 4) % 12];
  const flatMediant = NOTES[(keyIndex + 3) % 12];
  options.push({
    targetKey: mediant,
    type: 'major',
    chords: [currentChord, `${mediant}maj7`],
    description: 'Chromatic mediant modulation',
  });
  options.push({
    targetKey: flatMediant,
    type: 'major',
    chords: [currentChord, `${flatMediant}maj7`],
    description: 'Flat mediant modulation',
  });

  return options;
};