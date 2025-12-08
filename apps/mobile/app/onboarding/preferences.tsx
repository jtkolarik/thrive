import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import { useOnboarding } from '../../hooks/useOnboarding';

export default function PreferencesScreen() {
  const router = useRouter();
  const { preferences, setPreferences, setNotificationPreference } = useOnboarding();

  const handleDigestFrequencyChange = (frequency: 'daily' | 'weekly' | 'never') => {
    setPreferences({ digest_frequency: frequency });
  };

  const handleContinue = () => {
    router.push('/onboarding/first-entry');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= 2 && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Customize Your Experience</Text>
          <Text style={styles.subtitle}>
            Set your preferences for digests and notifications. You can always change these later.
          </Text>
        </View>

        {/* Digest Frequency Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Digest Frequency</Text>
          <Text style={styles.sectionDescription}>
            Receive a beautiful summary of your child's moments and milestones
          </Text>

          <View style={styles.optionsContainer}>
            {[
              {
                value: 'daily',
                label: 'Daily',
                description: 'Get a digest every day',
              },
              {
                value: 'weekly',
                label: 'Weekly',
                description: 'Get a digest every Sunday',
              },
              {
                value: 'never',
                label: 'Never',
                description: 'No automatic digests',
              },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  preferences.digest_frequency === option.value &&
                    styles.optionCardActive,
                ]}
                onPress={() =>
                  handleDigestFrequencyChange(option.value as any)
                }
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.radioButton,
                      preferences.digest_frequency === option.value &&
                        styles.radioButtonActive,
                    ]}
                  >
                    {preferences.digest_frequency === option.value && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <Text style={styles.sectionDescription}>
            Choose what notifications you'd like to receive
          </Text>

          <View style={styles.notificationsContainer}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>Milestone Reminders</Text>
                <Text style={styles.notificationDescription}>
                  Get notified about upcoming developmental milestones
                </Text>
              </View>
              <Switch
                value={preferences.notifications.milestones}
                onValueChange={(value) =>
                  setNotificationPreference('milestones', value)
                }
                trackColor={{
                  false: colors.neutral[300],
                  true: colors.primary[500],
                }}
                thumbColor={colors.background}
              />
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>Weekly Digest</Text>
                <Text style={styles.notificationDescription}>
                  Receive your weekly summary via push notification
                </Text>
              </View>
              <Switch
                value={preferences.notifications.digest}
                onValueChange={(value) =>
                  setNotificationPreference('digest', value)
                }
                trackColor={{
                  false: colors.neutral[300],
                  true: colors.primary[500],
                }}
                thumbColor={colors.background}
                disabled={preferences.digest_frequency === 'never'}
              />
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationLabel}>Daily Prompts</Text>
                <Text style={styles.notificationDescription}>
                  Get gentle reminders to capture today's moments
                </Text>
              </View>
              <Switch
                value={preferences.notifications.dailyPrompts}
                onValueChange={(value) =>
                  setNotificationPreference('dailyPrompts', value)
                }
                trackColor={{
                  false: colors.neutral[300],
                  true: colors.primary[500],
                }}
                thumbColor={colors.background}
              />
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View style={styles.infoBox}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            You can change these preferences anytime in your settings
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neutral[300],
  },
  progressDotActive: {
    backgroundColor: colors.primary[600],
    width: 24,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.base,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.sm,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  optionCardActive: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioButtonActive: {
    borderColor: colors.primary[600],
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[600],
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.sm,
  },
  notificationsContainer: {
    gap: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  notificationDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.lineHeight.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info[50],
    borderWidth: 1,
    borderColor: colors.info[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info[800],
    lineHeight: typography.lineHeight.sm,
  },
  bottomContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background,
  },
  continueButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  continueButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
