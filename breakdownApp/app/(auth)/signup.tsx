import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { Formik } from "formik";
import React from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";
import { ThemedText } from "../../components/ThemedText";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import { supabase } from "../utils/supabase";

const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  phone: Yup.string().required("Required"),
  password: Yup.string().min(1, "Too Short!").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Required"),
  role: Yup.string()
    .oneOf(["driver", "technician"], "Select a role")
    .required("Required"),
});

export default function Signup() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignUp = async (values: {
    email: string;
    password: string;
    phone: string;
    role: string;
  }) => {
    try {
      setIsLoading(true);

      if (values.role === "driver") {
        // 1. Check if driver exists
        const { data: existingDriver, error: driverError } = await supabase
          .from("drivers")
          .select("*")
          .eq("email_address", values.email)
          .single();

        if (driverError && driverError.code !== "PGRST116") {
          console.log("Driver Check Error:", driverError);
          Alert.alert(
            "Error",
            "Could not check driver. " + driverError.message
          );
          setIsLoading(false);
          return;
        }

        // 2. Sign up user in Supabase Auth
        const { data: driverData, error: signUpError } =
          await supabase.auth.signUp({
            email: values.email,
            password: values.password,
            options: {
              data: {
                phone: values.phone,
                role: "driver",
              },
            },
          });

        if (signUpError) {
          console.log("Sign Up Error:", signUpError);
          Alert.alert("Sign Up Error", signUpError.message);
          setIsLoading(false);
          return;
        }

        const user_id = driverData.user?.id;
        if (!user_id) {
          Alert.alert("Sign Up Error", "User ID not found after sign up.");
          setIsLoading(false);
          return;
        }

        // 3. If driver exists, update record to link with new auth user
        if (existingDriver) {
          const { data: updateDriver, error: updateError } = await supabase
            .from("drivers")
            .update({
              user_id: user_id,
            })
            .eq("email_address", values.email)
            .select();

          if (updateError) {
            console.error("Driver update error:", updateError);
          } else {
            console.log("Driver updated:", updateDriver);
          }
        }

        // 4. Upsert profile into users table
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .upsert({
            id: user_id,
            role: "driver",
            email: existingDriver?.email_address ?? values.email,
          })
          .select();

        if (profileError) {
          console.error("Error creating driver profile:", profileError);
          Alert.alert("Profile Error", profileError.message);
          setIsLoading(false);
          return;
        }

        console.log("User signed up and profile created:", profile);

        // 5. Redirect
        router.push("/(auth)/login");
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      Alert.alert("Sign Up failed", "Please check your details and try again");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior="padding"
      keyboardVerticalOffset={100}
      contentContainerStyle={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ marginBottom: 24, alignItems: "center" }}>
          {/* <View
                        style={{
                            backgroundColor: '#4caf50',
                            borderRadius: 50,
                            width: 64,
                            height: 64,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 8,
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 32 }}>✓</Text>
                    </View> */}
          <Image
            source={require("../../assets/images/icon.png")}
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: 8,
            }}
            resizeMode="cover"
          />
          <ThemedText
            type="title"
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: theme.tint,
              fontFamily: "SpaceMono",
            }}
          >
            Create Account
          </ThemedText>
          <ThemedText
            style={{ color: theme.icon, marginTop: 4, fontFamily: "SpaceMono" }}
          >
            Sign up to get started!
          </ThemedText>
        </View>

        <Formik
          initialValues={{
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            role: "",
          }}
          validationSchema={SignupSchema}
          onSubmit={handleSignUp}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => (
            <View>
              {/* Email */}
              <ThemedText
                style={{
                  color: theme.tint,
                  marginBottom: 4,
                  fontFamily: "SpaceMono",
                }}
              >
                Email
              </ThemedText>
              <TextInput
                placeholder="Enter your email"
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    touched.email && errors.email ? theme.tint : theme.icon,
                  padding: 12,
                  marginBottom: 8,
                  color: theme.text,
                  fontFamily: "SpaceMono",
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                placeholderTextColor={theme.icon}
              />
              {touched.email && errors.email && (
                <ThemedText
                  style={{
                    color: theme.tint,
                    marginBottom: 8,
                    fontFamily: "SpaceMono",
                  }}
                >
                  {errors.email}
                </ThemedText>
              )}

              {/* Phone */}
              <ThemedText
                style={{
                  color: theme.tint,
                  marginBottom: 4,
                  fontFamily: "SpaceMono",
                }}
              >
                Phone Number
              </ThemedText>
              <TextInput
                placeholder="Enter your phone number"
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    touched.phone && errors.phone ? theme.tint : theme.icon,
                  padding: 12,
                  marginBottom: 8,
                  color: theme.text,
                  fontFamily: "SpaceMono",
                }}
                keyboardType="phone-pad"
                autoCapitalize="none"
                onChangeText={handleChange("phone")}
                onBlur={handleBlur("phone")}
                value={values.phone}
                placeholderTextColor={theme.icon}
              />
              {touched.phone && errors.phone && (
                <ThemedText
                  style={{
                    color: theme.tint,
                    marginBottom: 8,
                    fontFamily: "SpaceMono",
                  }}
                >
                  {errors.phone}
                </ThemedText>
              )}

              {/* Role */}
              <ThemedText
                style={{
                  color: theme.tint,
                  marginBottom: 4,
                  fontFamily: "SpaceMono",
                }}
              >
                Role
              </ThemedText>
              <View
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    touched.role && errors.role ? theme.tint : theme.icon,
                  marginBottom: 8,
                }}
              >
                <Picker
                  selectedValue={values.role}
                  onValueChange={(itemValue: string) =>
                    setFieldValue("role", itemValue)
                  }
                  mode="dropdown"
                  style={{ color: "white", fontFamily: "SpaceMono" }}
                >
                  <Picker.Item label="Select role..." value="" />
                  <Picker.Item label="Driver" value="driver" />
                  {/* <Picker.Item label="Technician" value="technician" /> */}
                </Picker>
              </View>
              {touched.role && errors.role && (
                <ThemedText
                  style={{
                    color: theme.tint,
                    marginBottom: 8,
                    fontFamily: "SpaceMono",
                  }}
                >
                  {errors.role}
                </ThemedText>
              )}

              {/* Password */}
              <ThemedText
                style={{
                  color: theme.tint,
                  marginBottom: 4,
                  fontFamily: "SpaceMono",
                }}
              >
                Password
              </ThemedText>
              <TextInput
                placeholder="Enter your password"
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    touched.password && errors.password
                      ? theme.tint
                      : theme.icon,
                  padding: 12,
                  marginBottom: 8,
                  color: theme.text,
                  fontFamily: "SpaceMono",
                }}
                secureTextEntry
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
                value={values.password}
                placeholderTextColor={theme.icon}
              />
              {touched.password && errors.password && (
                <ThemedText
                  style={{
                    color: theme.tint,
                    marginBottom: 8,
                    fontFamily: "SpaceMono",
                  }}
                >
                  {errors.password}
                </ThemedText>
              )}

              {/* Confirm Password */}
              <ThemedText
                style={{
                  color: theme.tint,
                  marginBottom: 4,
                  fontFamily: "SpaceMono",
                }}
              >
                Confirm Password
              </ThemedText>
              <TextInput
                placeholder="Confirm your password"
                style={{
                  backgroundColor: theme.background,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor:
                    touched.confirmPassword && errors.confirmPassword
                      ? theme.tint
                      : theme.icon,
                  padding: 12,
                  marginBottom: 12,
                  color: theme.text,
                  fontFamily: "SpaceMono",
                }}
                secureTextEntry
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
                value={values.confirmPassword}
                placeholderTextColor={theme.icon}
              />
              {touched.confirmPassword && errors.confirmPassword && (
                <ThemedText
                  style={{
                    color: theme.tint,
                    marginBottom: 8,
                    fontFamily: "SpaceMono",
                  }}
                >
                  {errors.confirmPassword}
                </ThemedText>
              )}

              {/* Submit Button */}
              <View>
                <TouchableOpacity
                  onPress={handleSubmit as any}
                  style={{
                    backgroundColor: theme.tint,
                    borderRadius: 8,
                    padding: 16,
                    alignItems: "center",
                    marginTop: 12,
                    width: "100%",
                  }}
                >
                  <ThemedText
                    style={{
                      color: theme.background,
                      fontWeight: "bold",
                      fontSize: 16,
                      fontFamily: "SpaceMono",
                    }}
                  >
                    Sign Up
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(auth)/login")}
                style={{ marginTop: 16, alignItems: "center" }}
              >
                <ThemedText
                  style={{ color: theme.tint, fontFamily: "SpaceMono" }}
                >
                  Already have an account? Login
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
