/**
 * CDC Developmental Milestones Reference Data
 * Source: Centers for Disease Control and Prevention
 */

export interface MilestoneReference {
  id: string;
  category: 'cognitive' | 'motor' | 'language' | 'social' | 'emotional';
  title: string;
  description: string;
  ageRangeStartMonths: number;
  ageRangeEndMonths: number;
  source: 'CDC' | 'WHO' | 'custom';
}

export const MILESTONE_CATEGORIES = [
  { id: 'cognitive', label: 'Cognitive', icon: 'bulb-outline', color: '#3B82F6' },
  { id: 'motor', label: 'Motor', icon: 'body-outline', color: '#22C55E' },
  { id: 'language', label: 'Language', icon: 'chatbubble-outline', color: '#8B5CF6' },
  { id: 'social', label: 'Social', icon: 'people-outline', color: '#F59E0B' },
  { id: 'emotional', label: 'Emotional', icon: 'heart-outline', color: '#EF4444' },
] as const;

// Sample milestones for reference (full data is in database)
export const SAMPLE_MILESTONES: MilestoneReference[] = [
  // 2 months
  {
    id: '1',
    category: 'social',
    title: 'Begins to smile at people',
    description: 'Baby starts showing social smiles in response to faces',
    ageRangeStartMonths: 2,
    ageRangeEndMonths: 4,
    source: 'CDC',
  },
  {
    id: '2',
    category: 'cognitive',
    title: 'Pays attention to faces',
    description: 'Shows interest in looking at faces and making eye contact',
    ageRangeStartMonths: 2,
    ageRangeEndMonths: 4,
    source: 'CDC',
  },
  // 4 months
  {
    id: '3',
    category: 'motor',
    title: 'Holds head steady',
    description: 'Can hold head up without support when held',
    ageRangeStartMonths: 4,
    ageRangeEndMonths: 6,
    source: 'CDC',
  },
  {
    id: '4',
    category: 'language',
    title: 'Begins to babble',
    description: 'Makes cooing and babbling sounds',
    ageRangeStartMonths: 4,
    ageRangeEndMonths: 6,
    source: 'CDC',
  },
  // 6 months
  {
    id: '5',
    category: 'motor',
    title: 'Rolls over',
    description: 'Can roll over from tummy to back and back to tummy',
    ageRangeStartMonths: 6,
    ageRangeEndMonths: 9,
    source: 'CDC',
  },
  {
    id: '6',
    category: 'social',
    title: 'Responds to own name',
    description: 'Turns head or shows recognition when name is called',
    ageRangeStartMonths: 6,
    ageRangeEndMonths: 9,
    source: 'CDC',
  },
  // 9 months
  {
    id: '7',
    category: 'motor',
    title: 'Sits without support',
    description: 'Can sit independently without needing to be held up',
    ageRangeStartMonths: 9,
    ageRangeEndMonths: 12,
    source: 'CDC',
  },
  {
    id: '8',
    category: 'cognitive',
    title: 'Plays peek-a-boo',
    description: 'Enjoys and participates in peek-a-boo games',
    ageRangeStartMonths: 9,
    ageRangeEndMonths: 12,
    source: 'CDC',
  },
  // 12 months
  {
    id: '9',
    category: 'motor',
    title: 'Pulls up to stand',
    description: 'Can pull up to standing position using furniture',
    ageRangeStartMonths: 12,
    ageRangeEndMonths: 15,
    source: 'CDC',
  },
  {
    id: '10',
    category: 'language',
    title: 'Says first words',
    description: 'Says simple words like "mama" or "dada" with meaning',
    ageRangeStartMonths: 12,
    ageRangeEndMonths: 18,
    source: 'CDC',
  },
  // 18 months
  {
    id: '11',
    category: 'motor',
    title: 'Walks independently',
    description: 'Takes several steps without holding onto anything',
    ageRangeStartMonths: 12,
    ageRangeEndMonths: 18,
    source: 'CDC',
  },
  {
    id: '12',
    category: 'cognitive',
    title: 'Points to show interest',
    description: 'Points to get attention or show something interesting',
    ageRangeStartMonths: 18,
    ageRangeEndMonths: 24,
    source: 'CDC',
  },
  // 24 months
  {
    id: '13',
    category: 'language',
    title: 'Uses two-word phrases',
    description: 'Puts two words together like "more milk" or "daddy go"',
    ageRangeStartMonths: 24,
    ageRangeEndMonths: 30,
    source: 'CDC',
  },
  {
    id: '14',
    category: 'social',
    title: 'Plays alongside other children',
    description: 'Engages in parallel play with other children',
    ageRangeStartMonths: 24,
    ageRangeEndMonths: 36,
    source: 'CDC',
  },
  // 36 months
  {
    id: '15',
    category: 'cognitive',
    title: 'Follows simple instructions',
    description: 'Can follow two-step instructions',
    ageRangeStartMonths: 36,
    ageRangeEndMonths: 48,
    source: 'CDC',
  },
  {
    id: '16',
    category: 'emotional',
    title: 'Shows concern for others',
    description: 'Shows concern when seeing a crying friend',
    ageRangeStartMonths: 36,
    ageRangeEndMonths: 48,
    source: 'CDC',
  },
];

/**
 * Get milestones appropriate for a given age in months
 */
export function getMilestonesForAge(ageInMonths: number): MilestoneReference[] {
  return SAMPLE_MILESTONES.filter(
    (m) => ageInMonths >= m.ageRangeStartMonths && ageInMonths <= m.ageRangeEndMonths
  );
}

/**
 * Get upcoming milestones for a child (next 3-6 months)
 */
export function getUpcomingMilestones(ageInMonths: number): MilestoneReference[] {
  return SAMPLE_MILESTONES.filter(
    (m) => m.ageRangeStartMonths > ageInMonths && m.ageRangeStartMonths <= ageInMonths + 6
  );
}
