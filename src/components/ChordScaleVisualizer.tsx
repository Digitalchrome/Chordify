import React from 'react';
import { Music, Info } from 'lucide-react';
import { getCompatibleScales, getScaleCharacteristics } from '../utils/musicAnalysis';
import { Scale } from 'tonal';

interface ChordScaleVisualizerProps {
  chord: string;
  scale: string;
  currentKey: string;
}

export const ChordScaleVisualizer: React.FC<ChordScaleVisualizerProps> = ({
  chord,
  scale,
  currentKey,
}) => {
  const compatibleScales = getCompatibleScales(chord);
  const root = chord.match(/^[A-G][#b]?/)?.[0] || currentKey;

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Compatible scales for {chord}:
      </div>

      <div className="grid gap-3">
        {compatibleScales.map((scaleName) => {
          const scaleNotes = Scale.get(`${root} ${scaleName}`).notes;
          
          return (
            <div
              key={scaleName}
              className="p-3 bg-indigo-50 dark:bg-dark-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  {scaleName}
                </span>
                <div className="group relative">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded invisible group-hover:visible whitespace-nowrap">
                    {getScaleCharacteristics(scaleName)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {scaleNotes.map((note, index) => (
                  <div
                    key={`${note}-${index}`}
                    className={`px-2 py-1 rounded text-xs ${
                      chord.includes(note)
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};