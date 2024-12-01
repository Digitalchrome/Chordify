import React from 'react';
import { ChordCard } from './ChordCard';
import { Download } from 'lucide-react';
import { exportToMidi } from '../utils/midiExporter';
import { useChordSelectionStore } from '../stores/chordSelectionStore';
import { ChordMode } from '../types/music';

interface ChordDisplayProps {
  chords: string[];
  mode: ChordMode;
  romanNumerals?: string[];
  onChordChange: (index: number, newChord: string) => void;
}

export const ChordDisplay: React.FC<ChordDisplayProps> = ({
  chords = [],
  mode,
  romanNumerals = [],
  onChordChange,
}) => {
  const { selectedChordIndex, setSelectedChordIndex } = useChordSelectionStore();

  const handleExportMidi = () => {
    if (!chords.length) return;
    
    try {
      exportToMidi(chords);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
    }
  };

  if (!Array.isArray(chords)) {
    console.error('Chords prop must be an array');
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {chords.map((chord, index) => (
          <div
            key={`${index}-${chord}`}
            onClick={() => setSelectedChordIndex(index)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <ChordCard
              chord={chord}
              index={index}
              mode={mode}
              romanNumeral={romanNumerals[index]}
              onChordChange={onChordChange}
              isSelected={selectedChordIndex === index}
            />
          </div>
        ))}
      </div>
      {chords.length > 0 && (
        <button
          onClick={handleExportMidi}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Download className="w-4 h-4" />
          Export MIDI
        </button>
      )}
    </div>
  );
};