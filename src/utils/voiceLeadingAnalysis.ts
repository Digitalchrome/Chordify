import { Chord, Note } from 'tonal';

export interface VoicingOption {
  chord: string;
  notes: string[];
  smoothness: number;
  description: string;
  voicingType: VoicingType;
  midiNotes: number[];
}

export type VoicingType = 
  | 'close'
  | 'drop2'
  | 'drop3'
  | 'spread'
  | 'quartal'
  | 'cluster'
  | 'openVoicing'
  | 'shellVoicing';

export const optimizeVoiceLeading = (
  currentChord: string,
  nextChord: string,
  options: {
    preferredVoicingTypes?: VoicingType[];
    maxVoiceLeadingDistance?: number;
    forceTopNote?: string;
    forceBassPedal?: boolean;
    voiceRange?: { min: number; max: number };
  } = {}
): VoicingOption[] => {
  const current = Chord.get(currentChord);
  const next = Chord.get(nextChord);
  
  if (!current.notes.length || !next.notes.length) return [];

  const voicingOptions: VoicingOption[] = [];
  const baseVoicing = current.notes;
  
  // Default options
  const {
    preferredVoicingTypes = ['close', 'drop2', 'drop3'],
    maxVoiceLeadingDistance = 4,
    forceTopNote,
    forceBassPedal = false,
    voiceRange = { min: 48, max: 84 } // MIDI notes range from C3 to C6
  } = options;

  // Generate all possible voicing types
  const voicings = [
    ...getCloseVoicings(current.notes, voiceRange),
    ...getDropVoicings(current.notes, voiceRange),
    ...getQuartalVoicings(current.notes, voiceRange),
    ...getSpreadVoicings(current.notes, voiceRange),
    ...getShellVoicings(current.notes, voiceRange)
  ];

  // Filter and score voicings
  voicings.forEach(voicing => {
    const { notes, type } = voicing;
    
    // Skip if voicing type not preferred
    if (!preferredVoicingTypes.includes(type)) return;
    
    // Skip if top note doesn't match forced note
    if (forceTopNote && notes[notes.length - 1] !== forceTopNote) return;
    
    // Calculate voice leading smoothness
    const smoothness = calculateSmoothness(notes, next.notes, maxVoiceLeadingDistance);
    
    // Convert to MIDI notes for export
    const midiNotes = notes.map(note => Note.midi(note) || 60);
    
    voicingOptions.push({
      chord: `${currentChord} (${type})`,
      notes,
      smoothness,
      description: getVoicingDescription(type, smoothness),
      voicingType: type,
      midiNotes
    });
  });

  return voicingOptions.sort((a, b) => b.smoothness - a.smoothness);
};

const getCloseVoicings = (notes: string[], range: { min: number; max: number }): Array<{ notes: string[], type: VoicingType }> => {
  const voicings: Array<{ notes: string[], type: VoicingType }> = [];
  const octaves = [3, 4, 5];
  
  octaves.forEach(octave => {
    const voicing = notes.map(note => `${note}${octave}`);
    if (isWithinRange(voicing, range)) {
      voicings.push({ notes: voicing, type: 'close' });
    }
  });
  
  return voicings;
};

const getDropVoicings = (notes: string[], range: { min: number; max: number }): Array<{ notes: string[], type: VoicingType }> => {
  if (notes.length < 4) return [];
  
  const voicings: Array<{ notes: string[], type: VoicingType }> = [];
  const octaves = [3, 4];
  
  octaves.forEach(octave => {
    // Drop 2
    const drop2 = [
      `${notes[0]}${octave}`,
      `${notes[1]}${octave}`,
      `${notes[2]}${octave}`,
      `${notes[3]}${octave - 1}`
    ];
    
    // Drop 3
    const drop3 = [
      `${notes[0]}${octave}`,
      `${notes[1]}${octave}`,
      `${notes[2]}${octave - 1}`,
      `${notes[3]}${octave}`
    ];
    
    if (isWithinRange(drop2, range)) voicings.push({ notes: drop2, type: 'drop2' });
    if (isWithinRange(drop3, range)) voicings.push({ notes: drop3, type: 'drop3' });
  });
  
  return voicings;
};

