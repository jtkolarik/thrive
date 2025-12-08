import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Typography } from '@/components/ui';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { resetPassword } = useAuth();

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email';
    }
    return null;
  };

  const handleResetPassword = async () => {
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      await resetPassword(email.trim());
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert(
        'Reset Failed',
        error.message || 'Unable to send reset email. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (emailSent) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Typography variant="h1">✉️</Typography>
          </View>

          <Typography variant="h2" style={styles.successTitle}>
            Check Your Email
          </Typography>

          <Typography variant="body" color="secondary" style={styles.successMessage}>
            We've sent password reset instructions to
          </Typography>

          <Typography variant="body" style={styles.email}>
            {email}
          </Typography>

          <Typography variant="caption" color="secondary" style={styles.instructions}>
            Please check your inbox and follow the link to reset your password. The
            link will expire in 24 hours.
          </Typography>

          <Button
            title="Back to Login"
            onPress={handleBackToLogin}
            fullWidth
            style={styles.backButton}
          />

          <TouchableOpacity onPress={() => setEmailSent(false)} style={styles.resendLink}>
            <Typography variant="caption" color="primary">
              Didn't receive the email? Try again
            </Typography>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={styles.backButtonTop}
            disabled={isLoading}
          >
            <Typography variant="body" color="primary">
              ← Back
            </Typography>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h1">Forgot Password?</Typography>
            <Typography variant="body" color="secondary" style={styles.subtitle}>
              No worries! Enter your email address and we'll send you instructions to
              reset your password.
            </Typography>
          </View>

          {/* Email Form */}
          <View style={styles.form}>
            <Input
              label="Email Address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(undefined);
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={error}
              editable={!isLoading}
              autoFocus
            />

            <Button
              title="Send Reset Link"
              onPress={handleResetPassword}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
            />
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Typography variant="caption" color="secondary" style={styles.helpText}>
              Remember your password?{' '}
            </Typography>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Typography variant="caption" color="primary">
                  Sign In
                </Typography>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButtonTop: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 40,
  },
  subtitle: {
    marginTop: 12,
    lineHeight: 24,
  },
  form: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
  helpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  helpText: {
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    textAlign: 'center',
    marginBottom: 16,
  },
  instructions: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 16,
  },
  resendLink: {
    paddingVertical: 8,
  },
});
