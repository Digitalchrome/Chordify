import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VoicingType } from '../utils/voiceLeadingAnalysis';

interface VoicingPreset {
  id: string;
  name: string;
  description: string;
  voicingType: VoicingType;
  voicingRules: {
    preferredOctaves: number[];
    maxSpread: number;
    forceTopNote?: string;
    forceBassPedal?: boolean;
  };
}

interface ChordVoicing {
  chord: string;
  notes: string[];
  voicingType: VoicingType;
}

interface VoicingState {
  currentVoicings: Record<string, ChordVoicing>;
  voicingPresets: VoicingPreset[];
  activePresetId: string | null;
}

interface VoicingActions {
  setVoicing: (chord: string, notes: string[], voicingType: VoicingType) => void;
  addPreset: (preset: Omit<VoicingPreset, 'id'>) => void;
  removePreset: (id: string) => void;
  setActivePreset: (id: string | null) => void;
  getVoicing: (chord: string) => ChordVoicing | undefined;
}

type VoicingStore = VoicingState & VoicingActions;

const defaultPresets: VoicingPreset[] = [
  {
    id: 'default-close',
    name: 'Close Position',
    description: 'Traditional close position voicing',
    voicingType: 'close',
    voicingRules: {
      preferredOctaves: [4],
      maxSpread: 12,
    }
  },
  {
    id: 'default-drop2',
    name: 'Drop 2',
    description: 'Drop 2 voicing for warmer sound',
    voicingType: 'drop2',
    voicingRules: {
      preferredOctaves: [3, 4],
      maxSpread: 16,
    }
  },
  {
    id: 'default-spread',
    name: 'Spread Voicing',
    description: 'Wide spread for rich sound',
    voicingType: 'spread',
    voicingRules: {
      preferredOctaves: [3, 4, 5],
      maxSpread: 24,
    }
  },
  {
    id: 'default-quartal',
    name: 'Quartal',
    description: 'Modern quartal harmony',
    voicingType: 'quartal',
    voicingRules: {
      preferredOctaves: [3, 4],
      maxSpread: 20,
    }
  },
];

export const useVoicingStore = create<VoicingStore>()(
  persist(
    (set, get) => ({
      currentVoicings: {},
      voicingPresets: defaultPresets,
      activePresetId: 'default-close',

      setVoicing: (chord, notes, voicingType) => 
        set((state) => ({
          currentVoicings: {
            ...state.currentVoicings,
            [chord]: { chord, notes, voicingType }
          }
        })),

      addPreset: (preset) =>
        set((state) => ({
          voicingPresets: [
            ...state.voicingPresets,
            { ...preset, id: `preset-${Date.now()}` },
          ],
        })),

      removePreset: (id) =>
        set((state) => ({
          voicingPresets: state.voicingPresets.filter((preset) => preset.id !== id),
        })),

      setActivePreset: (id) => set({ activePresetId: id }),

      getVoicing: (chord) => get().currentVoicings[chord],
    }),
    {
      name: 'chord-voicings',
    }
  )
);
