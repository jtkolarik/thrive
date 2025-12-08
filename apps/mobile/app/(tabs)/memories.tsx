import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, differenceInMonths } from 'date-fns';

import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import { useEntries } from '../../hooks/useEntries';
import { ChildSelector } from '../../components/ChildSelector';
import { MilestoneCard } from '../../components/MilestoneCard';
import { Typography, EmptyState, Card, LoadingSpinner } from '../../components/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - spacing.md * 4) / 3;

const MILESTONE_CATEGORIES = [
  { id: 'cognitive', label: 'Cognitive', icon: 'bulb-outline', color: colors.info[500] },
  { id: 'motor', label: 'Motor', icon: 'body-outline', color: colors.success[500] },
  { id: 'language', label: 'Language', icon: 'chatbubble-outline', color: colors.secondary[500] },
  { id: 'social', label: 'Social', icon: 'people-outline', color: colors.warning[500] },
  { id: 'emotional', label: 'Emotional', icon: 'heart-outline', color: colors.error[500] },
];

export default function MemoriesScreen() {
  const { user } = useAuth();
  const { children, selectedChild, selectChild } = useChildren(user?.id);
  const { entries, loading, refetch } = useEntries(user?.id, {
    childId: selectedChild?.id,
    type: 'photo',
  });

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const photoEntries = useMemo(() => {
    return entries
      .filter((e) => e.media_urls && e.media_urls.length > 0)
      .slice(0, 9);
  }, [entries]);

  const childAgeInMonths = useMemo(() => {
    if (!selectedChild?.date_of_birth) return 0;
    return differenceInMonths(new Date(), new Date(selectedChild.date_of_birth));
  }, [selectedChild]);

  const handleChildSelect = useCallback((childId: string | null) => {
    const child = childId ? children.find((c) => c.id === childId) || null : null;
    selectChild(child);
  }, [children, selectChild]);

  const handlePhotoPress = useCallback((entryId: string) => {
    router.push(`/entry/${entryId}`);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderPhotoGrid = useCallback(() => {
    if (photoEntries.length === 0) {
      return (
        <EmptyState
          icon="camera-outline"
          title="No photos yet"
          description="Start capturing moments by adding photo entries"
          actionLabel="Add Photo"
          onAction={() => router.push({ pathname: '/entry/new', params: { type: 'photo' } })}
        />
      );
    }

    return (
      <View style={styles.photoGrid}>
        {photoEntries.map((entry) => (
          <Pressable
            key={entry.id}
            style={styles.photoItem}
            onPress={() => handlePhotoPress(entry.id)}
          >
            <Image
              source={{ uri: entry.media_urls[0] }}
              style={styles.photoImage}
              resizeMode="cover"
            />
            {entry.is_starred && (
              <View style={styles.starBadge}>
                <Ionicons name="star" size={12} color={colors.warning[500]} />
              </View>
            )}
          </Pressable>
        ))}
      </View>
    );
  }, [photoEntries, handlePhotoPress]);

  if (loading && entries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1">Memories</Typography>
          {children.length > 1 && (
            <ChildSelector
              selectedChildId={selectedChild?.id || null}
              onSelect={handleChildSelect}
              children={children}
            />
          )}
        </View>

        {/* This Month's Highlights */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h2">This Month's Highlights</Typography>
            {photoEntries.length > 0 && (
              <Pressable onPress={() => router.push('/entry/new?type=photo')}>
                <Typography variant="caption" style={{ color: colors.primary[500] }}>
                  Add Photo
                </Typography>
              </Pressable>
            )}
          </View>
          {renderPhotoGrid()}
        </View>

        {/* Milestones Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h2">Milestones</Typography>
          </View>

          {/* Category Filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            <Pressable
              style={[
                styles.categoryChip,
                !selectedCategory && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Typography
                variant="caption"
                color={!selectedCategory ? 'inverse' : 'secondary'}
              >
                All
              </Typography>
            </Pressable>
            {MILESTONE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === cat.id ? null : cat.id
                )}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? colors.background : cat.color}
                />
                <Typography
                  variant="caption"
                  color={selectedCategory === cat.id ? 'inverse' : 'secondary'}
                >
                  {cat.label}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>

          {/* Upcoming Milestones */}
          <View style={styles.milestonesContainer}>
            <Typography variant="h3" style={styles.milestoneSubheader}>
              Upcoming for {selectedChild?.name || 'your child'}
            </Typography>
            <Typography variant="caption" color="secondary" style={styles.milestoneHint}>
              Based on age: ~{childAgeInMonths} months
            </Typography>

            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneRow}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.info[100] }]}>
                  <Ionicons name="bulb-outline" size={20} color={colors.info[500]} />
                </View>
                <View style={styles.milestoneContent}>
                  <Typography variant="body">Follows simple instructions</Typography>
                  <Typography variant="caption" color="tertiary">
                    Cognitive • 12-18 months
                  </Typography>
                </View>
                <Pressable style={styles.milestoneAction}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success[500]} />
                </Pressable>
              </View>
            </Card>

            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneRow}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.success[100] }]}>
                  <Ionicons name="body-outline" size={20} color={colors.success[500]} />
                </View>
                <View style={styles.milestoneContent}>
                  <Typography variant="body">Walks independently</Typography>
                  <Typography variant="caption" color="tertiary">
                    Motor • 12-15 months
                  </Typography>
                </View>
                <Pressable style={styles.milestoneAction}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success[500]} />
                </Pressable>
              </View>
            </Card>

            <Card style={styles.milestoneCard}>
              <View style={styles.milestoneRow}>
                <View style={[styles.milestoneIcon, { backgroundColor: colors.secondary[100] }]}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.secondary[500]} />
                </View>
                <View style={styles.milestoneContent}>
                  <Typography variant="body">Says first words</Typography>
                  <Typography variant="caption" color="tertiary">
                    Language • 12-18 months
                  </Typography>
                </View>
                <Pressable style={styles.milestoneAction}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={colors.success[500]} />
                </Pressable>
              </View>
            </Card>
          </View>
        </View>

        {/* Year in Review */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h2">Year in Review</Typography>
          </View>
          <Card style={styles.yearbookCard}>
            <View style={styles.yearbookContent}>
              <View style={styles.yearbookIcon}>
                <Ionicons name="book-outline" size={40} color={colors.primary[500]} />
              </View>
              <Typography variant="h3" style={styles.yearbookTitle}>
                Create a Yearbook
              </Typography>
              <Typography variant="body" color="secondary" style={styles.yearbookText}>
                Compile your favorite moments into a beautiful memory book
              </Typography>
              <Pressable style={styles.yearbookButton}>
                <Typography variant="body" style={{ color: colors.primary[500] }}>
                  Coming Soon
                </Typography>
              </Pressable>
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  header: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoItem: {
    position: 'relative',
  },
  photoImage: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.md,
  },
  starBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  categoryScroll: {
    marginBottom: spacing.md,
  },
  categoryScrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  milestonesContainer: {
    gap: spacing.sm,
  },
  milestoneSubheader: {
    marginTop: spacing.sm,
  },
  milestoneHint: {
    marginBottom: spacing.sm,
  },
  milestoneCard: {
    padding: spacing.md,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneContent: {
    flex: 1,
    gap: 2,
  },
  milestoneAction: {
    padding: spacing.xs,
  },
  yearbookCard: {
    padding: spacing.lg,
  },
  yearbookContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  yearbookIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  yearbookTitle: {
    textAlign: 'center',
  },
  yearbookText: {
    textAlign: 'center',
  },
  yearbookButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
  },
});
