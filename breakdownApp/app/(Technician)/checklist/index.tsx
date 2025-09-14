import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput,
    TouchableOpacity, View
} from 'react-native';
import { supabase } from '../../utils/supabase';


type technicain = {
    id: number;
    name: string;
    phone: string;
    email: string;
    location: string;
    job_allocation?: number | null;
    status: boolean;
    availability: string
}

export default function Job() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [technician, setTechnician] = React.useState<technicain | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [jobs, setJobs] = React.useState<any[]>([]);
    const [selectedJob, setSelectedJob] = React.useState<any | null>(null);
    const [notes, setNotes] = React.useState<string>('');
    const [selectedImages, setSelectedImages] = React.useState<{ uri: string }[]>([]);
    const [items, setItems] = React.useState<string[]>([]);

    // Helper function to flatten job data for modal auto-fill
    function flattenJob(job: any) {
        const today = new Date();
        const dateStr = job.job_id?.date || today.toISOString().split('T')[0];
        const timeStr = job.job_id?.time || today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return {
            id: job.job_id?.id || job.id,
            date: dateStr,
            client: job.job_id?.client || '',
            contact: job.job_id?.contact || '',
            time: timeStr,
            location: job.job_id?.location || '',
            job_type: job.job_id?.job_type || '',
            vehicle_make: job.job_id?.vehicle_make || '',
            horse_fleet_no: job.job_id?.horse_fleet_no || '',
            horse_reg_no: job.job_id?.horse_reg_no || '',
            odo_reading: job.job_id?.odo_reading || '',
            mechanic: job.job_id?.mechanic || '',
            trailer_fleet_no: job.job_id?.trailer_fleet_no || '',
            trailer_reg_no: job.job_id?.trailer_reg_no || '',
            technician: job.technicians?.name || '',
            description: job.job_id?.description || '',
            status: job.job_id?.status || '',
            emergency_type: job.job_id?.emergency_type || '',
        };
    }

    useEffect(() => {
        const fetchTechnicianJobs = async () => {
            try {
                const {
                    data: { user },
                    error: userError,
                } = await supabase.auth.getUser();
                if (userError || !user) throw userError;

                // Now match the user with a technician record
                const { data: technician, error: technicianError } = await supabase
                    .from('technicians')
                    .select('*')
                    .eq('email', user.email || " ")
                    .single();
                if (technicianError) throw technicianError;

                setTechnician(technician as unknown as technicain);
                // console.log('Technician:', technician);

                const { data: jobs, error: jobsError } = await supabase
                    .from('assignements')
                    .select(`*, 
                        job_id:job_id(*),
                        breakdowns(*),
                        drivers(*),
                        technicians(*),
                        vehiclesc (*)
                    `)
                    .eq('tech_id', technician.id);

                if (jobs && jobs.length > 0) {
                    const activeJobs = jobs.filter(
                        j => j.job_id?.accepted === true && j.job_id?.job_status !== 'Done'
                    );
                    setJobs(activeJobs);
                } else {
                    setJobs([]);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching jobs:', error);
                setError('Failed to fetch technician');
                setIsLoading(false);
            }
        };
        fetchTechnicianJobs();
    }, []);
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Perform your data fetching or logic here
            setIsLoading(false); // Hide loading after 5 seconds
        }, 5000);
    };



    const saveJobCard = async () => {
        setIsLoading(true);

        if (!technician) {
            alert('Technician not found');
            setIsLoading(false);
            return;
        }
        if (!selectedJob) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const jobCardPayload = {
            job_assignment_id: selectedJob.id,
            updated_by: user.id,
            date: selectedJob.date,
            client_name: selectedJob.client,
            contact: selectedJob.contact,
            time: selectedJob.time,
            location: selectedJob.location,
            job_type: selectedJob.job_type,
            vehicle_make: selectedJob.vehicle_make,
            horse_fleet_no: selectedJob.horse_fleet_no,
            horse_reg_no: selectedJob.horse_reg_no,
            odo_reading: selectedJob.odo_reading ? parseInt(selectedJob.odo_reading) : null,
            mechanic: selectedJob.mechanic,
            trailer_fleet_no: selectedJob.trailer_fleet_no,
            trailer_reg_no: selectedJob.trailer_reg_no,
            technician: selectedJob.technician,
            description: selectedJob.description,
            notes: notes,
            updated_at: new Date().toISOString(),
        };

        const { data: upserted, error } = await supabase
            .from('job_card')
            .upsert(jobCardPayload)
            .select()
            .maybeSingle();

        if (error) {
            console.error("JobCard upsert error:", error);
            setIsLoading(false);
            return;
        }

        const { data: job_update, error: updateError } = await supabase
            .from('job_assignments')
            .update({
                job_status: "Done",
                status: "completed",
                completed_at: new Date().toISOString()
            })
            .eq('id', selectedJob.id);

        if (updateError) {
            console.error("Job assignment update error:", updateError);
            setIsLoading(false);
            return;
        }

        console.log("Upserted job_card:", upserted);
        console.log("Updated job_assignments:", job_update);

        alert('Job Completed card saved successfully!');
        setSelectedJob(null);
        setNotes('');
        setSelectedImages([]);
        setItems([]);
        setJobs(prevJobs => prevJobs.filter(j => j.id !== selectedJob.id));
        setIsLoading(false);
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
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
                        <Text style={{ textAlign: "center", marginTop: 20, fontSize: 16, color: "#666" }}>
                            No jobs assigned to you yet.
                        </Text>
                        <TouchableOpacity onPress={() => handleRefresh()}>
                            <Text className='text-center'>Refresh</Text>
                        </TouchableOpacity>
                    </View>

                )}

                {!isLoading && !error && jobs.length > 0 && (
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
                        {jobs.map((job: any) => (
                            <View key={job.id}
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
                                <Text style={{ fontSize: 18, marginBottom: 8, color: '#1a3d6d' }}>
                                    {job.job_id?.job_id || `Job ID ${job.job_id?.id}`}
                                </Text>

                                <Text style={{ fontWeight: 'bold', color: 'black' }}>Job Assignment ID: {job?.job_id.id}</Text>
                                <Text style={{ color: 'black' }}>Assignement Row ID: {job.id}</Text>
                                <Text style={{ color: 'black' }}>Type:{job.job_id.emergency_type || 'No type'}</Text>
                                <Text style={{ color: 'black' }}>Description: {job.job_id.description}</Text>
                                <Text style={{ color: 'black' }}>Technician: {job.technicians.name}</Text>
                                <View>
                                    <Text style={{ color: 'black' }}>Technician ID: {job.technicians.id}</Text>
                                </View>

                                <View>
                                    <Text style={{ color: 'black' }}>Job Status: {job.job_id.status}</Text>
                                    {job.job_id?.inspected === null || job.job_id?.inspected === false ? (
                                        <View>
                                            <TouchableOpacity
                                                onPress={() => router.push({
                                                    pathname: "/(Technician)/checklist/inspect",
                                                    params: { jobId: Number(job.job_id.id) }
                                                })}
                                                style={{
                                                    backgroundColor: '#ff9800',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    marginTop: 10,
                                                }}>
                                                <Text style={{ color: 'white', textAlign: 'center' }}>Go to start job</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View>
                                            <Pressable
                                                onPress={
                                                    () => router.push({ pathname: "/(Technician)/checklist/proofScreen", params: { jobId: String(job.job_id.id) } })
                                                }
                                                style={{
                                                    backgroundColor: '#28a745',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    marginTop: 10,
                                                }}>
                                                <Text style={{ color: 'white', textAlign: 'center' }}>Upload Proof</Text>
                                            </Pressable>
                                            <TouchableOpacity
                                                onPress={() => setSelectedJob(flattenJob(job))}
                                                style={{
                                                    backgroundColor: '#007bff',
                                                    padding: 10,
                                                    borderRadius: 5,
                                                    marginTop: 10,
                                                }}>
                                                <Text style={{ color: 'white', textAlign: 'center' }}>Update Job Card</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <Modal
                visible={!!selectedJob}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedJob(null)}
            >
                <View
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        padding: 10,
                    }}
                >
                    <ScrollView
                        contentContainerStyle={{
                            paddingVertical: 1,
                        }}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                    >
                        <View
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                padding: 20,
                            }}
                        >
                            {selectedJob && (
                                <>
                                    <Text style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 8, color: '#1a3d6d' }}>
                                        Job Card
                                    </Text>
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ color: '#333', fontWeight: 'bold' }}>Job ID: <Text style={{ fontWeight: 'normal' }}>{selectedJob.id}</Text></Text>
                                        <Text style={{ color: '#333' }}>Type: {selectedJob.emergency_type}</Text>
                                        <Text style={{ color: '#333' }}>Status: {selectedJob.status}</Text>
                                        <Text style={{ color: '#333' }}>Description: {selectedJob.description}</Text>
                                    </View>
                                    <View style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        marginBottom: 12,
                                    }}>
                                        <View style={{ flex: 1, marginRight: 8 }}>
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Date</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="YYYY-MM-DD"
                                                keyboardType="default"
                                                value={selectedJob?.date || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, date: text })}

                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Client</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Client Name"
                                                value={selectedJob?.client_name || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, client_name: text })}

                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Contact</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Contact"
                                                keyboardType="phone-pad"
                                                value={selectedJob?.contact || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, contact: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Time</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="HH:MM"
                                                keyboardType="default"
                                                value={selectedJob?.time || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, time: text })}

                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Location</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Location"
                                                value={selectedJob?.location || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, location: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Job Type</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Job Type"
                                                value={selectedJob?.job_type || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, job_type: text })}
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Vehicle Make</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Vehicle Make"
                                                value={selectedJob?.vehicle_make || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, vehicle_make: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Horse Fleet no</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Horse Fleet no"
                                                value={selectedJob?.horse_fleet_no || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, horse_fleet_no: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Horse Reg no</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Horse Reg no"
                                                value={selectedJob?.horse_reg_no || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, horse_reg_no: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>ODO Reading</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="ODO Reading"
                                                keyboardType="numeric"
                                                value={selectedJob?.odo_reading ? selectedJob.odo_reading.toString() : ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, odo_reading: text })}

                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Mechanic</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Mechanic"
                                                value={selectedJob?.mechanic || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, mechanic: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Trailer Fleet no</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Trailer Fleet no"
                                                value={selectedJob?.trailer_fleet_no || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, trailer_fleet_no: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Trailer Reg no</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Trailer Reg no"
                                                value={selectedJob?.trailer_reg_no || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, trailer_reg_no: text })}
                                            />
                                            <Text style={{ color: '#555', marginBottom: 2 }}>Technician</Text>
                                            <TextInput
                                                style={{
                                                    borderColor: '#e0e0e0',
                                                    borderWidth: 1,
                                                    borderRadius: 6,
                                                    padding: 6,
                                                    marginBottom: 4,
                                                    color: '#222',
                                                    backgroundColor: '#f9f9f9',
                                                }}
                                                placeholder="Technician"
                                                value={selectedJob?.technician || ''}
                                                onChangeText={text => setSelectedJob({ ...selectedJob, technician: text })}
                                            />
                                        </View>
                                    </View>
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
                                            Client Instructions & Requirements
                                        </Text>
                                        <TextInput
                                            style={{
                                                borderColor: '#e0e0e0',
                                                borderWidth: 1,
                                                borderRadius: 8,
                                                padding: 10,
                                                minHeight: 60,
                                                color: '#222',
                                                backgroundColor: '#f9f9f9',
                                                marginBottom: 4,
                                            }}
                                            multiline
                                            value={selectedJob.description}
                                            onChangeText={(text) => setSelectedJob({ ...selectedJob, description: text })}
                                        />
                                    </View>
                                    {/* Dynamic Items Section */}
                                    {/* <View style={{ marginBottom: 12 }}> */}
                                    {/* <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
                                            Items to Send Along
                                        </Text> */}
                                    {/* <ItemListInput items={items} setItems={setItems} /> */}
                                    {/* </View> */}

                                    {/* Notes */}
                                    <View style={{ marginBottom: 12 }}>
                                        <Text style={{ color: '#1a3d6d', fontWeight: 'bold', marginBottom: 4 }}>
                                            Additional Notes
                                        </Text>
                                        <TextInput
                                            style={{
                                                borderColor: '#e0e0e0',
                                                borderWidth: 1,
                                                borderRadius: 8,
                                                padding: 10,
                                                minHeight: 60,
                                                color: '#222',
                                                backgroundColor: '#f9f9f9',
                                            }}
                                            placeholder="Add notes..."
                                            placeholderTextColor="#888"
                                            multiline
                                            value={notes}
                                            onChangeText={setNotes}
                                        />
                                    </View>

                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
                                        <TouchableOpacity
                                            onPress={saveJobCard}
                                            style={{
                                                backgroundColor: '#1976d2',
                                                paddingVertical: 12,
                                                paddingHorizontal: 24,
                                                borderRadius: 8,
                                                marginRight: 10
                                            }}>
                                            <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                                {isLoading ? "Submitting..." : "Submit Card"}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setSelectedJob(null)}
                                            style={{
                                                backgroundColor: '#e0e0e0',
                                                paddingVertical: 12,
                                                paddingHorizontal: 24,
                                                borderRadius: 8
                                            }}>
                                            <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </Modal>
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
});