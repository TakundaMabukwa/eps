import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import { router, SplashScreen, Stack, usePathname, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from './contexts/theme-context';
import { supabase } from './utils/supabase';

async function checkAuth(session: Session | null, currentPath: string) {
  const resetPaths = ['/reset-password', '/new-password', '/otp', '/forgot-password'];

  if (!session) {
    console.log('no session');
    if (!resetPaths.includes(currentPath) && currentPath !== '/login') {
      router.replace('/login');
    }
    return;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.log('user fetch error or missing user', error?.message);
    if (!resetPaths.includes(currentPath) && currentPath !== '/login') {
      router.replace('/login');
    }
    return;
  }
  const {data} = await supabase.from('users').select('role').eq('id', user.id).single();
  if (data?.role && data.role) {
    console.log(`session role from ${data.role}`);
  }

  if (!resetPaths.includes(currentPath) && currentPath !== '/login') {
    let targetRoute = '/login';

    if (data?.role === 'driver') targetRoute = '/(tabs)';
    else if (data?.role === 'technician') targetRoute = '/(Technician)';

    if (currentPath !== targetRoute) {
      router.replace(targetRoute as Href);
    }
  }
}

export default function RootLayout() {
  const { theme } = useTheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const pathname = usePathname();
  const latestPathname = useRef(pathname);

  useEffect(() => {
    latestPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    async function initialCheck() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) await checkAuth(session, latestPathname.current);
    }

    initialCheck();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        await checkAuth(session, latestPathname.current);
      }
    });

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const background = theme === 'dark' ? '#121212' : '#f0f4f8';

  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: {
            backgroundColor: background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


// import { Session } from '@supabase/supabase-js';
// import { useFonts } from 'expo-font';
// import { router, SplashScreen, Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import 'react-native-reanimated';
// import { ThemeProvider, useTheme } from './contexts/theme-context';
// import { supabase } from './utils/supabase';

// async function checkAuth(session: Session | null) {
//   if (!session) {
//     console.log("no session");
//     router.replace("/login");
//     return;
//   }

//   // Always refresh the user to avoid stale metadata
//   const { data: { user }, error } = await supabase.auth.getUser();

//   if (error || !user) {
//     console.log("user fetch error or missing user", error?.message);
//     router.replace("/login");
//     return;
//   }

//   const role = user.user_metadata?.role;
//   console.log(`session ${user.email} role: ${role}`);

//   if (role === "driver") {
//     router.replace("/(tabs)");
//   } else if (role === "technician") {
//     router.replace("/(Technician)");
//   } else {
//     router.replace("/login");
//   }
// }

// export default function RootLayout() {
//   const { theme } = useTheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     let mounted = true;

//     // Get session on first load
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (mounted) checkAuth(session);
//     });

//     // Subscribe to auth state changes
//     const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (mounted) checkAuth(session);
//     });

//     // Cleanup subscription on unmount
//     return () => {
//       mounted = false;
//       subscription?.subscription.unsubscribe();
//     };
//   }, []);

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   // Colors based on theme
//   const background = theme === 'dark' ? '#121212' : '#f0f4f8';

//   return (
//     <ThemeProvider>
//       <Stack
//         screenOptions={{
//           headerShown: false,
//           animation: 'fade_from_bottom',
//           contentStyle: {
//             backgroundColor: background,
//           },
//         }}
//       >
//         <Stack.Screen name="(auth)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }
