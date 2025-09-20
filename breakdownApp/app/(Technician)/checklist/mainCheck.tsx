import { supabase } from '@/app/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InspectChecklist() {
    const { jobId } = useLocalSearchParams<{ jobId: string }>();
    const [jobType, setJobType] = useState('');
    const [issue, setIssue] = useState('');
    const [parts, setParts] = useState<string[]>([]);
    const [newPart, setNewPart] = useState('');
    // const [estimatedCost, setEstimatedCost] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { registration_number } = useLocalSearchParams();

    const handleAddPart = () => {
        if (newPart.trim()) {
            setParts([...parts, newPart.trim()]);
            setNewPart('');
        }
    };

    const handleRemovePart = (index: number) => {
        setParts(parts.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!jobType || !issue || parts.length === 0 || !estimatedTime) {
            Alert.alert('Validation Error', 'Please fill all required fields.');
            return;
        }

        setIsSubmitting(true);
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user || !user.email) {
                Alert.alert('Error', 'User not authenticated');
                setIsSubmitting(false);
                return;
            }
            const { data: technician } = await supabase
                .from('technicians')
                .select('*')
                .eq('email', user?.email)
                .single();

            const { data: job } = await supabase
                .from('job_assignments')
                .select('*')
                .eq('id', Number(jobId))
                .single();

            const jobidNum = jobId ? parseInt(jobId) : null;
            console.log("Job ID:", jobidNum);

            const quotationData = {
                job_type: jobType,
                issue,
                parts_needed: parts,
                estimated_time: estimatedTime,
                additional_notes: additionalNotes,
                status: 'pending',
                created_by: user.id,
                created_at: new Date().toISOString(),
                job_id: job?.id,
                breakdown_id: registration_number ? registration_number.toString() : null,
                type: technician?.type,
            };


            const { data, error } = await supabase
                .from('quotations')
                .insert(quotationData)
                .select();

            console.log("Quotation insert response:", { data, error });

            const { data: jobstat, error: joberror } = await supabase
                .from('job_assignments')
                .update({
                    status: 'Technician working'
                })
                .eq('id', jobidNum!);


            if (error) {
                Alert.alert('Error', `Failed to save: ${error.message}`);
            } else {
                Alert.alert('Success', 'Job record saved successfully!');
                setJobType('');
                setIssue('');
                setParts([]);
                setNewPart('');
                // setEstimatedCost('');
                setEstimatedTime('');
                setAdditionalNotes('');
                router.navigate("/(Technician)/checklist")
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Job Record Form</Text>
                        <Text style={styles.subtitle}>Record job details and required parts</Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <Ionicons name="clipboard" size={32} color="#fff" />
                    </View>
                </View>
            </View>

            <ScrollView style={styles.scrollView}>
                <View style={styles.formContainer}>
                    {/* Job Type */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Job Type *</Text>
                        <View style={styles.dropdownContainer}>
                            {['electrical', 'towing', 'mechanical'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.dropdownOption,
                                        jobType === type && styles.dropdownOptionActive,
                                    ]}
                                    onPress={() => setJobType(type)}
                                >
                                    <Text
                                        style={[
                                            styles.dropdownText,
                                            jobType === type && styles.dropdownTextActive,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                    {jobType === type && (
                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Issue Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Issue Description *</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe the problem in detail..."
                            value={issue}
                            onChangeText={setIssue}
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {/* Parts Needed */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Parts Needed</Text>
                        <View style={styles.partsContainer}>
                            <View style={styles.addPartRow}>
                                <TextInput
                                    style={styles.partInput}
                                    placeholder="Enter part name..."
                                    value={newPart}
                                    onChangeText={setNewPart}
                                />
                                <TouchableOpacity style={styles.addButton} onPress={handleAddPart}>
                                    <Ionicons name="add" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                            {parts.map((part, index) => (
                                <View key={index} style={styles.partItem}>
                                    <Text style={styles.partText}>{part}</Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemovePart(index)}
                                        style={styles.removeButton}
                                    >
                                        <Ionicons name="close" size={16} color="#dc3545" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Estimated Cost */}
                    {/* <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Cost (R)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={estimatedCost}
                            onChangeText={setEstimatedCost}
                            keyboardType="numeric"
                        />
                    </View> */}

                    {/* Estimated Time */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Time *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 2 hours, 1 day"
                            value={estimatedTime}
                            onChangeText={setEstimatedTime}
                        />
                    </View>

                    {/* Additional Notes */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Notes</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Any additional information..."
                            value={additionalNotes}
                            onChangeText={setAdditionalNotes}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Submit Button */}
                    <Pressable onPress={handleSubmit} disabled={isSubmitting}>
                        <Text style={{ color: '#fff', textAlign: 'center', padding: 12, backgroundColor: '#1e40af', borderRadius: 8, fontWeight: 'bold' }}>
                            {isSubmitting ? 'Submitting...' : 'Save'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
    },
    header: {
        backgroundColor: '#1e40af',
        paddingTop: 40,
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
    scrollView: {
        flex: 1,
    },
    formContainer: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a3d6d',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#fff',
        minHeight: 40,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#dc3545',
    },
    errorText: {
        color: '#dc3545',
        fontSize: 12,
        marginTop: 4,
    },
    partsContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    addPartRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    partInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 6,
        padding: 8,
        marginRight: 8,
        fontSize: 14,
    },
    addButton: {
        backgroundColor: '#28a745',
        borderRadius: 6,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },
    partItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
    },
    partText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    removeButton: {
        padding: 4,
    },
    priorityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    priorityButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    priorityButtonActive: {
        backgroundColor: '#1e40af',
        borderColor: '#1e40af',
    },
    priorityText: {
        fontSize: 14,
        color: '#666',
    },
    priorityTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#1e40af',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: -30,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dropdownContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        padding: 4,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        marginVertical: 4,
        backgroundColor: '#f0f0f0',
    },
    dropdownOptionActive: {
        backgroundColor: '#1e40af',
        borderColor: '#1e40af',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
        marginRight: 8,
    },
    dropdownTextActive: {
        color: '#fff',
        fontWeight: '600',
    },
});
