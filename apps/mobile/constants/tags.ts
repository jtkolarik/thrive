/**
 * Entry Tag Taxonomy for Thrive
 * Used for auto-tagging entries and filtering
 */

export interface TagDefinition {
  id: string;
  label: string;
  category: string;
  color: string;
  icon?: string;
}

export const TAG_CATEGORIES = [
  'activity',
  'development',
  'health',
  'emotion',
  'social',
  'routine',
] as const;

export type TagCategory = typeof TAG_CATEGORIES[number];

// Primary tags used for auto-tagging
export const ENTRY_TAGS: TagDefinition[] = [
  // Activity tags
  { id: 'sleep', label: 'Sleep', category: 'routine', color: '#6366F1', icon: 'moon-outline' },
  { id: 'feeding', label: 'Feeding', category: 'routine', color: '#F59E0B', icon: 'restaurant-outline' },
  { id: 'play', label: 'Play', category: 'activity', color: '#EC4899', icon: 'game-controller-outline' },
  { id: 'outdoor', label: 'Outdoor', category: 'activity', color: '#22C55E', icon: 'sunny-outline' },
  { id: 'learning', label: 'Learning', category: 'development', color: '#3B82F6', icon: 'school-outline' },

  // Development tags
  { id: 'milestone', label: 'Milestone', category: 'development', color: '#8B5CF6', icon: 'trophy-outline' },
  { id: 'development', label: 'Development', category: 'development', color: '#14B8A6', icon: 'trending-up-outline' },
  { id: 'first-time', label: 'First Time', category: 'development', color: '#F97316', icon: 'star-outline' },

  // Health tags
  { id: 'health', label: 'Health', category: 'health', color: '#EF4444', icon: 'medical-outline' },
  { id: 'symptoms', label: 'Symptoms', category: 'health', color: '#DC2626', icon: 'thermometer-outline' },
  { id: 'appointment', label: 'Appointment', category: 'health', color: '#7C3AED', icon: 'calendar-outline' },
  { id: 'medication', label: 'Medication', category: 'health', color: '#DB2777', icon: 'medkit-outline' },

  // Emotion tags
  { id: 'funny', label: 'Funny', category: 'emotion', color: '#FBBF24', icon: 'happy-outline' },
  { id: 'sweet', label: 'Sweet', category: 'emotion', color: '#F472B6', icon: 'heart-outline' },
  { id: 'challenging', label: 'Challenging', category: 'emotion', color: '#9CA3AF', icon: 'alert-circle-outline' },
  { id: 'tantrum', label: 'Tantrum', category: 'emotion', color: '#F87171', icon: 'sad-outline' },

  // Social tags
  { id: 'social', label: 'Social', category: 'social', color: '#A78BFA', icon: 'people-outline' },
  { id: 'family', label: 'Family', category: 'social', color: '#34D399', icon: 'home-outline' },
  { id: 'friends', label: 'Friends', category: 'social', color: '#60A5FA', icon: 'person-add-outline' },

  // Behavior tags
  { id: 'behavior', label: 'Behavior', category: 'development', color: '#818CF8', icon: 'eye-outline' },
  { id: 'communication', label: 'Communication', category: 'development', color: '#2DD4BF', icon: 'chatbubbles-outline' },
];

// Tags suggested by AI for auto-tagging prompt
export const AUTO_TAG_OPTIONS = [
  'sleep',
  'feeding',
  'development',
  'health',
  'behavior',
  'social',
  'learning',
  'milestone',
  'funny',
  'sweet',
  'challenging',
] as const;

/**
 * Get tag definition by ID
 */
export function getTagById(id: string): TagDefinition | undefined {
  return ENTRY_TAGS.find((tag) => tag.id === id);
}

/**
 * Get tags by category
 */
export function getTagsByCategory(category: TagCategory): TagDefinition[] {
  return ENTRY_TAGS.filter((tag) => tag.category === category);
}

/**
 * Get tag color by ID
 */
export function getTagColor(id: string): string {
  const tag = getTagById(id);
  return tag?.color || '#9CA3AF';
}

/**
 * Format tags for display
 */
export function formatTagLabel(id: string): string {
  const tag = getTagById(id);
  return tag?.label || id.charAt(0).toUpperCase() + id.slice(1);
}
