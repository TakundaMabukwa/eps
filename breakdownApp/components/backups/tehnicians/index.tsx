// import { Ionicons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator, Clipboard, Modal,
//     SafeAreaView, ScrollView, StyleSheet, Text,
//     TouchableOpacity, View
// } from 'react-native';
// import { supabase } from '../../utils/supabase';


// type technicain = {
//     id: number;
//     name: string;
//     phone: string;
//     email: string;
//     location: string;
//     job_allocation?: number | null;
//     status: boolean;
//     availability: string
// }

// export default function TechJobs() {
//     const [isLoading, setIsLoading] = React.useState(true);
//     const [technician, setTechnician] = React.useState<technicain | null>(null);
//     const [error, setError] = React.useState<string | null>(null);
//     const [jobs, setJobs] = React.useState<any[]>([]);
//     const [selectedJob, setSelectedJob] = React.useState<any | null>(null);
//     const [notes, setNotes] = React.useState<string>('');
//     const [selectedImages, setSelectedImages] = React.useState<{ uri: string }[]>([]);
//     const [items, setItems] = React.useState<string[]>([]);
//     const [accepted, setAccepted] = React.useState<boolean>(false);
//     const [vehicle, setVehicle] = React.useState<any[]>([]);
//     const [eta, setEta] = React.useState('');
//     const [isVisible, SetVisible] = React.useState(false)
//     const [copiedText, setCopiedText] = useState('');

//     const copyToClipboard = () => {
//         Clipboard.setString(copiedText);
//     };

//     // useEffect(() => {
//     //     const fetchTechnicianJobs = async () => {
//     //         try {
//     //             if (!technician || technician.id == null) {
//     //                 setError('Technician not found');
//     //                 setIsLoading(false);
//     //                 return;
//     //             }

//     //             const { data: jobs, error: jobsError } = await supabase
//     //                 .from('job_assignments')
//     //                 .select('*, technicians!job_assignments_technician_id_fkey(*)')
//     //                 .eq('technician_id', technician.id);

//     //             console.log('Fetched jobs:', jobs);
//     //             if (!jobs || jobs.length === 0) {
//     //                 setError('No jobs found for this technician');
//     //             }
//     //             setJobs(jobs || []);
//     //             setIsLoading(false);
//     //         } catch (error) {
//     //             console.error('Error fetching jobs:', error);
//     //             setError('Failed to fetch technician');
//     //             setIsLoading(false);
//     //         }
//     //     };

//     //     fetchTechnicianJobs();
//     // }, [technician]);


//     useEffect(() => {
//         const fetchTechnicianJobs = async () => {
//             try {
//                 const {
//                     data: { user },
//                     error: userError,
//                 } = await supabase.auth.getUser();
//                 if (userError || !user) throw userError;

//                 // Now match the user with a technician record
//                 const { data: technician, error: technicianError } = await supabase
//                     .from('technicians')
//                     .select('*')
//                     .eq('email', user.email || " ")
//                 if (technicianError) throw technicianError;

//                 if (technician && technician.length > 0) {
//                     console.log("Technician information:", technician[0]);
//                     setTechnician(technician[0] as technicain);
//                 } else {
//                     setError('Technician not found');
//                 }

//                 // setTechnician(technician as unknown as technicain);

//                 console.log('Technician information:', technician[0]?.id);

//                 let techId = technician[0]?.id;

//                 const { data: jobs, error: jobsError } = await supabase
//                     .from('assignements')
//                     .select(`*, 
//                         job_id:job_id(*),
//                         breakdowns(*),
//                         drivers(*),
//                         technicians(*),
//                         vehiclesc (*)
//                     `)
//                     .eq('tech_id', techId)
//                     .is('job_id.accepted', null);

//                 if (jobsError) {
//                     console.log(jobsError.message);
//                 }
//                 else {
//                     setJobs(jobs);
//                 }

//                 // if (jobs && jobs.length > 0 && jobs[0].job_id?.id) {
//                 //     const { data: vec, error: verror } = await supabase
//                 //         .from('vehiclesc')
//                 //         .select("*")
//                 //         .eq('job_allocated', jobs[0].job_id.id);

