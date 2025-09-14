import ScannerDriver from '@/components/scanner/scannerDriver';
import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
// 
const checkLicenseDiscFromDB = async (imageUri: string) => {
    return new Promise<{ found: boolean; details?: string }>((resolve) =>
        setTimeout(() => resolve({ found: Math.random() > 0.5, details: 'License: ABC123, Exp: 2025-12-31' }), 1500)
    );
};

export type SelectedVehicleContextType = {
    registrationNumber: string;
    setRegistrationNumber: (reg: string) => void;
};

export const SelectedVehicleContext = createContext<SelectedVehicleContextType | undefined>(undefined);

export const useSelectedVehicle = () => {
    const context = useContext(SelectedVehicleContext);
    if (!context) throw new Error('useSelectedVehicle must be used within SelectedVehicleProvider');
    return context;
};

export const SelectedVehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [registrationNumber, setRegistrationNumber] = useState('');
    return (
        <SelectedVehicleContext.Provider value={{ registrationNumber, setRegistrationNumber }}>
            {children}
        </SelectedVehicleContext.Provider>
    );
};

export default function TechHome() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();

    const isPermissionGranted = Boolean(permission?.granted);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [checking, setChecking] = useState(false);
    const [dbResult, setDbResult] = useState<{ found: boolean; details?: string } | null>(null);

    const handleImage = async (uri: string) => {
        setSelectedImage(uri);
        setDbResult(null);
        setChecking(true);
        try {
            const result = await checkLicenseDiscFromDB(uri);
            setDbResult(result);
        } catch (e) {
            Alert.alert('Error', 'Failed to check license disc.');
        }
        setChecking(false);
    };

    const openImagePicker = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage || 'Unknown error');
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    const uri = response.assets[0].uri;
                    if (uri) handleImage(uri);
                }
            }
        );
    };

    const openCamera = () => {
        launchCamera(
            {
                mediaType: 'photo',
                includeBase64: false,
                maxHeight: 2000,
                maxWidth: 2000,
            },
            (response: ImagePickerResponse) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage || 'Unknown error');
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    const uri = response.assets[0].uri;
                    if (uri) handleImage(uri);
                }
            }
        );
    };

    const pickImageExpo = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleImage(result.assets[0].uri);
        }
    };

    // Add a handler for QR scan result
    const handleQRScan = (registrationNumber: string) => {
        // Navigate to the checklist screen with the registration number as a param
        router.push({ pathname: '/(tabs)/inspection', params: { registrationNumber } });
    };

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, [permission]);
    return (
        <ScrollView style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity
                        style={{

                        }}
                        onPress={
                            router.back
                        }
                    >
                        <Ionicons name="return-up-back" />
                    </TouchableOpacity>
                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Driver</Text>
                        <Text style={styles.subtitle}>Scan a License Disc to Check Details</Text>
                    </View>
                    <View style={styles.headerIcon}>
                        <Ionicons name="document-text" size={32} color="#fff" />
                    </View>
                </View>
            </View>

            {/* QR Scanner Section */}
            <View style={styles.qrScannerSection}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="qr-code" size={24} color="#1e40af" />
                    <Text style={styles.sectionTitle}>QR Code Scanner</Text>
                </View>

                <View style={styles.qrCard}>
                    <View style={styles.permissionContainer}>
                        <Pressable style={styles.permissionButton} onPress={requestPermission}>
                            <Ionicons name="camera-outline" size={20} color="#3b82f6" />
                            <Text style={styles.permissionButtonText}>Request Permissions</Text>
                        </Pressable>
                    </View>

                    <View style={styles.scannerContainer}>
                        <ScannerDriver />
                    </View>

                    <View style={styles.scanButtonContainer}>
                        <Pressable
                            style={[
                                styles.scanButton,
                                { opacity: !isPermissionGranted ? 0.5 : 1 },
                            ]}
                            disabled={!isPermissionGranted}
                        >
                            <Ionicons name="scan" size={20} color="#fff" />
                            <Text style={styles.scanButtonText}>Scan Code</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },

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

    // Section Styles
    scannerSection: {
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginLeft: 8,
    },
    scannerCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },

    // Enhanced Image Container
    enhancedImageContainer: {
        width: '100%',
        height: 260,
        borderRadius: 16,
        backgroundColor: '#f1f5f9',
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderStyle: 'dashed',
    },
    enhancedPlaceholder: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 8,
        fontWeight: '500',
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 4,
    },

    // Action Buttons
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    primaryActionButton: {
        flex: 1,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    secondaryActionButton: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        borderWidth: 2,
        borderColor: '#3b82f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    secondaryActionButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Loading States
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        fontWeight: '500',
    },

    // Result Box Enhancement
    resultBox: {
        marginTop: 20,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    resultIconContainer: {
        marginBottom: 12,
    },
    resultText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#22c55e',
    },
    resultDetails: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
    },

    // QR Scanner Section
    qrScannerSection: {
        padding: 20,
    },
    qrCard: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    permissionContainer: {
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#dbeafe',
    },
    permissionButtonText: {
        color: '#3b82f6',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    scannerContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        backgroundColor: '#f1f5f9',
        minHeight: 200,
    },
    scanButtonContainer: {
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: '#10b981',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    scanButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },

    // Original styles preserved for compatibility
    imageContainer: {
        width: 260,
        height: 260,
        borderRadius: 16,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        marginBottom: 30,
    },
    buttonStyle: {
        color: "#3b82f6",
        fontSize: 20,
        textAlign: "center",
        fontWeight: '600',
    },
});
