import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import { ChordProgression } from '../types/music';

interface ProgressionHistoryProps {
  history: ChordProgression[];
  currentProgression: ChordProgression;
  onSelect: (progression: ChordProgression) => void;
}

export const ProgressionHistory: React.FC<ProgressionHistoryProps> = ({
  history,
  currentProgression,
  onSelect,
}) => {
  if (!Array.isArray(history) || history.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">History</h2>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Generate some progressions to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-indigo-600 dark:text-indigo-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">History</h2>
      </div>
      
      <div className="space-y-3">
        {history.map((progression, index) => {
          if (!Array.isArray(progression.chords)) return null;
          
          const isSelected = JSON.stringify(progression) === JSON.stringify(currentProgression);
          const mode = progression.mode || 'classical'; // Provide default mode if undefined
          
          return (
            <button
              key={index}
              onClick={() => onSelect(progression)}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                isSelected
                  ? 'bg-indigo-50 dark:bg-dark-700 text-indigo-700 dark:text-indigo-300'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {progression.length} bars
                  </div>
                </div>
                <ChevronRight
                  size={16}
                  className={
                    isSelected
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }
                />
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 truncate">
                {progression.chords.join(' → ')}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};