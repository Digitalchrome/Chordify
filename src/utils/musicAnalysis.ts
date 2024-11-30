import { Scale, Chord } from 'tonal';

export const getScaleCharacteristics = (scale: string): string => {
  switch (scale.toLowerCase()) {
    // Major scale family
    case 'major':
    case 'ionian':
      return 'Bright and stable';
    case 'lydian':
      return 'Bright and mystical (#4)';
    case 'mixolydian':
      return 'Dominant, bluesy (b7)';

    // Minor scale family
    case 'minor':
    case 'aeolian':
      return 'Natural minor, melancholic';
    case 'dorian':
      return 'Minor with bright 6th';
    case 'phrygian':
      return 'Dark, Spanish flavor (b2)';
    case 'locrian':
      return 'Diminished, very unstable';

    // Jazz scales
    case 'melodic minor':
      return 'Jazz minor, fluid sound';
    case 'harmonic minor':
      return 'Exotic, Middle Eastern';
    case 'altered':
      return 'Very tense, altered dominant';
    case 'whole tone':
      return 'Symmetrical, dreamlike';
    case 'diminished':
      return 'Symmetrical, unstable';

    // Modal scales
    case 'lydian dominant':
      return 'Fusion sound (#4, b7)';
    case 'lydian augmented':
      return 'Modern jazz sound (#4, #5)';
    case 'locrian #2':
      return 'Half-diminished sound';
    case 'super locrian':
      return 'Altered dominant scale';

    // World scales
    case 'hungarian minor':
      return 'Eastern European flavor';
    case 'ukrainian dorian':
      return 'Folk music character';
    case 'persian':
      return 'Middle Eastern sound';
    case 'byzantine':
      return 'Greek/Turkish character';
    case 'japanese':
      return 'Pentatonic-based, Asian';
    case 'indian':
      return 'South Asian character';

    // Pentatonic scales
    case 'pentatonic major':
      return 'Five-note, no tension';
    case 'pentatonic minor':
      return 'Blues-based, soulful';

    // Other scales
    case 'chromatic':
      return 'All 12 notes, highly chromatic';
    case 'blues':
      return 'Blues scale, soulful';
    case 'bebop':
      return 'Jazz bebop sound';
    case 'double harmonic':
      return 'Very exotic, Arabic sound';

    default:
      return 'Unique scale character';
  }
};

export const getCompatibleScales = (chord: string): string[] => {
  const root = chord.match(/^[A-G][#b]?/)?.[0] || 'C';
  const quality = chord.slice(root.length);

  // Start with common scales for all chords
  let scales = [
    'major', 'minor', 'melodic minor', 'harmonic minor',
    'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian',
    'whole tone', 'diminished', 'chromatic'
  ];

  // Add specific scales based on chord quality
  if (quality.includes('maj13') || quality.includes('maj9')) {
    scales = [
      'major', 'lydian', 'lydian augmented',
      'melodic minor', 'lydian dominant',
      'ionian augmented', 'harmonic major',
      'double harmonic major'
    ];
  } else if (quality.includes('maj7')) {
    scales = [
      'major', 'lydian', 'harmonic major',
      'melodic minor', 'lydian augmented',
      'ionian', 'lydian dominant',
      'whole tone'
    ];
  } else if (quality.includes('7alt')) {
    scales = [
      'altered', 'super locrian',
      'diminished whole tone',
      'melodic minor',
      'locrian #2',
      'half-whole diminished'
    ];
  } else if (quality.includes('7b9') || quality.includes('7#9')) {
    scales = [
      'half-whole diminished',
      'altered',
      'phrygian dominant',
      'harmonic minor',
      'melodic minor',
      'diminished'
    ];
  } else if (quality.includes('7#11')) {
    scales = [
      'lydian dominant',
      'lydian b7',
      'overtone',
      'whole tone',
      'melodic minor',
      'altered'
    ];
  } else if (quality.includes('7')) {
    scales = [
      'mixolydian',
      'lydian dominant',
      'phrygian dominant',
      'altered',
      'half-whole diminished',
      'whole tone',
      'blues'
    ];
  } else if (quality.includes('m13') || quality.includes('m11')) {
    scales = [
      'dorian',
      'aeolian',
      'melodic minor',
      'harmonic minor',
      'phrygian',
      'locrian natural 2'
    ];
  } else if (quality.includes('m9')) {
    scales = [
      'dorian',
      'aeolian',
      'phrygian',
      'melodic minor',
      'harmonic minor',
      'locrian #2'
    ];
  } else if (quality.includes('m7b5') || quality.includes('ø')) {
    scales = [
      'locrian',
      'locrian #2',
      'half-whole diminished',
      'altered',
      'super locrian',
      'melodic minor'
    ];
  } else if (quality.includes('m7')) {
    scales = [
      'dorian',
      'aeolian',
      'phrygian',
      'melodic minor',
      'harmonic minor',
      'locrian'
    ];
  } else if (quality.includes('m')) {
    scales = [
      'natural minor',
      'harmonic minor',
      'melodic minor',
      'dorian',
      'phrygian',
      'locrian'
    ];
  } else if (quality.includes('dim') || quality.includes('°')) {
    scales = [
      'whole-tone',
      'diminished',
      'half-whole diminished',
      'whole-half diminished',
      'locrian',
      'altered'
    ];
  } else if (quality.includes('aug')) {
    scales = [
      'whole-tone',
      'lydian augmented',
      'melodic minor',
      'harmonic major',
      'double harmonic'
    ];
  } else if (quality.includes('sus4')) {
    scales = [
      'mixolydian',
      'lydian dominant',
      'melodic minor',
      'phrygian',
      'whole tone'
    ];
  } else if (quality.includes('sus2')) {
    scales = [
      'mixolydian',
      'lydian',
      'dorian',
      'pentatonic major',
      'whole tone'
    ];
  } else {
    // Major triad
    scales = [
      'major',
      'lydian',
      'mixolydian',
      'harmonic major',
      'melodic minor',
      'pentatonic major',
      'whole tone'
    ];
  }

  // Add exotic/world scales for more options
  scales = [...new Set([
    ...scales,
    'hungarian minor',
    'ukrainian dorian',
    'persian',
    'byzantine',
    'japanese',
    'indian'
  ])];

  return scales;
};