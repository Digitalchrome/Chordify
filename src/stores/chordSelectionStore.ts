import { create } from 'zustand';

interface ChordSelectionState {
  selectedChordIndex: number;
  setSelectedChordIndex: (index: number) => void;
  showAdvancedFeatures: boolean;
  setShowAdvancedFeatures: (show: boolean) => void;
}

export const useChordSelectionStore = create<ChordSelectionState>((set) => ({
  selectedChordIndex: -1,
  setSelectedChordIndex: (index) => set({ 
    selectedChordIndex: index,
    showAdvancedFeatures: index !== -1 // Automatically show features when chord is selected
  }),
  showAdvancedFeatures: false,
  setShowAdvancedFeatures: (show) => set({ showAdvancedFeatures: show }),
}));
