import { useTheme } from "@/app/contexts/theme-context";
import { useAuth } from "@/app/contexts/AuthContext";
import React from "react";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { signOut, userData, user } = useAuth();

  const handleLogout = async () => {
    try {
      console.log("Initiating logout...");
      await signOut();
      console.log("Logout completed");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const email = user?.email || "";
  const username = userData?.email || "";

  // Colors based on theme
  const background = theme === "dark" ? "#121212" : "#f0f4f8";
  const cardBg = theme === "dark" ? "#525252ff" : "#fff";
  const textColor = theme === "dark" ? "#fff" : "#000";

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#f0f4f8" }}>
      <View>
        {/* Account Section */}
        <View
          style={{
            marginTop: 32,
            padding: 24,
            backgroundColor: cardBg,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              color: textColor,
            }}
          >
            Account
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8, color: textColor }}>
            Username: {username}
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8, color: textColor }}>
            Email: {email}
          </Text>
        </View>

        {/* Preferences Section */}
        <View
          style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: cardBg,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              color: textColor,
            }}
          >
            Preferences
          </Text>

          {/* Dark Mode Toggle NOT DONE AS YET*/}
          {/* <TouchableOpacity
            onPress={toggleTheme}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, color: textColor }}>Dark Mode</Text>
            <View
              style={{
                width: 40,
                height: 24,
                backgroundColor: theme === 'dark' ? '#4caf50' : '#ccc',
                borderRadius: 12,
                justifyContent: 'center',
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  alignSelf: theme === 'dark' ? 'flex-end' : 'flex-start',
                }}
              />
            </View>
          </TouchableOpacity> */}

          {/* Notifications (placeholder) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, flex: 1, color: textColor }}>
              Notifications
            </Text>
            <View
              style={{
                width: 40,
                height: 24,
                backgroundColor: "#4caf50",
                borderRadius: 12,
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: "#fff",
                  borderRadius: 10,
                  marginLeft: 18,
                }}
              />
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View
          style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: cardBg,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 16,
              color: textColor,
            }}
          >
            Support
          </Text>

          {/* Contact Us */}
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:brianv@soltrack.co.za?subject=Support Request"
              )
            }
          >
            <Text style={{ fontSize: 16, color: "#1976d2", marginBottom: 12 }}>
              Contact Us
            </Text>
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            onPress={() => Linking.openURL("https://popia.co.za")}
          >
            <Text style={{ fontSize: 16, color: "#1976d2" }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View>
          <TouchableOpacity onPress={handleLogout}>
            <Text
              style={{
                fontSize: 16,
                color: "#d32f2f",
                marginTop: 32,
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
