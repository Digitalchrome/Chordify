import { Chord, Scale, Note } from 'tonal';
import { ChordMode } from '../types/music';

export interface ProgressionVariation {
  chords: string[];
  description: string;
  complexity: number;
  style: string;
  technique: string;
}

export const generateProgressionVariations = (
  progression: string[],
  mode: ChordMode
): ProgressionVariation[] => {
  const variations: ProgressionVariation[] = [];

  // Add all variation types
  variations.push(...generateHarmonicSubstitutions(progression));
  variations.push(...generateModalInterchanges(progression));
  variations.push(...generateSecondaryDominants(progression));
  variations.push(...generateExtendedProgressions(progression));
  variations.push(...generateTritoneSubstitutions(progression));
  variations.push(...generateChordScaleVariations(progression, mode));
  variations.push(...generateRhythmicVariations(progression));
  variations.push(...generateChromaticApproaches(progression));
  variations.push(...generatePolytonalVariations(progression));
  variations.push(...generateSymmetricVariations(progression));

  return variations;
};

const generateHarmonicSubstitutions = (progression: string[]): ProgressionVariation[] => {
  const variations: ProgressionVariation[] = [];

  // Relative minor/major substitutions
  variations.push({
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      const relativeRoot = Note.transpose(
        info.tonic,
        info.type.includes('m') ? '3M' : '-3m'
      );
      return `${relativeRoot}${info.type.includes('m') ? '' : 'm'}`;
    }),
    description: 'Relative minor/major substitutions',
    complexity: 2,
    style: 'Jazz',
    technique: 'Harmonic Substitution'
  });

  // Mediant substitutions
  variations.push({
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      return `${Note.transpose(info.tonic, '3M')}${info.type}`;
    }),
    description: 'Mediant relationships',
    complexity: 3,
    style: 'Contemporary',
    technique: 'Harmonic Substitution'
  });

  return variations;
};

const generateModalInterchanges = (progression: string[]): ProgressionVariation[] => {
  const variations: ProgressionVariation[] = [];
  const modes = ['dorian', 'phrygian', 'lydian', 'mixolydian', 'aeolian', 'locrian'];

  modes.forEach(mode => {
    variations.push({
      chords: progression.map(chord => {
        const info = Chord.get(chord);
        const scale = Scale.get(`${info.tonic} ${mode}`);
        return `${info.tonic}${mode === 'dorian' || mode === 'phrygian' ? 'm7' : 'maj7'}`;
      }),
      description: `Modal interchange using ${mode} mode`,
      complexity: 3,
      style: 'Modal',
      technique: 'Modal Interchange'
    });
  });

  return variations;
};

const generateSecondaryDominants = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.map((chord, i) => {
      if (i === progression.length - 1) return chord;
      const nextChord = progression[i + 1];
      const nextRoot = Chord.get(nextChord).tonic;
      return `${Note.transpose(nextRoot, '5P')}7`;
    }),
    description: 'Secondary dominant chain',
    complexity: 3,
    style: 'Classical/Jazz',
    technique: 'Secondary Dominants'
  }];
};

const generateExtendedProgressions = (progression: string[]): ProgressionVariation[] => {
  return [
    {
      chords: progression.map(chord => {
        const info = Chord.get(chord);
        return `${info.tonic}${info.type.includes('m') ? 'm9' : 'maj9'}`;
      }),
      description: 'Extended chord voicings with 9ths',
      complexity: 2,
      style: 'Jazz',
      technique: 'Extension'
    },
    {
      chords: progression.map(chord => {
        const info = Chord.get(chord);
        return `${info.tonic}${info.type.includes('m') ? 'm11' : 'maj13'}`;
      }),
      description: 'Extended chord voicings with 11ths/13ths',
      complexity: 3,
      style: 'Modern Jazz',
      technique: 'Extension'
    }
  ];
};

const generateTritoneSubstitutions = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      if (info.type.includes('7')) {
        const tritoneRoot = Note.transpose(info.tonic, '6A');
        return `${tritoneRoot}7`;
      }
      return chord;
    }),
    description: 'Tritone substitutions for dominant chords',
    complexity: 4,
    style: 'Jazz',
    technique: 'Tritone Substitution'
  }];
};

const generateChordScaleVariations = (
  progression: string[],
  mode: ChordMode
): ProgressionVariation[] => {
  const variations: ProgressionVariation[] = [];

  // Melodic minor based
  variations.push({
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      return `${info.tonic}${info.type.includes('m') ? 'mMaj7' : 'maj7#11'}`;
    }),
    description: 'Melodic minor harmony',
    complexity: 4,
    style: 'Modern Jazz',
    technique: 'Scale-Based Harmony'
  });

  // Symmetric scales
  variations.push({
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      return `${info.tonic}7alt`;
    }),
    description: 'Altered scale harmony',
    complexity: 5,
    style: 'Advanced Jazz',
    technique: 'Scale-Based Harmony'
  });

  return variations;
};

const generateRhythmicVariations = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.flatMap(chord => [chord, chord]),
    description: 'Double-time harmonic rhythm',
    complexity: 2,
    style: 'Rhythmic',
    technique: 'Rhythmic Variation'
  }];
};

const generateChromaticApproaches = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.flatMap(chord => {
      const info = Chord.get(chord);
      const approach = Note.transpose(info.tonic, '-2m');
      return [`${approach}7`, chord];
    }),
    description: 'Chromatic approach chords',
    complexity: 3,
    style: 'Bebop',
    technique: 'Chromatic Approach'
  }];
};

const generatePolytonalVariations = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      const polyRoot = Note.transpose(info.tonic, '5P');
      return `${info.tonic}${info.type}/${polyRoot}`;
    }),
    description: 'Polytonal harmony with slash chords',
    complexity: 4,
    style: 'Contemporary',
    technique: 'Polytonality'
  }];
};

const generateSymmetricVariations = (progression: string[]): ProgressionVariation[] => {
  return [{
    chords: progression.map(chord => {
      const info = Chord.get(chord);
      return `${info.tonic}${info.type.includes('m') ? 'ø7' : 'aug7'}`;
    }),
    description: 'Symmetric harmony',
    complexity: 4,
    style: 'Modern',
    technique: 'Symmetric Harmony'
  }];
};