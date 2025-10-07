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

interface Driver {
  id: string | number;
  first_name?: string | null;
  surname?: string | null;
  email_address?: string | null;
  user_id?: string | null;
  name?: string | null;
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
  vehicleAssignments?: string;
  vehicle_assignments?: any;
  origin?: string;
  destination?: string;
  cost_centre?: any;
  client_details?: any;
  pickup_locations?: any;
  dropoff_locations?: any;
  waypoints?: any;
  notes?: string;
  rate?: string;
  order_number?: string;
}

const STATUS_OPTIONS = [
  { label: "Accept", value: "accepted" },
  { label: "Reject", value: "rejected" },
  { label: "Arrived at Loading", value: "arrived-at-loading" },
  { label: "Staging Area", value: "staging-area" },
  { label: "Loading", value: "loading" },
  { label: "On Trip", value: "on-trip" },
  { label: "Completed", value: "completed" },
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
  const [userDriver, setUserDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDriver = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUserDriver(null);
        return;
      }
      const { data: driversData, error: driversError } = await supabase
        .from("drivers")
        .select("*");

      console.log("Fetched Drivers Data:", driversData);
      console.log("Current User:", user);
      if (driversError || !driversData) {
        setUserDriver(null);
        return;
      }
      const userDriver =
        driversData.find(
          (d: Driver) =>
            String(d.user_id || d.id).toLowerCase() ===
            String(user.id).toLowerCase()
        ) ||
        driversData.find(
          (d: Driver) =>
            String(d.user_id || d.id).toLowerCase() ===
            String(user.id).toLowerCase()
        );
      setUserDriver(userDriver || null);
      console.log("User Driver:", userDriver);
    };
    fetchUserDriver();
  }, []);

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

  // Parse vehicle assignments
  let assignments: any[] = [];
  try {
    if (trip.vehicleAssignments) {
      assignments =
        typeof trip.vehicleAssignments === "string"
          ? JSON.parse(trip.vehicleAssignments)
          : trip.vehicleAssignments;
    } else if (trip.vehicle_assignments) {
      assignments = Array.isArray(trip.vehicle_assignments)
        ? trip.vehicle_assignments
        : typeof trip.vehicle_assignments === "string"
        ? JSON.parse(trip.vehicle_assignments)
        : [];
    }
  } catch {
    assignments = [];
  }

  const driverNames = assignments
    .flatMap((va) => va.drivers?.map((d: any) => d.name).filter(Boolean) || [])
    .join(", ");

  const vehicleNames = assignments
    .map((va) =>
      va.vehicle && va.vehicle.name
        ? va.vehicle.name
        : va.vehicle && va.vehicle.model
        ? `${va.vehicle.model} (${va.vehicle.regNumber || ""})`
        : ""
    )
    .filter(Boolean)
    .join(", ");

  let costCentreName = "";
  if (trip.cost_centre) {
    try {
      const cc =
        typeof trip.cost_centre === "string"
          ? JSON.parse(trip.cost_centre)
          : trip.cost_centre;
      costCentreName = cc?.name || "";
    } catch {
      costCentreName = "";
    }
  }

  let clientName = "";
  if (trip.client_details) {
    try {
      const cd =
        typeof trip.client_details === "string"
          ? JSON.parse(trip.client_details)
          : trip.client_details;
      clientName = cd?.name || "";
    } catch {
      clientName = "";
    }
  }

  const displayLocations = (locs: any) => {
    if (!locs) return "-";
    let arr: any[] = [];
    try {
      arr = typeof locs === "string" ? JSON.parse(locs) : locs;
    } catch {
      arr = [];
    }
    if (!Array.isArray(arr) || arr.length === 0) return "-";
    return arr.map((l) => l.address || l.location || l.name || "-").join(", ");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#27ae60";
      case "in-progress":
        return "#f39c12";
      case "cancelled":
        return "#c0392b";
      default:
        return "#2980b9";
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip {trip.trip_id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(trip.status) },
          ]}
        >
          <Text style={styles.statusText}>{trip.status}</Text>
        </View>
      </View>

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

      <View style={styles.section}>
        <Text style={styles.label}>Client:</Text>
        <Text style={styles.value}>{clientName || "-"}</Text>
{/* 
        <Text style={styles.label}>Cost Centre:</Text>
        <Text style={styles.value}>{costCentreName || "-"}</Text> */}

        <Text style={styles.label}>Driver(s):</Text>
        <Text style={styles.value}>{driverNames || trip.driver || "-"}</Text>

        <Text style={styles.label}>Vehicle(s):</Text>
        <Text style={styles.value}>{vehicleNames || trip.vehicle || "-"}</Text>

        <Text style={styles.label}>Cargo:</Text>
        <Text style={styles.value}>
          {trip.cargo} ({trip.cargo_weight} tons)
        </Text>

        {/* <Text style={styles.label}>Origin:</Text>
        <Text style={styles.value}>{trip.origin || "-"}</Text>

        <Text style={styles.label}>Destination:</Text>
        <Text style={styles.value}>{trip.destination || "-"}</Text> */}

        <Text style={styles.label}>Pickup:</Text>
        <Text style={styles.value}>
          {displayLocations(trip.pickup_locations)}
        </Text>

        <Text style={styles.label}>Dropoff:</Text>
        <Text style={styles.value}>
          {displayLocations(trip.dropoff_locations)}
        </Text>

        {/* <Text style={styles.label}>Waypoints:</Text>
        <Text style={styles.value}>{displayLocations(trip.waypoints)}</Text>

        <Text style={styles.label}>Order #:</Text>
        <Text style={styles.value}>{trip.order_number || "-"}</Text> */}

        {/* <Text style={styles.label}>Rate:</Text>
        <Text style={styles.value}>{trip.rate || "-"}</Text> */}

        {/* <Text style={styles.label}>Notes:</Text>
        <Text style={styles.value}>{trip.notes || "-"}</Text> */}

        <Text style={styles.label}>Dates:</Text>
        <Text style={styles.value}>
          {trip.start_date} - {trip.end_date}
        </Text>
      </View>

      {loading && (
        <ActivityIndicator
          size="small"
          color="#2980b9"
          style={{ marginTop: 10 }}
        />
      )}
    </View>
  );
}

