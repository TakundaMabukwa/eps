import { Stack } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{
        title: "Jobs",
        headerShown: false
      }} />
      <Stack.Screen name="inspect" options={{ title: "Home" }} />
      <Stack.Screen name="mainCheck" options={{ title: "Checklist" }} />
      <Stack.Screen name="proofScreen" options={{title: "Upload"}} />
    </Stack>
  );
}