//                 //     if (verror) {
//                 //         console.error("Vehicle fetch error:", verror.message);
//                 //     }
//                 //     else if (vec && vec.length > 0) {
//                 //         console.log("Vehicle Reg No:", vec[0].registration_number);
//                 //         setVehicle(vec);
//                 //     } else {
//                 //         console.log("No vehicle matched.");
//                 //         setVehicle([]);
//                 //     }
//                 // }

//                 if (jobs && jobs.length > 0) {
//                     setVehicle([]);
//                     console.log("Vehicle information:", jobs[0].job_id?.vehicle_id);
//                 }

//                 if (jobs && jobs.length > 0) {
//                     const activeJobs = jobs.filter(
//                         j => j.job_id &&
//                             j.job_id.accepted === null &&
//                             j.job_id.status !== 'completed'
//                     );
//                     setJobs(activeJobs);
//                     console.log(activeJobs);
//                 } else {
//                     setJobs([]);
//                 }
//                 setIsLoading(false);
//                 // if (jobsError) throw jobsError;

//                 // if (!jobs || jobs.length === 0) {
//                 //     setError('No jobs found for this technician');
//                 // }
//                 // setJobs(jobs);
//                 // console.log('Jobs:', jobs);
//                 // setIsLoading(false);

//             } catch (error) {
//                 console.error('Error fetching jobs:', error);
//                 setError('Failed to fetch technician');
//                 setIsLoading(false);
//             }
//         };
//         fetchTechnicianJobs();
//     }, []);

//     const handleRefresh = () => {
//         setIsLoading(true);
//         setTimeout(() => {
//             // Perform your data fetching or logic here
//             setIsLoading(false); // Hide loading after 5 seconds
//         }, 5000);
//     };


//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f7' }}>
//             <ScrollView>
//                 <View style={styles.header}>
//                     <View style={styles.headerContent}>
//                         <View style={styles.titleSection}>
//                             <Text style={styles.title}>Jobs</Text>
//                             <Text style={styles.subtitle}>Scan a License Disc and Complete Job Card</Text>
//                         </View>
//                         <View style={styles.headerIcon}>
//                             <Ionicons name="document-text" size={32} color="#fff" />
//                         </View>
//                     </View>
//                 </View>

//                 {isLoading && (
//                     <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />
//                 )}
//                 {!isLoading && !error && jobs.length === 0 && (
//                     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                         <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#666" }}>
//                             No jobs assigned to you yet.
//                         </Text>
//                         <TouchableOpacity onPress={() => handleRefresh()}>
//                             <Text>Refresh</Text>
//                         </TouchableOpacity>
//                     </View>
//                 )}


//                 {!isLoading && jobs.length > 0 && (
//                     <View style={{
//                         borderRadius: 10,
//                         padding: 20,
//                         shadowColor: '#000',
//                         shadowOffset: { width: 0, height: 2 },
//                         shadowOpacity: 0.1,
//                         shadowRadius: 4,
//                         elevation: 2,
//                         margin: 10,
//                     }}>
//                         {error && <Text>{error}</Text>}
//                         {jobs
//                             .filter(job => job.accepted !== false)
//                             .map((job: any) => (
//                                 <TouchableOpacity
//                                     key={job.id}
//                                     activeOpacity={0.8}
//                                     onPress={() => setSelectedJob(job)}
//                                     style={{
//                                         backgroundColor: 'lightgreen',
//                                         borderRadius: 10,
//                                         padding: 15,
//                                         marginBottom: 15,
//                                         shadowColor: '#000',
//                                         shadowOffset: { width: 0, height: 1 },
//                                         shadowOpacity: 0.1,
//                                         shadowRadius: 2,
//                                         elevation: 1,
//                                     }}
//                                 >
//                                     {/* Job Info */}
//                                     <Text style={{ fontSize: 18, marginBottom: 8, color: '#1a3d6d' }}>{job.job_id?.job_id}</Text>
//                                     <Text style={{ fontWeight: 'bold', color: 'black' }}>Job Assignment ID: {job.job_id?.id}</Text>
//                                     <Text style={{ color: 'black' }}>Assignement ID: {job.id}</Text>
//                                     <Text style={{ color: 'black' }}>Type: {job.job_id?.emergency_type}</Text>
//                                     <Text style={{ color: 'black' }}>Description: {job.job_id?.description}</Text>
//                                     <Text style={{ color: 'black' }}>Technician: {job.technicians?.name}</Text>
//                                     <Text style={{ color: 'black' }}>Driver: {job.drivers?.first_name} {job.drivers?.cell_number}</Text>
//                                     <View style={{ marginTop: 5, marginBottom: 15 }}>
//                                         <Text style={{ color: 'black', wordWrap: 'break-word' }}>Location: {job.job_id?.location}</Text>
//                                         <Ionicons
//                                             name="copy"
//                                             size={25}
//                                             color="#1a3d6d"
//                                             onPress={() => {
//                                                 setCopiedText(job.job_id?.location || '');
//                                                 copyToClipboard();
//                                                 alert('Location copied to clipboard! :' + job.job_id?.location);
//                                             }}
//                                         />
//                                     </View>

