import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, typography } from '../../constants/theme';

export type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
export type TypographyColor = 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success';

export interface TypographyProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  color?: TypographyColor;
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body',
  color = 'primary',
  style,
  numberOfLines,
}: TypographyProps) {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'body':
        return styles.body;
      case 'caption':
        return styles.caption;
      case 'label':
        return styles.label;
      default:
        return styles.body;
    }
  };

  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'primary':
        return { color: colors.text.primary };
      case 'secondary':
        return { color: colors.text.secondary };
      case 'tertiary':
        return { color: colors.text.tertiary };
      case 'inverse':
        return { color: colors.text.inverse };
      case 'error':
        return { color: colors.error[600] };
      case 'success':
        return { color: colors.success[600] };
      default:
        return { color: colors.text.primary };
    }
  };

  return (
    <Text
      style={[getVariantStyle(), getColorStyle(), style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight['3xl'],
  },
  h2: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight['2xl'],
  },
  h3: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.xl,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.base,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.sm,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.sm,
  },
});
