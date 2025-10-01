import { useTheme } from "@/app/contexts/theme-context";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/app/utils/supabase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const EMERGENCY_NUMBER = "1234567890"; // Replace with actual emergency number

const callEmergency = () => {
  Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() =>
    Alert.alert("Error", "Unable to make a call from this device.")
  );
};

const EmergencyScreenConditional = () => {
  const router = useRouter();
  const [inspectionDone, setInspectionDone] = useState<boolean | null>(null); // null = loading
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // Use AuthContext instead

  // Generate theme-based styles dynamically
  const styles = useMemo(() => createStyles(theme), [theme]);

  const checkInspection = useCallback(async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        setInspectionDone(false);
        return;
      }
      const userId = userData.user.id;

      const { data: driverData } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (!driverData) {
        setInspectionDone(false);
        return;
      }

      const { data: inspectionData } = await supabase
        .from("vehicle_inspections")
        .select("*")
        .eq("driver_id", driverData.id)
        .order("inspection_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      const inspectionDate = inspectionData?.updated_at
        ? new Date(inspectionData.updated_at).toISOString().slice(0, 10)
        : "";
      const createdDate = inspectionData?.created_at
        ? new Date(inspectionData.created_at).toISOString().slice(0, 10)
        : "";
      const todayDate = new Date().toISOString().slice(0, 10);

      if (createdDate === todayDate || inspectionDate === todayDate) {
        setInspectionDone(true); // ✅ inspection done
      } else {
        setInspectionDone(false); // ✅ not done yet
        router.replace("/(tabs)/inspection"); // redirect once
      }
    } catch (err) {
      setInspectionDone(false);
    }
  }, [router]);

  // 🔥 Run check whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkInspection();
    }, [checkInspection])
  );

  // Loading state while checking inspection
  if (inspectionDone === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If inspection not done, force them to go do it
  if (!inspectionDone) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.inspectionPrompt}>
          You need to complete a vehicle inspection before proceeding.
        </Text>
        <TouchableOpacity
          style={styles.goInspectionButton}
          onPress={() => router.replace("/(tabs)/inspection")}
        >
          <Text style={styles.goInspectionButtonText}>Go Do Inspection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Emergency UI (only rendered when inspection done today)
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            router.push("/(tabs)");
          }}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme === "dark" ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      <Ionicons
        name="alert-circle"
        size={80}
        color="#e53935"
        style={styles.icon}
      />
      <Text style={styles.title}>Breakdown Emergency</Text>
      <Text style={styles.description}>
        If you are experiencing a vehicle breakdown, please press the button to
        access our 24/7 emergency breakdown service.
      </Text>

      <View style={styles.buttonRow}>
        <View>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/emergency/breakdown")}
          >
            <Ionicons name="car-sport" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionText}>Breakdown</Text>
        </View>

        <View>
          <TouchableOpacity style={styles.actionButton} onPress={callEmergency}>
            <Ionicons name="call-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.actionText}>Call Emergency</Text>
        </View>
      </View>

      <Text style={styles.note}>
        Stay safe and wait for assistance at a secure location.
      </Text>

      <View>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => {
            router.push("/(tabs)/emergency/status");
          }}
        >
          <Text style={styles.statusButtonText}>View Status</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === "dark" ? "#121212" : "#f0f4f8",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme === "dark" ? "#121212" : "#fff",
    },
    loadingText: {
      color: theme === "dark" ? "#fff" : "#000",
    },
    centeredContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme === "dark" ? "#121212" : "#fff",
    },
    inspectionPrompt: {
      fontSize: 18,
      marginBottom: 20,
      color: theme === "dark" ? "#fff" : "#000",
      textAlign: "center",
    },
    goInspectionButton: {
      backgroundColor: "#28a745",
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 8,
    },
    goInspectionButtonText: {
      color: "white",
      fontSize: 16,
    },
    backButtonContainer: {
      alignItems: "center",
      marginBottom: 20,
      alignSelf: "stretch",
    },
    icon: {
      marginBottom: 24,
      color: "#e53935",
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#e53935",
      marginBottom: 12,
      textAlign: "center",
    },
    description: {
      fontSize: 16,
      color: theme === "dark" ? "#ccc" : "#333",
      marginBottom: 32,
      textAlign: "center",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
    },
    actionButton: {
      flexDirection: "row",
      backgroundColor: "#e53935",
      padding: 30,
      borderRadius: 100,
      alignItems: "center",
      marginBottom: 24,
    },
    actionText: {
      textAlign: "center",
      color: theme === "dark" ? "#fff" : "#000",
    },
    note: {
      fontSize: 14,
      color: theme === "dark" ? "#888" : "#666",
      textAlign: "center",
    },
    statusButton: {
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
      marginTop: 24,
    },
    statusButtonText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default EmergencyScreenConditional;

