import { getVehicleByRegistrationNumber } from "@/app/utils/actions/functions";
import { supabase } from "@/app/utils/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button, Icon, ListItem } from "react-native-elements";

// Replace options
const options = ["OK", "Faulty"];

// New checklist sections with categories
const checklistSections = [
  {
    title: "First Check (Before Start)",
    items: [
      { label: "Engine oil level", category: "A" },
      { label: "Radiator coolant level", category: "A" },
      { label: "Clutch fluid level", category: "A" },
      { label: "Auto grease level", category: "A" },
      { label: "Hydraulic/Steering oil level", category: "A" },
      { label: "Visually check for oil leaks", category: "A" },
      { label: "Visually check for water leaks", category: "A" },
      { label: "Visually check for any fuel leaks", category: "A" },
    ],
  },
  {
    title: "Inside Cabin",
    items: [
      { label: "Steering fluid level", category: "A" },
      { label: "Warning lights off", category: "A" },
      { label: "Air pressure is full", category: "A" },
      { label: "Function of all lights & indicators", category: "B" },
      { label: "Full PPE worn", category: "A" },
      { label: "Safety harness inside", category: "A" },
      { label: "DriveCam (no flashing/red lights)", category: "B" },
      { label: "Steering functioning correctly (test)", category: "A" },
      { label: "Footbrake functioning correctly (test)", category: "A" },
      { label: "Clutch pedal operating correctly", category: "A" },
      { label: "Gear shift functioning correctly", category: "A" },
      { label: "Handbrake functioning correctly (test)", category: "A" },
      { label: "Function of driver’s seat", category: "A" },
      {
        label:
          "All warning lights: charging, oil pressure, low air, handbrake, trailer brake, auto grease etc",
        category: "A",
      },
      { label: "Indicators, hazards, headlights working", category: "A" },
      { label: "Function of wipers & hooter", category: "B" },
      { label: "Reverse buzzer working", category: "A" },
      { label: "Seat belt functioning", category: "A" },
      { label: "Rear view mirrors adjusted correctly", category: "A" },
      { label: "No loose items in cab", category: "A" },
      { label: "Lock nuts keys present", category: "B" },
      { label: "First Aid Kit sealed", category: "A" },
    ],
  },
  {
    title: "Outside Cabin",
    items: [
      { label: "Valid license / COF / operator disc", category: "A" },
      { label: "Valid safe loading pass disc", category: "A" },
      { label: "No windscreen cracks/chips obstructing view", category: "A" },
      { label: "Battery cover undamaged", category: "B" },
      {
        label: "Battery isolation switch on/off clearly marked",
        category: "B",
      },
      { label: "Battery isolation switch working", category: "B" },
      { label: "Exhaust shield in place", category: "A" },
      { label: "Emergency warning triangle present", category: "A" },
      { label: "Tyre pressures (visual check)", category: "A" },
      { label: "Valve caps & extensions secure", category: "A" },
      { label: "Wheel nuts & indicators secured", category: "A" },
      { label: "Spill kit sealed", category: "A" },
      { label: "5th wheel coupling lock", category: "B" },
      { label: "Check for any air leaks", category: "A" },
      { label: "Landing legs fully retracted", category: "A" },
      { label: "Tow hitch lever locked", category: "B" },
      { label: "Tow eye bush & nut secure", category: "A" },
      { label: "Air hose & electrical connections secure", category: "B" },
      { label: "Air tanks secure", category: "A" },
      { label: "Check meter air pipes for kinks", category: "B" },
      { label: "Drain diesel overflow catch box", category: "A" },
      { label: "Chevron board & number plates present", category: "B" },
      { label: "Rear & side reflective tape intact", category: "A" },
      { label: "Rear & side under-run protection", category: "A" },
    ],
  },
  {
    title: "Fire & Safety Equipment",
    items: [
      { label: "2 x 9kg Fire Extinguishers per tank", category: "A" },
      { label: "Fire extinguisher seals & date valid", category: "B" },
      { label: "2 x Stop Blocks", category: "A" },
      { label: "Delivery nozzles and couplings intact", category: "A" },
      { label: "Emergency triangle present", category: "A" },
    ],
  },
  {
    title: "Tyres & Vehicle Condition",
    items: [
      { label: "Any vehicle/body damage", category: "B" },
      { label: "Smooth tyres – at least 3mm tread", category: "A" },
      { label: "Damaged tyres", category: "A" },
    ],
  },
];

type ChecklistState = {
  [sectionIdx: number]: {
    [itemIdx: number]: string; // option selected
  };
};

