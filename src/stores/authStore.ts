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
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Please verify your email before signing in. Check your inbox for the verification link.',
          };
        }
        return {
          success: false,
          message: error.message,
        };
      }

      if (!data?.session) {
        return {
          success: false,
          message: 'No session created. Please try again.',
        };
      }

      set({ session: data.session });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Signup error:', error);
        return {
          success: false,
          message: error.message,
        };
      }

      if (!data?.user) {
        return {
          success: false,
          message: 'No user was created. Please try again.',
        };
      }

      // If we get here, signup was successful
      return {
        success: true,
        message: 'Please check your email for the verification link. It may take a few minutes to arrive and might be in your spam folder.',
      };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ session: null });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  setSession: (session) => {
    set({ session });
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.getState().setSession(session);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user?.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'USER_UPDATED') {
    console.log('User updated:', session?.user?.email);
  }
});