// import { useTheme } from '@/app/contexts/theme-context';
// import { supabase } from '@/app/utils/supabase';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useMemo, useState } from 'react';
// import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// const EMERGENCY_NUMBER = '1234567890'; // Replace with actual emergency number

// const callEmergency = () => {
//     Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() =>
//         Alert.alert('Error', 'Unable to make a call from this device.')
//     );
// };

// const EmergencyScreenConditional = () => {
//     const router = useRouter();
//     const [inspectionDone, setInspectionDone] = useState<boolean | null>(null); // null while loading
//     const { theme } = useTheme();

//     // useMemo to generate theme-based styles dynamically
//     const styles = useMemo(() => createStyles(theme), [theme]);

//     // useEffect(() => {
//     //     const checkInspection = async () => {
//     //         // 1. Get user
//     //         const { data: userData, error: userError } = await supabase.auth.getUser();
//     //         if (userError || !userData?.user) {
//     //             Alert.alert('Error', "User not authenticated");
//     //             setInspectionDone(false);
//     //             return;
//     //         }
//     //         const userId = userData.user.id;

//     //         // 2. Get driver_id for user
//     //         const { data: driverData, error: driverError } = await supabase
//     //             .from('drivers')
//     //             .select('id')
//     //             .eq('user_id', userId)
//     //             .single();

//     //         if (driverError || !driverData) {
//     //             Alert.alert('Error', "Can't find driver linked to user");
//     //             setInspectionDone(false);
//     //             return;
//     //         }
//     //         const driverId = driverData.id;

//     //         // 3. Query latest inspection for this driver (full row, latest)
//     //         const { data: inspectionData, error: inspectionError } = await supabase
//     //             .from('vehicle_inspections')
//     //             .select('*')
//     //             .eq('driver_id', driverId)
//     //             .order('inspection_date', { ascending: false })
//     //             .limit(1)
//     //             .single();

//     //         if (inspectionError && inspectionError.code !== 'PGRST116') {
//     //             Alert.alert('Error', 'Failed to get inspection data');
//     //             setInspectionDone(false);
//     //             return;
//     //         }
//     //         const inspectionDate = inspectionData?.updated_at
//     //             ? new Date(inspectionData.updated_at).toISOString().slice(0, 10)
//     //             : '';
//     //         const createdDate = inspectionData?.created_at
//     //             ? new Date(inspectionData.created_at).toISOString().slice(0, 10)
//     //             : '';
//     //         const todayDate = new Date().toISOString().slice(0, 10);

//     //         if (createdDate === todayDate || inspectionDate === todayDate) {
//     //             console.log("Inspection created today, no action needed");
//     //             router.push('/(tabs)/emergency');
//     //         }
//     //         else {
//     //             console.log("Inspection not created today, redirecting... " + todayDate + " " + inspectionDate + " " + createdDate);
//     //             router.push('/(tabs)/inspection');
//     //         }
//     //         setInspectionDone(!!inspectionData);
//     //     };

//     //     checkInspection();
//     // }, []);
//     useEffect(() => {
//         const checkInspection = async () => {
//             try {
//                 const { data: userData, error: userError } = await supabase.auth.getUser();
//                 if (userError || !userData?.user) {
//                     Alert.alert('Error', "User not authenticated");
//                     return;
//                 }
//                 const userId = userData.user.id;
//                 const { data: driverData, error: driverError } = await supabase
//                     .from('drivers')
//                     .select('id')
//                     .eq('user_id', userId)
//                     .single();
//                 if (driverError || !driverData) {
//                     Alert.alert('Error', "Can't find driver linked to user");
//                     setInspectionDone(false);
//                     return;
//                 }
//                 const driverId = driverData.id;

//                 const { data: inspectionData, error: inspectionError } = await supabase
//                     .from('vehicle_inspections')
//                     .select('*')
//                     .eq('driver_id', driverId)
//                     .order('inspection_date', { ascending: false })
//                     .limit(1)
//                     .single();