const getQuartalVoicings = (notes: string[], range: { min: number; max: number }): Array<{ notes: string[], type: VoicingType }> => {
  const voicings: Array<{ notes: string[], type: VoicingType }> = [];
  const fourthsUp = notes.map((note, i) => 
    Note.transpose(note, `${i * 5}P`)  // Stack perfect fourths
  );
  
  [3, 4].forEach(octave => {
    const voicing = fourthsUp.map(note => `${note}${octave}`);
    if (isWithinRange(voicing, range)) {
      voicings.push({ notes: voicing, type: 'quartal' });
    }
  });
  
  return voicings;
};

const getSpreadVoicings = (notes: string[], range: { min: number; max: number }): Array<{ notes: string[], type: VoicingType }> => {
  const voicings: Array<{ notes: string[], type: VoicingType }> = [];
  
  // Create spread voicing with alternating octaves
  const spreadNotes = notes.map((note, i) => 
    `${note}${i % 2 === 0 ? 3 : 4}`
  );
  
  if (isWithinRange(spreadNotes, range)) {
    voicings.push({ notes: spreadNotes, type: 'spread' });
  }
  
  return voicings;
};

const getShellVoicings = (notes: string[], range: { min: number; max: number }): Array<{ notes: string[], type: VoicingType }> => {
  const voicings: Array<{ notes: string[], type: VoicingType }> = [];
  
  // Create shell voicing (root, third, seventh)
  if (notes.length >= 3) {
    const shellNotes = [
      `${notes[0]}3`, // root
      `${notes[1]}4`, // third
      `${notes[notes.length - 1]}4` // seventh or fifth
    ];
    
    if (isWithinRange(shellNotes, range)) {
      voicings.push({ notes: shellNotes, type: 'shellVoicing' });
    }
  }
  
  return voicings;
};

const calculateSmoothness = (
  voicing1: string[],
  voicing2: string[],
  maxDistance: number
): number => {
  let totalDistance = 0;
  let maxVoiceDistance = 0;
  const len = Math.min(voicing1.length, voicing2.length);
  
  for (let i = 0; i < len; i++) {
    const note1 = Note.midi(voicing1[i]) || 60;
    const note2 = Note.midi(voicing2[i]) || 60;
    const distance = Math.abs(note1 - note2);
    totalDistance += distance;
    maxVoiceDistance = Math.max(maxVoiceDistance, distance);
  }
  
  // Penalize if any voice moves more than maxDistance
  const distancePenalty = maxVoiceDistance > maxDistance ? 20 : 0;
  
  // Convert to a 0-100 smoothness score
  const maxPossibleDistance = len * maxDistance;
  const smoothness = 100 - (totalDistance / maxPossibleDistance) * 100 - distancePenalty;
  
  return Math.max(0, Math.round(smoothness));
};

const isWithinRange = (notes: string[], range: { min: number; max: number }): boolean => {
  return notes.every(note => {
    const midi = Note.midi(note);
    return midi && midi >= range.min && midi <= range.max;
  });
};

const getVoicingDescription = (type: VoicingType, smoothness: number): string => {
  const descriptions: Record<VoicingType, string> = {
    close: 'Traditional close position voicing',
    drop2: 'Drop 2 voicing - warmer sound with more spread',
    drop3: 'Drop 3 voicing - open sound with good voice separation',
    spread: 'Spread voicing across octaves',
    quartal: 'Modern quartal harmony',
    cluster: 'Dense cluster voicing',
    openVoicing: 'Open position with wide intervals',
    shellVoicing: 'Minimal shell voicing (root, 3rd, 7th)'
  };
  
  return `${descriptions[type]} - Smoothness: ${smoothness}%`;
};