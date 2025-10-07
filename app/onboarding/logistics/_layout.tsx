import { Stack } from 'expo-router';

export default function LogisticsOnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="role" />
      <Stack.Screen name="owner" />
      <Stack.Screen name="driver" />
      <Stack.Screen name="delivery" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}