//                                     {/* Action Buttons */}
//                                     {(job.accepted === null || job.accepted === undefined) && (
//                                         <View style={{ flexDirection: 'row', marginTop: 10 }}>
//                                             <TouchableOpacity onPress={() => {
//                                                 SetVisible(true)
//                                             }}
//                                                 // onPress={async () => {
//                                                 //     const { error } = await supabase
//                                                 //         .from('job_assignments')
//                                                 //         .update({
//                                                 //             accepted: true,
//                                                 //             technician_id: technician?.id,
//                                                 //             status: 'in-progress',
//                                                 //         })
//                                                 //         .eq('id', job.id);
//                                                 //     if (error) {
//                                                 //         alert("Issue :" + error.message)
//                                                 //     }
//                                                 //     if (!error) {
//                                                 //         setJobs(jobs =>
//                                                 //             jobs.map(j =>
//                                                 //                 j.id === job.id ? { ...j, accepted: true } : j
//                                                 //             )
//                                                 //         );
//                                                 //     }
//                                                 // }}
//                                                 style={{
//                                                     backgroundColor: '#28a745',
//                                                     padding: 10,
//                                                     borderRadius: 5,
//                                                     flex: 1,
//                                                     marginRight: 5,
//                                                 }}
//                                             >
//                                                 <Text style={{ color: 'white', textAlign: 'center' }}>Accept</Text>
//                                             </TouchableOpacity>

//                                             <TouchableOpacity
//                                                 onPress={async () => {
//                                                     const { error } = await supabase
//                                                         .from('job_assignments')
//                                                         .update({
//                                                             accepted: null,
//                                                             status: 'Breakdown Request',
//                                                             inspected: null,
//                                                             technician_id: null
//                                                         })
//                                                         .eq('id', job.job_id.id);
//                                                     const { data, error: assigError } = await supabase
//                                                         .from('assignements')
//                                                         .update({
//                                                             tech_id: null
//                                                         })
//                                                         .eq('job_id', job.job_id.id);
//                                                     console.log("Rejected", data, job.job_id.id)
//                                                     if (error || assigError) {
//                                                         alert("Issue :" + (error?.message || assigError?.message))
//                                                     }
//                                                     if (!error) {
//                                                         setJobs(jobs =>
//                                                             jobs.filter(j => j.id !== job.id)
//                                                         );
//                                                     }
//                                                 }}
//                                                 style={{
//                                                     backgroundColor: '#dc3545',
//                                                     padding: 10,
//                                                     borderRadius: 5,
//                                                     flex: 1,
//                                                 }}
//                                             >
//                                                 <Text style={{ color: 'white', textAlign: 'center' }}>Reject</Text>
//                                             </TouchableOpacity>

