import { supabase } from '@/app/utils/supabase';
import { decode as atob } from 'base-64';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type jobAssignment = {
    id: number;
    description: string | null;
    location: string | null;
    attachment: string[] | null;
    status: string;
    job_id: string;
    updated_at: string;
    created_by: string | null;
};

export default function Status() {
    const [loading, setLoading] = useState(true);
    const [jobStatus, setJobStatus] = useState<jobAssignment[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState<jobAssignment | null>(null);
    const [editIssue, setEditIssue] = useState('');
    const [editLocation, setEditLocation] = useState('');
    const [editAttachments, setEditAttachments] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id ?? null);
        };

        const fetchStatus = async () => {
            if (!userId) return;
            const { data, error } = await supabase
                .from('job_assignments')
                .select('*')
                .eq('created_by', userId)
                .order('updated_at', { ascending: false });
            if (error) console.error('Error fetching job status:', error);
            if (data) setJobStatus(data as unknown as jobAssignment[]);
            setLoading(false);
        };

        fetchUser();
        if (userId) fetchStatus();
    }, [userId]);

    const openEditModal = (job: jobAssignment) => {
        setSelectedJob(job);
        setEditIssue(job.description || '');
        setEditLocation(job.location || '');
        setEditAttachments(job.attachment || []);
        setModalVisible(true);
    };

    const addAttachments = async () => {
        if (!selectedJob) return;
        let response = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!response.canceled && response.assets?.length) {
            const uploadedPaths: string[] = [];
            for (let i = 0; i < response.assets.length; i++) {
                const uri = response.assets[i].uri;
                const fileName = uri.split('/').pop()!;
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let j = 0; j < binary.length; j++) bytes[j] = binary.charCodeAt(j);

                const { data, error } = await supabase.storage
                    .from('images')
                    .upload(`attachments/${selectedJob.id}/${fileName}`, bytes, { contentType: 'image/jpeg', upsert: true });

                if (!error) uploadedPaths.push(data.path);
            }
            setEditAttachments(prev => [...prev, ...uploadedPaths]);
        }
    };

    const saveChanges = async () => {
        if (!selectedJob) return;
        setIsSaving(true);

        try {
            const { error } = await supabase
                .from('job_assignments')
                .update({
                    description: editIssue,
                    location: editLocation,
                    attachments: editAttachments,
                })
                .eq('id', selectedJob.id);

            if (error) {
                console.error('Supabase error:', error.message);
                Alert.alert('Error', error.message);
                return;
            }

            console.log(`Job ${selectedJob.id} updated successfully!`);
            Alert.alert('Success', 'Job updated successfully!');
            setModalVisible(false);
            setSelectedJob(null);
        } catch (err) {
            console.error('Unexpected error updating job:', err);
            Alert.alert('Error', 'Failed to update job.');
        } finally {
            setIsSaving(false);
        }
    };


    if (loading) return <ActivityIndicator size="large" color="red" />;

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f0f0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push('/(tabs)/emergency')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Emergency Job Status</Text>
                <Text style={styles.subtitle}>🔧 Issue Progress Tracker</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {jobStatus.length === 0 ? (
                    <Text style={styles.noData}>No job status available.</Text>
                ) : (
                    jobStatus.map(job => (
                        <TouchableOpacity key={job.id} onPress={() => openEditModal(job)}>
                            <View style={styles.card}>
                                <Text style={styles.cardStatus}>
                                    Status: <Text style={styles.statusValue}>{job.status}</Text>
                                </Text>
                                <Text style={styles.cardDate}>Last Updated: {new Date(job.updated_at).toLocaleString()}</Text>
                                <Text style={styles.cardJobId}>Job ID: {job.job_id}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Job</Text>

                        <Text style={styles.label}>Issue for Job {selectedJob?.job_id}</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            value={editIssue}
                            onChangeText={setEditIssue}
                        />

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            value={editLocation}
                            onChangeText={setEditLocation}
                        />

                        <Text style={styles.label}>Attachments</Text>
                        <TouchableOpacity onPress={addAttachments}>
                            <Text style={styles.addAttachment}>Add Attachments</Text>
                        </TouchableOpacity>

                        <ScrollView horizontal style={{ marginTop: 8 }}>
                            {isSaving ? (
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 }}>
                                    <ActivityIndicator size="small" color="black" />
                                    <Text style={{ marginLeft: 8, color: '#555' }}>Updating attachments...</Text>
                                </View>
                            ) : editAttachments?.length ? (
                                editAttachments.map((att, i) => (
                                    <Text key={i} style={styles.attachmentItem}>{att.split('/').pop()}</Text>
                                ))
                            ) : (
                                <Text style={styles.attachmentItem}>No attachments</Text>
                            )}
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
                                <Text style={styles.buttonText}>{isSaving ? 'Saving...' : 'Save'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
    header: {
        marginTop: 10,
        paddingTop: 20,
        paddingHorizontal: 24,
        paddingBottom: 10,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    backButton: { position: 'absolute', left: 20, top: 20 },
    backButtonText: { color: 'black' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#777', marginTop: 4 },
    scrollContainer: { padding: 20 },
    noData: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 40 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    cardStatus: { fontSize: 16, fontWeight: '600', marginBottom: 6, color: '#333' },
    statusValue: { color: '#007AFF', fontWeight: 'bold' },
    cardDate: { fontSize: 14, color: '#666', marginBottom: 4 },
    cardJobId: { fontSize: 13, color: '#888' },

    // Modal
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    label: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
    textArea: {
        minHeight: 80,
        borderWidth: 1,
        borderColor: '#d1e3f6',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1e3f6',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    addAttachment: { color: '#007AFF', fontWeight: 'bold', marginTop: 4 },
    attachmentItem: { marginRight: 10, color: '#555' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    saveButton: {
        flex: 1,
        backgroundColor: '#359dff',
        padding: 12,
        borderRadius: 8,
        marginRight: 8,
        alignItems: 'center',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginLeft: 8,
        alignItems: 'center',
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
});
