import { create } from 'zustand';
import { VoicingType } from '../types/music';

interface ChordSelectionState {
  selectedChordIndex: number;
  setSelectedChordIndex: (index: number) => void;
  showAdvancedFeatures: boolean;
  setShowAdvancedFeatures: (show: boolean) => void;
  voicingType: VoicingType;
  setVoicingType: (type: VoicingType) => void;
}

export const useChordSelectionStore = create<ChordSelectionState>((set) => ({
  selectedChordIndex: -1,
  setSelectedChordIndex: (index) => set({ 
    selectedChordIndex: index,
    showAdvancedFeatures: index !== -1 // Automatically show features when chord is selected
  }),
  showAdvancedFeatures: false,
  setShowAdvancedFeatures: (show) => set({ showAdvancedFeatures: show }),
  voicingType: 'basic' as VoicingType,
  setVoicingType: (type) => set({ voicingType: type }),
}));
