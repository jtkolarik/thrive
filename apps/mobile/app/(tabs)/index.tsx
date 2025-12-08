import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SectionList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  format,
  isToday,
  isYesterday,
  isThisWeek,
  startOfDay,
} from 'date-fns';

import { colors, spacing } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import { useEntries } from '../../hooks/useEntries';
import { ChildSelector } from '../../components/ChildSelector';
import { QuickActions, QuickActionType } from '../../components/QuickActions';
import { EntryCard } from '../../components/EntryCard';
import { Typography, EmptyState, LoadingSpinner } from '../../components/ui';

interface EntrySection {
  title: string;
  data: any[];
}

function getDateGroup(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return 'This Week';
  return format(date, 'MMMM d, yyyy');
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { children, selectedChild, selectChild } = useChildren(user?.id);
  const {
    entries,
    loading,
    hasMore,
    fetchMore,
    toggleStar,
    refetch,
  } = useEntries(user?.id, {
    childId: selectedChild?.id,
  });

  const sections = useMemo((): EntrySection[] => {
    if (!entries.length) return [];

    const groups: Record<string, any[]> = {};

    entries.forEach((entry) => {
      const date = new Date(entry.occurred_at || entry.created_at);
      const group = getDateGroup(date);
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(entry);
    });

    // Sort by date priority: Today, Yesterday, This Week, then by date
    const priority: Record<string, number> = {
      'Today': 0,
      'Yesterday': 1,
      'This Week': 2,
    };

    return Object.entries(groups)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        const aPriority = priority[a.title] ?? 3;
        const bPriority = priority[b.title] ?? 3;
        return aPriority - bPriority;
      });
  }, [entries]);

  const handleQuickAction = useCallback((type: QuickActionType) => {
    router.push({
      pathname: '/entry/new',
      params: { type },
    });
  }, []);

  const handleEntryPress = useCallback((entryId: string) => {
    router.push(`/entry/${entryId}`);
  }, []);

  const handleToggleStar = useCallback((entryId: string) => {
    toggleStar(entryId);
  }, [toggleStar]);

  const handleChildSelect = useCallback((childId: string | null) => {
    const child = childId ? children.find((c) => c.id === childId) || null : null;
    selectChild(child);
  }, [children, selectChild]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchMore();
    }
  }, [hasMore, loading, fetchMore]);

  const renderHeader = useCallback(() => (
    <View style={styles.header}>
      <ChildSelector
        selectedChildId={selectedChild?.id || null}
        onSelect={handleChildSelect}
        children={children}
      />
      <QuickActions onSelectAction={handleQuickAction} />
    </View>
  ), [selectedChild, children, handleChildSelect, handleQuickAction]);

  const renderSectionHeader = useCallback(({ section }: { section: EntrySection }) => (
    <View style={styles.sectionHeader}>
      <Typography variant="h3" color="secondary">
        {section.title}
      </Typography>
    </View>
  ), []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={styles.entryItem}>
      <EntryCard
        entry={{
          id: item.id,
          type: item.type,
          title: item.title,
          content: item.content,
          mediaUrl: item.media_urls?.[0],
          tags: item.tags,
          isStarred: item.is_starred,
          createdAt: new Date(item.occurred_at || item.created_at),
          childId: item.child_id,
        }}
        onPress={() => handleEntryPress(item.id)}
        onToggleStar={handleToggleStar}
      />
    </View>
  ), [handleEntryPress, handleToggleStar]);

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary[500]} />
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          icon="book-outline"
          title="Start your journey"
          description="Capture your first moment with your little one"
          actionLabel="Create Entry"
          onAction={() => handleQuickAction('note')}
        />
      </View>
    );
  }, [loading, handleQuickAction]);

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
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refetch}
            tintColor={colors.primary[500]}
          />
        }
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  entryItem: {
    paddingHorizontal: spacing.md,
  },
  footer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing['3xl'],
  },
});
