import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../app/contexts/AuthContext';
import { usePathname, useRouter } from 'expo-router';

export default function AuthDebugInfo() {
  const { isLoading, isAuthenticated, session, user, userData, hasValidRole } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleManualNavigation = () => {
    console.log('🚀 Manual navigation button pressed');
    try {
      router.replace('/(tabs)');
      console.log('🚀 Manual navigation to /(tabs) completed');
    } catch (error) {
      console.error('🚀 Manual navigation failed:', error);
    }
  };

  if (!__DEV__) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Auth Debug Info</Text>
      <Text style={styles.item}>Loading: {String(isLoading)}</Text>
      <Text style={styles.item}>Authenticated: {String(isAuthenticated)}</Text>
      <Text style={styles.item}>Has Valid Role: {String(hasValidRole())}</Text>
      <Text style={styles.item}>User ID: {user?.id || 'null'}</Text>
      <Text style={styles.item}>User Email: {user?.email || 'null'}</Text>
      <Text style={styles.item}>User Role: {userData?.role || 'null'}</Text>
      <Text style={styles.item}>Current Path: {pathname}</Text>
      <Text style={styles.item}>Session: {session ? 'exists' : 'null'}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleManualNavigation}>
        <Text style={styles.buttonText}>🚀 Force Navigate to /(tabs)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  item: {
    color: 'white',
    fontSize: 12,
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});