//                 const inspectionDate = inspectionData?.updated_at
//                     ? new Date(inspectionData.updated_at).toISOString().slice(0, 10)
//                     : '';
//                 const createdDate = inspectionData?.created_at
//                     ? new Date(inspectionData.created_at).toISOString().slice(0, 10)
//                     : '';
//                 const todayDate = new Date().toISOString().slice(0, 10);

//                 if (createdDate === todayDate || inspectionDate === todayDate) {
//                     console.log("Inspection created today, allowing access" + todayDate + " " + inspectionDate + " " + createdDate);
//                     router.push('/(tabs)/emergency');
//                     return;
//                 } else if (createdDate !== todayDate && inspectionDate !== todayDate) {
//                     console.log("Inspection not created today, redirecting to inspection" + todayDate + " " + inspectionDate + " " + createdDate);
//                     router.push('/(tabs)/inspection');
//                     return;
//                 }
//                 console.log("Inspection data:", inspectionData);
//                 setInspectionDone(!!inspectionData);
//             } catch (error) {
//                 Alert.alert('Unexpected Error', (error as { message?: string }).message || 'Unknown error');
//                 setInspectionDone(false);
//             }
//         };

//         checkInspection();
//     }, []);

//     if (inspectionDone === null) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
//                 <Text>Loading...</Text>
//             </View>
//         );
//     }

//     if (!inspectionDone) {
//         return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
//                 <Text style={{ fontSize: 18, marginBottom: 20 }}>
//                     You need to complete a vehicle inspection before proceeding.
//                 </Text>
//                 <TouchableOpacity
//                     style={{
//                         backgroundColor: '#28a745',
//                         paddingHorizontal: 25,
//                         paddingVertical: 12,
//                         borderRadius: 8,
//                     }}
//                     onPress={() => router.push('/(tabs)/inspection')}
//                 >
//                     <Text style={{ color: 'white', fontSize: 16 }}>Go Do Inspection</Text>
//                 </TouchableOpacity>
//             </View>
//         );
//     }
//     // Define colors based on theme
//     const background = theme === 'dark' ? '#121212' : '#f0f4f8';
//     const cardBg = theme === 'dark' ? '#1e1e1e' : '#fff';
//     const textColor = theme === 'dark' ? '#fff' : '#000';
//     // Inspection done — show your EmergencyScreen UI
//     return (
//         <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
//             <View style={{ alignItems: 'center', marginBottom: 20 }}>
//                 <TouchableOpacity
//                     onPress={() => {
//                         router.push('/(tabs)');
//                         console.log('Back button pressed');
//                     }}
//                 >
//                     <Ionicons name="arrow-back" size={24} color={textColor} />
//                 </TouchableOpacity>
//             </View>

//             <Ionicons name="alert-circle" size={80} color="#e53935" style={styles.icon} />
//             <Text style={styles.title}>Breakdown Emergency</Text>
//             <Text style={styles.description}>
//                 If you are experiencing a vehicle breakdown, please press the button to access our 24/7
//                 emergency breakdown service.
//             </Text>

//             <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
//                 <View>
//                     <TouchableOpacity
//                         style={styles.actionButton}
//                         onPress={() => router.push('/(tabs)/emergency/breakdown')}
//                     >
//                         <Ionicons name="car-sport" size={24} color="#fff" />

//                     </TouchableOpacity>
//                     <Text style={{
//                         color: theme === 'dark' ? '#fff' : '#000',
//                     }}
//                     >Breakdown</Text>
//                 </View>

//                 <View>
//                     <TouchableOpacity style={styles.actionButton} onPress={callEmergency}>
//                         <Ionicons name="call-outline" size={24} color="#fff" />
//                     </TouchableOpacity>
//                     <Text style={{
//                         color: theme === 'dark' ? '#fff' : '#000',
//                     }}>Call Emergency</Text>
//                 </View>
//             </View>

//             {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
//                 <Ionicons name="location-outline" size={24} color="#888" />
//                 <Text>Your current location: Johannesburg, 123</Text>
//             </View> */}
//             <Text style={styles.note}>Stay safe and wait for assistance at a secure location.</Text>

