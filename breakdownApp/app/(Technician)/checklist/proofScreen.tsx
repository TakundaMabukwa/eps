import { supabase } from '@/app/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode as atob } from 'base-64';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProofScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();

  const [selectedImages, setSelectedImages] = useState<{ uri: string }[]>([]);
  const [multipleImages, setMultipleImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pickImages = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        selectionLimit: 0,
        allowsMultipleSelection: true,
      });

      if (!result.canceled) {
        setSelectedImages(result.assets);
        setMultipleImages(result.assets.map(asset => asset.uri));
        setError(null);
        setSuccessMessage(null);
      }
    } catch (err) {
      setError("Failed to pick images");
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const newImages = [...selectedImages, ...result.assets];
        setSelectedImages(newImages);
        setMultipleImages(newImages.map(asset => asset.uri));
        setError(null);
        setSuccessMessage(null);
      }
    } catch (err) {
      setError("Failed to take photo");
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setMultipleImages(newImages.map(asset => asset.uri));
  };

  const uploadImages = async () => {
    if (multipleImages.length === 0) {
      setError("No images selected");
      return;
    }
    if (!jobId || isNaN(parseInt(jobId))) {
      setError("Invalid job ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const uploadedPaths = [];
      for (let i = 0; i < multipleImages.length; i++) {
        let uri = multipleImages[i];
        const fileName = uri.split('/').pop() || `image_${i}.jpg`;

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        // Convert base64 to binary
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) {
          bytes[j] = binary.charCodeAt(j);
        }

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('images')
          .upload(`attachments/${jobId}/${fileName}`, bytes, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (error) {
          setError(`Failed to upload image: ${fileName} - ${error.message}`);
          setIsLoading(false);
          return;
        }
        uploadedPaths.push(data.path);
      }
      // Update the job_assignments table with the array of image paths
      const { data: assignData, error: assignError } = await supabase
        .from('job_assignments')
        .update({
          attachments: uploadedPaths,
          status: "inprogress"

        })
        .eq('id', parseInt(jobId));
      if (assignError) {
        console.log("erroir", assignError.message)
      }
      setSuccessMessage("Images uploaded successfully!");
      setTimeout(() => {
        setSelectedImages([]);
        setMultipleImages([]);
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      setError("Failed to upload images : " + err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="camera" size={32} color="#fff" />
        <TouchableOpacity onPress={() => router.push('/(Technician)/checklist')}>
          <Ionicons name="close" size={32} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Job Proof Upload</Text>
          <Text style={styles.subtitle}>Job ID: {jobId}</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={pickImages}>
          <Ionicons name="images" size={24} color="#fff" />
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={takePhoto}>
          <Ionicons name="camera" size={24} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>Take Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Images Preview */}
      {selectedImages.length > 0 && (
        <View style={styles.imagesSection}>
          <Text style={styles.sectionTitle}>Selected Images ({selectedImages.length})</Text>
          <View style={styles.imagesGrid}>
            {selectedImages.map((img, idx) => (
              <View key={idx} style={styles.imageContainer}>
                <Image source={{ uri: img.uri }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(idx)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            { opacity: multipleImages.length === 0 || isLoading ? 0.5 : 1 }
          ]}
          onPress={uploadImages}
          disabled={isLoading || multipleImages.length === 0}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="cloud-upload" size={24} color="#fff" />
          )}
          <Text style={styles.uploadButtonText}>
            {isLoading ? 'Uploading...' : 'Upload Images'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Status Messages */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {successMessage && (
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}
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
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    fontWeight: '500',
  },

  // Action Buttons Styles
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Images Section Styles
  imagesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Upload Section Styles
  uploadSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#22c55e',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  // Status Messages Styles
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  successText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});
