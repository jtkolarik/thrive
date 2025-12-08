/**
 * Mobile-specific utilities for the Thrive app
 *
 * Re-exports utilities from @thrive/shared where applicable
 * and adds mobile-specific functionality
 */

// Re-export shared utilities
export {
  calculateAge,
  formatAge,
  getAgeInMonths,
  formatRelativeTime,
  groupEntriesByDate,
} from '@thrive/shared';

// Re-export shared types
export type {
  Profile,
  Child,
  Entry,
  Milestone,
  ChildMilestone,
  Conversation,
  Message,
  Digest,
  DigestContent,
} from '@thrive/shared';

export {
  EntryType,
  Sentiment,
  MilestoneCategory,
  MessageRole,
  Gender,
  DigestFrequency,
} from '@thrive/shared';

/**
 * Generate a UUID v4
 * Simple implementation for mobile without external dependencies
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
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
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
 * @param uri - File URI
 * @returns Media type: 'image', 'video', or 'unknown'
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
 * Uses expo-image-manipulator for compression
 * @param uri - Original image URI
 * @param quality - Compression quality (0-1, default: 0.8)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @returns Compressed image URI
 */
export async function compressImage(
  uri: string,
  quality: number = 0.8,
  maxWidth: number = 1920
): Promise<string> {
  try {
    // Dynamically import to avoid loading if not needed
    const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');

    const result = await manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return original URI if compression fails
    return uri;
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
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
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
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
 * @param date - Date to format
 * @param format - Format type: 'short', 'medium', 'long'
 * @returns Formatted date string
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

  // medium (default)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format time for display
 * @param date - Date to format
 * @returns Formatted time string (e.g., "2:30 PM")
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
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sleep/delay utility
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse with fallback
 * @param json - JSON string to parse
 * @param fallback - Fallback value if parse fails
 * @returns Parsed object or fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}
