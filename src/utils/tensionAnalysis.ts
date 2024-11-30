import { ChordFunction } from '../types/music';
import { Chord, Note, Interval, Scale } from 'tonal';

interface TensionSource {
  type: 'harmonic' | 'melodic' | 'functional' | 'voiceLeading';
  description: string;
  severity: number;
  resolution?: string;
}

interface TensionAnalysis {
  totalTension: number;
  sources: TensionSource[];
  resolutionPaths: string[];
  voiceLeadingSuggestions: string[];
}

export const analyzeTension = (
  chord: string,
  nextChord: string | undefined,
  chordFunction: ChordFunction,
  isResolution: boolean = false,
  key: string = 'C'
): TensionAnalysis => {
  const chordInfo = Chord.get(chord);
  const nextChordInfo = nextChord ? Chord.get(nextChord) : null;
  const sources: TensionSource[] = [];
  let totalTension = 0;

  // Analyze harmonic tension (chord internal structure)
  const harmonicTension = analyzeHarmonicTension(chordInfo);
  sources.push(...harmonicTension.sources);
  totalTension += harmonicTension.tension;

  // Analyze functional tension (role in progression)
  const functionalTension = analyzeFunctionalTension(chord, chordFunction, key);
  sources.push(...functionalTension.sources);
  totalTension += functionalTension.tension;

  // Analyze voice leading tension (if next chord exists)
  if (nextChordInfo) {
    const voiceLeadingTension = analyzeVoiceLeadingTension(chordInfo, nextChordInfo);
    sources.push(...voiceLeadingTension.sources);
    totalTension += voiceLeadingTension.tension;
  }

  // Generate resolution paths
  const resolutionPaths = generateResolutionPaths(chord, chordFunction, key);

  // Generate voice leading suggestions
  const voiceLeadingSuggestions = generateVoiceLeadingSuggestions(
    chordInfo,
    nextChordInfo,
    key
  );

  return {
    totalTension: Math.min(100, totalTension),
    sources,
    resolutionPaths,
    voiceLeadingSuggestions,
  };
};

interface TensionComponent {
  tension: number;
  sources: TensionSource[];
}

const analyzeHarmonicTension = (chordInfo: any): TensionComponent => {
  const sources: TensionSource[] = [];
  let tension = 0;

  // Analyze intervals within the chord
  const intervals = chordInfo.intervals;
  const dissonantIntervals = intervals.filter(int => 
    ['2m', '2M', '4A', '5d', '7m', '7M', '9m', '9M', '11A', '13m'].includes(int)
  );

  if (dissonantIntervals.length > 0) {
    tension += dissonantIntervals.length * 15;
    sources.push({
      type: 'harmonic',
      description: `Contains dissonant intervals: ${dissonantIntervals.join(', ')}`,
      severity: dissonantIntervals.length * 15,
      resolution: 'Consider resolving dissonant intervals by step'
    });
  }

  // Analyze chord extensions
  if (chordInfo.extended) {
    tension += 20;
    sources.push({
      type: 'harmonic',
      description: 'Extended harmony increases complexity',
      severity: 20,
      resolution: 'Extended harmonies typically resolve to simpler structures'
    });
  }

  // Analyze chord alterations
  if (chordInfo.symbol.includes('alt') || chordInfo.symbol.includes('b5') || chordInfo.symbol.includes('#5')) {
    tension += 25;
    sources.push({
      type: 'harmonic',
      description: 'Altered chord tones create instability',
      severity: 25,
      resolution: 'Altered tones typically resolve by half-step'
    });
  }

  return { tension, sources };
};

