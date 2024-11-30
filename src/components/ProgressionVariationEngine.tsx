import React, { useState } from 'react';
import { RefreshCw, Shuffle, Music, TrendingUp } from 'lucide-react';
import { Chord } from 'tonal';
import { ChordMode } from '../types/music';

interface ProgressionVariationEngineProps {
  progression: string[];
  mode: ChordMode;
  onSelectVariation: (variation: string[]) => void;
}

interface Variation {
  chords: string[];
  complexity: number;
  description: string;
  style: string;
}

export const ProgressionVariationEngine: React.FC<ProgressionVariationEngineProps> = ({
  progression,
  mode,
  onSelectVariation,
}) => {
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex'>('moderate');

  const generateVariations = (
    originalProgression: string[],
    mode: ChordMode,
    complexity: string
  ): Variation[] => {
    const variations: Variation[] = [];

    // Basic substitutions
    variations.push({
      chords: originalProgression.map(chord => {
        const chordInfo = Chord.get(chord);
        return complexity === 'simple'
          ? chord
          : complexity === 'moderate'
          ? `${chordInfo.tonic}${chordInfo.type === 'major' ? 'maj7' : 'm7'}`
          : `${chordInfo.tonic}${chordInfo.type === 'major' ? 'maj9' : 'm9'}`;
      }),
      complexity: 1,
      description: 'Extended chord qualities',
      style: 'Jazz',
    });

    // Secondary dominants
    variations.push({
      chords: originalProgression.map((chord, i) => {
        if (i === originalProgression.length - 1) return chord;
        const nextChord = originalProgression[i + 1];
        const nextRoot = Chord.get(nextChord).tonic;
        return `${nextRoot}7`;
      }),
      complexity: 2,
      description: 'Secondary dominant chain',
      style: 'Classical',
    });

    // Modal interchange
    variations.push({
      chords: originalProgression.map(chord => {
        const chordInfo = Chord.get(chord);
        return `${chordInfo.tonic}${
          Math.random() > 0.5 ? 'm7' : 'maj7'
        }`;
      }),
      complexity: 2,
      description: 'Modal interchange variations',
      style: 'Contemporary',
    });

    // Tritone substitutions
    if (complexity === 'complex') {
      variations.push({
        chords: originalProgression.map(chord => {
          const chordInfo = Chord.get(chord);
          const root = chordInfo.tonic;
          const tritoneRoot = Chord.get(`${root}7`).notes[3];
          return `${tritoneRoot}7`;
        }),
        complexity: 3,
        description: 'Tritone substitutions',
        style: 'Jazz',
      });
    }

    return variations;
  };

  const variations = generateVariations(progression, mode, complexity);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Progression Variations
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setComplexity('simple')}
            className={`px-3 py-1 rounded-full text-sm ${
              complexity === 'simple'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Simple
          </button>
          <button
            onClick={() => setComplexity('moderate')}
            className={`px-3 py-1 rounded-full text-sm ${
              complexity === 'moderate'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Moderate
          </button>
          <button
            onClick={() => setComplexity('complex')}
            className={`px-3 py-1 rounded-full text-sm ${
              complexity === 'complex'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Complex
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {variations.map((variation, index) => (
          <div
            key={index}
            className="p-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-100 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-indigo-600">
                  {variation.style} Variation
                </span>
                <p className="text-sm text-gray-500">{variation.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Complexity: {variation.complexity}/3
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {variation.chords.map((chord, i) => (
                <React.Fragment key={i}>
                  <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full">
                    {chord}
                  </span>
                  {i < variation.chords.length - 1 && (
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() => onSelectVariation(variation.chords)}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
            >
              Apply Variation
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Variation Techniques
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Secondary dominants for stronger resolution</li>
          <li>• Modal interchange for color changes</li>
          <li>• Extended harmonies for richness</li>
          <li>• Tritone substitutions for jazz flavor</li>
        </ul>
      </div>
    </div>
  );
};