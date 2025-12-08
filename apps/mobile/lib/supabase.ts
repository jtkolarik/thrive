import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your app.json.');
}

/**
 * Custom storage implementation using expo-secure-store for auth tokens
 * with AsyncStorage as fallback for non-sensitive data
 */
class SupabaseStorage {
  async getItem(key: string): Promise<string | null> {
    try {
      // Try to get from SecureStore first (more secure for auth tokens)
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      // Fallback to AsyncStorage
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      return AsyncStorage.getItem(key);
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      // Fallback to AsyncStorage
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      await AsyncStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      // Fallback to AsyncStorage
      console.warn('SecureStore unavailable, falling back to AsyncStorage:', error);
      await AsyncStorage.removeItem(key);
    }
  }
}

/**
 * Supabase client configured for React Native/Expo
 * - Uses expo-secure-store for secure auth token persistence
 * - Falls back to AsyncStorage when SecureStore is unavailable
 * - Auto-refresh tokens enabled
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: new SupabaseStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for mobile
  },
});

/**
 * Session management types
 */
export type Session = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    created_at: string;
  };
};

export type User = {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Auth helper functions
 */
export const authHelpers = {
  /**
   * Get current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  async getUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  },

  /**
   * Sign out
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'thrive://reset-password',
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * Update user metadata
   */
  async updateUser(metadata: { full_name?: string; avatar_url?: string }) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });
    if (error) throw error;
    return data;
  },
};

export default supabase;
