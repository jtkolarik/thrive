import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useEntries } from '../../hooks/useEntries';
import { useChildren } from '../../hooks/useChildren';
import { Typography, Badge, LoadingSpinner, Button } from '../../components/ui';

const SCREEN_WIDTH = Dimensions.get('window').width;

const ENTRY_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  note: 'document-text-outline',
  photo: 'camera-outline',
  milestone: 'trophy-outline',
  health: 'medical-outline',
  feeding: 'restaurant-outline',
  sleep: 'moon-outline',
  activity: 'football-outline',
  measurement: 'resize-outline',
};

const ENTRY_TYPE_COLORS: Record<string, string> = {
  note: colors.entryTypes.note,
  photo: colors.entryTypes.photo,
  milestone: colors.entryTypes.milestone,
  health: colors.entryTypes.health,
  feeding: colors.entryTypes.feeding,
  sleep: colors.entryTypes.sleep,
  activity: colors.entryTypes.activity,
  measurement: colors.entryTypes.measurement,
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: colors.success[500],
  neutral: colors.neutral[500],
  negative: colors.error[500],
  mixed: colors.warning[500],
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { entries, toggleStar, deleteEntry, loading } = useEntries(user?.id);
  const { children } = useChildren(user?.id);

  const [entry, setEntry] = useState<any>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const found = entries.find((e) => e.id === id);
    setEntry(found);
  }, [entries, id]);

  const child = entry ? children.find((c) => c.id === entry.child_id) : null;

  const handleShare = async () => {
    if (!entry) return;
    try {
      await Share.share({
        message: `${entry.title || entry.type}\n\n${entry.content || ''}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEntry(id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete entry.');
            }
          },
        },
      ]
    );
  };

  const handleToggleStar = () => {
    if (entry) {
      toggleStar(entry.id);
    }
  };

  if (!entry && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner size="large" />
      </SafeAreaView>
    );
  }

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Typography variant="h2">Entry not found</Typography>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = ENTRY_TYPE_COLORS[entry.type] || colors.primary[500];
  const icon = ENTRY_TYPE_ICONS[entry.type] || 'document-text-outline';
  const hasPhotos = entry.media_urls && entry.media_urls.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: entry.title || 'Entry',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Pressable onPress={handleToggleStar} style={styles.headerButton}>
                <Ionicons
                  name={entry.is_starred ? 'star' : 'star-outline'}
                  size={24}
                  color={entry.is_starred ? colors.warning[500] : colors.text.secondary}
                />
              </Pressable>
              <Pressable onPress={handleShare} style={styles.headerButton}>
                <Ionicons name="share-outline" size={24} color={colors.text.secondary} />
              </Pressable>
            </View>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Gallery */}
        {hasPhotos && (
          <View style={styles.photoSection}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentPhotoIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {entry.media_urls.map((uri: string, index: number) => (
                <Image key={index} source={{ uri }} style={styles.photo} resizeMode="cover" />
              ))}
            </ScrollView>
            {entry.media_urls.length > 1 && (
              <View style={styles.photoIndicators}>
                {entry.media_urls.map((_: string, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.photoIndicator,
                      index === currentPhotoIndex && styles.photoIndicatorActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.typeRow}>
            <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
              <Ionicons name={icon} size={24} color={typeColor} />
            </View>
            <Badge
              label={entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              variant="default"
            />
            {entry.sentiment && (
              <View style={[styles.sentimentBadge, { backgroundColor: SENTIMENT_COLORS[entry.sentiment] + '20' }]}>
                <Typography variant="caption" style={{ color: SENTIMENT_COLORS[entry.sentiment] }}>
                  {entry.sentiment}
                </Typography>
              </View>
            )}
          </View>

          {entry.title && (
            <Typography variant="h1" style={styles.title}>
              {entry.title}
            </Typography>
          )}

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
            <Typography variant="caption" color="tertiary">
              {format(new Date(entry.occurred_at || entry.created_at), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}
            </Typography>
          </View>

          {child && (
            <View style={styles.metaRow}>
              <Ionicons name="person-outline" size={16} color={colors.text.tertiary} />
              <Typography variant="caption" color="tertiary">
                {child.name}
              </Typography>
            </View>
          )}
        </View>

        {/* Content */}
        {entry.content && (
          <View style={styles.contentSection}>
            <Typography variant="body" style={styles.content}>
              {entry.content}
            </Typography>
          </View>
        )}

        {/* Summary (AI-generated) */}
        {entry.summary && (
          <View style={styles.summarySection}>
            <View style={styles.summaryHeader}>
              <Ionicons name="sparkles" size={16} color={colors.secondary[500]} />
              <Typography variant="label" style={{ color: colors.secondary[500] }}>
                AI Summary
              </Typography>
            </View>
            <Typography variant="body" color="secondary">
              {entry.summary}
            </Typography>
          </View>
        )}

        {/* Tags */}
        {entry.tags && entry.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Typography variant="label" style={styles.sectionLabel}>
              Tags
            </Typography>
            <View style={styles.tagsContainer}>
              {entry.tags.map((tag: string, index: number) => (
                <Badge key={index} label={tag} variant="info" />
              ))}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button
            title="Delete Entry"
            onPress={handleDelete}
            variant="outline"
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    padding: spacing.xs,
  },
  photoSection: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    backgroundColor: colors.neutral[100],
  },
  photo: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
  photoIndicatorActive: {
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentimentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  title: {
    marginTop: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  contentSection: {
    padding: spacing.md,
    paddingTop: 0,
  },
  content: {
    lineHeight: 24,
  },
  summarySection: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondary[50],
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagsSection: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.text.secondary,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  actionsSection: {
    padding: spacing.md,
    marginTop: spacing.lg,
  },
});
