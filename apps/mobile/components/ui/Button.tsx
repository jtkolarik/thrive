import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.neutral[200];

    switch (variant) {
      case 'primary':
        return colors.primary[600];
      case 'secondary':
        return colors.secondary[600];
      case 'outline':
        return 'transparent';
      default:
        return colors.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.neutral[400];

    switch (variant) {
      case 'primary':
      case 'secondary':
        return colors.text.inverse;
      case 'outline':
        return colors.primary[600];
      default:
        return colors.text.inverse;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md':
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return typography.fontSize.sm;
      case 'md':
        return typography.fontSize.base;
      case 'lg':
        return typography.fontSize.lg;
      default:
        return typography.fontSize.base;
    }
  };

  const buttonStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderRadius: borderRadius.lg,
    ...getPadding(),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth && { width: '100%' }),
    ...(variant === 'outline' && {
      borderWidth: 2,
      borderColor: disabled ? colors.neutral[300] : colors.primary[600],
    }),
    opacity: disabled ? 0.6 : 1,
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
    fontSize: getFontSize(),
    fontWeight: typography.fontWeight.semibold,
  };

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle,
        style,
        pressed && !disabled && { opacity: 0.8 },
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors.primary[600] : colors.text.inverse}
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({});
