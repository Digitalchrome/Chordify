import React from 'react';
import { Music, Layers, Info } from 'lucide-react';
import { Chord, Note } from 'tonal';

interface PolyharmonicAnalysisProps {
  chord: string;
  progression: string[];
}

interface PolyharmonicLayer {
  type: string;
  chords: string[];
  description: string;
  color: string;
}

export const PolyharmonicAnalysis: React.FC<PolyharmonicAnalysisProps> = ({
  chord,
  progression,
}) => {
  const analyzePolyharmonicLayers = (chord: string): PolyharmonicLayer[] => {
    const chordInfo = Chord.get(chord);
    const layers: PolyharmonicLayer[] = [];

    // Triadic Layer
    const triad = chordInfo.notes.slice(0, 3);
    layers.push({
      type: 'Triadic',
      chords: [Chord.detect(triad)[0] || chord],
      description: 'Basic harmonic foundation',
      color: 'text-blue-600 dark:text-blue-400',
    });

    // Upper Structure
    if (chordInfo.notes.length > 3) {
      const upperNotes = chordInfo.notes.slice(3);
      layers.push({
        type: 'Upper Structure',
        chords: [Chord.detect(upperNotes)[0] || ''],
        description: 'Extended harmony layer',
        color: 'text-purple-600 dark:text-purple-400',
      });
    }

    // Quartal Layer
    const quartalNotes = [
      chordInfo.notes[0],
      Note.transpose(chordInfo.notes[0], '4P'),
      Note.transpose(chordInfo.notes[0], '7P'),
    ];
    layers.push({
      type: 'Quartal',
      chords: [Chord.detect(quartalNotes)[0] || ''],
      description: 'Modern quartal harmony',
      color: 'text-green-600 dark:text-green-400',
    });

    // Polychordal Analysis
    if (progression.length > 1) {
      const nextChord = progression[progression.indexOf(chord) + 1];
      if (nextChord) {
        const combined = [...chordInfo.notes, ...Chord.get(nextChord).notes];
        layers.push({
          type: 'Polychordal',
          chords: [chord, nextChord],
          description: 'Simultaneous harmony with next chord',
          color: 'text-red-600 dark:text-red-400',
        });
      }
    }

    return layers;
  };

  const layers = analyzePolyharmonicLayers(chord);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Polyharmonic Analysis
        </h3>
      </div>

      <div className="grid gap-3">
        {layers.map((layer, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${layer.color}`}>{layer.type}</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400" />
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded invisible group-hover:visible whitespace-nowrap">
                  {layer.description}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {layer.chords.map((layerChord, i) => (
                <div
                  key={i}
                  className="px-3 py-1 bg-gray-50 dark:bg-dark-700 rounded-full text-sm"
                >
                  {layerChord}
                </div>
              ))}
            </div>

            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {layer.description}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Understanding Polyharmonic Structures
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Triadic layer forms the harmonic foundation</li>
          <li>• Upper structures add color and tension</li>
          <li>• Quartal voicings create modern sound</li>
          <li>• Polychords combine multiple harmonic centers</li>
        </ul>
      </div>
    </div>
  );
};