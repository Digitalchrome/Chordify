import { ChordFunction } from '../types/music';
import { Chord } from 'tonal';
import { NOTES } from './chordDatabase';

export const analyzeChordFunction = (
  chord: string,
  key: string,
  romanNumeral: string
): ChordFunction => {
  // Remove any numbers or symbols after the root note
  const chordRoot = chord.match(/^[A-G][#b]?/)?.[0] || '';
  const keyRoot = key.match(/^[A-G][#b]?/)?.[0] || '';
  
  if (!chordRoot || !keyRoot) return 'tonic';

  const interval = NOTES.indexOf(chordRoot) - NOTES.indexOf(keyRoot);
  const normalizedInterval = ((interval % 12) + 12) % 12;

  // Check for secondary dominants
  if (romanNumeral.includes('/')) return 'secondary';

  // Analyze based on scale degree
  switch (normalizedInterval) {
    case 0: // I
      return 'tonic';
    case 7: // V
      return 'dominant';
    case 5: // IV
    case 2: // ii
      return 'subdominant';
    default:
      return romanNumeral.toLowerCase().includes('v') ? 'dominant' : 'subdominant';
  }
};

export const getChordSubstitutions = (
  chord: string,
  romanNumeral: string,
  chordFunction: ChordFunction
): string[] => {
  const substitutions: string[] = [];
  const chordObj = Chord.get(chord);
  const root = chord.match(/^[A-G][#b]?/)?.[0];
  
  if (!root || !chordObj.notes.length) return [];

  // Basic Substitutions
  const tritoneRoot = NOTES[(NOTES.indexOf(root) + 6) % 12];
  const relativeRoot = NOTES[(NOTES.indexOf(root) + (chord.includes('m') ? 3 : -3)) % 12];
  const mediantRoot = NOTES[(NOTES.indexOf(root) + 4) % 12];
  const submediandRoot = NOTES[(NOTES.indexOf(root) + 8) % 12];

  // Add sophisticated substitutions based on function and chord quality
  switch (chordFunction) {
    case 'tonic':
      // Tonic substitutes
      substitutions.push(
        `${root}maj9`, // Extended tonic
        `${root}6/9`, // Add6/9 voicing
        `${relativeRoot}m11`, // Relative minor with extensions
        `${mediantRoot}m7`, // Mediant minor
        `${submediandRoot}m7`, // Submediant minor
      );
      if (!chord.includes('m')) {
        substitutions.push(
          `${root}maj13#11`, // Lydian tonic
          `${root}maj7#5`, // Augmented major
          `${mediantRoot}m7b5` // Modal interchange
        );
      }
      break;

    case 'dominant':
      // Dominant substitutes
      substitutions.push(
        `${root}7b9`, // Altered dominant
        `${root}7#9`, // Hendrix chord
        `${root}7#11`, // Lydian dominant
        `${root}7alt`, // Altered scale dominant
        `${root}13b9`, // Extended altered dominant
        `${tritoneRoot}7b5`, // Tritone with altered fifth
        `${tritoneRoot}7#9`, // Tritone with sharp nine
        `${mediantRoot}7sus4`, // Mediant sus
        `${NOTES[(NOTES.indexOf(root) + 9) % 12]}7b13` // Minor third relation
      );
      break;

    case 'subdominant':
      // Subdominant substitutes
      substitutions.push(
        `${root}m9`, // Minor ninth
        `${root}m11`, // Minor eleventh
        `${mediantRoot}m7b5`, // Half-diminished
        `${NOTES[(NOTES.indexOf(root) + 5) % 12]}m7`, // Minor substitute
        `${root}sus4`, // Sus4 voicing
        `${root}6/9`, // 6/9 voicing
        `${NOTES[(NOTES.indexOf(root) + 10) % 12]}m7b5` // Modal interchange
      );
      break;

    case 'secondary':
      // Secondary dominant substitutes
      substitutions.push(
        `${root}7b9`,
        `${root}7#5`,
        `${tritoneRoot}7`,
        `${NOTES[(NOTES.indexOf(root) + 9) % 12]}m7b5`
      );
      break;
  }

  // Add upper structure triads
  const upperStructures = [
    `${root}7sus4`,
    `${NOTES[(NOTES.indexOf(root) + 2) % 12]}/${root}`,
    `${NOTES[(NOTES.indexOf(root) + 4) % 12]}/${root}`,
    `${NOTES[(NOTES.indexOf(root) + 6) % 12]}m/${root}`
  ];
  substitutions.push(...upperStructures);

  return [...new Set(substitutions)]; // Remove duplicates
};

export const generateSecondaryDominantChain = (
  targetChord: string,
  key: string
): string[][] => {
  const root = targetChord.match(/^[A-G][#b]?/)?.[0];
  if (!root) return [];

  const chains: string[][] = [];

  // Extended secondary dominant chain
  const extendedChain = generateExtendedChain(root);
  if (extendedChain.length > 0) {
    chains.push([...extendedChain, targetChord]);
  }

  // Chromatic approach chain
  const chromaticChain = generateChromaticChain(root);
  if (chromaticChain.length > 0) {
    chains.push([...chromaticChain, targetChord]);
  }

  // Modal interchange chain
  const modalChain = generateModalChain(root, key);
  if (modalChain.length > 0) {
    chains.push([...modalChain, targetChord]);
  }

  return chains;
};

const generateExtendedChain = (targetRoot: string): string[] => {
  const chain: string[] = [];
  let currentRoot = targetRoot;

  // Generate up to 3 secondary dominants
  for (let i = 0; i < 3; i++) {
    const dominantRoot = NOTES[(NOTES.indexOf(currentRoot) + 7) % 12];
    chain.unshift(`${dominantRoot}7`);
    currentRoot = dominantRoot;

    // Add ii-V relationship for more complexity
    const supertonic = NOTES[(NOTES.indexOf(dominantRoot) + 2) % 12];
    chain.unshift(`${supertonic}m7`);
  }

  return chain.slice(-4); // Limit to 4 chords
};

const generateChromaticChain = (targetRoot: string): string[] => {
  const targetIndex = NOTES.indexOf(targetRoot);
  const chain: string[] = [];

  // Generate chromatic approach
  for (let i = 1; i <= 3; i++) {
    const approachRoot = NOTES[(targetIndex - i + 12) % 12];
    chain.unshift(`${approachRoot}7`);
  }

  return chain;
};

const generateModalChain = (targetRoot: string, key: string): string[] => {
  const chain: string[] = [];
  const keyIndex = NOTES.indexOf(key);
  const targetIndex = NOTES.indexOf(targetRoot);

  // Add modal mixture chords
  const flatSixth = NOTES[(keyIndex + 8) % 12];
  const flatSeventh = NOTES[(keyIndex + 10) % 12];
  
  chain.push(`${flatSixth}maj7`);
  chain.push(`${flatSeventh}7`);
  chain.push(`${targetRoot}${targetIndex === keyIndex ? 'maj7' : '7'}`);

  return chain;
};