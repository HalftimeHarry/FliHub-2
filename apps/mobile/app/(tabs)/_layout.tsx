import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopWidth: 0,
          height: 74,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#60a5fa',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            home: 'home',
            leagues: 'trophy',
            draft: 'clipboard',
            standings: 'podium',
          };

          return <Ionicons name={icons[route.name] ?? 'home'} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="leagues" options={{ title: 'Leagues' }} />
      <Tabs.Screen name="draft" options={{ title: 'Draft' }} />
      <Tabs.Screen name="standings" options={{ title: 'Standings' }} />
    </Tabs>
  );
}
