import React from 'react';
import { RefreshCw } from 'lucide-react';
import { getModalInterchangeChords } from '../utils/modalInterchange';

interface ModalInterchangeProps {
  chord: string;
  scale: string;
  onSelectChord: (chord: string) => void;
}

export const ModalInterchange: React.FC<ModalInterchangeProps> = ({
  chord,
  scale,
  onSelectChord,
}) => {
  const suggestions = getModalInterchangeChords(chord, scale);

  if (!suggestions.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-medium text-gray-700">
          Modal Interchange Options
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectChord(suggestion.chord)}
            className="group relative px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full text-sm transition-colors"
          >
            {suggestion.chord}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded invisible group-hover:visible whitespace-nowrap">
              From {suggestion.mode} mode
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};