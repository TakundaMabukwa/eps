import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { View, Text } from 'react-native';
import { useEffect } from 'react';

export default function IndexPage() {
  const { isLoading, isAuthenticated, hasValidRole } = useAuth();

  useEffect(() => {
    console.log('📍 Index useEffect:', { 
      isLoading, 
      isAuthenticated, 
      hasValidRole: hasValidRole()
    });

    // Simple logic: if authenticated with valid role, go to tabs
    if (isAuthenticated && hasValidRole()) {
      console.log('📍 Index: User authenticated, going to tabs');
      router.replace('/(tabs)');
    } else if (!isLoading && !isAuthenticated) {
      // Only redirect to login if definitely not authenticated and not loading
      console.log('📍 Index: User not authenticated, going to login');
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, hasValidRole, isLoading]);

  // Show simple starting message
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Starting app...</Text>
    </View>
  );
}