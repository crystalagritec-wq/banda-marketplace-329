import { Stack } from 'expo-router';

export default function ServiceOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="offerings" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="availability" />
    </Stack>
  );
}
