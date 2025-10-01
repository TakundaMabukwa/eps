import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider, useTheme } from "./contexts/theme-context";
import { AuthProvider } from "./contexts/AuthContext";
import AuthDebugInfo from "@/components/AuthDebugInfo";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const { theme } = useTheme();
  const background = theme === "dark" ? "#121212" : "#f0f4f8";

  return (
    <>
      {/* <AuthDebugInfo /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade_from_bottom",
          contentStyle: {
            backgroundColor: background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
