import React, { useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { Typography } from './Typography';

export type DatePickerMode = 'date' | 'time' | 'datetime';

export interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: DatePickerMode;
  label?: string;
  style?: ViewStyle;
}

export function DatePicker({
  value,
  onChange,
  mode = 'date',
  label,
  style,
}: DatePickerProps) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date): string => {
    if (mode === 'time') {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (mode === 'datetime') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    setShow(true);
  };

  const handleDismiss = () => {
    setShow(false);
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Typography variant="label" style={styles.label}>
          {label}
        </Typography>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={handlePress}
      >
        <Typography variant="body" color="primary">
          {formatDate(value)}
        </Typography>
        <Ionicons name="calendar-outline" size={20} color={colors.primary[600]} />
      </Pressable>

      {show && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <Pressable onPress={handleDismiss}>
                  <Typography variant="body" color="primary">
                    Done
                  </Typography>
                </Pressable>
              </View>
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                style={styles.iosPicker}
              />
            </View>
          )}

          {Platform.OS === 'android' && (
            <DateTimePicker
              value={value}
              mode={mode}
              display="default"
              onChange={handleChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  buttonPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  iosPickerContainer: {
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  iosPicker: {
    backgroundColor: colors.background,
  },
});
