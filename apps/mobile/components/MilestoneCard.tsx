import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Card, Typography, Badge } from './ui';
import { format } from 'date-fns';

export interface Milestone {
  id: string;
  category: 'physical' | 'cognitive' | 'social' | 'language';
  title: string;
  description: string;
  minAgeMonths: number;
  maxAgeMonths: number;
}

export interface ChildMilestone {
  id: string;
  milestoneId: string;
  childId: string;
  achievedAt?: Date | null;
  notes?: string;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  childMilestone?: ChildMilestone;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<
  Milestone['category'],
  keyof typeof Ionicons.glyphMap
> = {
  physical: 'fitness-outline',
  cognitive: 'bulb-outline',
  social: 'people-outline',
  language: 'chatbubble-outline',
};

const CATEGORY_COLORS: Record<Milestone['category'], string> = {
  physical: colors.success[600],
  cognitive: colors.info[600],
  social: colors.secondary[600],
  language: colors.warning[600],
};

export function MilestoneCard({
  milestone,
  childMilestone,
  onPress,
}: MilestoneCardProps) {
  const icon = CATEGORY_ICONS[milestone.category];
  const iconColor = CATEGORY_COLORS[milestone.category];
  const isAchieved = childMilestone?.achievedAt != null;

  const getAgeRange = (): string => {
    if (milestone.minAgeMonths === milestone.maxAgeMonths) {
      return `${milestone.minAgeMonths} months`;
    }
    return `${milestone.minAgeMonths}-${milestone.maxAgeMonths} months`;
  };

  const formatAchievedDate = (date: Date): string => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconColor + '20' },
            ]}
          >
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
          <View style={styles.categoryInfo}>
            <Typography variant="caption" color="secondary">
              {milestone.category.charAt(0).toUpperCase() +
                milestone.category.slice(1)}
            </Typography>
            <Typography variant="caption" color="tertiary">
              {getAgeRange()}
            </Typography>
          </View>
        </View>

        {isAchieved && (
          <View style={styles.achievedBadge}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success[600]} />
          </View>
        )}
      </View>

      <Typography variant="h3" style={styles.title}>
        {milestone.title}
      </Typography>

      <Typography variant="body" color="secondary" numberOfLines={2}>
        {milestone.description}
      </Typography>

      {isAchieved && childMilestone?.achievedAt && (
        <View style={styles.achievedInfo}>
          <Badge label="Achieved" variant="success" />
          <Typography variant="caption" color="tertiary">
            {formatAchievedDate(childMilestone.achievedAt)}
          </Typography>
        </View>
      )}

      {!isAchieved && (
        <View style={styles.notAchievedInfo}>
          <Badge label="Not yet achieved" variant="default" />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: {
    gap: 2,
  },
  achievedBadge: {
    padding: spacing.xs / 2,
  },
  title: {
    marginBottom: spacing.xs,
  },
  achievedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  notAchievedInfo: {
    marginTop: spacing.sm,
  },
});
