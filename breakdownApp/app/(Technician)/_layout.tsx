import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: '#eff6ff', // Soft light blue background
          borderRadius: 20,
          marginHorizontal: 14,
          marginBottom: insets.bottom + 12,
          height: 60,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 10,
          borderTopWidth: 0,
          position: 'absolute', // allows overlay and rounded corners without clipping
          left: 10,
          right: 10,
          bottom: insets.bottom + 10,
        },
        tabBarLabelStyle: {
          fontSize: 8,
          marginBottom: 1,
        },
        tabBarIconStyle: {
          marginTop: 6,
        },
        tabBarActiveTintColor: '#22c55e', // green-500
        tabBarInactiveTintColor: '#a3a3a3',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="car-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: 'Job Details',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="checkbox-outline" color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="settings-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
