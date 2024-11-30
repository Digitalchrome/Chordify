import React from 'react';
import { ArrowRight, Percent } from 'lucide-react';
import { ChordMode } from '../types/music';
import { getProbableNextChords } from '../utils/chordProbability';

interface ChordProbabilityEngineProps {
  currentChord: string;
  mode: ChordMode;
  currentKey: string;
  onSelectChord: (chord: string) => void;
}

export const ChordProbabilityEngine: React.FC<ChordProbabilityEngineProps> = ({
  currentChord,
  mode,
  currentKey,
  onSelectChord,
}) => {
  const probableChords = getProbableNextChords(currentChord, mode, currentKey);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Likely next chords based on {mode} progressions:
      </div>

      <div className="grid gap-2">
        {probableChords.map(({ chord, probability }) => (
          <button
            key={chord}
            onClick={() => onSelectChord(chord)}
            className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-dark-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-dark-600 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">
                {currentChord}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-indigo-600 dark:text-indigo-400">
                {chord}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-1.5 bg-indigo-600 dark:bg-indigo-400 rounded"
                style={{ width: `${probability * 100}px` }}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(probability * 100)}%
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Probabilities are based on common {mode} chord progressions and music theory rules.
      </div>
    </div>
  );
};