//                                             <Modal
//                                                 visible={isVisible}
//                                                 animationType="slide"
//                                                 onRequestClose={() => SetVisible(false)}
//                                                 transparent={false}
//                                             >
//                                                 <View style={{
//                                                     flex: 1,
//                                                     backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
//                                                     justifyContent: 'center',
//                                                     alignItems: 'center',
//                                                 }}>
//                                                     <View style={{
//                                                         width: '80%',
//                                                         backgroundColor: 'white',
//                                                         padding: 20,
//                                                         borderRadius: 10,
//                                                         elevation: 5, // shadow on android
//                                                         shadowColor: '#000', // shadow on iOS
//                                                         shadowOffset: { width: 0, height: 2 },
//                                                         shadowOpacity: 0.25,
//                                                         shadowRadius: 4,
//                                                     }}>
//                                                         <Text style={{ fontSize: 18, marginBottom: 8, color: '#1a3d6d' }}>{job.job_id?.job_id}</Text>
//                                                         <Text style={{ color: 'black' }}>Description: {job.job_id?.description}</Text>
//                                                         <Text style={styles.label}>ETA:</Text>
//                                                         <Picker
//                                                             selectedValue={eta}
//                                                             onValueChange={(itemValue) => setEta(itemValue)}
//                                                             mode="dropdown"
//                                                             style={styles.picker}
//                                                         >
//                                                             <Picker.Item label="Select ETA..." value="" />
//                                                             <Picker.Item label="10min" value="10min" />
//                                                             <Picker.Item label="20min" value="20min" />
//                                                             <Picker.Item label="1hr" value="1hr" />
//                                                         </Picker>

//                                                         <TouchableOpacity
//                                                             onPress={async () => {
//                                                                 const { data: changed, error } = await supabase
//                                                                     .from('job_assignments')
//                                                                     .update({
//                                                                         accepted: true,
//                                                                         technician_id: technician?.id,
//                                                                         status: 'Technician accepted',
//                                                                         eta: eta
//                                                                     })
//                                                                     .eq('id', job.job_id.id)
//                                                                     .select();
//                                                                 if (error) {
//                                                                     alert("Issue :" + error.message)
//                                                                 }
//                                                                 if (!error) {
//                                                                     setJobs(jobs =>
//                                                                         jobs.map(j =>
//                                                                             j.id === job.id ? { ...j, accepted: true } : j
//                                                                         )
//                                                                     );
//                                                                 }
//                                                             }}
//                                                             style={styles.acceptButton}
//                                                         >
//                                                             <Text style={styles.acceptButtonText}>Accept Job</Text>
//                                                         </TouchableOpacity>

//                                                         <TouchableOpacity onPress={
//                                                             () => {
//                                                                 SetVisible(false);
//                                                             }}
//                                                             style={styles.closeButton}
//                                                         >
//                                                             <Text style={styles.closeButtonText}>Close</Text>
//                                                         </TouchableOpacity>

//                                                     </View>
//                                                 </View>
//                                             </Modal>
//                                         </View>
//                                     )}
//                                 </TouchableOpacity>
//                             ))
//                         }

//                         {/* <Modal
//                             visible={isVisible}
//                             transparent
//                             animationType="slide"
//                             onRequestClose={() => SetVisible(false)}
//                         >
//                             <View>
//                                 <Text>ETA:</Text>
//                                 <Picker
//                                     selectedValue={eta}
//                                     onValueChange={(itemValue) => setEta(itemValue)}
//                                     mode="dropdown"
//                                 >
//                                     <Picker.Item label="Select ETA..." value="" />
//                                     <Picker.Item label="10min" value="10min" />
//                                     <Picker.Item label="20min" value="20min" />
//                                     <Picker.Item label="1hr" value="1hr" />
//                                 </Picker>
//                             </View>

//                             <TouchableOpacity
//                                 onPress={async () => {
//                                     const { error } = await supabase
//                                         .from('job_assignments')
//                                         .update({
//                                             accepted: true,
//                                             technician_id: technician?.id,
//                                             status: 'inprogress',
//                                         })
//                                         .eq('id', job.id);
//                                     if (error) {
//                                         alert("Issue :" + error.message)
//                                     }
//                                     if (!error) {
//                                         setJobs(jobs =>
//                                             jobs.map(j =>
//                                                 j.id === job.id ? { ...j, accepted: true } : j
//                                             )
//                                         );
//                                     }
//                                 }}
//                                 style={{
//                                     backgroundColor: '#28a745',
//                                     padding: 10,
//                                     borderRadius: 5,
//                                     flex: 1,
//                                     marginRight: 5,
//                                 }}
//                             >
//                                 <Text>Accept Job</Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity onPress={
//                                 ()=>{
//                                     SetVisible(false);
//                                 }
//                             }>
//                                 <Text>Close</Text>
//                             </TouchableOpacity>
//                         </Modal> */}
//                     </View >
//                 )}
//             </ScrollView >
//         </SafeAreaView >
//     );
// }

