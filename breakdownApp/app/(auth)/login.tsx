import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import { Alert, Image, KeyboardAvoidingView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import * as yup from 'yup';
import { ThemedText } from '../../components/ThemedText';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { supabase } from '../utils/supabase';
const loginValidationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, ({ min }) => `Password must be at least ${min} characters`)
    .required('Password is required'),
});

export default function Login() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleLogin = async (values: {
    email: string;
    password: string;
    // phone: string
  }) => {
    try {
      setIsLoading(true);
      const { data: existingDriver, error: driverError } = await supabase
        .from("users")
        .select("*")
        .eq("email", values.email)
        .eq("role", "fc")
        .single();

      if (driverError && driverError.code !== "PGRST116") {
        console.log("Driver Check Error:", driverError);
        Alert.alert("Error", "Could not check Role.");
        setIsLoading(false);
        return;
      }
      // if (!existingDriver) {
      //   setIsLoading(false);
      //   Alert.alert("Login failed", "No driver profile found with this email.");
      //   return;
      // }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      if (!data.user) {
        Alert.alert('Login failed', 'Error checking for this requested driver.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      console.log('User logged in:', data.user);
      router.push('/(tabs)');

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login failed', 'Please check your email and password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={[styles.container1, { backgroundColor: theme.background }]}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>Driver Login</ThemedText>
        <Formik
          validationSchema={loginValidationSchema}
          initialValues={{
            email: '', password: '',
            //  phone: '' 
          }}
          onSubmit={handleLogin}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
          }) => (
            <>
              {/* <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#23272e' : '#f1f1f1' }]}>
                <Ionicons name="call-outline" size={25} style={[styles.icon, { color: theme.icon }]} />
                <TextInput
                  style={[styles.input, { color: theme.text, fontFamily: 'SpaceMono' }]}
                  placeholder="Phone Number"
                  placeholderTextColor={theme.icon}
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  autoCapitalize="none"
                />
              </View>
              {errors.phone && touched.phone && (
                <ThemedText style={[styles.errorText, { color: theme.tint }]}>{errors.phone}</ThemedText>
              )} */}
              <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#23272e' : '#f1f1f1' }]}>
                <Ionicons name="mail-outline" size={25} style={[styles.icon, { color: theme.icon }]} />
                <TextInput
                  style={[styles.input, { color: theme.text, fontFamily: 'SpaceMono' }]}
                  placeholder="Email"
                  placeholderTextColor={theme.icon}
                  keyboardType="email-address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  autoCapitalize="none"
                />
              </View>
              {errors.email && touched.email && (
                <ThemedText style={[styles.errorText, { color: theme.tint }]}>{errors.email}</ThemedText>
              )}
              <View style={[styles.inputContainer, { backgroundColor: colorScheme === 'dark' ? '#23272e' : '#f1f1f1' }]}>
                <Ionicons name="lock-closed-outline" size={25} style={[styles.icon, { color: theme.icon }]} />
                <TextInput
                  style={[styles.input, { color: theme.text, fontFamily: 'SpaceMono' }]}
                  placeholder="Password"
                  placeholderTextColor={theme.icon}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  value={values.password}
                  secureTextEntry={!showPassword}
                />
                <View>
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={25} style={[styles.icon, { color: theme.icon }]} />
                  </TouchableOpacity>
                </View>
              </View>
              {errors.password && touched.password && (
                <ThemedText style={[styles.errorText, { color: theme.tint }]}>{errors.password}</ThemedText>
              )}
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <ThemedText style={styles.forgotPassword}>Forgot Password?</ThemedText>
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[styles.button, !isValid && { backgroundColor: '#87CEFA' }]}
                  onPress={handleSubmit as any}
                  disabled={!isValid}
                >
                  <ThemedText style={styles.buttonText}>{isLoading ? 'Signing In...' : 'Login'}</ThemedText>
                </TouchableOpacity>
              </View>

              {/* <TouchableOpacity onPress={() => router.push("/(auth)/techsignin")}>
                <ThemedText style={styles.signUp}>
                  Sign in as<ThemedText style={styles.signUpLink}>: Technician </ThemedText>
                </ThemedText>
              </TouchableOpacity> */}

              <TouchableOpacity onPress={() => router.push("/(auth)/signup")} style={{ marginTop: 20 }}>
                <ThemedText style={styles.signUp}>
                  Don't have an account? <ThemedText style={styles.signUpLink}>Sign Up</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 50,
  },
  title: {
    fontSize: 32,
    marginBottom: 40,
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: 'SpaceMono',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'SpaceMono',
  },
  signUp: {
    fontFamily: 'SpaceMono',
  },
  signUpLink: {
    fontFamily: 'SpaceMono',
  },
  errorText: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    fontFamily: 'SpaceMono',
  },
});
