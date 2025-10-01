import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";
import LocationScreen from "../hooks/locationHock";
import { supabase } from "../utils/supabase";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const theme = Colors[colorScheme];
  const [inspection, setInspection] = React.useState<any | null>(null); // single object or null
  const [inspectionDone, setInspectionDone] = useState<boolean | null>(null); // null while loading
  const { user } = useAuth(); // Use AuthContext instead

  const fetchData = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      await supabase.auth.signOut();
      router.replace("/login");
      return;
    }
  };
  // navigation helper functions
  useEffect(() => {
    fetchData();
    const checkInspection = async () => {
      try {
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError || !userData?.user) {
          Alert.alert("Error", "User not authenticated");
          setInspectionDone(false);
          return;
        }
        const userId = userData.user.id;

        const { data: driverData, error: driverError } = await supabase
          .from("drivers")
          .select("id")
          .eq("user_id", userId)
          .single();
        if (driverError || !driverData) {
          // Alert.alert('Error', "Can't find driver linked to user");
          setInspectionDone(false);
          return;
        }
        const driverId = driverData.id;

        const { data: inspectionData, error: inspectionError } = await supabase
          .from("vehicle_inspections")
          .select("*")
          .eq("driver_id", driverId)
          .order("inspection_date", { ascending: false })
          .limit(1)
          .single();

        console.log("Inspection data:", inspectionData);

        setInspectionDone(!!inspectionData);
      } catch (error) {
        Alert.alert(
          "Unexpected Error",
          (error as { message?: string }).message || "Unknown error"
        );
        setInspectionDone(false);
      }
    };

    checkInspection();
  }, []);

  const emergency = () => {
    const inspectionDate = inspection?.updated_at
      ? new Date(inspection.updated_at).toISOString().slice(0, 10)
      : "";
    const createdDate = inspection?.created_at
      ? new Date(inspection.created_at).toISOString().slice(0, 10)
      : "";
    const todayDate = new Date().toISOString().slice(0, 10);

    if (createdDate === todayDate || inspectionDate === todayDate) {
      console.log("Inspection created today, allowing access");
      router.push("/(tabs)/emergency");
    } else {
      console.log(
        "Inspection not created today, redirecting to inspection" +
          todayDate +
          " " +
          inspectionDate +
          " " +
          createdDate
      );
      router.push("/(tabs)/inspection");
    }

    if (
      inspection.inspected === false ||
      inspection === undefined ||
      inspectionDate !== todayDate
    ) {
      router.push("/(tabs)/inspection");
    } else {
      router.push("/(tabs)/emergency");
    }
  };

  const capture = () => {
    if (!inspection || inspection.inspected === false) {
      router.push("/(tabs)/inspection");
    } else {
      router.push("/(tabs)/emergency");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.background, borderBottomColor: theme.icon },
        ]}
      >
        <ThemedText type="title" style={styles.title}>
          Breakdown Logictics
        </ThemedText>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/settings")}
        >
          <Ionicons name="settings-outline" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent]}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Section */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.background, shadowColor: theme.icon },
          ]}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colorScheme === "dark" ? "#23272e" : "#f1f4f0",
              },
            ]}
          >
            <ThemedText style={{ fontSize: 26 }}>📍</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Your Location
            </ThemedText>
            <LocationScreen />
          </View>
        </View>

        {/* Welcome Banner */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />
          <ThemedText type="title" style={styles.bannerText}>
            Stay Safe on the Road
          </ThemedText>
        </View>

        {/* Emergency Section */}
        {}
        <TouchableOpacity
          style={[
            styles.sectionCard,
            { backgroundColor: theme.background, shadowColor: theme.icon },
          ]}
          // onPress={emergency}
          onPress={() => router.push("/(tabs)/emergency")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colorScheme === "dark" ? "#23272e" : "#f1f4f0",
              },
            ]}
          >
            <ThemedText style={{ fontSize: 28 }}>🚨</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Emergency Assistance
            </ThemedText>
            <ThemedText style={styles.sectionDesc}>
              Get instant help in case of accidents or emergencies.
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.icon} />
        </TouchableOpacity>

        {/* Vehicle Inspection Section */}
        <TouchableOpacity
          style={[
            styles.sectionCard,
            { backgroundColor: theme.background, shadowColor: theme.icon },
          ]}
          onPress={() => router.push("/(tabs)/inspection")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colorScheme === "dark" ? "#23272e" : "#f1f4f0",
              },
            ]}
          >
            <ThemedText style={{ fontSize: 26 }}>🛠️</ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Vehicle Inspections
            </ThemedText>
            <ThemedText style={styles.sectionDesc}>
              Do a professional inspection for your vehicle.
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.icon} />
        </TouchableOpacity>

        {/* Capture Damage Section */}
        <TouchableOpacity
          style={[
            styles.sectionCard,
            { backgroundColor: theme.background, shadowColor: theme.icon },
          ]}
          onPress={() => router.push("/(tabs)/emergency/status")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: colorScheme === "dark" ? "#23272e" : "#f1f4f0",
              },
            ]}
          >
            <Ionicons name="infinite-sharp" size={26} color={theme.text} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              View Breakdown Status
            </ThemedText>
            <ThemedText style={styles.sectionDesc}>
              Check what is the progress on your logged issue.
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={22} color={theme.icon} />
        </TouchableOpacity>

        {/* Tips Section */}
        <View
          style={[
            styles.tipsCard,
            { backgroundColor: colorScheme === "dark" ? "#23272e" : "#eaf5e6" },
          ]}
        >
          <ThemedText type="subtitle" style={styles.tipsTitle}>
            Safety Tips
          </ThemedText>
          <ThemedText style={styles.tipsText}>
            • Always wear your seatbelt
          </ThemedText>
          <ThemedText style={styles.tipsText}>
            • Keep emergency contacts updated
          </ThemedText>
          <ThemedText style={styles.tipsText}>
            • Regularly inspect your vehicle
          </ThemedText>
          <ThemedText style={styles.tipsText}>
            • Don’t use your phone while driving
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 38,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    elevation: 2,
    zIndex: 2,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 25,
    letterSpacing: 1,
    fontFamily: "SpaceMono",
  },
  settingsButton: {
    width: 36,
    alignItems: "flex-end",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
    gap: 18,
  },
  banner: {
    position: "relative",
    height: 140,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(19,24,17,0.35)",
  },
  bannerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    zIndex: 1,
    textAlign: "center",
    letterSpacing: 0.5,
    fontFamily: "SpaceMono",
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 16,
    marginBottom: 2,
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 2,
    fontFamily: "SpaceMono",
  },
  sectionDesc: {
    fontSize: 14,
    fontFamily: "SpaceMono",
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    fontFamily: "SpaceMono",
  },
  tipsText: {
    fontSize: 14,
    marginBottom: 2,
    fontFamily: "SpaceMono",
  },
});