// const styles = StyleSheet.create({
//     // Header Styles
//     header: {
//         backgroundColor: '#1e40af',
//         paddingTop: 60,
//         paddingBottom: 20,
//         paddingHorizontal: 20,
//         borderBottomLeftRadius: 24,
//         borderBottomRightRadius: 24,
//     },
//     headerContent: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//     },
//     titleSection: {
//         flex: 1,
//     },
//     title: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         marginBottom: 8,
//         color: '#ffffff',
//     },
//     subtitle: {
//         fontSize: 16,
//         color: '#bfdbfe',
//         marginBottom: 24,
//     },
//     headerIcon: {
//         backgroundColor: 'rgba(255, 255, 255, 0.1)',
//         borderRadius: 20,
//         padding: 12,
//     },
//     label: {
//         marginBottom: 10,
//         fontSize: 18,
//         fontWeight: 'bold',
//     },
//     picker: {
//         marginBottom: 20,
//         color: '#1a3d6d',
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 5,
//     },
//     acceptButton: {
//         backgroundColor: '#28a745',
//         padding: 12,
//         borderRadius: 5,
//         marginBottom: 10,
//     },
//     acceptButtonText: {
//         color: 'white',
//         textAlign: 'center',
//         fontWeight: '600',
//     },
//     closeButton: {
//         padding: 12,
//         borderRadius: 5,
//     },
//     closeButtonText: {
//         color: '#333',
//         textAlign: 'center',
//     },


// });









































// import { Ionicons } from '@expo/vector-icons';
// import { Picker } from '@react-native-picker/picker';
// import * as Location from 'expo-location';
// import React, { useEffect, useState } from 'react';
// import {
//     ActivityIndicator,
//     Clipboard,
//     Modal,
//     SafeAreaView,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from 'react-native';
// import { supabase } from '../../utils/supabase';

// type Technician = {
//     id: number;
//     name: string;
//     phone: string;
//     email: string;
//     location: string;
//     job_allocation?: number | null;
//     status: boolean;
//     availability: string;
// };

// export default function TechJobs() {
//     const [isLoading, setIsLoading] = useState(true);
//     const [technician, setTechnician] = useState<Technician | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const [jobs, setJobs] = useState<any[]>([]);
//     const [selectedJob, setSelectedJob] = useState<any | null>(null);
//     const [eta, setEta] = useState('');
//     const [isVisible, setVisible] = useState(false);
//     const [copiedText, setCopiedText] = useState('');
//     const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
//     const [jobCoords, setJobCoords] = useState<{ latitude: number; longitude: number } | null>(null);

//     const copyToClipboard = () => {
//         Clipboard.setString(copiedText);
//     };

//     // Fetch technician and jobs        
//     const fetchTechnicianJobs = async () => {
//         try {
//             const { data: { user } } = await supabase.auth.getUser();
//             if (!user) throw new Error("User not found");

//             const { data: techData } = await supabase
//                 .from('technicians')
//                 .select('*')
//                 .eq('email', user.email || ' ');

//             if (techData && techData.length > 0) setTechnician(techData[0] as Technician);
//             else throw new Error("Technician not found");

//             const techId = techData[0].id;

//             const { data: jobsData } = await supabase
//                 .from('assignements')
//                 .select(`*, job_id:job_id(*), breakdowns(*), drivers(*), technicians(*), vehiclesc (*)`)
//                 .eq('tech_id', techId)
//                 .is('job_id.accepted', null);

//             if (jobsData && jobsData.length > 0) {
//                 const activeJobs = jobsData.filter(
//                     j => j.job_id && j.job_id.accepted === null && j.job_id.status !== 'completed'
//                 );
//                 setJobs(activeJobs);
//             } else {
//                 setJobs([]);
//             }
//             setIsLoading(false);
//         } catch (err: any) {
//             console.error(err);
//             setError(err.message || "Failed to fetch technician or jobs");
//             setIsLoading(false);
//         }
//     };
//     useEffect(() => {
//         fetchTechnicianJobs();
//     }, []);

