import { Stack } from 'expo-router';

export default function FarmOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="profile" />
      <Stack.Screen name="crops" />
      <Stack.Screen name="workers" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
