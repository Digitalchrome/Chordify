import { ChordMode } from '../types/music';
import { PROGRESSION_PATTERNS } from './chordDatabase';

interface ChordProbability {
  chord: string;
  probability: number;
}

export const getProbableNextChords = (
  currentChord: string,
  mode: ChordMode,
  key: string
): ChordProbability[] => {
  const patterns = PROGRESSION_PATTERNS[mode] || [];
  const probabilities = new Map<string, number>();
  let totalOccurrences = 0;

  // Analyze all patterns for transitions from current chord
  patterns.forEach(pattern => {
    for (let i = 0; i < pattern.length - 1; i++) {
      if (pattern[i] === currentChord) {
        const nextChord = pattern[i + 1];
        probabilities.set(
          nextChord,
          (probabilities.get(nextChord) || 0) + 1
        );
        totalOccurrences++;
      }
    }
  });

  // Convert to array and normalize probabilities
  const results = Array.from(probabilities.entries())
    .map(([chord, count]) => ({
      chord,
      probability: count / totalOccurrences
    }))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 5); // Top 5 most likely chords

  // Add common substitutions if we have few results
  if (results.length < 3) {
    const substitutions = getCommonSubstitutions(currentChord, mode);
    substitutions.forEach(sub => {
      if (!results.find(r => r.chord === sub)) {
        results.push({ chord: sub, probability: 0.1 });
      }
    });
  }

  return results;
};

const getCommonSubstitutions = (chord: string, mode: ChordMode): string[] => {
  switch (mode) {
    case 'jazz':
      return ['ii7', 'V7', 'iiø7', 'V7alt'];
    case 'classical':
      return ['V', 'IV', 'vi'];
    case 'contemporary':
      return ['IV', 'vi', 'V'];
    default:
      return [];
  }
};