import { useCurrentAddress } from "@/app/hooks/useCurrentAddress";
import { getVehicleByRegistrationNumber } from "@/app/utils/actions/functions";
import {
  addEmergency,
  getVehicleAndDrivers,
  getVehicleAssignId,
} from "@/app/utils/actions/requests";
import { supabase } from "@/app/utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { decode as atob } from "base-64";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type BreakdownScreenProps = {
  navigation?: any;
};

type jobAssignment = {
  id?: number;
  breakdowns_id: string | null;
  technician_id: string | null;
  accepted: boolean | null;
  service: string | null;
  notes: string | null;
  result_images: string[] | null;
  completed_at: Date | null;
  location: string | null;
  emergency_type: string | null;
  description: string;
  created_at: Date | null;
  created_by: string | null;
  job_id?: string;
  status:
    | "pending"
    | "assigned"
    | "inprogress"
    | "awaiting-approval"
    | "approved"
    | "completed"
    | "cancelled"
    | "Breakdown Request"
    | "Breakdown assigned"
    | "Technician accepted"
    | "Technician on site"
    | "Technician working"
    | "Tow requested";
  attachment?: string[] | null;
  vehicle_id?: number | null;
  driver_id?: number | null;
};

const AvailableBreakdowns = [
  {
    id: "1",
    title: "Tow Truck",
    description:
      "Get a tow truck to your location for vehicle recovery or transport.",
  },
  {
    id: "2",
    title: "Mechanical Failure",
    description: "Request help for mechanical failure.",
  },
  {
    id: "3",
    title: "Jump Start",
    description:
      "Request help to jump start your vehicle if your battery is dead.",
  },
  {
    id: "4",
    title: "Fuel Delivery",
    description: "Ran out of fuel? We can deliver fuel to your location.",
  },
  {
    id: "5",
    title: "Lockout Service",
    description:
      "Locked out of your car? Get assistance to unlock your vehicle.",
  },
  {
    id: "6",
    title: "Tire Change",
    description: "Flat or damaged tire? Request a tire change service.",
  },
];

