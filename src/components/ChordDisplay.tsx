import React from 'react';
import { ChordCard } from './ChordCard';
import { Download } from 'lucide-react';
import { exportToMidi } from '../utils/midiExporter';
import { useChordSelectionStore } from '../stores/chordSelectionStore';

interface ChordDisplayProps {
  chords: string[];
  mode: string;
  romanNumerals?: string[];
  onChordChange: (index: number, newChord: string) => void;
}

export const ChordDisplay: React.FC<ChordDisplayProps> = ({
  chords = [],
  mode,
  romanNumerals = [],
  onChordChange,
}) => {
  const { setSelectedChordIndex } = useChordSelectionStore();

  const handleExportMidi = () => {
    if (!chords.length) return;
    
    try {
      exportToMidi(chords);
    } catch (error) {
      console.error('Failed to export MIDI:', error);
    }
  };

  const handleChordSelect = (index: number) => {
    setSelectedChordIndex(index);
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
            onClick={() => handleChordSelect(index)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <ChordCard
              chord={chord}
              index={index}
              mode={mode}
              romanNumeral={romanNumerals[index]}
              onChordChange={onChordChange}
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={handleExportMidi}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
        disabled={!chords.length}
      >
        <Download size={20} />
        Export MIDI
      </button>
    </div>
  );
};