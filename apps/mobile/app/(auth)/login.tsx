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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, signInWithGoogle, signInWithApple } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { user, session } = await signIn(email.trim(), password);

      if (user && session) {
        // Navigation is handled by useAuth hook
        console.log('Login successful');
      }
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { data } = await signInWithGoogle();
      // OAuth flow will handle navigation
      console.log('Google login initiated', data);
    } catch (error: any) {
      Alert.alert(
        'Google Login Failed',
        error.message || 'Unable to sign in with Google. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const { data } = await signInWithApple();
      // OAuth flow will handle navigation
      console.log('Apple login initiated', data);
    } catch (error: any) {
      Alert.alert(
        'Apple Login Failed',
        error.message || 'Unable to sign in with Apple. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              Welcome Back
            </Typography>
            <Typography
              variant="body"
              color="secondary"
              style={styles.subtitle}
            >
              Sign in to continue your journey
            </Typography>
          </View>

          {/* Email/Password Form */}
          <View style={styles.form}>
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
              placeholder="Enter your password"
              autoComplete="password"
              textContentType="password"
              error={errors.password}
              editable={!isLoading}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPassword}
              disabled={isLoading}
            >
              <Typography variant="caption" style={styles.linkText}>
                Forgot password?
              </Typography>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Typography variant="caption" color="secondary" style={styles.dividerText}>
              or continue with
            </Typography>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <Button
              title="Continue with Google"
              onPress={handleGoogleLogin}
              variant="outline"
              fullWidth
              disabled={isLoading}
              style={styles.oauthButton}
            />

            <Button
              title="Continue with Apple"
              onPress={handleAppleLogin}
              variant="outline"
              fullWidth
              disabled={isLoading}
              style={styles.oauthButton}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Typography variant="body" color="secondary">
              Don't have an account?{' '}
            </Typography>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={isLoading}>
                <Typography variant="body" style={styles.linkText}>
                  Sign Up
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
    marginBottom: 40,
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
  form: {
    marginBottom: 32,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5EA',
  },
  dividerText: {
    marginHorizontal: 16,
  },
  oauthContainer: {
    gap: 12,
    marginBottom: 32,
  },
  oauthButton: {
    marginBottom: 0,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
});