// ✅ Main Component
export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      setTrips([]);
      setLoading(false);
      return;
    }

    const { data: driversData, error: driversError } = await supabase
      .from("drivers")
      .select("*");

    if (driversError || !driversData) {
      Alert.alert("Error", "Could not fetch drivers.");
      setTrips([]);
      setLoading(false);
      return;
    }

    const userDriver =
      driversData.find(
        (d: Driver) =>
          String(d.user_id || d.id).toLowerCase() ===
          String(user.id).toLowerCase()
      ) ||
      driversData.find(
        (d: Driver) =>
          d.email_address &&
          d.email_address.toLowerCase() === user.email?.toLowerCase()
      ) ||
      driversData.find(
        (d: Driver) =>
          (d.first_name || d.name) &&
          (d.first_name || d.name)?.toLowerCase() ===
            (user.user_metadata?.name || "").toLowerCase()
      );

    if (!userDriver) {
      Alert.alert("Error", "Could not find your driver profile.");
      setTrips([]);
      setLoading(false);
      return;
    }

    const userDriverName = (userDriver.first_name || "").toLowerCase();

    const { data, error } = await supabase.from("trips").select("*");
    if (error) {
      Alert.alert("Error", "Could not fetch trips.");
      setTrips([]);
      setLoading(false);
      return;
    }

    const filteredTrips = (data as Trip[]).filter((trip) => {
      try {
        let assignments: any[] = [];
        if (trip.vehicleAssignments) {
          assignments =
            typeof trip.vehicleAssignments === "string"
              ? JSON.parse(trip.vehicleAssignments)
              : trip.vehicleAssignments;
        } else if (trip.vehicle_assignments) {
          assignments = Array.isArray(trip.vehicle_assignments)
            ? trip.vehicle_assignments
            : typeof trip.vehicle_assignments === "string"
            ? JSON.parse(trip.vehicle_assignments)
            : [];
        }
        return assignments.some((assignment: any) =>
          assignment.drivers?.some(
            (driver: any) =>
              driver.name && driver.name.toLowerCase() === userDriverName
          )
        );
      } catch {
        return false;
      }
    });

    setTrips(filteredTrips);
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
      <View style={[styles.card, { alignItems: "center" }]}>
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
    borderRadius: 16,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#2980b9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2c3e50",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  picker: {
    marginVertical: 10,
    backgroundColor: "#f7f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  section: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 6,
  },
  value: {
    fontSize: 15,
    color: "#2c3e50",
    fontWeight: "500",
  },
});
