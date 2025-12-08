import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '../constants/theme';
import { Avatar, Typography, Modal } from './ui';

export interface Child {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ChildSelectorProps {
  selectedChildId: string | null;
  onSelect: (childId: string | null) => void;
  children: Child[];
}

export function ChildSelector({
  selectedChildId,
  onSelect,
  children,
}: ChildSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedChild = selectedChildId
    ? children.find((child) => child.id === selectedChildId)
    : null;

  const handleSelect = (childId: string | null) => {
    onSelect(childId);
    setModalVisible(false);
  };

  const displayName = selectedChild ? selectedChild.name : 'All Children';

  return (
    <>
      <Pressable
        style={({ pressed }) => [
          styles.selector,
          pressed && styles.selectorPressed,
        ]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.content}>
          {selectedChild ? (
            <Avatar
              uri={selectedChild.avatarUrl}
              name={selectedChild.name}
              size="sm"
            />
          ) : (
            <View style={styles.allChildrenIcon}>
              <Ionicons name="people-outline" size={20} color={colors.primary[600]} />
            </View>
          )}

          <Typography variant="body" style={styles.name}>
            {displayName}
          </Typography>

          <Ionicons
            name="chevron-down-outline"
            size={20}
            color={colors.neutral[500]}
          />
        </View>
      </Pressable>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Select Child"
      >
        <View style={styles.modalContent}>
          {/* All Children option */}
          <Pressable
            style={({ pressed }) => [
              styles.childOption,
              selectedChildId === null && styles.childOptionSelected,
              pressed && styles.childOptionPressed,
            ]}
            onPress={() => handleSelect(null)}
          >
            <View style={styles.allChildrenIcon}>
              <Ionicons name="people-outline" size={20} color={colors.primary[600]} />
            </View>
            <Typography variant="body" style={styles.childName}>
              All Children
            </Typography>
            {selectedChildId === null && (
              <Ionicons name="checkmark" size={24} color={colors.primary[600]} />
            )}
          </Pressable>

          {/* Individual children */}
          {children.map((child) => (
            <Pressable
              key={child.id}
              style={({ pressed }) => [
                styles.childOption,
                selectedChildId === child.id && styles.childOptionSelected,
                pressed && styles.childOptionPressed,
              ]}
              onPress={() => handleSelect(child.id)}
            >
              <Avatar uri={child.avatarUrl} name={child.name} size="sm" />
              <Typography variant="body" style={styles.childName}>
                {child.name}
              </Typography>
              {selectedChildId === child.id && (
                <Ionicons name="checkmark" size={24} color={colors.primary[600]} />
              )}
            </Pressable>
          ))}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  selectorPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flex: 1,
  },
  allChildrenIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    gap: spacing.sm,
  },
  childOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  childOptionSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  childOptionPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  childName: {
    flex: 1,
  },
});