const analyzeFunctionalTension = (
  chord: string,
  chordFunction: ChordFunction,
  key: string
): TensionComponent => {
  const sources: TensionSource[] = [];
  let tension = 0;

  // Base tension from harmonic function
  switch (chordFunction) {
    case 'dominant':
      tension += 60;
      sources.push({
        type: 'functional',
        description: 'Dominant function creates strong pull to tonic',
        severity: 60,
        resolution: 'Resolve to tonic or deceptively to submediant'
      });
      break;
    case 'subdominant':
      tension += 30;
      sources.push({
        type: 'functional',
        description: 'Subdominant function creates moderate tension',
        severity: 30,
        resolution: 'Move to dominant or tonic'
      });
      break;
    case 'secondary':
      tension += 45;
      sources.push({
        type: 'functional',
        description: 'Secondary function creates temporary tonal shift',
        severity: 45,
        resolution: 'Resolve to local tonic or continue secondary progression'
      });
      break;
  }

  // Analyze distance from key center
  const keyRoot = key.match(/^[A-G][#b]?/)?.[0] || 'C';
  const chordRoot = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
  const distance = Math.abs(Note.midi(chordRoot)! - Note.midi(keyRoot)!);
  
  if (distance > 6) {
    tension += 20;
    sources.push({
      type: 'functional',
      description: 'Remote from key center',
      severity: 20,
      resolution: 'Consider smoother modulation path'
    });
  }

  return { tension, sources };
};

const analyzeVoiceLeadingTension = (
  currentChord: any,
  nextChord: any
): TensionComponent => {
  const sources: TensionSource[] = [];
  let tension = 0;

  // Analyze voice leading between chords
  const currentNotes = currentChord.notes;
  const nextNotes = nextChord.notes;

  // Check for parallel fifths/octaves
  const hasParallelFifths = checkParallelFifths(currentNotes, nextNotes);
  if (hasParallelFifths) {
    tension += 25;
    sources.push({
      type: 'voiceLeading',
      description: 'Contains parallel perfect intervals',
      severity: 25,
      resolution: 'Use contrary or oblique motion'
    });
  }

  // Analyze voice leading distances
  const totalLeap = currentNotes.reduce((sum, note, i) => {
    if (i >= nextNotes.length) return sum;
    const interval = Math.abs(Note.midi(nextNotes[i])! - Note.midi(note)!);
    return sum + (interval > 2 ? interval : 0);
  }, 0);

  if (totalLeap > 8) {
    tension += Math.min(40, totalLeap * 2);
    sources.push({
      type: 'voiceLeading',
      description: 'Large voice leading distances',
      severity: Math.min(40, totalLeap * 2),
      resolution: 'Consider smoother voice leading or voice exchange'
    });
  }

  return { tension, sources };
};

const checkParallelFifths = (currentNotes: string[], nextNotes: string[]): boolean => {
  for (let i = 0; i < currentNotes.length - 1; i++) {
    for (let j = i + 1; j < currentNotes.length; j++) {
      const currentInterval = Interval.distance(currentNotes[i], currentNotes[j]);
      if (!nextNotes[i] || !nextNotes[j]) continue;
      const nextInterval = Interval.distance(nextNotes[i], nextNotes[j]);
      
      if (
        (currentInterval === '5P' && nextInterval === '5P') ||
        (currentInterval === '8P' && nextInterval === '8P')
      ) {
        return true;
      }
    }
  }
  return false;
};

const generateResolutionPaths = (
  chord: string,
  chordFunction: ChordFunction,
  key: string
): string[] => {
  const paths: string[] = [];
  const chordRoot = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
  const scale = Scale.get(`${key} major`);

  switch (chordFunction) {
    case 'dominant':
      paths.push(`Resolve to ${key}maj7 (authentic cadence)`);
      paths.push(`Resolve to ${scale.notes[5]}m7 (deceptive cadence)`);
      paths.push(`Extend tension with ${chordRoot}7alt`);
      break;
    case 'subdominant':
      paths.push(`Move to ${scale.notes[4]}7 (pre-dominant)`);
      paths.push(`Move to ${key}maj7 (plagal cadence)`);
      break;
    case 'secondary':
      const target = Interval.transpose(chordRoot, '4P');
      paths.push(`Resolve to ${target} (secondary resolution)`);
      paths.push(`Return to ${key} (abandon secondary)`);
      break;
    default:
      paths.push(`Move to ${scale.notes[4]}7 (to dominant)`);
      paths.push(`Move to ${scale.notes[3]}m7 (to subdominant)`);
  }

  return paths;
};

const generateVoiceLeadingSuggestions = (
  currentChord: any,
  nextChord: any | null,
  key: string
): string[] => {
  const suggestions: string[] = [];

  if (!nextChord) {
    suggestions.push('Maintain common tones when possible');
    suggestions.push('Prepare voice leading for next chord');
    return suggestions;
  }

  // Analyze specific voice leading issues
  const currentNotes = currentChord.notes;
  const nextNotes = nextChord.notes;

  // Common tones
  const commonTones = currentNotes.filter(note => nextNotes.includes(note));
  if (commonTones.length > 0) {
    suggestions.push(`Keep common tones: ${commonTones.join(', ')}`);
  }

  // Leading tone resolution
  const leadingTone = Scale.get(`${key} major`).notes[6];
  if (currentNotes.includes(leadingTone)) {
    suggestions.push(`Resolve leading tone ${leadingTone} to ${key}`);
  }

  // Suggest contrary motion if parallel motion issues exist
  if (checkParallelFifths(currentNotes, nextNotes)) {
    suggestions.push('Use contrary motion to avoid parallel fifths/octaves');
  }

  return suggestions;
};