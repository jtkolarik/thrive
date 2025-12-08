import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          style,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    opacity: 0.8,
    ...shadows.sm,
  },
});
