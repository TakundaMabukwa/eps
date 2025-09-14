// import { Session } from '@supabase/supabase-js';
// import { useFonts } from 'expo-font';
// import { router, SplashScreen, Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useEffect } from 'react';
// import 'react-native-reanimated';
// import { ThemeProvider, useTheme } from './contexts/theme-context';
// import { supabase } from './utils/supabase';
// function checkAuth(session: Session | null) {
//   if (!session) {
//     router.replace("/login");
//     console.log("no session");
//   } else {
//     if (session.user.email && session.user.user_metadata.role === 'driver') {
//       router.replace("/(tabs)");
//       console.log("session" + session.user.email);
//     } else if (session.user.email && session.user.user_metadata.role === 'technician') {
//       router.replace("/(Technician)");
//       console.log("session" + session.user.email);
//     } else if (session.user.email === undefined) {
//       router.replace("/login");
//     }
//     console.log("session" + session.user.email, " role: " + session.user.user_metadata.role);
//   }
// }
// export default function RootLayout() {
//   const { theme, toggleTheme } = useTheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     supabase.auth
//       .getSession()
//       .then(
//         ({
//           data: { session },
//         }) => {
//           checkAuth(session);
//         }
//       );

//     supabase.auth.onAuthStateChange((_event, session) => {
//       checkAuth(session);
//     });
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
//   const cardBg = theme === 'dark' ? '#1e1e1e' : '#fff';  
//   const textColor = theme === 'dark' ? '#fff' : '#000';

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