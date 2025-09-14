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
    //  phone: string
  }) => {
    try {
      setIsLoading(true);
      const { data: existingTech, error: techError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", values.email)
        .eq("role", "technician")
        .single();

      if (techError && techError.code !== "PGRST116") {
        setIsLoading(false);
        console.log("Technician Check Error:", techError);
        Alert.alert("Error", "Could not check the requested user.");
        return;
      }

      if (!existingTech) {
        Alert.alert(
          "Sign Up Error",
          "Technician email does not exist in the profiles: "
        );
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;
      if (!data.user) {
        Alert.alert("Login Failed", "Please check your details");
        return;
      }

      setIsLoading(false);
      console.log('User logged in:', data.user);
      router.push('/(Technician)');

    } catch (error) {
      setIsLoading(false);
      Alert.alert('Login failed', 'Please check your email and password');
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.container1, { backgroundColor: theme.background }]}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>Technician Login</ThemedText>
        <Formik
          validationSchema={loginValidationSchema}
          initialValues={{
            email: '',
            password: '',
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
                <Ionicons name="phone-landscape" size={25} style={[styles.icon, { color: theme.icon }]} />
                <TextInput
                  style={[styles.input, { color: theme.text, fontFamily: 'SpaceMono' }]}
                  placeholder="phone number"
                  placeholderTextColor={theme.icon}
                  keyboardType="phone-pad"
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                  value={values.phone}
                  autoCapitalize="none"
                />
              </View> */}
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
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <ThemedText style={styles.signUp}>
                  Sign in as<ThemedText style={styles.signUpLink}> : Driver</ThemedText>
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <ThemedText style={styles.signUp}>
                  Don't have an account? <ThemedText style={styles.signUpLink}>Sign Up</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>
    </KeyboardAvoidingView >
  );
}

const styles = StyleSheet.create({
  container1: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
    // paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logo: {
    height: 100,
    width: 100,
    resizeMode: 'contain',
    marginBottom: 20,
    borderRadius: 50
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
    fontFamily: 'SpaceMono',
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
