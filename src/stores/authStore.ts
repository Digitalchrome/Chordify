import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,

  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      set({ session: data.session });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to sign in' };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      // Auto-sign in after signup
      if (data.session) {
        set({ session: data.session });
        return { success: true, message: 'Account created successfully!' };
      }

      return { success: false, message: 'Failed to create account' };
    } catch (error) {
      return { success: false, message: 'Failed to sign up' };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },

  setSession: (session) => set({ session }),
}));

// Listen for auth changes
supabase.auth.onAuthStateChange((_, session) => {
  useAuthStore.getState().setSession(session);
});
