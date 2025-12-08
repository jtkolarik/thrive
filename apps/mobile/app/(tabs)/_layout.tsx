import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

// Placeholder icon components - replace with actual icon library (e.g., @expo/vector-icons)
function HomeIcon({ color, size }: { color: string; size: number }) {
  return null; // Replace with actual icon
}

function ChatIcon({ color, size }: { color: string; size: number }) {
  return null; // Replace with actual icon
}

function MemoriesIcon({ color, size }: { color: string; size: number }) {
  return null; // Replace with actual icon
}

function ProfileIcon({ color, size }: { color: string; size: number }) {
  return null; // Replace with actual icon
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <ChatIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: 'Memories',
          tabBarIcon: ({ color, size }) => (
            <MemoriesIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
