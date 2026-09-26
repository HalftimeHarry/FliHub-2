import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { MobileShell } from '@/components/mobile-shell';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <MobileShell>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </MobileShell>
    </>
  );
}
