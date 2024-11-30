// Root notes
export const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES = ROOTS;

// Scales and modes
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

export const ROMAN_NUMERALS = {
  major: ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
  minor: ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
  dorian: ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
  mixolydian: ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
  lydian: ['I', 'II', 'iii', '#iv°', 'V', 'vi', 'vii'],
  phrygian: ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
  locrian: ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii'],
};

export const MODAL_VOICINGS = {
  dorian: {
    i: [0, 3, 7, 10, 14, 17, 21],  // 1, b3, 5, b7, 9, 11, 13
    ii: [0, 4, 7, 10, 14, 17],     // 1, 3, 5, b7, 9, 11
    III: [0, 4, 7, 10, 14, 17],    // 1, 3, 5, b7, 9, 11
    IV: [0, 4, 7, 10, 14, 21],     // 1, 3, 5, b7, 9, 13
    v: [0, 3, 7, 10, 14, 17],      // 1, b3, 5, b7, 9, 11
    vi: [0, 3, 7, 10, 13, 17],     // 1, b3, 5, b7, b9, 11
    VII: [0, 4, 7, 10, 14, 21],    // 1, 3, 5, b7, 9, 13
  },
  mixolydian: {
    I: [0, 4, 7, 10, 14, 21],      // 1, 3, 5, b7, 9, 13
    ii: [0, 3, 7, 10, 17],         // 1, b3, 5, b7, 11
    iii: [0, 3, 7, 10, 17],        // 1, b3, 5, b7, 11
    IV: [0, 4, 7, 11, 14, 21],     // 1, 3, 5, 7, 9, 13
    v: [0, 3, 7, 10, 14, 17],      // 1, b3, 5, b7, 9, 11
    vi: [0, 3, 7, 10, 14, 17],     // 1, b3, 5, b7, 9, 11
    bVII: [0, 4, 7, 10, 14, 21],   // 1, 3, 5, b7, 9, 13
  },
};

export const PROGRESSION_PATTERNS = {
  classical: [
    ['I', 'IV', 'V', 'I'],
    ['I', 'vi', 'IV', 'V'],
    ['I', 'V', 'vi', 'IV'],
    ['ii', 'V', 'I', 'vi'],
  ],
  jazz: [
    ['ii7', 'V7', 'Imaj7'],
    ['iiø7', 'V7b9', 'i'],
    ['ii7', 'V7', 'iii7', 'vi7'],
    ['Imaj7', 'vi7', 'ii7', 'V7'],
  ],
  blues: [
    ['I7', 'IV7', 'I7', 'V7'],
    ['I7', 'IV7', 'V7', 'IV7'],
    ['i7', 'iv7', 'i7', 'V7'],
    ['I7', 'IV7', 'ii7', 'V7'],
  ],
  modal: [
    ['i7', 'IV7', 'i7', 'IV7'],
    ['Imaj7', 'IVmaj7', 'v7', 'i7'],
    ['i7', 'bVII7', 'bVI7', 'v7'],
    ['Imaj7', 'bVIImaj7', 'bVImaj7', 'bVmaj7'],
  ],
  contemporary: [
    ['Imaj9', 'IVmaj9', 'vi9', 'V9'],
    ['i9', 'bVI9', 'bVII9', 'i9'],
    ['Imaj9', 'iii9', 'vi9', 'IV9'],
    ['i9', 'iv9', 'bVII9', 'bVI9'],
  ],
};

export const CADENCES = {
  perfect: ['V7', 'I'],
  imperfect: ['V', 'I'],
  plagal: ['IV', 'I'],
  deceptive: ['V', 'vi'],
  halfCadence: ['I', 'V'],
  jazzTwoFive: ['ii7', 'V7', 'Imaj7'],
  minorTwoFive: ['iiø7', 'V7b9', 'i'],
  backdoor: ['bVII7', 'I'],
  tritoneSubstitution: ['bII7', 'I'],
  modal: ['bVII', 'I'],
  phrygian: ['bII', 'i'],
  mixolydian: ['bVII', 'I'],
  lydian: ['II', 'I'],
};

