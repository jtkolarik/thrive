import { supabase } from './supabase';

/**
 * OpenAI Edge Function Helpers
 *
 * This file provides helper functions to interact with Supabase Edge Functions
 * that use OpenAI API on the backend. The mobile app does NOT call OpenAI directly.
 * All AI operations go through our secure edge functions.
 */

/**
 * Response type for embedding generation
 */
export interface GenerateEmbeddingResponse {
  success: boolean;
  embedding?: number[];
  error?: string;
}

/**
 * Response type for auto-tagging
 */
export interface AutoTagResponse {
  success: boolean;
  tags?: string[];
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed';
  summary?: string;
  error?: string;
}

/**
 * Response type for chat completion
 */
export interface ChatCompletionResponse {
  success: boolean;
  message?: {
    id: string;
    role: 'assistant';
    content: string;
    created_at: string;
  };
  conversationId?: string;
  error?: string;
}

/**
 * Generate embedding for an entry
 * Calls the 'generate-embedding' edge function
 *
 * @param entryId - The entry ID to generate embedding for
 * @param content - The entry content to embed
 * @returns Promise with embedding data
 */
export async function generateEmbedding(
  entryId: string,
  content: string
): Promise<GenerateEmbeddingResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: {
        entryId,
        content,
      },
    });

    if (error) {
      console.error('Error generating embedding:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate embedding',
      };
    }

    return {
      success: true,
      embedding: data.embedding,
    };
  } catch (error) {
    console.error('Exception generating embedding:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-tag an entry using AI
 * Calls the 'auto-tag-entry' edge function
 *
 * @param entryId - The entry ID to tag
 * @param content - The entry content to analyze
 * @param childAgeMonths - Child's age in months for context
 * @returns Promise with tags, sentiment, and summary
 */
export async function autoTagEntry(
  entryId: string,
  content: string,
  childAgeMonths: number
): Promise<AutoTagResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('auto-tag-entry', {
      body: {
        entryId,
        content,
        childAgeMonths,
      },
    });

    if (error) {
      console.error('Error auto-tagging entry:', error);
      return {
        success: false,
        error: error.message || 'Failed to auto-tag entry',
      };
    }

    return {
      success: true,
      tags: data.tags,
      sentiment: data.sentiment,
      summary: data.summary,
    };
  } catch (error) {
    console.error('Exception auto-tagging entry:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a chat message and get AI response
 * Calls the 'chat-completion' edge function
 *
 * @param message - The user's message
 * @param childId - Optional child ID for context
 * @param conversationId - Optional conversation ID to continue existing conversation
 * @returns Promise with AI response message
 */
export async function chatCompletion(
  message: string,
  childId?: string,
  conversationId?: string
): Promise<ChatCompletionResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        message,
        childId,
        conversationId,
      },
    });

    if (error) {
      console.error('Error in chat completion:', error);
      return {
        success: false,
        error: error.message || 'Failed to get chat response',
      };
    }

    return {
      success: true,
      message: data.message,
      conversationId: data.conversationId,
    };
  } catch (error) {
    console.error('Exception in chat completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Batch generate embeddings for multiple entries
 *
 * @param entries - Array of { entryId, content } objects
 * @returns Promise with array of results
 */
export async function batchGenerateEmbeddings(
  entries: Array<{ entryId: string; content: string }>
): Promise<GenerateEmbeddingResponse[]> {
  const results = await Promise.allSettled(
    entries.map(({ entryId, content }) => generateEmbedding(entryId, content))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      success: false,
      error: result.reason?.message || 'Failed to generate embedding',
    };
  });
}

/**
 * Search for similar entries using semantic search
 * Calls the 'semantic-search' edge function
 *
 * @param query - Search query
 * @param childId - Optional child ID to filter results
 * @param limit - Maximum number of results (default: 10)
 * @returns Promise with similar entries
 */
export interface SemanticSearchResponse {
  success: boolean;
  entries?: Array<{
    id: string;
    title: string | null;
    content: string;
    occurred_at: string;
    similarity: number;
  }>;
  error?: string;
}

export async function semanticSearch(
  query: string,
  childId?: string,
  limit: number = 10
): Promise<SemanticSearchResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('semantic-search', {
      body: {
        query,
        childId,
        limit,
      },
    });

    if (error) {
      console.error('Error in semantic search:', error);
      return {
        success: false,
        error: error.message || 'Failed to search entries',
      };
    }

    return {
      success: true,
      entries: data.entries,
    };
  } catch (error) {
    console.error('Exception in semantic search:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
