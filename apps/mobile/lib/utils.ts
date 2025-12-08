/**
 * Mobile utilities for the Thrive app
 * Contains types, utility functions, and helpers
 */

import { differenceInMonths, differenceInYears, formatDistanceToNow, startOfDay } from 'date-fns';

// ============================================================
// Types (matching database schema)
// ============================================================

export type EntryType = 'note' | 'photo' | 'milestone' | 'health' | 'school' | 'memory';
export type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed';
export type MilestoneCategory = 'cognitive' | 'motor' | 'language' | 'social' | 'emotional';
export type MessageRole = 'user' | 'assistant' | 'system';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type DigestFrequency = 'daily' | 'weekly' | 'never';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  digest_frequency: DigestFrequency;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string;
  avatar_url?: string;
  gender?: Gender;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  child_id: string;
  parent_id: string;
  type: EntryType;
  title?: string;
  content?: string;
  media_urls: string[];
  tags: string[];
  sentiment?: Sentiment;
  summary?: string;
  embedding?: number[];
  occurred_at: string;
  is_starred: boolean;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  category: MilestoneCategory;
  title: string;
  description?: string;
  age_range_start_months: number;
  age_range_end_months: number;
  source: string;
  created_at: string;
}

export interface ChildMilestone {
  id: string;
  child_id: string;
  milestone_id: string;
  achieved_at?: string;
  notes?: string;
  entry_id?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  parent_id: string;
  child_id?: string;
  title?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface Digest {
  id: string;
  parent_id: string;
  child_id?: string;
  period_start: string;
  period_end: string;
  content: DigestContent;
  sent_at?: string;
  created_at: string;
}

export interface DigestContent {
  greeting: string;
  highlights: Array<{
    title: string;
    description: string;
    entryId?: string;
  }>;
  insight: string;
  upcomingMilestones: string[];
  promptForNextWeek: string;
}

// ============================================================
// Age Calculation Utilities
// ============================================================

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date): { years: number; months: number } {
  const now = new Date();
  const years = differenceInYears(now, dateOfBirth);
  const months = differenceInMonths(now, dateOfBirth) % 12;
  return { years, months };
}

/**
 * Format age as a readable string
 */
export function formatAge(dateOfBirth: Date): string {
  const { years, months } = calculateAge(dateOfBirth);

  if (years === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  }

  if (months === 0) {
    return years === 1 ? '1 year' : `${years} years`;
  }

  const yearStr = years === 1 ? '1 year' : `${years} years`;
  const monthStr = months === 1 ? '1 month' : `${months} months`;

  return `${yearStr}, ${monthStr}`;
}

/**
 * Get age in months
 */
export function getAgeInMonths(dateOfBirth: Date): number {
  return differenceInMonths(new Date(), dateOfBirth);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Group entries by date
 */
export function groupEntriesByDate(entries: Entry[]): Map<string, Entry[]> {
  const groups = new Map<string, Entry[]>();

  for (const entry of entries) {
    const date = startOfDay(new Date(entry.occurred_at || entry.created_at));
    const key = date.toISOString();

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(entry);
  }

  // Sort entries within each group by date descending
  for (const [key, groupEntries] of groups) {
    groups.set(
      key,
      groupEntries.sort(
        (a, b) => new Date(b.occurred_at || b.created_at).getTime() -
                  new Date(a.occurred_at || a.created_at).getTime()
      )
    );
  }

  return groups;
}

// ============================================================
// Mobile-Specific Utilities
// ============================================================

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Format file size in bytes to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Get media type from URI
 */
export function getMediaType(uri: string): 'image' | 'video' | 'unknown' {
  const extension = uri.split('.').pop()?.toLowerCase();

  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v'];

  if (extension && imageExtensions.includes(extension)) {
    return 'image';
  }

  if (extension && videoExtensions.includes(extension)) {
    return 'video';
  }

  return 'unknown';
}

/**
 * Compress image before upload
 */
export async function compressImage(
  uri: string,
  quality: number = 0.8,
  maxWidth: number = 1920
): Promise<string> {
  try {
    const ImageManipulator = require('expo-image-manipulator');

    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri;
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
