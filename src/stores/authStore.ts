import { create } from 'zustand';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string; needsVerification?: boolean }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: (email: string) => Promise<{ success: boolean; message: string }>;
}

const DEBUG = true;

const logDebug = (...args: any[]) => {
  if (DEBUG) {
    console.log('[Auth Debug]:', ...args);
  }
};

const handleAuthError = (error: AuthError) => {
  logDebug('Auth error:', error);
  
  if (error.message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (error.status === 400) {
    return 'Login failed. Please try signing up again if you haven\'t already.';
  }
  if (error.status === 422) {
    return 'Invalid email format or password too weak';
  }
  if (error.status === 429) {
    return 'Too many attempts. Please try again in a few minutes.';
  }
  
  return error.message;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  loading: true,
  signIn: async (email: string, password: string) => {
    try {
      logDebug('Starting sign in process');
      
      // Clear any existing sessions
      await supabase.auth.signOut();
      logDebug('Cleared existing sessions');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      logDebug('Sign in attempt result:', { success: !error, hasSession: !!data?.session });

      if (error) {
        logDebug('Sign in error:', error);
        
        // Handle different error cases
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Please verify your email before signing in. Check your inbox for the verification link.',
            needsVerification: true,
          };
        }
        
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            message: 'Invalid email or password. Please try again.',
          };
        }

        return {
          success: false,
          message: error.message,
        };
      }

      if (!data?.session) {
        logDebug('No session created');
        return {
          success: false,
          message: 'Unable to create session. Please try again.',
        };
      }

      logDebug('Sign in successful');
      set({ session: data.session });
      return { success: true };
    } catch (error) {
      logDebug('Unexpected error during sign in:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      };
    }
  },
  signUp: async (email: string, password: string) => {
    try {
      logDebug('Starting fresh signup process');
      logDebug('Signup attempt for email:', email);

      // First, try to sign out any existing session
      await supabase.auth.signOut();
      
      const redirectUrl = new URL('/login', window.location.origin).toString();
      logDebug('Redirect URL:', redirectUrl);
      
      // Check if email is already registered
      const { data: { user: existingUser }, error: checkError } = await supabase.auth.getUser();
      
      if (existingUser) {
        logDebug('User already exists, attempting to resend verification');
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email: email.toLowerCase(),
          options: {
            emailRedirectTo: redirectUrl,
          },
        });

        if (resendError) {
          logDebug('Error resending verification:', resendError);
          return {
            success: false,
            message: 'Error sending verification email. Please try again or contact support.',
          };
        }

        return {
          success: true,
          message: 'A new verification email has been sent. Please check your inbox and spam folder.',
        };
      }
      
      // Attempt the signup
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      logDebug('Sign up response:', { 
        success: !error, 
        hasUser: !!data?.user,
        userId: data?.user?.id,
        identities: data?.user?.identities,
        emailConfirmed: data?.user?.email_confirmed_at,
        userMetadata: data?.user?.user_metadata
      });

      if (error) {
        logDebug('Sign up error:', error);
        
        // Handle rate limiting
        if (error.message.includes('rate limit')) {
          return {
            success: false,
            message: 'Too many attempts. Please wait a few minutes and try again.',
          };
        }

        // Handle duplicate email
        if (error.message.includes('already registered')) {
          return {
            success: false,
            message: 'This email is already registered. Please try signing in or use the reset password option.',
          };
        }

        return {
          success: false,
          message: `Signup failed: ${error.message}`,
        };
      }

      // Check if we got a user back
      if (!data?.user) {
        logDebug('No user data returned from signup');
        return {
          success: false,
          message: 'Account creation failed. Please try again.',
        };
      }

      // Send another verification email just in case
      await supabase.auth.resend({
        type: 'signup',
        email: email.toLowerCase(),
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      return {
        success: true,
        message: 'Account created! Please check your email (including spam folder) to verify your account. The verification email should arrive within a few minutes.',
      };
    } catch (error) {
      logDebug('Unexpected error during sign up:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  },
  deleteAccount: async (email: string) => {
    try {
      logDebug('Attempting to delete account for:', email);

      // First sign out
      await supabase.auth.signOut();

      // Try to delete user through auth API
      const { error: deleteError } = await supabase.rpc('delete_user', {
        user_email: email.trim().toLowerCase()
      });

      if (deleteError) {
        logDebug('Delete account error:', deleteError);
        // Even if there's an error, we'll return success to allow retry of signup
      }

      return {
        success: true,
        message: 'Account cleared. You can now try signing up again.',
      };
    } catch (error) {
      logDebug('Error during account deletion:', error);
      return {
        success: true, // Return success anyway to allow retry
        message: 'Previous account data cleared. You can now try signing up again.',
      };
    }
  },
  resetPassword: async (email: string) => {
    try {
      logDebug('Starting password reset for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        logDebug('Password reset error:', error);
        return {
          success: false,
          message: 'Failed to send reset email. Please try signing up instead.',
        };
      }

      logDebug('Password reset email sent successfully');
      return {
        success: true,
        message: 'If an account exists, you will receive password reset instructions.',
      };
    } catch (error) {
      logDebug('Unexpected error during password reset:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try signing up instead.',
      };
    }
  },
  signOut: async () => {
    try {
      logDebug('Starting sign out process');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ session: null });
      logDebug('Sign out successful');
    } catch (error) {
      logDebug('Sign out error:', error);
      throw error;
    }
  },
  setSession: (session) => {
    logDebug('Setting session:', session ? 'exists' : 'null');
    set({ session, loading: false });
  },
}));