//     // Get current location
//     useEffect(() => {
//         (async () => {
//             const { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== 'granted') {
//                 console.log('Location permission denied');
//                 return;
//             }
//             const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
//             setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
//         })();
//     }, []);

//     // Geocode job address to coordinates
//     useEffect(() => {
//         if (selectedJob?.job_id?.location) {
//             (async () => {
//                 try {
//                     const geocoded = await Location.geocodeAsync(selectedJob.job_id.location);
//                     if (geocoded && geocoded.length > 0) {
//                         setJobCoords({
//                             latitude: geocoded[0].latitude,
//                             longitude: geocoded[0].longitude,
//                         });
//                     } else {
//                         setJobCoords(null);
//                     }
//                 } catch (error) {
//                     console.error("Geocoding error:", error);
//                     setJobCoords(null);
//                 }
//             })();
//         }
//     }, [selectedJob]);

//     // Haversine formula for distance in km
//     const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//         const R = 6371;
//         const dLat = ((lat2 - lat1) * Math.PI) / 180;
//         const dLon = ((lon2 - lon1) * Math.PI) / 180;
//         const a =
//             Math.sin(dLat / 2) ** 2 +
//             Math.cos((lat1 * Math.PI) / 180) *
//             Math.cos((lat2 * Math.PI) / 180) *
//             Math.sin(dLon / 2) ** 2;
//         return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     };

//     const handleRefresh = () => {
//         setIsLoading(true);
//         fetchTechnicianJobs();
//         setTimeout(() => setIsLoading(false), 2000);
//     };

//     // Approx ETA in minutes assuming average speed 50 km/h
//     const getEtaMinutes = (distanceKm: number) => Math.round((distanceKm / 50) * 60);

//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f7' }}>
//             <ScrollView>
//                 <View style={styles.header}>
//                     <View style={styles.headerContent}>
//                         <View style={styles.titleSection}>
//                             <Text style={styles.title}>Jobs</Text>
//                             <Text style={styles.subtitle}>Scan a License Disc and Complete Job Card</Text>
//                         </View>
//                         <View style={styles.headerIcon}>
//                             <Ionicons name="document-text" size={32} color="#fff" />
//                         </View>
//                     </View>
//                 </View>

//                 {isLoading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />}
//                 {!isLoading && !error && jobs.length === 0 && (
//                     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//                         <Text style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: "#666" }}>
//                             No jobs assigned to you yet.
//                         </Text>
//                         <TouchableOpacity onPress={handleRefresh}>
//                             <Text>Refresh</Text>
//                         </TouchableOpacity>
//                     </View>
//                 )}

//                 {!isLoading && jobs.length > 0 && (
//                     <View style={styles.jobsContainer}>
//                         {jobs.map((job: any) => (
//                             <TouchableOpacity
//                                 key={job.id}
//                                 activeOpacity={0.8}
//                                 onPress={() => setSelectedJob(job)}
//                                 style={styles.jobCard}
//                             >
//                                 <Text style={styles.jobTitle}>{job.job_id?.job_id}</Text>
//                                 <Text style={styles.jobText}>Job Assignment ID: {job.job_id?.id}</Text>
//                                 <Text style={styles.jobText}>Type: {job.job_id?.emergency_type}</Text>
//                                 <Text style={styles.jobText}>Technician: {job.technicians?.name}</Text>
//                                 <Text style={styles.jobText}>Driver: {job.drivers?.first_name} {job.drivers?.cell_number}</Text>

//                                 <View style={{ marginTop: 5, marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
//                                     <Text style={styles.jobText}>Location: {job.job_id?.location}</Text>
//                                     <Ionicons
//                                         name="copy"
//                                         size={25}
//                                         color="#1a3d6d"
//                                         onPress={() => {
//                                             setCopiedText(job.job_id?.location || '');
//                                             copyToClipboard();
//                                             alert('Location copied to clipboard: ' + job.job_id?.location);
//                                         }}
//                                     />
//                                 </View>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                 )}

