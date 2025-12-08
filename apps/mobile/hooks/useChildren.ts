import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Child, Gender } from '../lib/utils';

/**
 * Input for creating/updating a child
 */
export interface ChildInput {
  name: string;
  date_of_birth: string;
  gender?: Gender;
  avatar_url?: string;
  notes?: string;
}

/**
 * Children state interface
 */
interface ChildrenState {
  children: Child[];
  selectedChild: Child | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook for children CRUD operations with realtime updates
 *
 * Features:
 * - Fetches all children for authenticated user
 * - Realtime updates via Supabase subscriptions
 * - CRUD operations: add, update, delete
 * - Selected child state management
 * - Automatic loading and error handling
 *
 * @param userId - The authenticated user's ID
 * @returns Children state and CRUD functions
 */
export function useChildren(userId?: string) {
  const [state, setState] = useState<ChildrenState>({
    children: [],
    selectedChild: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch children from database
   */
  const fetchChildren = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        children: data || [],
        loading: false,
      }));

      // If there's no selected child but we have children, select the first one
      if (data && data.length > 0 && !state.selectedChild) {
        setState((prev) => ({
          ...prev,
          selectedChild: data[0],
        }));
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [userId, state.selectedChild]);

  /**
   * Set up realtime subscription
   */
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    // Initial fetch
    fetchChildren();

    // Subscribe to realtime changes
    channel = supabase
      .channel(`children:parent_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'children',
          filter: `parent_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Children realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            setState((prev) => ({
              ...prev,
              children: [...prev.children, payload.new as Child],
            }));
          } else if (payload.eventType === 'UPDATE') {
            setState((prev) => ({
              ...prev,
              children: prev.children.map((child) =>
                child.id === payload.new.id ? (payload.new as Child) : child
              ),
              selectedChild:
                prev.selectedChild?.id === payload.new.id
                  ? (payload.new as Child)
                  : prev.selectedChild,
            }));
          } else if (payload.eventType === 'DELETE') {
            setState((prev) => {
              const newChildren = prev.children.filter(
                (child) => child.id !== payload.old.id
              );
              return {
                ...prev,
                children: newChildren,
                selectedChild:
                  prev.selectedChild?.id === payload.old.id
                    ? newChildren[0] || null
                    : prev.selectedChild,
              };
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, fetchChildren]);

  /**
   * Select a child
   */
  const selectChild = useCallback((child: Child | null) => {
    setState((prev) => ({ ...prev, selectedChild: child }));
  }, []);

  /**
   * Add a new child
   */
  const addChild = useCallback(
    async (childData: ChildInput) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase
          .from('children')
          .insert([
            {
              parent_id: userId,
              ...childData,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setState((prev) => ({ ...prev, loading: false }));

        // Select the newly added child
        if (data) {
          selectChild(data as Child);
        }

        return data as Child;
      } catch (error) {
        console.error('Error adding child:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [userId, selectChild]
  );

  /**
   * Update a child
   */
  const updateChild = useCallback(
    async (childId: string, updates: Partial<ChildInput>) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase
          .from('children')
          .update(updates)
          .eq('id', childId)
          .select()
          .single();

        if (error) throw error;

        setState((prev) => ({ ...prev, loading: false }));

        return data as Child;
      } catch (error) {
        console.error('Error updating child:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Delete a child
   */
  const deleteChild = useCallback(async (childId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.from('children').delete().eq('id', childId);

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error deleting child:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Upload child avatar
   */
  const uploadAvatar = useCallback(
    async (childId: string, fileUri: string, fileName: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Read file as blob
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Upload to storage
        const filePath = `avatars/${userId}/${childId}/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(filePath, blob, {
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('media').getPublicUrl(filePath);

        // Update child record
        await updateChild(childId, { avatar_url: publicUrl });

        setState((prev) => ({ ...prev, loading: false }));

        return publicUrl;
      } catch (error) {
        console.error('Error uploading avatar:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [userId, updateChild]
  );

  return {
    children: state.children,
    selectedChild: state.selectedChild,
    loading: state.loading,
    error: state.error,
    selectChild,
    addChild,
    updateChild,
    deleteChild,
    uploadAvatar,
    refetch: fetchChildren,
  };
}