export default function BreakdownScreen({ navigation }: BreakdownScreenProps) {
  const params = useLocalSearchParams();
  const regNumFromParams = params.registration_number || "";
  const [issue, setIssue] = useState("");
  const [location, setLocation] = useState("");
  const [shareLocation, setShareLocation] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [regExists, setRegExists] = useState(false);
  const [error, setError] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const { address } = useCurrentAddress();
  const [regNum, setRegNum] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [vehicle_id, setVehicleId] = useState<number | null>(null);
  const [driver_id, setDriverId] = useState<number | null>(null);
  const [editable, setEditable] = useState(false);
  const [service, setService] = useState<string | null>(null);

  useEffect(() => {
    if (!editable && address) {
      setLocation(address);
      console.log("Address set to:", address);
    }
  }, [address, editable]);

  useEffect(() => {
    const saveReg = async () => {
      if (regNum && typeof window !== "undefined") {
        await AsyncStorage.setItem("registrationNumber", regNum);
      }
    };
    saveReg();
  }, [regNum]);

  const saveRegistrationNumber = async (regNum: string) => {
    await AsyncStorage.setItem("registrationNumber", regNum);
  };

  const getRegistrationNumber = async () => {
    const value = await AsyncStorage.getItem("registrationNumber");
    return value;
  };

  useEffect(() => {
    const loadStoredRegNum = async () => {
      const storedReg = await getRegistrationNumber();
      if (storedReg) {
        setRegistrationNumber(storedReg);
      }
    };
    loadStoredRegNum();
  }, []);

  useEffect(() => {
    if (regNumFromParams) {
      const regNumStr = Array.isArray(regNumFromParams)
        ? regNumFromParams[0]
        : regNumFromParams;
      setRegistrationNumber(regNumStr);
      saveRegistrationNumber(regNumStr);
    }
  }, [regNumFromParams]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    const fetchVehicle = async () => {
      if (!registrationNumber) {
        setRegExists(false);
        return;
      }
      const vehicle = await getVehicleByRegistrationNumber(registrationNumber);
      setVehicleId(vehicle?.id || null);

      const driver =
        driver_id !== null
          ? await getVehicleAndDrivers({ Jobassignment: { id: driver_id } })
          : null;
      setDriverId(driver?.data?.id || null);

      setRegExists(!!vehicle);
    };
    fetchVehicle();
    fetchUser();
  }, [registrationNumber]);

  // React.useEffect(() => {
  //   if (registration_number) {
  //     setRegNum(registration_number);
  //   }
  // }, [registration_number]);
  // useEffect(() => {
  //   if (regNumFromParams && registrationNumber === '') {
  //     setRegistrationNumber((regNumFromParams.toString()).toUpperCase());
  //     console.log("Setting registration number from params:", regNumFromParams);
  //   }
  // }, [regNumFromParams]);

  const [userId, setUserId] = useState<string | null>(null);
  console.log("User ID:", userId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => {
              router.back();
              console.log("Back button pressed");
            }}
          >
            <Text style={styles.iconText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Request a breakdown</Text>
        </View>
        <Text style={styles.label}>Registration Number *</Text>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="e.g. ABC123"
            placeholderTextColor="#aaa"
            value={registrationNumber}
            onChangeText={(text) => setRegistrationNumber(text.toUpperCase())}
            style={[
              styles.input,
              !regExists &&
                registrationNumber.length > 0 && { borderColor: "red" },
            ]}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={false}
          />
        </View>
        {!regExists && registrationNumber.length > 0 && (
          <Text style={styles.errorText}>
            Registration number does not exist
          </Text>
        )}

        {/* Service Type */}
        <Text style={styles.sectionTitle}>Service Type</Text>
        <View style={styles.inputStyle}>
          <Picker
            selectedValue={service}
            onValueChange={(itemValue) => setService(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Select a service" value={null} />
            {AvailableBreakdowns.map((breakdown) => (
              <Picker.Item
                key={breakdown.id}
                label={breakdown.title}
                value={breakdown.title}
              />
            ))}
          </Picker>
        </View>

        {/* What's the issue? */}
        <Text style={styles.sectionTitle}>What's the issue?</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textArea}
            placeholder="Describe the issue"
            placeholderTextColor="#4574a1"
            multiline
            value={issue}
            onChangeText={setIssue}
          />
        </View>

        {/* Attachments */}
        <TouchableOpacity
          onPress={async () => {
            let response = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              selectionLimit: 0,
              allowsMultipleSelection: true,
            });

            if (response.canceled) return;
            if (response.assets && response.assets.length > 0) {
              const jobId = undefined;
              const uploadedPaths: string[] = [];

              for (let i = 0; i < response.assets.length; i++) {
                const uri = response.assets[i].uri;
                const fileName = uri.split("/").pop() || `image_${i}.jpg`;

                // Read file as base64
                const base64 = await FileSystem.readAsStringAsync(uri, {
                  encoding: FileSystem.EncodingType.Base64,
                });
                // Convert base64 to binary
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let j = 0; j < binary.length; j++) {
                  bytes[j] = binary.charCodeAt(j);
                }

                // Upload to Supabase Storage
                const { data, error } = await supabase.storage
                  .from("images")
                  .upload(`attachments/${jobId}/${fileName}`, bytes, {
                    contentType: "image/jpeg",
                    upsert: true,
                  });

                if (error) {
                  console.error(
                    `Failed to upload image: ${fileName} - ${error.message}`
                  );
                  continue;
                }
                uploadedPaths.push(data.path);
              }

              // Now you can store uploadedPaths in your state or send to your backend
              setAttachments((prev) => [...prev, ...uploadedPaths]);
            }
          }}
        >
          <Text style={styles.sectionSubtitle}>Attachments (optional)</Text>
        </TouchableOpacity>

        {/* Where are you? */}
        <Text style={styles.sectionTitle}>Where are you?</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            editable={editable}
            value={location}
            onChangeText={setLocation}
          />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Edit my location</Text>
          <Switch
            trackColor={{ false: "#e6edf4", true: "#359dff" }}
            thumbColor="#fff"
            value={editable}
            onValueChange={(value) => {
              setEditable(value);
              // Optional: when disabling editable, reset to address automatically
              if (!value && address) {
                setLocation(address);
              }
            }}
          />
        </View>

        {/* Request assistance button */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              console.log("Request Breakdown pressed");
              setIsLoading(true);

              const jobAssignment: jobAssignment = {
                id: undefined,
                breakdowns_id: null,
                technician_id: null,
                service: service ? service : null,
                accepted: null,
                notes: null,
                result_images: null,
                completed_at: null,
                location: address,
                description: issue,
                emergency_type: "breakdown",
                status: "Breakdown Request",
                created_at: new Date(),
                created_by: userId ? userId : null,
                job_id: "",
                attachment: attachments.length > 0 ? attachments : null,
                driver_id: driver_id,
                vehicle_id: vehicle_id,
              };
              try {
                setIsLoading(true);
                const response = await addEmergency({ jobAssignment });
                if (response.success && response.data && response.data[0]?.id) {
                  const insertedId = response.data[0].id;
                  const driverResponse = await getVehicleAndDrivers({
                    Jobassignment: { id: insertedId },
                  });

                  console.log("Driver updated:", driverResponse);

                  const insertedVehicle = await getVehicleAssignId(
                    { Jobassignment: { id: insertedId } },
                    registrationNumber
                  );

                  console.log("Vehicle updated:", insertedVehicle);

                  const insertedJobAssignment = response.data[0]; // from addEmergency

                  const driverId = driverResponse.data?.id; // from getVehicleAndDrivers

                  // 3) Update job assignment to set driver_id
                  const { data: update, error: updateError } = await supabase
                    .from("job_assignments")
                    .update({ driver_id: driverId })
                    .eq("id", insertedId);

                  // const { data: assignData, error: assignError } = await supabase.from('assignements')
                  //   .insert({
                  //     driver_id: driverId,
                  //     job_id: insertedJobAssignment.id,
                  //     vehicle_id: insertedVehicle.id,
                  //   });
                  // Success
                  Alert.alert(
                    "Success",
                    "Breakdown request sent successfully."
                  );
                  setIsLoading(false);
                  router.navigate("/(tabs)/emergency/status");
                  return;
                }
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Something went wrong while sending your request."
                );
              } finally {
                setIsLoading(false);
              }

              navigation?.navigate("emergency", {
                issue,
                location,
                shareLocation,
              });
            }}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Loading..." : "Request BreakDown"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              router.push("/(tabs)/emergency/status");
            }}
          >
            <Text style={styles.buttonText}>View Status</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Breakdown Services</Text>
          {AvailableBreakdowns.map((breakdown) => (
            <View key={breakdown.id} style={styles.serviceCard}>
              <Text style={styles.serviceTitle}>{breakdown.title}</Text>
              <Text style={styles.serviceDescription}>
                {breakdown.description}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#e6edf4",
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e6edf4",
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
    color: "#0c151d",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#0c151d",
    marginRight: 48,
  },
  sectionTitle: {
    color: "#0c151d",
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionSubtitle: {
    color: "#4574a1",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxWidth: 480,
    width: "100%",
  },
  inputStyle: {
    paddingHorizontal: 16,
    maxWidth: 480,
    borderRadius: 12,
    width: "100%",
    height: 50,
  },
  textArea: {
    flex: 1,
    minHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 12,
    color: "#0c151d",
    padding: 16,
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#d1e3f6",
  },
  input: {
    flex: 1,
    height: "auto",
    backgroundColor: "#fff",
    borderRadius: 12,
    color: "#0c151d",
    padding: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#d1e3f6",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 8,
  },
  switchLabel: {
    flex: 1,
    color: "#0c151d",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
    gap: 12,
  },
  button: {
    flex: 1,
    minWidth: 120,
    height: 48,
    backgroundColor: "#359dff",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#359dff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  servicesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1e3f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c151d",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#4574a1",
  },
  etaContainer: {
    marginTop: 24,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  etaText: {
    fontSize: 16,
    color: "#0c151d",
  },
  bottomSpacer: {
    height: 32,
    backgroundColor: "#f8fafc",
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 13,
  },
  label: {
    marginTop: 10,
    marginBottom: 3,
    fontWeight: "600",
    color: "#444",
    fontSize: 14,
  },
});
