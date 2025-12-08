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
import { Button, Input, PasswordInput, Typography } from '@/components/ui';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();

  const validatePassword = (pwd: string) => {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push('at least 8 characters');
    if (!/[A-Z]/.test(pwd)) errors.push('one uppercase letter');
    if (!/[a-z]/.test(pwd)) errors.push('one lowercase letter');
    if (!/[0-9]/.test(pwd)) errors.push('one number');
    return errors;
  };

  const getPasswordStrength = (pwd: string) => {
    const validationErrors = validatePassword(pwd);
    if (validationErrors.length === 0) return 'strong';
    if (validationErrors.length <= 2) return 'medium';
    return 'weak';
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Please enter your full name';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    const passwordErrors = validatePassword(password);
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (passwordErrors.length > 0) {
      newErrors.password = `Password must have ${passwordErrors.join(', ')}`;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms of service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      if (errors.terms) {
        Alert.alert('Terms Required', errors.terms, [{ text: 'OK' }]);
      }
      return;
    }

    setIsLoading(true);
    try {
      const { user, session } = await signUp(email.trim(), password, fullName.trim());

      if (user) {
        Alert.alert(
          'Registration Successful',
          'Welcome to Thrive! Please check your email to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to onboarding if session exists, otherwise to login
                if (session) {
                  router.replace('/(tabs)');
                } else {
                  router.replace('/(auth)/login');
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Registration Failed',
        error.message || 'Unable to create account. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;
  const passwordRequirements = password ? validatePassword(password) : [];

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
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h1" style={styles.title}>
              Create Account
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              Join Thrive and start your wellness journey
            </Typography>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (errors.fullName) setErrors({ ...errors, fullName: undefined });
              }}
              placeholder="John Doe"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              error={errors.fullName}
              editable={!isLoading}
            />

            <Input
              label="Email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              error={errors.email}
              editable={!isLoading}
            />

            <PasswordInput
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="Create a strong password"
              autoComplete="password-new"
              textContentType="newPassword"
              error={errors.password}
              editable={!isLoading}
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthBars}>
                  <View
                    style={[
                      styles.strengthBar,
                      passwordStrength === 'weak' && styles.strengthBarWeak,
                      passwordStrength === 'medium' && styles.strengthBarMedium,
                      passwordStrength === 'strong' && styles.strengthBarStrong,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      passwordStrength === 'medium' && styles.strengthBarMedium,
                      passwordStrength === 'strong' && styles.strengthBarStrong,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      passwordStrength === 'strong' && styles.strengthBarStrong,
                    ]}
                  />
                </View>
                {passwordRequirements.length > 0 && (
                  <Typography variant="caption" color="secondary" style={styles.requirements}>
                    Missing: {passwordRequirements.join(', ')}
                  </Typography>
                )}
              </View>
            )}

            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              placeholder="Re-enter your password"
              autoComplete="password-new"
              textContentType="newPassword"
              error={errors.confirmPassword}
              editable={!isLoading}
            />

            {/* Terms of Service */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                  errors.terms && styles.checkboxError,
                ]}
              >
                {acceptedTerms && (
                  <Typography variant="caption" style={styles.checkmark}>
                    ✓
                  </Typography>
                )}
              </View>
              <View style={styles.termsText}>
                <Typography variant="caption" color="primary">
                  I agree to the{' '}
                  <Typography variant="caption" style={styles.linkText}>
                    Terms of Service
                  </Typography>{' '}
                  and{' '}
                  <Typography variant="caption" style={styles.linkText}>
                    Privacy Policy
                  </Typography>
                </Typography>
              </View>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.footer}>
            <Typography variant="body" color="secondary">
              Already have an account?{' '}
            </Typography>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Typography variant="body" style={styles.linkText}>
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
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    textAlign: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  form: {
    marginBottom: 24,
  },
  passwordStrength: {
    marginTop: -8,
    marginBottom: 16,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
  },
  strengthBarWeak: {
    backgroundColor: '#FF3B30',
  },
  strengthBarMedium: {
    backgroundColor: '#FF9500',
  },
  strengthBarStrong: {
    backgroundColor: '#34C759',
  },
  requirements: {
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxError: {
    borderColor: '#FF3B30',
  },
  termsText: {
    flex: 1,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 16,
  },
});
