import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function AuthLayout() {
  const { session } = useAuth();

  // Redirect authenticated users away from auth screens
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: 'Register',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: 'Forgot Password',
        }}
      />
    </Stack>
  );
}
