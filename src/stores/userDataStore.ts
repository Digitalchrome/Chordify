import { create } from 'zustand';
import { database, SavedProgression, VoicingPreset } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface UserDataState {
  savedProgressions: SavedProgression[];
  voicingPresets: VoicingPreset[];
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  saveProgression: (name: string, progression: string[], voicings: Record<string, { notes: string[] }>) => Promise<void>;
  saveVoicingPreset: (name: string, voicingType: string, settings?: Record<string, any>) => Promise<void>;
}

export const useUserDataStore = create<UserDataState>((set, get) => ({
  savedProgressions: [],
  voicingPresets: [],
  loading: false,
  error: null,

  fetchUserData: async () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    set({ loading: true, error: null });
    try {
      const [progressions, presets] = await Promise.all([
        database.getUserProgressions(userId),
        database.getUserPresets(userId),
      ]);
      set({
        savedProgressions: progressions,
        voicingPresets: presets,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch user data',
        loading: false,
      });
    }
  },

  saveProgression: async (name: string, progression: string[], voicings: Record<string, { notes: string[] }>) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');

    set({ loading: true, error: null });
    try {
      await database.saveProgression(userId, {
        name,
        progression,
        voicings,
      });
      await get().fetchUserData();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save progression',
        loading: false,
      });
    }
  },

  saveVoicingPreset: async (name: string, voicingType: string, settings = {}) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');

    set({ loading: true, error: null });
    try {
      await database.saveVoicingPreset(userId, {
        name,
        voicing_type: voicingType,
        settings,
      });
      await get().fetchUserData();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to save voicing preset',
        loading: false,
      });
    }
  },
}));
