import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, typography } from '../../constants/theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 32;
      case 'md':
        return 48;
      case 'lg':
        return 64;
      case 'xl':
        return 96;
      default:
        return 48;
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return typography.fontSize.sm;
      case 'md':
        return typography.fontSize.lg;
      case 'lg':
        return typography.fontSize.xl;
      case 'xl':
        return typography.fontSize['3xl'];
      default:
        return typography.fontSize.lg;
    }
  };

  const avatarSize = getSize();
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (uri) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri }}
          style={[styles.image, { width: avatarSize, height: avatarSize }]}
        />
      </View>
    );
  }

  return (
    <View style={[containerStyle, style]}>
      <Text
        style={[
          styles.initials,
          {
            fontSize: getFontSize(),
            color: colors.primary[700],
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  initials: {
    fontWeight: typography.fontWeight.semibold,
  },
});
