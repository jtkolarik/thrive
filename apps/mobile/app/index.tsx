import { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography } from '@/constants/theme';

/**
 * Root entry point for the app
 * Handles authentication state and initial routing
 * Redirects based on auth status and onboarding completion
 */
export default function Index() {
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (session && profile) {
        // User is authenticated, check onboarding status
        if (!profile.onboarding_completed) {
          // Onboarding not completed, redirect to onboarding
          router.replace('/onboarding/welcome');
        } else {
          // Onboarding completed, redirect to main app
          router.replace('/(tabs)');
        }
      } else if (session && !profile) {
        // Session exists but no profile yet (new user), redirect to onboarding
        router.replace('/onboarding/welcome');
      } else {
        // User is not authenticated, redirect to login
        router.replace('/(auth)/login');
      }
    }
  }, [session, profile, loading]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Fallback redirect (should not be reached due to useEffect)
  if (session && profile) {
    return profile.onboarding_completed ? (
      <Redirect href="/(tabs)" />
    ) : (
      <Redirect href="/onboarding/welcome" />
    );
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
});
