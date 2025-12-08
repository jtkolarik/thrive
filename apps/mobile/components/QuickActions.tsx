import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { Typography } from './ui';

export type QuickActionType = 'note' | 'photo' | 'milestone' | 'health';

export interface QuickActionsProps {
  onSelectAction: (type: QuickActionType) => void;
}

interface ActionButton {
  type: QuickActionType;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}

const ACTIONS: ActionButton[] = [
  {
    type: 'note',
    icon: 'document-text-outline',
    label: 'Note',
    color: colors.entryTypes.note,
  },
  {
    type: 'photo',
    icon: 'camera-outline',
    label: 'Photo',
    color: colors.entryTypes.photo,
  },
  {
    type: 'milestone',
    icon: 'trophy-outline',
    label: 'Milestone',
    color: colors.entryTypes.milestone,
  },
  {
    type: 'health',
    icon: 'medical-outline',
    label: 'Health',
    color: colors.entryTypes.health,
  },
];

export function QuickActions({ onSelectAction }: QuickActionsProps) {
  const handlePress = (type: QuickActionType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectAction(type);
  };

  return (
    <View style={styles.container}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.type}
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: action.color + '15' },
            pressed && styles.actionButtonPressed,
          ]}
          onPress={() => handlePress(action.type)}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: action.color + '30' },
            ]}
          >
            <Ionicons name={action.icon} size={24} color={action.color} />
          </View>
          <Typography variant="caption" style={styles.label}>
            {action.label}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  actionButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    textAlign: 'center',
  },
});
