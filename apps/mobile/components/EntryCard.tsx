import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../constants/theme';
import { Card, Typography, Badge } from './ui';
import { formatDistanceToNow } from 'date-fns';

export interface Entry {
  id: string;
  type: 'note' | 'photo' | 'milestone' | 'health' | 'feeding' | 'sleep' | 'activity' | 'measurement';
  title?: string;
  content?: string;
  mediaUrl?: string;
  tags?: string[];
  isStarred: boolean;
  createdAt: Date;
  childId: string;
}

export interface EntryCardProps {
  entry: Entry;
  onPress: () => void;
  onToggleStar: (entryId: string) => void;
}

const ENTRY_TYPE_ICONS: Record<Entry['type'], keyof typeof Ionicons.glyphMap> = {
  note: 'document-text-outline',
  photo: 'camera-outline',
  milestone: 'trophy-outline',
  health: 'medical-outline',
  feeding: 'restaurant-outline',
  sleep: 'moon-outline',
  activity: 'football-outline',
  measurement: 'resize-outline',
};

const ENTRY_TYPE_COLORS: Record<Entry['type'], string> = {
  note: colors.entryTypes.note,
  photo: colors.entryTypes.photo,
  milestone: colors.entryTypes.milestone,
  health: colors.entryTypes.health,
  feeding: colors.entryTypes.feeding,
  sleep: colors.entryTypes.sleep,
  activity: colors.entryTypes.activity,
  measurement: colors.entryTypes.measurement,
};

export function EntryCard({ entry, onPress, onToggleStar }: EntryCardProps) {
  const icon = ENTRY_TYPE_ICONS[entry.type];
  const iconColor = ENTRY_TYPE_COLORS[entry.type];
  const relativeTime = formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true });

  const handleStarPress = () => {
    onToggleStar(entry.id);
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <Badge
            label={entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
            variant="default"
          />
        </View>

        <Pressable onPress={handleStarPress} style={styles.starButton}>
          <Ionicons
            name={entry.isStarred ? 'star' : 'star-outline'}
            size={24}
            color={entry.isStarred ? colors.warning[500] : colors.neutral[400]}
          />
        </Pressable>
      </View>

      {entry.title && (
        <Typography variant="h3" style={styles.title}>
          {entry.title}
        </Typography>
      )}

      {entry.content && (
        <Typography variant="body" color="secondary" numberOfLines={3}>
          {truncateText(entry.content)}
        </Typography>
      )}

      {entry.mediaUrl && (
        <Image
          source={{ uri: entry.mediaUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      )}

      {entry.tags && entry.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {entry.tags.map((tag, index) => (
            <Badge key={index} label={tag} variant="info" style={styles.tag} />
          ))}
        </View>
      )}

      <Typography variant="caption" color="tertiary" style={styles.timestamp}>
        {relativeTime}
      </Typography>
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    padding: spacing.xs,
  },
  title: {
    marginBottom: spacing.xs,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  tag: {
    marginBottom: 0,
  },
  timestamp: {
    marginTop: spacing.sm,
  },
});
