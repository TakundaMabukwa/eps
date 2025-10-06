import { supabase } from "@/app/utils/supabase";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

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
  vehicleAssignments?: string; // JSON string
}

const STATUS_OPTIONS = [
  { label: "Accept", value: "accepted" },
  { label: "Reject", value: "rejected" },
  { label: "Arrived at Loading", value: "arrived-at-loading" },
  { label: "Staging Area", value: "staging-area" },
  { label: "Loading", value: "loading" },
  { label: "On Trip", value: "on-trip" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Stopped", value: "stopped" },
  { label: "Offloading", value: "offloading" },
  { label: "Weighing In/Out", value: "weighing" },
  { label: "Delivered", value: "delivered" },
];

function TripCard({
  trip,
  onStatusChange,
}: {
  trip: Trip;
  onStatusChange?: (status: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from("trips")
      .update({ status: newStatus })
      .eq("trip_id", trip.trip_id);
    setLoading(false);
    if (error) {
      Alert.alert("Error", `Failed to update status: ${error.message}`);
    } else {
      onStatusChange?.(newStatus);
      Alert.alert("Success", `Trip status updated to ${newStatus}`);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Trip {trip.trip_id}</Text>
      <Text style={styles.label}>
        Status: <Text style={styles.status}>{trip.status}</Text>
      </Text>
      <Picker
        selectedValue={trip.status}
        onValueChange={handleStatusChange}
        style={styles.picker}
        enabled={!loading}
      >
        {STATUS_OPTIONS.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
      <Text style={styles.label}>Driver: {trip.driver}</Text>
      <Text style={styles.label}>Vehicle: {trip.vehicle}</Text>
      <Text style={styles.label}>
        Cargo: {trip.cargo} ({trip.cargo_weight} kg)
      </Text>
      <Text style={styles.label}>
        Dates: {trip.start_date} - {trip.end_date}
      </Text>
      {loading && <ActivityIndicator size="small" color="#2980b9" />}
    </View>
  );
}

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      setTrips([]);
      setLoading(false);
      return;
    }
    const userId = user.id;

    // Fetch all trips
    const { data, error } = await supabase.from("trips").select("*");
    if (error) {
      Alert.alert("Error", "Could not fetch trips.");
      setTrips([]);
      setLoading(false);
      return;
    }

    // Filter trips where current user is a driver
    const filteredTrips = (data as Trip[]).filter((trip) => {
      try {
        const assignments = trip.vehicleAssignments
          ? JSON.parse(trip.vehicleAssignments)
          : [];
        // assignments is an array of objects with a 'drivers' array
        return assignments.some((assignment: any) =>
          assignment.drivers?.some((driver: any) => driver.id === userId)
        );
      } catch {
        return false;
      }
    });

    setTrips(data as Trip[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleStatusChange = (tripId: string, newStatus: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.trip_id === tripId ? { ...t, status: newStatus } : t))
    );
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return (
    <FlatList
      data={trips}
      keyExtractor={(item) => item.trip_id}
      renderItem={({ item }) => (
        <TripCard
          trip={item}
          onStatusChange={(status) => handleStatusChange(item.trip_id, status)}
        />
      )}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
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
  picker: {
    marginVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
});
