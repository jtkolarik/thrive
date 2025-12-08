import { useEffect, useState, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { chatCompletion } from '../lib/openai';
import type { Message, Conversation, MessageRole } from '../lib/utils';

/**
 * Chat state interface
 */
interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  sending: boolean;
  error: Error | null;
}

/**
 * Custom hook for chat conversation management
 *
 * Features:
 * - Manages chat conversations and messages
 * - Sends messages and gets AI responses
 * - Realtime updates for new messages
 * - Create new conversations or continue existing ones
 * - Automatic loading and error handling
 *
 * @param userId - The authenticated user's ID
 * @param childId - Optional child ID for context
 * @returns Chat state and functions
 */
export function useChat(userId?: string, childId?: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    conversations: [],
    currentConversation: null,
    loading: true,
    sending: false,
    error: null,
  });

  /**
   * Fetch conversations for user
   */
  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      let query = supabase
        .from('conversations')
        .select('*')
        .eq('parent_id', userId)
        .order('updated_at', { ascending: false });

      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        conversations: data || [],
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, [userId, childId]);

  /**
   * Fetch messages for a conversation
   */
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setState((prev) => ({
        ...prev,
        messages: data || [],
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        loading: false,
      }));
    }
  }, []);

  /**
   * Initialize - fetch conversations
   */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /**
   * Set up realtime subscription for messages
   */
  useEffect(() => {
    if (!state.currentConversation) return;

    let channel: RealtimeChannel;

    // Fetch messages for current conversation
    fetchMessages(state.currentConversation.id);

    // Subscribe to realtime updates
    channel = supabase
      .channel(`messages:conversation_id=eq.${state.currentConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${state.currentConversation.id}`,
        },
        (payload) => {
          console.log('New message:', payload);
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, payload.new as Message],
          }));
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [state.currentConversation, fetchMessages]);

  /**
   * Load a conversation
   */
  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Fetch conversation details
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError) throw convError;

        setState((prev) => ({
          ...prev,
          currentConversation: conversation,
        }));

        // Messages will be fetched by useEffect
      } catch (error) {
        console.error('Error loading conversation:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
      }
    },
    []
  );

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(
    async (title?: string) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { data, error } = await supabase
          .from('conversations')
          .insert([
            {
              parent_id: userId,
              child_id: childId || null,
              title: title || null,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          currentConversation: data,
          messages: [],
          conversations: [data, ...prev.conversations],
          loading: false,
        }));

        return data as Conversation;
      } catch (error) {
        console.error('Error creating conversation:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          loading: false,
        }));
        throw error;
      }
    },
    [userId, childId]
  );

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        setState((prev) => ({ ...prev, sending: true, error: null }));

        let conversationId = state.currentConversation?.id;

        // Create new conversation if needed
        if (!conversationId) {
          const newConversation = await startNewConversation();
          conversationId = newConversation.id;
        }

        // Add user message to database
        const { data: userMessage, error: messageError } = await supabase
          .from('messages')
          .insert([
            {
              conversation_id: conversationId,
              role: 'user' as MessageRole,
              content,
            },
          ])
          .select()
          .single();

        if (messageError) throw messageError;

        // Add to state immediately
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage as Message],
        }));

        // Call edge function for AI response
        const response = await chatCompletion(content, childId, conversationId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to get AI response');
        }

        // AI message will be added via realtime subscription
        // Update conversation title if it's the first message
        if (state.messages.length === 0 && conversationId) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
          await supabase
            .from('conversations')
            .update({ title })
            .eq('id', conversationId);
        }

        setState((prev) => ({ ...prev, sending: false }));

        return response.message;
      } catch (error) {
        console.error('Error sending message:', error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          sending: false,
        }));
        throw error;
      }
    },
    [userId, childId, state.currentConversation, state.messages, startNewConversation]
  );

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', conversationId);

        if (error) throw error;

        setState((prev) => ({
          ...prev,
          conversations: prev.conversations.filter((c) => c.id !== conversationId),
          currentConversation:
            prev.currentConversation?.id === conversationId
              ? null
              : prev.currentConversation,
          messages: prev.currentConversation?.id === conversationId ? [] : prev.messages,
          loading: false,
        }));
      } catch (error) {
        console.error('Error deleting conversation:', error);
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
   * Clear current conversation
   */
  const clearConversation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentConversation: null,
      messages: [],
    }));
  }, []);

  return {
    messages: state.messages,
    conversations: state.conversations,
    currentConversation: state.currentConversation,
    loading: state.loading,
    sending: state.sending,
    error: state.error,
    sendMessage,
    startNewConversation,
    loadConversation,
    deleteConversation,
    clearConversation,
    refetch: fetchConversations,
  };
}
