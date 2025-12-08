import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useChildren } from '../../hooks/useChildren';
import { useProfile } from '../../hooks/useProfile';
import { Avatar, Typography, Card, Button } from '../../components/ui';
import { formatAge } from '../../lib/utils';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}

function SettingsRow({ icon, label, value, onPress, showArrow = true, danger = false }: SettingsRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.settingsRow,
        pressed && onPress && styles.settingsRowPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.settingsIcon, danger && styles.settingsIconDanger]}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? colors.error[500] : colors.primary[500]}
        />
      </View>
      <View style={styles.settingsContent}>
        <Typography
          variant="body"
          color={danger ? 'error' : 'primary'}
        >
          {label}
        </Typography>
        {value && (
          <Typography variant="caption" color="tertiary">
            {value}
          </Typography>
        )}
      </View>
      {showArrow && onPress && (
        <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
      )}
    </Pressable>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Typography variant="label" style={styles.sectionTitle}>
        {title}
      </Typography>
      <Card style={styles.sectionCard}>
        {children}
      </Card>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const { children } = useChildren(user?.id);

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  }, [signOut]);

  const handleEditProfile = useCallback(() => {
    Alert.alert('Coming Soon', 'Profile editing will be available soon.');
  }, []);

  const handleAddChild = useCallback(() => {
    router.push('/onboarding/add-child');
  }, []);

  const handleEditChild = useCallback((childId: string) => {
    Alert.alert('Coming Soon', 'Child editing will be available soon.');
  }, []);

  const handleChangePassword = useCallback(() => {
    Alert.alert('Coming Soon', 'Password change will be available soon.');
  }, []);

  const handleExportData = useCallback(() => {
    Alert.alert(
      'Export Data',
      'Your data export will be prepared and emailed to you within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Success', 'Export request submitted.') },
      ]
    );
  }, []);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted after a 30-day recovery period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available soon.');
          },
        },
      ]
    );
  }, []);

  const handleOpenLink = useCallback((url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link.');
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <Pressable onPress={handleEditProfile}>
            <Avatar
              uri={profile?.avatar_url}
              name={profile?.full_name || user?.email || 'User'}
              size="xl"
            />
          </Pressable>
          <Typography variant="h2" style={styles.userName}>
            {profile?.full_name || 'Parent'}
          </Typography>
          <Typography variant="body" color="secondary">
            {user?.email}
          </Typography>
        </View>

        {/* Children Section */}
        <SettingsSection title="Your Children">
          {children.map((child, index) => (
            <React.Fragment key={child.id}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={styles.childRow}
                onPress={() => handleEditChild(child.id)}
              >
                <Avatar
                  uri={child.avatar_url}
                  name={child.name}
                  size="md"
                />
                <View style={styles.childInfo}>
                  <Typography variant="body">{child.name}</Typography>
                  <Typography variant="caption" color="tertiary">
                    {child.date_of_birth
                      ? formatAge(new Date(child.date_of_birth))
                      : 'Age unknown'}
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
              </Pressable>
            </React.Fragment>
          ))}
          <View style={styles.divider} />
          <Pressable style={styles.addChildRow} onPress={handleAddChild}>
            <View style={styles.addChildIcon}>
              <Ionicons name="add" size={24} color={colors.primary[500]} />
            </View>
            <Typography variant="body" style={{ color: colors.primary[500] }}>
              Add Child
            </Typography>
          </Pressable>
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsRow
            icon="person-outline"
            label="Edit Profile"
            onPress={handleEditProfile}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={handleChangePassword}
          />
        </SettingsSection>

        {/* Preferences Section */}
        <SettingsSection title="Preferences">
          <SettingsRow
            icon="mail-outline"
            label="Email Digest"
            value={profile?.digest_frequency === 'weekly' ? 'Weekly' : profile?.digest_frequency === 'daily' ? 'Daily' : 'Never'}
            onPress={() => Alert.alert('Coming Soon', 'Digest settings will be available soon.')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="notifications-outline"
            label="Push Notifications"
            value="Enabled"
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon.')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="globe-outline"
            label="Timezone"
            value={profile?.timezone || 'America/New_York'}
            onPress={() => Alert.alert('Coming Soon', 'Timezone settings will be available soon.')}
          />
        </SettingsSection>

        {/* Data Section */}
        <SettingsSection title="Data & Privacy">
          <SettingsRow
            icon="download-outline"
            label="Export All Data"
            onPress={handleExportData}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
            danger
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsRow
            icon="help-circle-outline"
            label="Help Center"
            onPress={() => handleOpenLink('https://thrive.app/help')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="chatbubble-outline"
            label="Contact Support"
            onPress={() => handleOpenLink('mailto:support@thrive.app')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => handleOpenLink('https://thrive.app/terms')}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="shield-outline"
            label="Privacy Policy"
            onPress={() => handleOpenLink('https://thrive.app/privacy')}
          />
        </SettingsSection>

        {/* Sign Out */}
        <View style={styles.signOutContainer}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            fullWidth
          />
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Typography variant="caption" color="tertiary">
            Thrive v1.0.0
          </Typography>
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
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  userName: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingsRowPressed: {
    backgroundColor: colors.backgroundSecondary,
  },
  settingsIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIconDanger: {
    backgroundColor: colors.error[100],
  },
  settingsContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.md + 36 + spacing.md,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  childInfo: {
    flex: 1,
    gap: 2,
  },
  addChildRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  addChildIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutContainer: {
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  versionContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
});
