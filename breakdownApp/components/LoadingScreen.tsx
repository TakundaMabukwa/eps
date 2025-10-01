import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../app/contexts/theme-context';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  const { theme } = useTheme();
  const backgroundColor = theme === "dark" ? "#121212" : "#f0f4f8";
  const textColor = theme === "dark" ? "#fff" : "#000";

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color="#22c55e" />
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'SpaceMono',
  },
});