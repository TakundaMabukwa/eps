import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Clipboard, Modal,
    SafeAreaView, ScrollView, StyleSheet, Text,
    TouchableOpacity, View
} from 'react-native';
import { supabase } from '../../utils/supabase';

type Technician = {
    id: number;
    name: string;
    phone: string;
    email: string;
    location: string;
    job_allocation?: number | null;
    status: boolean;
    availability: string;
};

export default function TechJobs() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [technician, setTechnician] = React.useState<Technician | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [jobs, setJobs] = React.useState<any[]>([]);
    const [selectedJob, setSelectedJob] = React.useState<any | null>(null);
    const [eta, setEta] = React.useState('');
    const [isVisible, SetVisible] = React.useState(false)
    const [copiedText, setCopiedText] = useState('');
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [jobCoords, setJobCoords] = useState<{ latitude: number; longitude: number } | null>(null);


    // Fetch technician and jobs        
    const fetchTechnicianJobs = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not found");

            const { data: techData } = await supabase
                .from('technicians')
                .select('*')
                .eq('email', user.email || ' ');

            if (techData && techData.length > 0) setTechnician(techData[0] as Technician);
            else throw new Error("Technician not found");

            const techId = techData[0].id;

            const { data: jobsData } = await supabase
                .from('assignements')
                .select(`*, job_id:job_id(*), breakdowns(*), drivers(*), technicians(*), vehiclesc (*)`)
                .eq('tech_id', techId)
                .is('job_id.accepted', null);

            if (jobsData && jobsData.length > 0) {
                const activeJobs = jobsData.filter(
                    j => j.job_id && j.job_id.accepted === null && j.job_id.status !== 'completed'
                );
                setJobs(activeJobs);
            } else {
                setJobs([]);
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch technician or jobs");
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchTechnicianJobs();
    }, []);

    // Get current location
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                return;
            }
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        })();
    }, []);

    // Geocode job address to coordinates
    useEffect(() => {
        if (selectedJob?.job_id?.location) {
            (async () => {
                try {
                    const geocoded = await Location.geocodeAsync(selectedJob.job_id.location);
                    if (geocoded && geocoded.length > 0) {
                        setJobCoords({
                            latitude: geocoded[0].latitude,
                            longitude: geocoded[0].longitude,
                        });
                    } else {
                        setJobCoords(null);
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                    setJobCoords(null);
                }
            })();
        }
    }, [selectedJob]);

    // Haversine formula for distance in km
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const handleRefresh = () => {
        setIsLoading(true);
        fetchTechnicianJobs();
        setTimeout(() => setIsLoading(false), 2000);
    };

    // Approx ETA in minutes assuming average speed 50 km/h
    const getEtaMinutes = (distanceKm: number) => Math.round((distanceKm / 50) * 60);

    const copyToClipboard = () => {
        Clipboard.setString(copiedText);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f7' }}>
            <ScrollView>
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>Jobs</Text>
                            <Text style={styles.subtitle}>Scan a License Disc and Complete Job Card</Text>
                        </View>
                        <View style={styles.headerIcon}>
                            <Ionicons name="document-text" size={32} color="#fff" />
                        </View>
                    </View>
                </View>

                {isLoading && (
                    <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />
                )}
                {!isLoading && !error && jobs.length === 0 && (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#666" }}>
                            No jobs assigned to you yet.
                        </Text>
                        <TouchableOpacity onPress={() => handleRefresh()}>
                            <Text>Refresh</Text>
                        </TouchableOpacity>
                    </View>
                )}


                {!isLoading && jobs.length > 0 && (
                    <View style={{
                        borderRadius: 10,
                        padding: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        elevation: 2,
                        margin: 10,
                    }}>
                        {error && <Text>{error}</Text>}
                        {jobs
                            .filter(job => job.accepted !== false)
                            .map((job: any) => (
                                <TouchableOpacity
                                    key={job.id}
                                    activeOpacity={0.8}
                                    onPress={() => setSelectedJob(job)}
                                    style={{
                                        backgroundColor: 'lightgreen',
                                        borderRadius: 10,
                                        padding: 15,
                                        marginBottom: 15,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 1 },
                                        shadowOpacity: 0.1,
                                        shadowRadius: 2,
                                        elevation: 1,
                                    }}
                                >
                                    {/* Job Info */}
                                    <Text style={{ fontSize: 18, marginBottom: 8, color: '#1a3d6d' }}>{job.job_id?.job_id}</Text>
                                    <Text style={{ fontWeight: 'bold', color: 'black' }}>Job Assignment ID: {job.job_id?.id}</Text>
                                    <Text style={{ color: 'black' }}>Assignement ID: {job.id}</Text>
                                    <Text style={{ color: 'black' }}>Type: {job.job_id?.emergency_type}</Text>
                                    <Text style={{ color: 'black' }}>Description: {job.job_id?.description}</Text>
                                    <Text style={{ color: 'black' }}>Technician: {job.technicians?.name}</Text>
                                    <Text style={{ color: 'black' }}>Driver: {job.drivers?.first_name} {job.drivers?.cell_number}</Text>
                                    <View style={{ marginTop: 5, marginBottom: 15 }}>
                                        <Text style={{ color: 'black', wordWrap: 'break-word' }}>Location: {job.job_id?.location}</Text>
                                        <Ionicons
                                            name="copy"
                                            size={25}
                                            color="#1a3d6d"
                                            onPress={() => {
                                                setCopiedText(job.job_id?.location || '');
                                                copyToClipboard();
                                                alert('Location copied to clipboard! :' + job.job_id?.location);
                                            }}
                                        />
                                    </View>

                                    {/* Action Buttons */}
                                    {(job.accepted === null || job.accepted === undefined) && (
                                        <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                            <TouchableOpacity onPress={() => {
                                                SetVisible(true)
                                                setSelectedJob(job)
                                            }}
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    flex: 1,
                                                    marginRight: 5,
                                                }}
                                            >
                                                <Text style={{ color: 'white', textAlign: 'center' }}>Accept</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const { error } = await supabase
                                                        .from('job_assignments')
                                                        .update({
                                                            accepted: null,
                                                            status: 'Breakdown Request',
                                                            inspected: null,
                                                            technician_id: null
                                                        })
                                                        .eq('id', job.job_id.id);
                                                    const { data, error: assigError } = await supabase
                                                        .from('assignements')
                                                        .update({
                                                            tech_id: null
                                                        })
                                                        .eq('job_id', job.job_id.id);
                                                    console.log("Rejected", data, job.job_id.id)
                                                    if (error || assigError) {
                                                        alert("Issue :" + (error?.message || assigError?.message))
                                                    }
                                                    if (!error) {
                                                        setJobs(jobs =>
                                                            jobs.filter(j => j.id !== job.id)
                                                        );
                                                    }
                                                }}
                                                style={{
                                                    backgroundColor: '#dc3545',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    flex: 1,
                                                }}
                                            >
                                                <Text style={{ color: 'white', textAlign: 'center' }}>Reject</Text>
                                            </TouchableOpacity>

                                            {/* Job Details Modal */}
                                            {selectedJob && currentLocation && (
                                                <Modal
                                                    visible={isVisible}
                                                    animationType="slide"
                                                    onRequestClose={() => SetVisible(false)}
                                                    transparent={false}
                                                >
                                                    <View style={{
                                                        flex: 1,
                                                        backgroundColor: 'rgba(0,0,0,0.5)', // semi-transparent overlay
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        <View style={{
                                                            width: '80%',
                                                            backgroundColor: 'white',
                                                            padding: 20,
                                                            borderRadius: 10,
                                                            elevation: 5, // shadow on android
                                                            shadowColor: '#000', // shadow on iOS
                                                            shadowOffset: { width: 0, height: 2 },
                                                            shadowOpacity: 0.25,
                                                            shadowRadius: 4,
                                                        }}>
                                                            <Text style={{ fontSize: 18, marginBottom: 8, color: '#1a3d6d' }}>{job.job_id?.job_id}</Text>
                                                            <Text style={{ color: 'black' }}>Description: {job.job_id?.description}</Text>
                                                            <Text style={[styles.jobText, { marginTop: 10 }]}>
                                                                Your Location: {currentLocation.latitude.toFixed(5)}, {currentLocation.longitude.toFixed(5)}
                                                            </Text>
                                                            <Text style={styles.jobText}>
                                                                Job Location: {selectedJob.job_id?.location}
                                                            </Text>

                                                            {/* Estimated Distance & ETA */}
                                                            {jobCoords && currentLocation && (
                                                                <Text style={[styles.jobText, { marginTop: 10 }]}>
                                                                    Distance: {getDistance(currentLocation.latitude, currentLocation.longitude, jobCoords.latitude, jobCoords.longitude).toFixed(2)} km
                                                                </Text>
                                                            )}
                                                            {jobCoords && currentLocation && (
                                                                <Text style={[styles.jobText, { marginTop: 5 }]}>
                                                                    Estimated Arrival: {getEtaMinutes(getDistance(currentLocation.latitude, currentLocation.longitude, jobCoords.latitude, jobCoords.longitude))} min
                                                                </Text>
                                                            )}

                                                            <Text style={styles.label}>ETA:</Text>
                                                            <Picker
                                                                selectedValue={eta}
                                                                onValueChange={(itemValue) => setEta(itemValue)}
                                                                mode="dropdown"
                                                                style={styles.picker}
                                                            >
                                                                <Picker.Item label="Select ETA..." value="" />
                                                                <Picker.Item label="10min" value="10min" />
                                                                <Picker.Item label="20min" value="20min" />
                                                                <Picker.Item label="1hr" value="1hr" />
                                                            </Picker>

                                                            <TouchableOpacity
                                                                onPress={async () => {
                                                                    const { data: changed, error } = await supabase
                                                                        .from('job_assignments')
                                                                        .update({
                                                                            accepted: true,
                                                                            technician_id: technician?.id,
                                                                            status: 'Technician accepted',
                                                                            eta: eta
                                                                        })
                                                                        .eq('id', job.job_id.id)
                                                                        .select();
                                                                    if (error) {
                                                                        alert("Issue :" + error.message)
                                                                    }
                                                                    if (!error) {
                                                                        setJobs(jobs =>
                                                                            jobs.map(j =>
                                                                                j.id === job.id ? { ...j, accepted: true } : j
                                                                            )
                                                                        );
                                                                    }
                                                                }}
                                                                style={styles.acceptButton}
                                                            >
                                                                <Text style={styles.acceptButtonText}>Accept Job</Text>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity onPress={
                                                                () => {
                                                                    SetVisible(false);
                                                                }}
                                                                style={styles.closeButton}
                                                            >
                                                                <Text style={styles.closeButtonText}>Close</Text>
                                                            </TouchableOpacity>

                                                        </View>
                                                    </View>
                                                </Modal>
                                            )}
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))
                        }
                    </View >
                )}
            </ScrollView >
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    // Header Styles
    header: {
        backgroundColor: '#1e40af',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#ffffff',
    },
    subtitle: {
        fontSize: 16,
        color: '#bfdbfe',
        marginBottom: 24,
    },
    headerIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        padding: 12,
    },
    label: {
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
    picker: {
        marginBottom: 20,
        color: '#1a3d6d',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    acceptButton: {
        backgroundColor: '#28a745',
        padding: 12,
        borderRadius: 5,
        marginBottom: 10,
    },
    acceptButtonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: '600',
    },
    closeButton: {
        padding: 12,
        borderRadius: 5,
    },
    closeButtonText: {
        color: '#333',
        textAlign: 'center',
    },
    jobText: { color: 'black', marginBottom: 4 },

});























