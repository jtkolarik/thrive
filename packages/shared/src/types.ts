// Enums
export enum EntryType {
  NOTE = 'note',
  PHOTO = 'photo',
  MILESTONE = 'milestone',
  HEALTH = 'health',
  SCHOOL = 'school',
  MEMORY = 'memory'
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  MIXED = 'mixed'
}

export enum MilestoneCategory {
  COGNITIVE = 'cognitive',
  MOTOR = 'motor',
  LANGUAGE = 'language',
  SOCIAL = 'social',
  EMOTIONAL = 'emotional'
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum DigestFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NEVER = 'never'
}

// Interfaces
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string | null;
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
  avatar_url: string | null;
  gender: Gender | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Entry {
  id: string;
  child_id: string;
  parent_id: string;
  type: EntryType;
  title: string | null;
  content: string;
  media_urls: string[] | null;
  tags: string[] | null;
  sentiment: Sentiment | null;
  summary: string | null;
  embedding: number[] | null;
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
  description: string;
  age_range_start_months: number;
  age_range_end_months: number;
  source: string | null;
}

export interface ChildMilestone {
  id: string;
  child_id: string;
  milestone_id: string;
  achieved_at: string;
  notes: string | null;
  entry_id: string | null;
}

export interface Conversation {
  id: string;
  parent_id: string;
  child_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface DigestContent {
  greeting: string;
  highlights: Array<{
    title: string;
    description: string;
    date: string;
  }>;
  insight: string;
  upcomingMilestones: Array<{
    title: string;
    description: string;
    ageRange: string;
  }>;
  promptForNextWeek: string;
}

export interface Digest {
  id: string;
  parent_id: string;
  child_id: string | null;
  period_start: string;
  period_end: string;
  content: DigestContent;
  sent_at: string | null;
  created_at: string;
}
