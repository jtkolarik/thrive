import { Entry } from './types';

/**
 * Calculate age from date of birth
 * @param dateOfBirth - The date of birth
 * @returns Object with years and months
 */
export function calculateAge(dateOfBirth: Date): { years: number; months: number } {
  const today = new Date();
  const birth = new Date(dateOfBirth);

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // Adjust for day of month
  if (today.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      years--;
      months += 12;
    }
  }

  return { years, months };
}

/**
 * Format age as human-readable string
 * @param dateOfBirth - The date of birth
 * @returns Formatted age string (e.g., "2 years, 3 months" or "8 months")
 */
export function formatAge(dateOfBirth: Date): string {
  const { years, months } = calculateAge(dateOfBirth);

  if (years === 0) {
    return months === 1 ? '1 month' : `${months} months`;
  }

  const yearStr = years === 1 ? '1 year' : `${years} years`;

  if (months === 0) {
    return yearStr;
  }

  const monthStr = months === 1 ? '1 month' : `${months} months`;
  return `${yearStr}, ${monthStr}`;
}

/**
 * Get age in total months
 * @param dateOfBirth - The date of birth
 * @returns Total age in months
 */
export function getAgeInMonths(dateOfBirth: Date): number {
  const { years, months } = calculateAge(dateOfBirth);
  return years * 12 + months;
}

/**
 * Format a date as relative time
 * @param date - The date to format
 * @returns Relative time string (e.g., "2 hours ago", "Yesterday")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  }

  if (diffMin < 60) {
    return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
  }

  if (diffHour < 24) {
    return diffHour === 1 ? '1 hour ago' : `${diffHour} hours ago`;
  }

  if (diffDay === 1) {
    return 'Yesterday';
  }

  if (diffDay < 7) {
    return `${diffDay} days ago`;
  }

  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(diffDay / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

/**
 * Group entries by date (YYYY-MM-DD format)
 * @param entries - Array of entries to group
 * @returns Map with date keys and entry arrays as values
 */
export function groupEntriesByDate(entries: Entry[]): Map<string, Entry[]> {
  const grouped = new Map<string, Entry[]>();

  for (const entry of entries) {
    const date = new Date(entry.occurred_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(entry);
  }

  // Sort entries within each date by occurred_at (newest first)
  for (const [, entries] of grouped) {
    entries.sort((a, b) => {
      return new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime();
    });
  }

  return grouped;
}
