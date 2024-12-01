import React from 'react';
import { useChordSelectionStore } from '../stores/chordSelectionStore';
import { ChordVoicingCustomizer } from './ChordVoicingCustomizer';
import { AdvancedAnalysis } from './AdvancedAnalysis';
import { ChordAnalysis } from './ChordAnalysis';

interface AdvancedFeaturesProps {
  chords: string[];
  currentKey: string;
  scale: string;
  onVoicingChange?: (voicing: string[]) => void;
}

export const AdvancedFeatures: React.FC<AdvancedFeaturesProps> = ({
  chords,
  currentKey,
  scale,
  onVoicingChange
}) => {
  const { selectedChordIndex, showAdvancedFeatures } = useChordSelectionStore();

  if (!showAdvancedFeatures || selectedChordIndex === -1) {
    return null;
  }

  const selectedChord = chords[selectedChordIndex];

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      <div className="text-lg font-semibold text-gray-800 mb-4">
        Advanced Analysis for {selectedChord}
      </div>

      {/* Chord Analysis */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Chord Analysis</h3>
        <ChordAnalysis chord={selectedChord} />
      </div>

      {/* Voicing Customizer */}
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Voicing Editor</h3>
        <ChordVoicingCustomizer
          chord={selectedChord}
          onChange={onVoicingChange || (() => {})}
        />
      </div>

      {/* Advanced Analysis */}
      <div>
        <h3 className="text-md font-medium text-gray-700 mb-2">Scale Analysis</h3>
        <AdvancedAnalysis
          progression={{ chords: [selectedChord], mode: 'jazz', length: 1 }}
          currentKey={currentKey}
          scale={scale}
        />
      </div>
    </div>
  );
};
