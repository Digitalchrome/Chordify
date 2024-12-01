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
      // First try to sign in, in case user exists
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      // If sign in successful, user already exists and is now logged in
      if (signInData?.session) {
        set({ session: signInData.session });
        return { success: true, message: 'Logged in successfully!' };
      }

      // If sign in failed for a reason other than invalid credentials, throw the error
      if (signInError && !signInError.message.includes('Invalid login credentials')) {
        throw signInError;
      }

      // If we get here, try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });

      if (error) throw error;

      if (data?.session) {
        set({ session: data.session });
        return { success: true, message: 'Account created successfully!' };
      }

      return { success: false, message: 'Failed to create account. Please try again.' };
    } catch (error: any) {
      console.error('Signup/Signin error:', error);
      if (error.message.includes('User already registered')) {
        return { success: false, message: 'This email is already registered. Please try signing in instead.' };
      }
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
