export type ChordMode = 'classical' | 'jazz' | 'blues' | 'modal' | 'contemporary' | 'smart';
export type ProgressionLength = 4 | 8 | 12 | 16;
export type VoicingStyle = 'close' | 'spread' | 'drop2' | 'quartal';
export type ScaleType = 'major' | 'minor' | 'dorian' | 'mixolydian' | 'lydian' | 'phrygian' | 'locrian';
export type ChordFunction = 'tonic' | 'subdominant' | 'dominant' | 'secondary';
export type VoicingType = 'basic' | 'extended' | 'custom' | 'jazz' | 'quartal' | 'close' | 'spread' | 'drop2';

export interface VoicingOptions {
  style: VoicingStyle;
  type: VoicingType;
  extensions: boolean;
  smoothVoiceLeading: boolean;
}

export interface ChordProgression {
  chords: string[];
  mode: ChordMode;
  length: ProgressionLength;
  voicings?: string[][];
  cadence?: string;
  key?: string;
  scale?: ScaleType;
  romanNumerals?: string[];
  functions?: ChordFunction[];
  voicingType?: VoicingType;
}

export const DEFAULT_PROGRESSION: ChordProgression = {
  chords: ['Cmaj7', 'Dm7', 'G7', 'Cmaj7'],
  mode: 'jazz',
  length: 4,
  key: 'C',
  scale: 'major',
  voicingType: 'basic'
};