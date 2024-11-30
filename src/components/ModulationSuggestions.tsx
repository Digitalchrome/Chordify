import React from 'react';
import { ArrowRight, Shuffle } from 'lucide-react';
import { ChordMode } from '../types/music';
import { getModulationOptions } from '../utils/modulationAnalysis';

interface ModulationSuggestionsProps {
  currentKey: string;
  currentChord: string;
  mode: ChordMode;
  onSelectModulation: (chord: string) => void;
}

export const ModulationSuggestions: React.FC<ModulationSuggestionsProps> = ({
  currentKey,
  currentChord,
  mode,
  onSelectModulation,
}) => {
  const modulationOptions = getModulationOptions(currentKey, currentChord, mode);

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Suggested modulation paths:
      </div>

      <div className="grid gap-3">
        {modulationOptions.map((option, index) => (
          <div
            key={index}
            className="p-3 bg-indigo-50 dark:bg-dark-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                To {option.targetKey} {option.type}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {option.description}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {option.chords.map((chord, i) => (
                <React.Fragment key={i}>
                  <button
                    onClick={() => onSelectModulation(chord)}
                    className="px-3 py-1 bg-white dark:bg-dark-600 text-indigo-600 dark:text-indigo-400 rounded-full hover:bg-indigo-50 dark:hover:bg-dark-500 transition-colors"
                  >
                    {chord}
                  </button>
                  {i < option.chords.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Click any chord to add it to your progression
      </div>
    </div>
  );
};