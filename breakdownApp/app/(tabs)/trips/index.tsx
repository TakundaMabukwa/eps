// See all the allocated trips here and navigate to the trip details
// From here we should be able to update the trip status
// e.g. when the trip is started, completed, or cancelled

import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/app/utils/supabase";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

interface Driver {
  id: string;
  name: string;
}

interface Vehicle {
  name: string;
}

interface Trip {
  id: number;
  trip_id: string;
  status: string;
  start_date: string;
  end_date: string;
  cargo: string;
  cargo_weight: string;
  driver: string;
  vehicle: string;
}

interface Props {
  trip: Trip;
  onStatusChange?: (status: string) => void;
}

// Add destination, origin, and other details as needed

export default function TripCard({ trip, onStatusChange }: Props) {
  const [tripData, setTripData] = React.useState<Trip | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth(); // Use AuthContext instead

  const fetchTripData = async () => {
    const { data: tripData, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .single();

    if (tripError) {
      console.error("Error fetching trip data:", tripError);
    } else {
      setTripData(tripData as Trip);
    }
  };
  useEffect(() => {
    fetchTripData();
  }, []);

  const handleUpdateStatus = async (newStatus: "accepted" | "rejected") => {
    const { data, error } = await supabase
      .from("trips")
      .update({
        status: newStatus,
      })
      .eq("id", trip.id);

    if (error) {
      Alert.alert("Error", `Failed to update status: ${error.message}`);
    } else {
      onStatusChange?.(newStatus);
      Alert.alert("Success", `Trip ${newStatus}`);
    }
  };

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>Trip's Coming Soon</Text>
        <Text style={styles.label}>
          Stay Tuned! Will be used for additional stops and etc
        </Text>
      </View>
      {/* <Text style={styles.title}>Trip {tripData?.trip_id || "Unknown"}</Text>
      <Text style={styles.label}>
        Status:{" "}
        <Text style={styles.status}>{tripData?.status || "Unknown"}</Text>
      </Text>
      <Text style={styles.label}>Driver: {tripData?.driver || "Unknown"}</Text>
      <Text style={styles.label}>
        Vehicle: {tripData?.vehicle || "Unknown"}
      </Text>
      <Text style={styles.label}>
        Cargo: {tripData?.cargo || "Unknown"} ({tripData?.cargo_weight || 0} kg)
      </Text>
      <Text style={styles.label}>
        Dates: {tripData?.start_date || "Unknown"} -{" "}
        {tripData?.end_date || "Unknown"}
      </Text> */}

      {/* <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleUpdateStatus("accepted")}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleUpdateStatus("rejected")}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#2c3e50",
  },
  label: {
    fontSize: 16,
    marginVertical: 2,
    color: "#34495e",
  },
  status: {
    fontWeight: "600",
    color: "#2980b9",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#27ae60",
  },
  rejectButton: {
    backgroundColor: "#c0392b",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
