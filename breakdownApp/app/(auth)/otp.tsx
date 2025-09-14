import { supabase } from '@/app/utils/supabase';
import { Link, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Screen = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { email } = useLocalSearchParams();
  const [countDown, setCountDown] = useState(90);

  useEffect(() => {
    if (countDown <= 0) return;

    const interval = setInterval(() => {
      setCountDown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [countDown]);

  async function submit() {
    if (!otp) {
      return Alert.alert('Please fill in all fields', 'OTP is required');
    }

    if (!email || typeof email !== 'string') {
      Alert.alert('Please provide an email address');
      return router.replace('/forgot-password');
    }

    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    setLoading(false);
    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'OTP verified successfully');
    router.push('/(auth)/new-password');
  }

  async function resendOTP() {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email as string);
    setLoading(false);

    if (error) {
      return Alert.alert('Error', error.message);
    }

    Alert.alert('Success', `OTP has been sent to your email address ${email}`);

    setCountDown(90);
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Image source={require('../../assets/images/Logo.jpeg')} style={styles.logo} />
      <Text allowFontScaling={false} style={styles.title}>
        Breakdown Brigade
      </Text>

      <View style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Text style={styles.formTitle}>One-Time Pin</Text>
          <Text style={styles.formSubtitle}>Enter the OTP sent to your email address.</Text>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>One-Time Pin:</Text>
            <TextInput
              placeholder="• • • • • •"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              style={styles.otpInput}
              clearTextOnFocus
              textAlign="center"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={submit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>Submit OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={countDown > 0}
            onPress={resendOTP}
            style={[styles.resendButton, countDown > 0 && styles.disabledOpacity]}
          >
            <Text>
              {countDown > 0 ? `Resend OTP in ${countDown} seconds` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          <Link href="/signup" style={styles.signupLink}>
            Don't have an account? Sign up
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
    justifyContent: 'center',
    backgroundColor: '#0a5fe8ff',
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  formContainer: {
    marginTop: 40,
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#4b5563', // gray-600 shadow color
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    padding: 40,
  },
  formTitle: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    textTransform: 'capitalize',
    color: 'black',
  },
  formSubtitle: {
    marginTop: 16,
    textAlign: 'center',
    color: 'gray',
    fontSize: 16,
  },
  inputGroup: {
    gap: 24,
    paddingHorizontal: 40,
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputLabel: {
    color: '#4b5563', // gray-600
    fontSize: 12,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 12,
    paddingTop: 4,
    paddingBottom: 4,
  },
  submitButton: {
    backgroundColor: '#31466a',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 18,
  },
  resendButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  disabledOpacity: {
    opacity: 0.3,
  },
  signupLink: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    color: '#31466a',
  },
});

export default Screen;
