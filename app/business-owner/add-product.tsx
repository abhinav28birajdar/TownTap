import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AddProductScreen() {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [availability, setAvailability] = useState(true);

  const handleAddProduct = () => {
    // Handle add product logic
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Image Upload */}
          <TouchableOpacity style={styles.imageUpload}>
            <Ionicons name="camera-outline" size={40} color="#6B8E6F" />
            <Text style={styles.uploadText}>Upload Service Image</Text>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="e.g., Plumbing Repair"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity style={styles.input}>
                <Text style={{ color: category ? '#2D3E2F' : '#999' }}>
                  {category || 'Select Category'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6B8E6F" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your service..."
                multiline
                numberOfLines={5}
              />
            </View>

            <View style={styles.availabilitySection}>
              <Text style={styles.label}>Availability</Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setAvailability(!availability)}
              >
                <View style={[styles.toggleTrack, availability && styles.toggleTrackActive]}>
                  <View style={[styles.toggleThumb, availability && styles.toggleThumbActive]} />
                </View>
                <Text style={styles.toggleLabel}>
                  {availability ? 'Available' : 'Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
              <Text style={styles.addButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageUpload: {
    height: 200,
    backgroundColor: '#A8D5AB',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#6B8E6F',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5F4E',
    fontWeight: '500',
  },
  formSection: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2D3E2F',
    borderWidth: 1,
    borderColor: '#A8D5AB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  availabilitySection: {
    gap: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    padding: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#4A5F4E',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 24 }],
  },
  toggleLabel: {
    fontSize: 16,
    color: '#2D3E2F',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#4A5F4E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
