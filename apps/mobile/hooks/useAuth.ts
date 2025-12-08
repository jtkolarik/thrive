import { useEffect, useState, useCallback } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, authHelpers } from '../lib/supabase';
import type { Profile } from '../lib/utils';

/**
 * Auth state interface
 */
interface AuthState {
  session: Session | null;
  user: SupabaseUser | null;
  profile: Profile | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for authentication state management
 *
 * Features:
 * - Listens to auth state changes via Supabase
 * - Automatically fetches user profile when authenticated
 * - Provides sign in, sign up, sign out, and password reset functions
 * - Handles loading and error states
 *
 * @returns Auth state and helper functions
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        profile: data,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Initialize auth state and set up listener
   */
  useEffect(() => {
    // Get initial session
    authHelpers.getSession().then((session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState((prev) => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);

      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setState((prev) => ({
          ...prev,
          profile: null,
          loading: false,
        }));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { session, user } = await authHelpers.signInWithPassword(email, password);

      setState((prev) => ({
        ...prev,
        session,
        user,
      }));

      if (user) {
        await fetchProfile(user.id);
      }

      return { session, user };
    } catch (error) {
      console.error('Sign in error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, [fetchProfile]);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { session, user } = await authHelpers.signUp(email, password, {
          full_name: fullName,
        });

        setState((prev) => ({
          ...prev,
          session,
          user,
        }));

        // Profile will be created via database trigger
        // Fetch it after a short delay
        if (user) {
          setTimeout(() => fetchProfile(user.id), 1000);
        }

        return { session, user };
      } catch (error) {
        console.error('Sign up error:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [fetchProfile]
  );

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await authHelpers.signOut();

      setState({
        session: null,
        user: null,
        profile: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Reset password - sends reset email
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await authHelpers.resetPassword(email);

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Reset password error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Update password
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      await authHelpers.updatePassword(newPassword);

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Update password error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      try {
        if (!state.user) throw new Error('No user logged in');

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', state.user.id);

        if (error) throw error;

        // Refetch profile
        await fetchProfile(state.user.id);
      } catch (error) {
        console.error('Update profile error:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [state.user, fetchProfile]
  );

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'thrive://auth/callback',
        },
      });

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
      return { data };
    } catch (error) {
      console.error('Google sign in error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Sign in with Apple OAuth
   */
  const signInWithApple = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'thrive://auth/callback',
        },
      });

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
      return { data };
    } catch (error) {
      console.error('Apple sign in error:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    session: state.session,
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    signInWithGoogle,
    signInWithApple,
  };
}
