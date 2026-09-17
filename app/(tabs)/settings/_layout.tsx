import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="language" options={{ title: 'Language' }} />
      <Stack.Screen name="currency" options={{ title: 'Currency' }} />
    </Stack>
  );
}
