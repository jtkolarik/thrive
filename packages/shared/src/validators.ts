import { z } from 'zod';
import {
  EntryType,
  Sentiment,
  Gender,
  DigestFrequency,
  MessageRole
} from './types';

// Child validators
export const CreateChildSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date_of_birth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  avatar_url: z.string().url().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  notes: z.string().max(1000).optional().nullable()
});

export const UpdateChildSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  date_of_birth: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  avatar_url: z.string().url().optional().nullable(),
  gender: z.nativeEnum(Gender).optional().nullable(),
  notes: z.string().max(1000).optional().nullable()
});

// Entry validators
export const CreateEntrySchema = z.object({
  child_id: z.string().uuid(),
  type: z.nativeEnum(EntryType),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  media_urls: z.array(z.string().url()).optional().nullable(),
  tags: z.array(z.string().max(50)).optional().nullable(),
  sentiment: z.nativeEnum(Sentiment).optional().nullable(),
  occurred_at: z.string().datetime().optional(),
  is_starred: z.boolean().optional(),
  is_private: z.boolean().optional()
});

export const UpdateEntrySchema = z.object({
  type: z.nativeEnum(EntryType).optional(),
  title: z.string().max(200).optional().nullable(),
  content: z.string().min(1).optional(),
  media_urls: z.array(z.string().url()).optional().nullable(),
  tags: z.array(z.string().max(50)).optional().nullable(),
  sentiment: z.nativeEnum(Sentiment).optional().nullable(),
  occurred_at: z.string().datetime().optional(),
  is_starred: z.boolean().optional(),
  is_private: z.boolean().optional()
});

// Message validators
export const CreateMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  role: z.nativeEnum(MessageRole),
  content: z.string().min(1, 'Content is required'),
  metadata: z.record(z.any()).optional().nullable()
});

// Profile validators
export const UpdateProfileSchema = z.object({
  full_name: z.string().max(100).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  timezone: z.string().optional().nullable(),
  digest_frequency: z.nativeEnum(DigestFrequency).optional()
});

// Type exports for use in other packages
export type CreateChildInput = z.infer<typeof CreateChildSchema>;
export type UpdateChildInput = z.infer<typeof UpdateChildSchema>;
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>;
export type UpdateEntryInput = z.infer<typeof UpdateEntrySchema>;
export type CreateMessageInput = z.infer<typeof CreateMessageSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