//                 {/* Job Details Modal */}
//                 {selectedJob && currentLocation && (
//                     <Modal
//                         visible={isVisible}
//                         animationType="slide"
//                         onRequestClose={() => setVisible(false)}
//                     >
//                         <View style={styles.modalContainer}>
//                             <Text style={styles.modalTitle}>{selectedJob.job_id?.job_id}</Text>
//                             <Text style={styles.jobText}>Description: {selectedJob.job_id?.description}</Text>

//                             <Text style={[styles.jobText, { marginTop: 10 }]}>
//                                 Your Location: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
//                             </Text>
//                             <Text style={styles.jobText}>
//                                 Job Location: {selectedJob.job_id?.location}
//                             </Text>

//                             {/* Estimated Distance & ETA */}
//                             {jobCoords && currentLocation && (
//                                 <Text style={[styles.jobText, { marginTop: 10 }]}>
//                                     Distance: {getDistance(currentLocation.latitude, currentLocation.longitude, jobCoords.latitude, jobCoords.longitude).toFixed(2)} km
//                                 </Text>
//                             )}
//                             {jobCoords && currentLocation && (
//                                 <Text style={[styles.jobText, { marginTop: 5 }]}>
//                                     Estimated Arrival: {getEtaMinutes(getDistance(currentLocation.latitude, currentLocation.longitude, jobCoords.latitude, jobCoords.longitude))} min
//                                 </Text>
//                             )}

//                             {/* ETA Picker */}
//                             <Text style={styles.label}>Select Estimated Arrival Time:</Text>
//                             <Picker
//                                 selectedValue={eta}
//                                 onValueChange={itemValue => setEta(itemValue)}
//                                 style={styles.picker}
//                             >
//                                 <Picker.Item label="Select ETA..." value="" />
//                                 <Picker.Item label="10min" value="10min" />
//                                 <Picker.Item label="20min" value="20min" />
//                                 <Picker.Item label="30min" value="30min" />
//                                 <Picker.Item label="1hr" value="1hr" />
//                             </Picker>

//                             {/* Accept Job */}
//                             <TouchableOpacity
//                                 onPress={async () => {
//                                     const { error } = await supabase
//                                         .from('job_assignments')
//                                         .update({
//                                             accepted: true,
//                                             technician_id: technician?.id,
//                                             status: 'Technician accepted',
//                                             eta
//                                         })
//                                         .eq('id', selectedJob.job_id.id);

//                                     if (!error) setJobs(jobs.map(j => j.id === selectedJob.id ? { ...j, accepted: true } : j));
//                                     setVisible(false);
//                                 }}
//                                 style={styles.acceptButton}
//                             >
//                                 <Text style={styles.acceptButtonText}>Accept Job</Text>
//                             </TouchableOpacity>

//                             <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
//                                 <Text style={styles.closeButtonText}>Close</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </Modal>
//                 )}
//             </ScrollView>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     header: { backgroundColor: '#1e40af', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
//     headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//     titleSection: { flex: 1 },
//     title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8, color: '#ffffff' },
//     subtitle: { fontSize: 16, color: '#bfdbfe', marginBottom: 24 },
//     headerIcon: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 12 },
//     jobsContainer: { borderRadius: 10, padding: 20, margin: 10 },
//     jobCard: { backgroundColor: 'lightgreen', borderRadius: 10, padding: 15, marginBottom: 15 },
//     jobTitle: { fontSize: 18, marginBottom: 8, color: '#1a3d6d' },
//     jobText: { color: 'black', marginBottom: 4 },
//     label: { marginBottom: 10, fontSize: 18, fontWeight: 'bold' },
//     picker: { marginBottom: 20, color: '#1a3d6d', borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
//     acceptButton: { backgroundColor: '#28a745', padding: 12, borderRadius: 5, marginBottom: 10, flex: 1, marginRight: 5 },
//     acceptButtonText: { color: 'white', textAlign: 'center', fontWeight: '600' },
//     rejectButton: { backgroundColor: '#dc3545', padding: 12, borderRadius: 5, flex: 1 },
//     closeButton: { padding: 12, borderRadius: 5 },
//     closeButtonText: { color: '#333', textAlign: 'center' },
//     modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
//     modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, color: '#1a3d6d' },
// });
