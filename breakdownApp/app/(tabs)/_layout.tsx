import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/theme-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  // Define colors based on theme
  const backgroundColor = theme === 'dark' ? '#292929ff' : '#f0fdf4';
  const activeTintColor = theme === 'dark' ? '#4caf50' : '#22c55e'; // green shades
  const inactiveTintColor = theme === 'dark' ? '#f0fdf4' : '#a3a3a3';
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#22c55e', // green-500
        tabBarInactiveTintColor: '#a3a3a3',
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
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inspection"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="checkbox-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="car-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="settings-sharp" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