//             <View>
//                 <TouchableOpacity
//                     style={styles.statusButton}
//                     onPress={() => {
//                         router.push('/(tabs)/emergency/status');
//                     }}
//                 >
//                     <Text style={styles.statusButtonText}>View Status</Text>
//                 </TouchableOpacity>
//             </View>
//         </ScrollView>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#f0f4f8',
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 24,
//     },
//     icon: {
//         marginBottom: 24,
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: '#e53935',
//         marginBottom: 12,
//         textAlign: 'center',
//     },
//     description: {
//         fontSize: 16,
//         color: '#333',
//         marginBottom: 32,
//         textAlign: 'center',
//     },
//     button: {
//         flexDirection: 'row',
//         backgroundColor: '#e53935',
//         // paddingVertical: 14,
//         // paddingHorizontal: 32,
//         padding: 30,
//         borderRadius: 100,
//         alignItems: 'center',
//         marginBottom: 24,
//     },
//     buttonText: {
//         color: '#fff',
//         fontSize: 18,
//         marginLeft: 10,
//         fontWeight: 'bold',
//     },
//     note: {
//         fontSize: 14,
//         color: '#888',
//         textAlign: 'center',
//     },
//     stbutton: {
//         minWidth: 120,
//         height: 48,
//         backgroundColor: "#359dff",
//         borderRadius: 999,
//         justifyContent: "center",
//         alignItems: "center",
//         shadowColor: "#359dff",
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.15,
//         shadowRadius: 4,
//         elevation: 2,
//     },
// });

// const createStyles = (theme: string) =>
//     StyleSheet.create({
//         container: {
//             flex: 1,
//             backgroundColor: theme === 'dark' ? '#121212' : '#f0f4f8',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: 24,
//         },
//         loadingContainer: {
//             flex: 1,
//             justifyContent: 'center',
//             alignItems: 'center',
//             backgroundColor: theme === 'dark' ? '#121212' : '#fff',
//         },
//         loadingText: {
//             color: theme === 'dark' ? '#fff' : '#000',
//         },
//         centeredContainer: {
//             flex: 1,
//             justifyContent: 'center',
//             alignItems: 'center',
//             padding: 20,
//             backgroundColor: theme === 'dark' ? '#121212' : '#fff',
//         },
//         inspectionPrompt: {
//             fontSize: 18,
//             marginBottom: 20,
//             color: theme === 'dark' ? '#fff' : '#000',
//             textAlign: 'center',
//         },
//         goInspectionButton: {
//             backgroundColor: '#28a745',
//             paddingHorizontal: 25,
//             paddingVertical: 12,
//             borderRadius: 8,
//         },
//         goInspectionButtonText: {
//             color: 'white',
//             fontSize: 16,
//         },
//         backButtonContainer: {
//             alignItems: 'center',
//             marginBottom: 20,
//             alignSelf: 'stretch',
//         },
//         icon: {
//             marginBottom: 24,
//             color: theme === 'dark' ? '#e53935' : '#e53935',
//         },
//         title: {
//             fontSize: 28,
//             fontWeight: 'bold',
//             color: theme === 'dark' ? '#e53935' : '#e53935',
//             marginBottom: 12,
//             textAlign: 'center',
//         },
//         description: {
//             fontSize: 16,
//             color: theme === 'dark' ? '#ccc' : '#333',
//             marginBottom: 32,
//             textAlign: 'center',
//         },
//         buttonRow: {
//             flexDirection: 'row',
//             justifyContent: 'space-around',
//             width: '100%',
//         },
//         actionButton: {
//             flexDirection: 'row',
//             backgroundColor: '#e53935',
//             padding: 30,
//             borderRadius: 100,
//             alignItems: 'center',
//             marginBottom: 24,
//         },
//         actionButtonIcon: {
//             color: '#fff',
//         },
//         actionText: {
//             textAlign: 'center',
//             color: theme === 'dark' ? '#fff' : '#000',
//         },
//         note: {
//             fontSize: 14,
//             color: theme === 'dark' ? '#888' : '#666',
//             textAlign: 'center',
//         },
//         statusButton: {
//             minWidth: 120,
//             height: 48,
//             backgroundColor: '#359dff',
//             borderRadius: 999,
//             justifyContent: 'center',
//             alignItems: 'center',
//             shadowColor: '#359dff',
//             shadowOffset: { width: 0, height: 2 },
//             shadowOpacity: 0.15,
//             shadowRadius: 4,
//             elevation: 2,
//             marginTop: 24,
//         },
//         statusButtonText: {
//             color: '#fff',
//             fontSize: 18,
//             fontWeight: 'bold',
//         },
//     });

// export default EmergencyScreenConditional;
