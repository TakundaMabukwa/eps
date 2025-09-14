import { supabase } from '@/app/utils/supabase';
import { Link, router } from 'expo-router';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Screen = () => {
  const [showPassword, setShowPassword] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleNewPassword() {
    if (!newPassword || !confirmPassword) {
      return Alert.alert('Please fill in all fields', 'All fields are required');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Passwords do not match', 'Please make sure the passwords match');
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (error) {
      return Alert.alert('Error', error.message);
    }

    Alert.alert('Password changed', 'Your password has been changed successfully');

    router.replace('/login');
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Text allowFontScaling={false} style={styles.title}>
        Breakdown Brigade
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>Change Password</Text>
          <Text style={styles.formSubtitle}>Let's help you change your password.</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>New Password:</Text>
              <TextInput
                placeholder="••••••••••••••"
                placeholderTextColor="gray"
                autoComplete="password-new"
                style={styles.textInput}
                secureTextEntry={showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            {showPassword ? (
              <EyeIcon size={20} color="gray" onPress={() => setShowPassword(false)} />
            ) : (
              <EyeOffIcon size={20} color="gray" onPress={() => setShowPassword(true)} />
            )}
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirm Password:</Text>
              <TextInput
                placeholder="••••••••••••••"
                placeholderTextColor="gray"
                autoComplete="password-new"
                style={styles.textInput}
                secureTextEntry={showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleNewPassword}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Change Password</Text>
          </TouchableOpacity>

          <Link href="/login" style={styles.loginLink}>
            Already have an account? Sign in
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: '#0848c6ff',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    marginTop: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#4b5563',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    padding: 40,
    backgroundColor: 'white',
  },
  formTitle: {
    fontWeight: '700',
    color: '#31466a',
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  formSubtitle: {
    marginTop: 16,
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
  inputGroup: {
    paddingHorizontal: 40,
    gap: 24, // Note: gap unsupported in RN, can replace with marginBetween or View spacing if needed
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 20,
    paddingVertical: 4,
  },
  submitButton: {
    backgroundColor: '#31466a',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  loginLink: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#31466a',
  },
});

export default Screen;
