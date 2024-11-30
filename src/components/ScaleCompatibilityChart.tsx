import React from 'react';
import { Music, Info } from 'lucide-react';

interface ScaleCompatibilityChartProps {
  chord: string;
  scales: string[];
  scaleNotes: string[][];
  compatibility: number;
}

export const ScaleCompatibilityChart: React.FC<ScaleCompatibilityChartProps> = ({
  chord,
  scales,
  scaleNotes,
  compatibility,
}) => {
  const getScaleCharacteristics = (scale: string): string => {
    switch (scale) {
      case 'major': return 'Bright, stable';
      case 'minor': return 'Dark, emotional';
      case 'dorian': return 'Minor with bright 6th';
      case 'phrygian': return 'Dark, Spanish flavor';
      case 'lydian': return 'Bright, mystical';
      case 'mixolydian': return 'Dominant, bluesy';
      case 'locrian': return 'Diminished, unstable';
      default: return '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-medium">{chord}</h3>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              compatibility > 80
                ? 'bg-green-500'
                : compatibility > 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-600">
            {Math.round(compatibility)}% compatible
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {scales.map((scale, index) => (
          <div
            key={scale}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{scale}</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-gray-800 text-white text-xs rounded invisible group-hover:visible whitespace-nowrap">
                  {getScaleCharacteristics(scale)}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {scaleNotes[index].map((note, i) => (
                <div
                  key={`${note}-${i}`}
                  className={`px-2 py-1 rounded text-xs ${
                    chord.includes(note)
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {note}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};