const Checklist = () => {
  const params = useLocalSearchParams();
  const initialReg =
    typeof params.registration_number === "string"
      ? params.registration_number
      : "";
  const [expanded, setExpanded] = useState<number | null>(1);
  const [registrationNumber, setRegistrationNumber] = useState(initialReg);
  const [odoReading, setOdoReading] = useState("");
  const [error, setError] = useState(false);
  const [regExists, setRegExists] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistState>({});

  const [driver, setDriver] = useState<{ id: number } | null>(null);
  const [vehicleId, setVehicleId] = useState<number | null>(null);

  const fetchData = async () => {
    if (!registrationNumber) {
      setRegExists(false);
      return;
    }
    // Fetch vehicle by registration number
    const { data: vehicleData, error: vehicleError } = await supabase
      .from("vehiclesc")
      .select("id")
      .eq("registration_number", registrationNumber)
      .single();

    setRegExists(!!vehicleData);
    setVehicleId(vehicleData?.id ?? null);

    // Get session and driver info
    const { data: sessionData } = await supabase.auth.getSession();
    const driverUserId = sessionData?.session?.user?.id ?? null;
    if (driverUserId) {
      const { data: driverData, error: driverError } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", driverUserId)
        .single();
      setDriver(driverData ?? null);
    }
  };
  useEffect(() => {
    fetchData();
  }, [registrationNumber]);

  useEffect(() => {
    if (initialReg && registrationNumber !== initialReg) {
      setRegistrationNumber(initialReg);
    }
    const getViewDetails = async () => {
      const { data: Vehicle, error } = await supabase
        .from("vehiclesc")
        .select("*")
        .eq("inspected", false);
    };
    getViewDetails();

    const fetchVehicle = async () => {
      if (!registrationNumber) {
        setRegExists(false);
        return;
      }
      const vehicle = await getVehicleByRegistrationNumber(registrationNumber);
      setRegExists(!!vehicle);
    };
    fetchVehicle();
  }, [initialReg, registrationNumber]);

  async function handleAssignDriver(vehicleId: number, driverId: number) {
    const { data, error } = await supabase
      .from("vehiclesc")
      .update({ driver_id: driverId })
      .eq("id", vehicleId)
      .select();

    if (error) {
      console.error("Issue in assigning driver:", error.message);
      alert("Failed to assign driver: " + error.message);
      return;
    }

    console.log("Driver assigned successfully:", data);
  }

  const updateVehicle = async () => {
    const { error } = await supabase
      .from("vehiclesc")
      .update({
        inspected: true,
        registration_number: registrationNumber,
      })
      .eq("registration_number", registrationNumber);
    Alert.alert(
      "Checklist Submitted",
      "Your checklist has been successfully submitted." +
        "\n\nRegistration Number: " +
        registrationNumber +
        "\nOdo Reading: " +
        odoReading
    );
    setExpanded(null);
    console.log({
      registrationNumber,
      odoReading,
      checklist,
    });
  };

  const handleNext = () => {
    if (!odoReading || !regExists) {
      setError(true);
    } else {
      setError(false);
      setExpanded(2);
    }
  };

  const handleOptionSelect = (
    sectionIdx: number,
    itemIdx: number,
    option: string
  ) => {
    setChecklist((prev) => ({
      ...prev,
      [sectionIdx]: {
        ...prev[sectionIdx],
        [itemIdx]: option,
      },
    }));
  };

  const isChecklistComplete = () => {
    for (let s = 0; s < checklistSections.length; s++) {
      const section = checklistSections[s];
      if (section.items.length === 0) continue;
      if (!checklist[s]) return false;
      for (let i = 0; i < section.items.length; i++) {
        if (!checklist[s][i]) return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!isChecklistComplete()) {
      setError(true);
      return;
    }
    const detailedChecklist = checklistSections.map((section, sIdx) => ({
      title: section.title,
      items: section.items.map((item, iIdx) => ({
        label: item.label,
        category: item.category,
        status: checklist[sIdx]?.[iIdx] || null,
      })),
    }));

    const inspectionData = {
      vehicle_id: vehicleId,
      driver_id: driver?.id ?? null,
      odo_reading: parseInt(odoReading),
      checklist: detailedChecklist,
      category: Object.values(checklist).some((section) =>
        Object.values(section).includes("Faulty_A")
      )
        ? "A"
        : "B",
      overall_status: Object.values(checklist).some((section) =>
        Object.values(section).includes("Faulty")
      )
        ? "Faulty"
        : "OK",
    };

    const { error } = await supabase
      .from("inspections")
      .insert(inspectionData as any);

    if (error) {
      console.error("Failed to save inspection:", error, inspectionData as any);
      Alert.alert("Error", "Could not save inspection. Please try again.");
      return;
    }

    if (vehicleId != null) {
      await supabase
        .from("vehiclesc")
        .update({ inspected: true })
        .eq("id", vehicleId);
    }
    if (vehicleId != null && driver?.id != null) {
      await handleAssignDriver(vehicleId, driver.id);
    }
    updateVehicle();
    Alert.alert(
      "Checklist Submitted",
      `Vehicle ${registrationNumber} inspection saved.`
    );

    router.push({
      pathname: "/(tabs)/emergency/breakdown",
      params: {
        registration_number: registrationNumber,
        odo_reading: odoReading,
        checklist: JSON.stringify(checklist),
      },
    });
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Step 1: Vehicle Details */}
      <ListItem.Accordion
        content={
          <>
            <Icon name="car" type="material-community" color="#2196F3" />
            <ListItem.Content>
              <ListItem.Title style={styles.title}>
                Vehicle Details
              </ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded === 1}
        onPress={() => setExpanded(expanded === 1 ? null : 1)}
        containerStyle={styles.accordion}
      >
        <View style={styles.form} key={registrationNumber}>
          <Text style={styles.label}>Registration Number *</Text>
          <TextInput
            placeholder="e.g. ABC123"
            placeholderTextColor="#aaa"
            value={registrationNumber}
            onChangeText={(text) => {
              setRegistrationNumber(text.trim().toUpperCase());
              setError(false);
            }}
            style={[
              styles.input,
              !regExists &&
                registrationNumber.length > 0 && { borderColor: "red" },
            ]}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {!regExists && registrationNumber.length > 0 && (
            <Text style={styles.errorText}>
              Registration number does not exist
            </Text>
          )}
          <Text style={styles.label}>Current Odo Reading *</Text>
          <TextInput
            placeholder="e.g. 123456"
            placeholderTextColor="#aaa"
            value={odoReading}
            onChangeText={(text) => {
              setOdoReading(text.replace(/[^0-9]/g, ""));
              setError(false);
            }}
            style={styles.input}
            keyboardType="numeric"
          />
          {error && (
            <Text style={styles.errorText}>
              All fields are required and registration must exist
            </Text>
          )}
          <Button
            title="Next"
            onPress={handleNext}
            disabled={!registrationNumber || !regExists || !odoReading}
            buttonStyle={styles.button}
            containerStyle={{ marginTop: 15 }}
          />
        </View>
      </ListItem.Accordion>

      {/* Step 2: Check List */}
      <ListItem.Accordion
        content={
          <>
            <Icon
              name="clipboard-check"
              type="material-community"
              color="#4CAF50"
            />
            <ListItem.Content>
              <ListItem.Title style={styles.title}>Check List</ListItem.Title>
            </ListItem.Content>
          </>
        }
        isExpanded={expanded === 2}
        onPress={() => setExpanded(expanded === 2 ? null : 2)}
        containerStyle={styles.accordion}
      >
        <View style={styles.form}>
          {checklistSections.map(
            (section, index) =>
              section.items.length > 0 && (
                <View key={index} style={styles.section}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  {section.items.map((item, iIdx) => (
                    <View key={iIdx} style={styles.itemRow}>
                      <Text style={styles.itemText}>
                        {item.label} : {item.category}
                      </Text>
                      <View style={styles.optionsRow}>
                        {options.map((option) => (
                          <Button
                            key={option}
                            title={option}
                            type={
                              checklist[index]?.[iIdx] === option
                                ? "solid"
                                : "outline"
                            }
                            onPress={() =>
                              handleOptionSelect(index, iIdx, option)
                            }
                            buttonStyle={[
                              styles.optionButton,
                              checklist[index]?.[iIdx] === option && {
                                backgroundColor:
                                  option === "Good/No Leaks"
                                    ? "#4CAF50"
                                    : option === "Average"
                                    ? "#FFC107"
                                    : "#F44336",
                              },
                            ]}
                            titleStyle={{
                              fontSize: 12,
                              color:
                                checklist[index]?.[iIdx] === option
                                  ? "#fff"
                                  : "#333",
                            }}
                            containerStyle={{ flex: 1, marginHorizontal: 2 }}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )
          )}
          <Button
            title="Submit Checklist"
            onPress={handleSubmit}
            buttonStyle={[
              styles.button,
              !isChecklistComplete() && { backgroundColor: "#ccc" },
            ]}
            disabled={!isChecklistComplete()}
            containerStyle={{ marginTop: 20 }}
          />
          <Text style={styles.infoText}>
            Please ensure all items are checked and noted before submitting.
          </Text>
        </View>
      </ListItem.Accordion>
    </ScrollView>
  );
};

export default Checklist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  accordion: {
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontWeight: "bold",
    fontSize: 17,
    color: "#222",
  },
  form: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    marginBottom: 3,
    fontWeight: "600",
    color: "#444",
    fontSize: 14,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#d3d3d3",
    padding: 10,
    backgroundColor: "#fafbfc",
    fontSize: 15,
    marginBottom: 5,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 10,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    fontSize: 13,
  },
  infoText: {
    marginTop: 15,
    color: "#666",
    fontSize: 13,
    textAlign: "center",
  },
  section: {
    marginBottom: 25,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#1976D2",
    marginBottom: 10,
    marginTop: 10,
  },
  itemRow: {
    marginBottom: 10,
    backgroundColor: "#f6f8fa",
    borderRadius: 6,
    padding: 8,
    elevation: 1,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
    fontWeight: "500",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  optionButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: "#d3d3d3",
    backgroundColor: "#fff",
  },
});
