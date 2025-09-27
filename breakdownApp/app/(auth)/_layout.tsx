// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="forgot-password" options={{ presentation: 'modal' }} />
      <Stack.Screen name="otp" options={{ presentation: 'modal' }} />
      <Stack.Screen name="new-password" options={{ presentation: 'modal' }} />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
