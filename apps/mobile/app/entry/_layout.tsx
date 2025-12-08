import { Stack } from 'expo-router';
import { colors } from '../../constants/theme';

export default function EntryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          title: 'New Entry',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Entry',
        }}
      />
    </Stack>
  );
}
