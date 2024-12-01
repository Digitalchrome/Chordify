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

      if (error) throw error;
      set({ session: data.session });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      // First, try to sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signUpError) throw signUpError;

      // If signup successful, immediately sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) throw signInError;

      set({ session: signInData.session });
      return { success: true, message: 'Account created and logged in successfully!' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },

  setSession: (session) => set({ session }),
}));

supabase.auth.onAuthStateChange((_, session) => {
  useAuthStore.getState().setSession(session);
});
