import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../config/constants';
import { getBusinessCategories } from '../../lib/supabase';
import { BusinessService } from '../../services/businessService';
import { useAuthStore } from '../../stores/authStore';
import { useLocationStore } from '../../stores/locationStoreNew';
import type { BusinessRegistration } from '../../types/index_location';

const BusinessRegistrationScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    currentLocation, 
    getCurrentLocation,
  } = useLocationStore();

  // Local state for business categories
  const [businessCategories, setBusinessCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Function to load business categories
  const loadBusinessCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await getBusinessCategories();
      if (error) {
        console.error('Error loading categories:', error);
      } else {
        setBusinessCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Function to get address from coordinates (simplified version)
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      // This is a simplified version - in a real app you'd use a geocoding service
      return {
        address: `Address for ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        city: 'City',
        state: 'State',
        latitude,
        longitude
      };
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  };

  const [formData, setFormData] = useState<BusinessRegistration>({
    business_name: '',
    description: '',
    category_id: '',
    phone_number: '',
    whatsapp_number: '',
    email: '',
    website_url: '',
    location: { latitude: 0, longitude: 0 },
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true },
    },
    services: [],
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [servicesText, setServicesText] = useState('');

  useEffect(() => {
    initializeForm();
  }, []);

  const initializeForm = async () => {
    // Load business categories
    await loadBusinessCategories();
    
    // Get current location if available
    if (!currentLocation) {
      await getCurrentLocation();
    }
    
    // Set location and address if available
    if (currentLocation) {
      const addressData = await getAddressFromCoordinates(
        currentLocation.latitude, 
        currentLocation.longitude
      );
      
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          location: currentLocation,
          address: addressData.address,
          city: addressData.city,
          state: addressData.state,
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Please select a business category';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone_number.replace(/\D/g, ''))) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit PIN code';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors and try again.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setLoading(true);

    try {
      // Parse services from text
      const services = servicesText
        .split(',')
        .map(service => service.trim())
        .filter(service => service.length > 0);

      // Ensure location is set
      const location = formData.location.latitude && formData.location.longitude 
        ? formData.location 
        : currentLocation || { latitude: 0, longitude: 0 };

      const registrationData: BusinessRegistration = {
        ...formData,
        services,
        location,
      };

      console.log('Registering business with data:', registrationData);

      const result = await BusinessService.registerBusiness(registrationData, user.id);

      if (result) {
        Alert.alert(
          'Success',
          'Your business has been registered successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Navigate back to dashboard or business list
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to register business. Please try again.');
      }
    } catch (error: any) {
      console.error('Error registering business:', error);
      Alert.alert('Error', `Failed to register business: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof BusinessRegistration, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getCurrentLocationAddress = async () => {
    setLoading(true);
    try {
      await getCurrentLocation();
      if (currentLocation) {
        const addressData = await getAddressFromCoordinates(currentLocation.latitude, currentLocation.longitude);
        if (addressData) {
          setFormData(prev => ({
            ...prev,
            location: currentLocation,
            address: addressData.address,
            city: addressData.city,
            state: addressData.state,
          }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Register Your Business</Text>
          <Text style={styles.headerSubtitle}>
            Add your business details to get discovered by customers
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Name *</Text>
            <TextInput
              style={[styles.input, errors.business_name && styles.inputError]}
              value={formData.business_name}
              onChangeText={(value) => updateFormData('business_name', value)}
              placeholder="Enter your business name"
            />
            {errors.business_name && (
              <Text style={styles.errorText}>{errors.business_name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={[styles.pickerContainer, errors.category_id && styles.inputError]}>
              <Picker
                selectedValue={formData.category_id}
                onValueChange={(value) => updateFormData('category_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select a category" value="" />
                {businessCategories.map((category) => (
                  <Picker.Item 
                    key={category.id} 
                    label={category.name} 
                    value={category.id} 
                  />
                ))}
              </Picker>
            </View>
            {errors.category_id && (
              <Text style={styles.errorText}>{errors.category_id}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Describe your business..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Services Offered</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={servicesText}
              onChangeText={setServicesText}
              placeholder="Enter services separated by commas (e.g., Hair Cut, Beard Trim, Facial)"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={[styles.input, errors.phone_number && styles.inputError]}
              value={formData.phone_number}
              onChangeText={(value) => updateFormData('phone_number', value)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              maxLength={15}
            />
            {errors.phone_number && (
              <Text style={styles.errorText}>{errors.phone_number}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>WhatsApp Number</Text>
            <TextInput
              style={styles.input}
              value={formData.whatsapp_number}
              onChangeText={(value) => updateFormData('whatsapp_number', value)}
              placeholder="Enter WhatsApp number (optional)"
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              placeholder="Enter email address (optional)"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website</Text>
            <TextInput
              style={styles.input}
              value={formData.website_url}
              onChangeText={(value) => updateFormData('website_url', value)}
              placeholder="Enter website URL (optional)"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Address *</Text>
              <TouchableOpacity 
                style={styles.locationButton}
                onPress={getCurrentLocationAddress}
                disabled={loading}
              >
                <Ionicons name="location" size={16} color={COLORS.primary} />
                <Text style={styles.locationButtonText}>Use Current Location</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              placeholder="Enter full address"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address}</Text>
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>City *</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={formData.city}
                onChangeText={(value) => updateFormData('city', value)}
                placeholder="City"
              />
              {errors.city && (
                <Text style={styles.errorText}>{errors.city}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>State *</Text>
              <TextInput
                style={[styles.input, errors.state && styles.inputError]}
                value={formData.state}
                onChangeText={(value) => updateFormData('state', value)}
                placeholder="State"
              />
              {errors.state && (
                <Text style={styles.errorText}>{errors.state}</Text>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>PIN Code *</Text>
              <TextInput
                style={[styles.input, errors.pincode && styles.inputError]}
                value={formData.pincode}
                onChangeText={(value) => updateFormData('pincode', value)}
                placeholder="PIN Code"
                keyboardType="numeric"
                maxLength={6}
              />
              {errors.pincode && (
                <Text style={styles.errorText}>{errors.pincode}</Text>
              )}
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Landmark</Text>
              <TextInput
                style={styles.input}
                value={formData.landmark}
                onChangeText={(value) => updateFormData('landmark', value)}
                placeholder="Landmark (optional)"
              />
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Registering...' : 'Register Business'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    lineHeight: 22,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray[700],
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.gray[800],
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  locationButtonText: {
    fontSize: 12,
    color: COLORS.primary,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BusinessRegistrationScreen;
