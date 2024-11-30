import React, { useState } from 'react';
import { Music, ArrowRight, Play, Pause } from 'lucide-react';
import { Chord, Note, Scale } from 'tonal';

interface ArpeggioPattern {
  name: string;
  pattern: string[];
  category: string;
  description: string;
  style: string;
}

interface ArpeggioVisualizerProps {
  chord: string;
  progression?: string[];
}

export const ArpeggioVisualizer: React.FC<ArpeggioVisualizerProps> = ({ 
  chord,
  progression = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Basic');
  const [isPlaying, setIsPlaying] = useState(false);

  const getArpeggioPatterns = (chord: string): ArpeggioPattern[] => {
    const chordInfo = Chord.get(chord);
    if (!chordInfo.notes.length) return [];

    const notes = chordInfo.notes;
    const root = notes[0];
    const patterns: ArpeggioPattern[] = [
      // Basic Patterns
      {
        name: 'Ascending',
        pattern: [...notes],
        category: 'Basic',
        description: 'Simple ascending arpeggio',
        style: 'Traditional'
      },
      {
        name: 'Descending',
        pattern: [...notes].reverse(),
        category: 'Basic',
        description: 'Simple descending arpeggio',
        style: 'Traditional'
      },
      
      // Jazz Patterns
      {
        name: 'Enclosure',
        pattern: notes.flatMap(note => [
          note,
          Note.transpose(note, '2m'),
          note,
        ]),
        category: 'Jazz',
        description: 'Chromatic enclosure pattern',
        style: 'Bebop'
      },
      {
        name: 'Bebop Approach',
        pattern: [
          ...notes,
          Note.transpose(notes[0], '2M'),
          Note.transpose(notes[0], '2m'),
          notes[0]
        ],
        category: 'Jazz',
        description: 'Classic bebop approach pattern',
        style: 'Bebop'
      },
      {
        name: 'Modal Superimposition',
        pattern: [
          root,
          Note.transpose(root, '4P'),
          Note.transpose(root, '5P'),
          Note.transpose(root, '7M'),
          Note.transpose(root, '9M'),
        ],
        category: 'Jazz',
        description: 'Modal superimposition pattern',
        style: 'Modern Jazz'
      },

      // Classical Patterns
      {
        name: 'Broken Thirds',
        pattern: notes.flatMap((note, i) => 
          i < notes.length - 2 ? [note, notes[i + 2]] : [note]
        ),
        category: 'Classical',
        description: 'Alternating notes in thirds',
        style: 'Baroque'
      },
      {
        name: 'Turn Figure',
        pattern: notes.flatMap(note => [
          note,
          Note.transpose(note, '2M'),
          note,
          Note.transpose(note, '-2M'),
        ]),
        category: 'Classical',
        description: 'Classical turn ornament',
        style: 'Classical'
      },
      {
        name: 'Alberti Bass',
        pattern: [root, notes[2], notes[1], notes[2]],
        category: 'Classical',
        description: 'Classic accompaniment pattern',
        style: 'Classical'
      },

      // Contemporary Patterns
      {
        name: 'Pentatonic Hybrid',
        pattern: [
          root,
          Note.transpose(root, '3M'),
          Note.transpose(root, '5P'),
          Note.transpose(root, '7M'),
          Note.transpose(root, '9M'),
        ],
        category: 'Contemporary',
        description: 'Pentatonic-based pattern',
        style: 'Modern'
      },
      {
        name: 'Quartal',
        pattern: [
          root,
          Note.transpose(root, '4P'),
          Note.transpose(root, '7M'),
          Note.transpose(root, '11P'),
        ],
        category: 'Contemporary',
        description: 'Modern quartal voicing',
        style: 'Modern'
      },
    ];

    // Add improvisation patterns if progression is provided
    if (progression.length > 0) {
      const improvisationPatterns = generateImprovisationPatterns(chord, progression);
      patterns.push(...improvisationPatterns);
    }

    return patterns;
  };

  const generateImprovisationPatterns = (
    currentChord: string,
    progression: string[]
  ): ArpeggioPattern[] => {
    const patterns: ArpeggioPattern[] = [];
    const currentChordNotes = Chord.get(currentChord).notes;
    
    // Generate patterns that connect chord tones
    progression.forEach((nextChord, index) => {
      if (index === 0) return;
      
      const nextChordNotes = Chord.get(nextChord).notes;
      const connectingPattern = createConnectingPattern(currentChordNotes, nextChordNotes);
      
      patterns.push({
        name: `Connection to ${nextChord}`,
        pattern: connectingPattern,
        category: 'Improvisation',
        description: `Smooth voice leading to ${nextChord}`,
        style: 'Guide Tones'
      });
    });

    // Add scalar patterns
    patterns.push({
      name: 'Chord Scale',
      pattern: generateChordScale(currentChord),
      category: 'Improvisation',
      description: 'Scale-based improvisation',
      style: 'Scalar'
    });

    return patterns;
  };

  const createConnectingPattern = (
    currentNotes: string[],
    nextNotes: string[]
  ): string[] => {
    const pattern: string[] = [];
    const commonTones = currentNotes.filter(note => nextNotes.includes(note));
    
    // Start with common tones
    if (commonTones.length > 0) {
      pattern.push(...commonTones);
    }
    
    // Add voice leading connections
    currentNotes.forEach(note => {
      const closest = findClosestNote(note, nextNotes);
      if (closest && !pattern.includes(closest)) {
        pattern.push(closest);
      }
    });

    return pattern;
  };

  const findClosestNote = (note: string, targetNotes: string[]): string => {
    let closest = targetNotes[0];
    let minDistance = 12;

    targetNotes.forEach(target => {
      const distance = Math.abs(Note.midi(note)! - Note.midi(target)!);
      if (distance < minDistance) {
        minDistance = distance;
        closest = target;
      }
    });

    return closest;
  };

  const generateChordScale = (chord: string): string[] => {
    const chordInfo = Chord.get(chord);
    const root = chordInfo.tonic || 'C';
    const scale = chord.includes('m') ? Scale.get(`${root} dorian`) : Scale.get(`${root} mixolydian`);
    return scale.notes;
  };

  const patterns = getArpeggioPatterns(chord);
  const categories = [...new Set(patterns.map(p => p.category))];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {patterns
          .filter(p => p.category === selectedCategory)
          .map((pattern, index) => (
            <div
              key={index}
              className="p-3 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {pattern.name}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {pattern.style} - {pattern.description}
                  </div>
                </div>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1 text-indigo-600 hover:text-indigo-800"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {pattern.pattern.map((note, i) => (
                  <React.Fragment key={`${note}-${i}`}>
                    <span className={`px-2 py-1 rounded text-sm ${
                      chord.includes(note)
                        ? 'bg-indigo-50 dark:bg-dark-700 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-50 dark:bg-dark-600 text-gray-600 dark:text-gray-400'
                    }`}>
                      {note}
                    </span>
                    {i < pattern.pattern.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};