export const CADENCE_PATTERNS = {
  classical: [
    { name: 'Perfect Authentic', pattern: ['V7', 'I'] },
    { name: 'Extended Perfect', pattern: ['ii', 'V7', 'I'] },
    { name: 'Plagal', pattern: ['IV', 'I'] },
    { name: 'Double Plagal', pattern: ['bVII', 'IV', 'I'] },
    { name: 'Deceptive', pattern: ['V7', 'vi'] },
    { name: 'Half', pattern: ['I', 'V'] },
  ],
  jazz: [
    { name: 'ii-V-I', pattern: ['ii7', 'V7', 'Imaj7'] },
    { name: 'Extended ii-V-I', pattern: ['ii7', 'V7b9', 'Imaj9'] },
    { name: 'Minor ii-V-i', pattern: ['iiø7', 'V7b9', 'i'] },
    { name: 'Bird Changes', pattern: ['ii7', 'V7alt', 'Imaj7'] },
    { name: 'Backdoor', pattern: ['bVII7', 'I'] },
    { name: 'Tritone Sub', pattern: ['bII7', 'I'] },
  ],
  contemporary: [
    { name: 'Modal', pattern: ['IV', 'I'] },
    { name: 'Slash Chord', pattern: ['IV/V', 'I'] },
    { name: 'Sus Resolution', pattern: ['V7sus4', 'I'] },
    { name: 'Quartal', pattern: ['vsus4', 'I'] },
    { name: 'Chromatic Mediant', pattern: ['bIII', 'I'] },
    { name: 'Altered Dominant', pattern: ['V7alt', 'I'] },
  ],
  blues: [
    { name: 'Blues Turnaround', pattern: ['I7', 'IV7', 'I7', 'V7'] },
    { name: 'Jazz Blues', pattern: ['I7', 'IV9', 'I7', 'V7alt'] },
    { name: 'Quick Change', pattern: ['I7', 'IV7', 'I7', 'I7'] },
    { name: 'Gospel Turnaround', pattern: ['I7', 'VI7', 'II7', 'V7'] },
    { name: 'Minor Blues', pattern: ['i7', 'iv7', 'i7', 'V7'] },
  ],
  modal: [
    { name: 'Dorian vamp', pattern: ['i7', 'IV7'] },
    { name: 'Phrygian', pattern: ['i', 'bII'] },
    { name: 'Mixolydian', pattern: ['I7', 'bVII7'] },
    { name: 'Aeolian', pattern: ['i', 'bVI'] },
    { name: 'Lydian', pattern: ['Imaj7', 'II7'] },
  ],
  smart: [
    { name: 'Tension Builder', pattern: ['I', 'vi', 'IV', 'V7'] },
    { name: 'Resolution Chain', pattern: ['iii', 'vi', 'ii', 'V7', 'I'] },
    { name: 'Modal Interchange', pattern: ['I', 'bVI', 'bVII', 'I'] },
    { name: 'Extended Tension', pattern: ['Imaj7', 'vi7', 'ii7', 'V7b9'] },
    { name: 'Chromatic Approach', pattern: ['I', 'bIII7', 'bVI7', 'V7'] },
  ],
};

export const CHORD_POOLS = {
  classical: [
    ...ROOTS.map(root => `${root}`),
    ...ROOTS.map(root => `${root}m`),
    ...ROOTS.map(root => `${root}dim`),
    ...ROOTS.map(root => `${root}aug`),
  ],
  jazz: [
    ...ROOTS.map(root => `${root}maj7`),
    ...ROOTS.map(root => `${root}7`),
    ...ROOTS.map(root => `${root}m7`),
    ...ROOTS.map(root => `${root}m7b5`),
    ...ROOTS.map(root => `${root}dim7`),
    ...ROOTS.map(root => `${root}9`),
    ...ROOTS.map(root => `${root}maj9`),
    ...ROOTS.map(root => `${root}13`),
  ],
  blues: [
    ...ROOTS.map(root => `${root}7`),
    ...ROOTS.map(root => `${root}9`),
    ...ROOTS.map(root => `${root}13`),
    ...ROOTS.map(root => `${root}m7`),
  ],
  contemporary: [
    ...ROOTS.map(root => `${root}maj9`),
    ...ROOTS.map(root => `${root}m9`),
    ...ROOTS.map(root => `${root}13`),
    ...ROOTS.map(root => `${root}m11`),
    ...ROOTS.map(root => `${root}sus4`),
    ...ROOTS.map(root => `${root}add9`),
  ],
  modal: [
    ...ROOTS.map(root => `${root}sus2`),
    ...ROOTS.map(root => `${root}sus4`),
    ...ROOTS.map(root => `${root}m11`),
    ...ROOTS.map(root => `${root}maj13`),
    ...ROOTS.map(root => `${root}7sus4`),
  ],
  smart: [
    ...ROOTS.map(root => `${root}maj7`),
    ...ROOTS.map(root => `${root}maj9`),
    ...ROOTS.map(root => `${root}maj13`),
    ...ROOTS.map(root => `${root}7`),
    ...ROOTS.map(root => `${root}9`),
    ...ROOTS.map(root => `${root}13`),
    ...ROOTS.map(root => `${root}7alt`),
    ...ROOTS.map(root => `${root}7b9`),
    ...ROOTS.map(root => `${root}7#9`),
    ...ROOTS.map(root => `${root}7#11`),
    ...ROOTS.map(root => `${root}7b13`),
    ...ROOTS.map(root => `${root}m7`),
    ...ROOTS.map(root => `${root}m9`),
    ...ROOTS.map(root => `${root}m11`),
    ...ROOTS.map(root => `${root}m13`),
    ...ROOTS.map(root => `${root}ø7`),
    ...ROOTS.map(root => `${root}°7`),
    ...ROOTS.map(root => `${root}sus4`),
    ...ROOTS.map(root => `${root}6/9`),
  ],
};