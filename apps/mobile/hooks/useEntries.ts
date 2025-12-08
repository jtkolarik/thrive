import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Entry, EntryType } from '../lib/utils';

/**
 * Input for creating an entry
 */
export interface EntryInput {
  child_id: string;
  type: EntryType;
  title?: string;
  content: string;
  media_urls?: string[];
  tags?: string[];
  occurred_at?: string;
  is_starred?: boolean;
  is_private?: boolean;
}

/**
 * Filters for fetching entries
 */
export interface EntryFilters {
  childId?: string;
  type?: EntryType;
  dateFrom?: string;
  dateTo?: string;
  isStarred?: boolean;
  tags?: string[];
}

/**
 * Entries state interface
 */
interface EntriesState {
  entries: Entry[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  page: number;
}

const ENTRIES_PER_PAGE = 20;

/**
 * Custom hook for entries CRUD operations with pagination and filtering
 *
 * Features:
 * - Fetches entries with pagination (20 per page)
 * - Filtering by child, type, date range, starred status, tags
 * - Realtime updates via Supabase subscriptions
 * - CRUD operations: create, update, delete, toggle star
 * - Automatic loading and error handling
 *
 * @param userId - The authenticated user's ID
 * @param filters - Optional filters to apply
 * @returns Entries state and CRUD functions
 */
export function useEntries(userId?: string, filters?: EntryFilters) {
  const [state, setState] = useState<EntriesState>({
    entries: [],
    loading: true,
    error: null,
    hasMore: true,
    page: 0,
  });

  /**
   * Build query with filters
   */
  const buildQuery = useCallback(
    (page: number = 0) => {
      if (!userId) return null;

      let query = supabase
        .from('entries')
        .select('*', { count: 'exact' })
        .eq('parent_id', userId)
        .order('occurred_at', { ascending: false })
        .range(page * ENTRIES_PER_PAGE, (page + 1) * ENTRIES_PER_PAGE - 1);

      if (filters?.childId) {
        query = query.eq('child_id', filters.childId);
      }

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.dateFrom) {
        query = query.gte('occurred_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('occurred_at', filters.dateTo);
      }

      if (filters?.isStarred !== undefined) {
        query = query.eq('is_starred', filters.isStarred);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      return query;
    },
    [userId, filters]
  );

  /**
   * Fetch entries from database
   */
  const fetchEntries = useCallback(
    async (page: number = 0, append: boolean = false) => {
      const query = buildQuery(page);
      if (!query) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error, count } = await query;

        if (error) throw error;

        const newEntries = data || [];
        const hasMore = count ? (page + 1) * ENTRIES_PER_PAGE < count : false;

        setState((prev) => ({
          ...prev,
          entries: append ? [...prev.entries, ...newEntries] : newEntries,
          loading: false,
          hasMore,
          page,
        }));
      } catch (error) {
        console.error('Error fetching entries:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
      }
    },
    [buildQuery]
  );

  /**
   * Fetch more entries (pagination)
   */
  const fetchMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;

    await fetchEntries(state.page + 1, true);
  }, [state.hasMore, state.loading, state.page, fetchEntries]);

  /**
   * Set up realtime subscription
   */
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    // Initial fetch
    fetchEntries(0, false);

    // Subscribe to realtime changes
    channel = supabase
      .channel(`entries:parent_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entries',
          filter: `parent_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Entries realtime update:', payload);

          if (payload.eventType === 'INSERT') {
            const newEntry = payload.new as Entry;

            // Check if entry matches current filters
            let matches = true;
            if (filters?.childId && newEntry.child_id !== filters.childId) {
              matches = false;
            }
            if (filters?.type && newEntry.type !== filters.type) {
              matches = false;
            }

            if (matches) {
              setState((prev) => ({
                ...prev,
                entries: [newEntry, ...prev.entries],
              }));
            }
          } else if (payload.eventType === 'UPDATE') {
            setState((prev) => ({
              ...prev,
              entries: prev.entries.map((entry) =>
                entry.id === payload.new.id ? (payload.new as Entry) : entry
              ),
            }));
          } else if (payload.eventType === 'DELETE') {
            setState((prev) => ({
              ...prev,
              entries: prev.entries.filter((entry) => entry.id !== payload.old.id),
            }));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, fetchEntries, filters]);

  /**
   * Create a new entry
   */
  const createEntry = useCallback(
    async (entryData: EntryInput) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase
          .from('entries')
          .insert([
            {
              parent_id: userId,
              occurred_at: entryData.occurred_at || new Date().toISOString(),
              ...entryData,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setState((prev) => ({ ...prev, loading: false }));

        return data as Entry;
      } catch (error) {
        console.error('Error creating entry:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [userId]
  );

  /**
   * Update an entry
   */
  const updateEntry = useCallback(
    async (entryId: string, updates: Partial<EntryInput>) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase
          .from('entries')
          .update(updates)
          .eq('id', entryId)
          .select()
          .single();

        if (error) throw error;

        setState((prev) => ({ ...prev, loading: false }));

        return data as Entry;
      } catch (error) {
        console.error('Error updating entry:', error);
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
   * Delete an entry
   */
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.from('entries').delete().eq('id', entryId);

      if (error) throw error;

      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      console.error('Error deleting entry:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Toggle star status on an entry
   */
  const toggleStar = useCallback(async (entryId: string) => {
    try {
      // Optimistic update
      setState((prev) => ({
        ...prev,
        entries: prev.entries.map((entry) =>
          entry.id === entryId ? { ...entry, is_starred: !entry.is_starred } : entry
        ),
      }));

      const entry = state.entries.find((e) => e.id === entryId);
      if (!entry) return;

      const { error } = await supabase
        .from('entries')
        .update({ is_starred: !entry.is_starred })
        .eq('id', entryId);

      if (error) {
        // Revert on error
        setState((prev) => ({
          ...prev,
          entries: prev.entries.map((entry) =>
            entry.id === entryId ? { ...entry, is_starred: !entry.is_starred } : entry
          ),
        }));
        throw error;
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }));
      throw error;
    }
  }, [state.entries]);

  /**
   * Upload media for entry
   */
  const uploadMedia = useCallback(
    async (entryId: string, fileUri: string, fileName: string) => {
      try {
        // Read file as blob
        const response = await fetch(fileUri);
        const blob = await response.blob();

        // Upload to storage
        const filePath = `entries/${userId}/${entryId}/${fileName}`;
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

        return publicUrl;
      } catch (error) {
        console.error('Error uploading media:', error);
        throw error;
      }
    },
    [userId]
  );

  return {
    entries: state.entries,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    fetchMore,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleStar,
    uploadMedia,
    refetch: () => fetchEntries(0, false),
  };
}
