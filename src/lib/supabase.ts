import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database schema
export type UserProfile = {
  id: string;
  user_id: string;
  username: string;
  created_at: string;
}

export type SavedProgression = {
  id: string;
  user_id: string;
  name: string;
  progression: string[];
  voicings: Record<string, { notes: string[] }>;
  created_at: string;
  updated_at: string;
}

export type VoicingPreset = {
  id: string;
  user_id: string;
  name: string;
  voicing_type: string;
  settings: Record<string, any>;
  created_at: string;
}

// Database helper functions
export const database = {
  // User profiles
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data as UserProfile;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  // Saved progressions
  async saveProgression(userId: string, progression: Omit<SavedProgression, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('saved_progressions')
      .insert([
        {
          user_id: userId,
          ...progression,
        }
      ]);
    if (error) throw error;
    return data;
  },

  async getUserProgressions(userId: string) {
    const { data, error } = await supabase
      .from('saved_progressions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as SavedProgression[];
  },

  // Voicing presets
  async saveVoicingPreset(userId: string, preset: Omit<VoicingPreset, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('voicing_presets')
      .insert([
        {
          user_id: userId,
          ...preset,
        }
      ]);
    if (error) throw error;
    return data;
  },

  async getUserPresets(userId: string) {
    const { data, error } = await supabase
      .from('voicing_presets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as VoicingPreset[];
  },
};
