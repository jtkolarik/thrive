import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return colors.success[100];
      case 'warning':
        return colors.warning[100];
      case 'error':
        return colors.error[100];
      case 'info':
        return colors.info[100];
      case 'default':
      default:
        return colors.neutral[100];
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'success':
        return colors.success[700];
      case 'warning':
        return colors.warning[700];
      case 'error':
        return colors.error[700];
      case 'info':
        return colors.info[700];
      case 'default':
      default:
        return colors.neutral[700];
    }
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: getTextColor() },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});
