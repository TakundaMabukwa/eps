import { checkCarReg } from "@/app/utils/actions/requests";
import { supabase } from "@/app/utils/supabase";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Linking,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

export default function ScannerDriver() {
  const qrLock = useRef(false);
  const appState = useRef(AppState.currentState);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);

  useFocusEffect(
    useCallback(() => {
      qrLock.current = false;
      setHasScanned(false);
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        qrLock.current = false;
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);



  function parseVehicleQR(raw: string) {
    const fields = raw.split('%').filter(Boolean); // Removes empty strings

    return {
      registration_number: fields[5],           // Looks like DD80MKGP
      engine_number: fields[6],                 // FTV684K
      body_type: fields[7],                     // Hatch back / Luikrug
      manufacturer: fields[8],                  // OPEL
      model: fields[9],                         // ASTRA
      color: fields[10],                        // Silver / Silwer
      VIN: fields[11],                          // W0LPC6ED2EG017187
      engine_code: fields[12],                  // A16XER20TF6740
      license_expiry: fields[13],               // 2025-07-31 (likely a date)
    };
  }
  const handleScannedData = async (rawScan: string) => {
    // if (!hasScanned) return;

    if (rawScan.startsWith("http")) {
      try {
        await Linking.openURL(rawScan);
      } catch (err) {
        Alert.alert("Failed to open link", rawScan);
      }
      return;
    }

    if (!rawScan.includes('%')) {
      Alert.alert("Invalid QR format", "The scanned data doesn't contain expected vehicle info.");
      return;
    }

    const parsed = parseVehicleQR(rawScan);
    const regNumber = parsed.registration_number;

    if (!regNumber || regNumber.length < 6) {
      Alert.alert("No 1 registration number found." + JSON.stringify(parsed));
      console.error("No 2 registration number found in parsed data:", parsed);
      return;
    }

    const checking = await checkCarReg({ registrationNumber: regNumber });
    console.log("Checking vehicle registration:", regNumber, checking);


    // if (checking.success) {
    //   setHasScanned(true);
    //   Alert.alert("Scanned Vehicle 45", `Registration: ${regNumber}`);

    //   // 1. Get vehicle ID from registration number
    //   const { data: vehicleData, error: vehicleError } = await supabase
    //     .from('vehiclesc')
    //     .select('id')
    //     .eq('registration_number', regNumber)
    //     .single();

    //   if (vehicleError) {
    //     console.error('Vehicle lookup error:', vehicleError);
    //     alert('Vehicle not found');
    //     return;
    //   }

    //   if (!vehicleData) {
    //     alert('Vehicle not found');
    //     return;
    //   }
    //   // 2. Upsert inspection record
    //   const { data: userId, error: errors } = await supabase.auth.getUser();
    //   if (!userId?.user) {
    //     return;
    //   }
    //   const { data: driverData, error: driverError } = await supabase
    //     .from('drivers')
    //     .select('id')
    //     .eq('user_id', userId.user.aud)
    //     .single();

    //   if (driverError || !driverData) {
    //     alert("Can't find driver linked to user");
    //     return;
    //   }

    //   const driverId = driverData.id;
    //   const vehicleId = vehicleData.id;


    //   const { data, error } = await supabase
    //     .from('vehicle_inspections')
    //     .select('*')
    //     .upsert({
    //       driver_id: driverId,
    //       vehicle_id: vehicleId,
    //       inspected: true,
    //       inspection_date: new Date().toISOString(),
    //       updated_at: new Date().toISOString(),
    //       user_id: userId
    //     }, { onConflict: ['driver_id', 'vehicle_id'] });

    //   if (error) {
    //     console.error('Upsert inspection error:', error);
    //     alert('Failed to record inspection');
    //     return;
    //   }


    //   if (error) {
    //     console.error("Upsert error:", error);
    //   } else { 
    //     alert('Inspection recorded successfully');
    //     console.log("Inspection upserted:", data);
    //   }


    //   router.push({
    //     pathname: "/(tabs)/inspection/inspect",
    //     params: { registration_number: regNumber },
    //   });
    // } 
    if (checking.success) {
      if (checking.success) {
        Alert.alert("Scanned Vehicle", `Registration: ${regNumber}`);

        // 1. Get vehicle ID from registration number
        const { data: vehicleData, error: vehicleError } = await supabase
          .from('vehiclesc')  // your table name for vehicles
          .select('id')
          .eq('registration_number', regNumber)
          .single();

        if (vehicleError || !vehicleData) {
          console.error('Vehicle lookup error:', vehicleError);
          alert('Vehicle not found');
          return;
        }
        const vehicleId = vehicleData.id;

        // 2. Get current authenticated user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          alert('User not authenticated');
          return;
        }
        const userId = userData.user.id;

        // 3. Lookup driver ID from drivers table using user_id foreign key
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('id')
          .eq('user_id', userId)  // your drivers table links user_id to auth.users.id
          .single();

        if (driverError || !driverData) {
          alert("Can't find driver linked to user");
          return;
        }
        const driverId = driverData.id;

        // 4. Upsert the inspection record
        // IMPORTANT: Let Postgres MINT id with SERIAL, omit id on insert/upsert
        const { data, error } = await supabase
          .from('vehicle_inspections')
          .upsert({
            driver_id: driverId,
            vehicle_id: vehicleId,
            inspected: true,
            inspection_date: new Date().toISOString(),
            user_id: userId,
          });

        if (error) {
          console.error('Upsert inspection error:', error);
          alert('Failed to record inspection');
          return;
        }
        alert('licensed disk scanned successfully.');
        console.log("Inspection upserted:", data);

        router.push({
          pathname: "/(tabs)/inspection/inspect",
          params: { registration_number: regNumber },
        });
      }
    }

    else {
      setHasScanned(false);
      Alert.alert("Error", checking.error || "1 Vehicle registration not found." + JSON.stringify(checking));
      console.error("Error checking vehicle registration: 3", checking.error);
    }
  };
  // const rawScan = "%MVL1CC09%0148%4025T0BD%1%4025013FVTT0%DD80MKGP%FTV684K%Hatch back / Luikrug%OPEL%ASTRA%Silver / Silwer%W0LPC6ED2EG017187%A16XER20TF6740%2025-07-31%";
  // const vehicleDetails = parseVehicleQR(rawScan);

  // console.log(vehicleDetails);

  // const handleScannedData = async (rawScan: string) => {
  //   if (!hasScanned) return;

  //   const parsed = parseVehicleQR(rawScan);

  //   // If it's a link, open it
  //   if (rawScan.startsWith("http")) {
  //     try {
  //       await Linking.openURL(rawScan);
  //     } catch (err) {
  //       Alert.alert("Failed to open link", rawScan);
  //     }
  //     return;
  //   }

  //   if (parsed.registration_number.startsWith("http")) {
  //     try {
  //       await Linking.openURL(parsed.registration_number);
  //     } catch (err) {
  //       Alert.alert("Failed to open link", parsed.registration_number);
  //     }
  //   } else {
  //     const checking = await checkCarReg({ registrationNumber: parsed.registration_number });
  //     if (checking.success) {
  //       setHasScanned(true);
  //       Alert.alert("Scanned Data", parsed.registration_number || "No registration number found.");
  //       router.push({
  //         pathname: "/(Technician)/checklist/mainCheck",
  //         params: { registration_number: parsed.registration_number || "" },
  //       });
  //     } else {
  //       setHasScanned(false);
  //       console.error("Error checking vehicle registration:", checking.error);
  //       Alert.alert("Error", checking.error || "No vehicle registration found.");
  //     }
  //   }
  // };
  return (
    <SafeAreaView style={StyleSheet.absoluteFillObject}>
      <Stack.Screen
        options={{
          title: "Scanner",
          headerShown: false,
        }}
      />
      {Platform.OS === "android" && <StatusBar hidden />}
      <CameraView
        active={!hasScanned}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "ean13"],
        }}
        onBarcodeScanned={({ data }) => {
          if (data && !qrLock.current) {
            qrLock.current = true;
            setTimeout(() => {
              handleScannedData(data);
            }, 300);
          }
        }}
      />
      <TouchableOpacity
        onPress={() => {
          setHasScanned(false);
          qrLock.current = false;
        }}
      >
        <Text style={{ color: 'white', textAlign: 'center', padding: 12 }}>
          Scan Again
        </Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  permissionView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 20,
    textAlign: "center",
  },
  permissionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});