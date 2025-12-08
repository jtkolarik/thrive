import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const steps = 4;

  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.progressDot,
            index <= currentStep && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: false,
        headerTitle: '',
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          headerShown: true,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="add-child"
        options={{
          headerShown: true,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="preferences"
        options={{
          headerShown: true,
          headerLeft: () => null,
        }}
      />
      <Stack.Screen
        name="first-entry"
        options={{
          headerShown: true,
          headerLeft: () => null,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
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
});
