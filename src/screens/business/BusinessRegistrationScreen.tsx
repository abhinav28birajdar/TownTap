import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { BusinessRegistrationData, BusinessCategory } from '../../types';

const BUSINESS_CATEGORIES: { label: string; value: BusinessCategory }[] = [
  { label: 'Restaurant', value: 'restaurant' },
  { label: 'Retail Store', value: 'retail' },
  { label: 'Service Provider', value: 'service' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Beauty & Wellness', value: 'beauty' },
  { label: 'Education', value: 'education' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Professional Services', value: 'professional' },
  { label: 'Other', value: 'other' },
];

export default function BusinessRegistrationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    business_name: '',
    description: '',
    category: 'restaurant',
    phone: '',
    email: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
    },
    hours: {
      monday: { open: '09:00', close: '17:00', is_closed: false },
      tuesday: { open: '09:00', close: '17:00', is_closed: false },
      wednesday: { open: '09:00', close: '17:00', is_closed: false },
      thursday: { open: '09:00', close: '17:00', is_closed: false },
      friday: { open: '09:00', close: '17:00', is_closed: false },
      saturday: { open: '09:00', close: '17:00', is_closed: false },
      sunday: { open: '09:00', close: '17:00', is_closed: true },
    },
    tags: [],
    social_media: {
      facebook: '',
      instagram: '',
      twitter: '',
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Basic Information',
    'Contact Details',
    'Location',
    'Business Hours',
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const updateSocialMedia = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_media: { ...prev.social_media, [field]: value },
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return formData.business_name.trim() && formData.description.trim();
      case 1: // Contact Details
        return formData.phone.trim() && formData.email.trim();
      case 2: // Location
        return formData.address.street.trim() && 
               formData.address.city.trim() && 
               formData.address.state.trim();
      case 3: // Business Hours
        return true; // Hours have default values
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a business');
      return;
    }

    if (!validateCurrentStep()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('business_profiles')
        .insert({
          ...formData,
          owner_id: user.id,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert(
        'Success!',
        'Your business profile has been created successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/business/dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating business:', error);
      Alert.alert('Error', 'Failed to create business profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInformation();
      case 1:
        return renderContactDetails();
      case 2:
        return renderLocation();
      case 3:
        return renderBusinessHours();
      default:
        return null;
    }
  };

  const renderBasicInformation = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Business Name *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Enter your business name"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.business_name}
          onChangeText={(value) => updateFormData('business_name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Category *
        </Text>
        <View style={styles.categoryGrid}>
          {BUSINESS_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.value}
              style={[
                styles.categoryButton,
                {
                  backgroundColor: formData.category === category.value 
                    ? theme.colors.primary 
                    : theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => updateFormData('category', category.value)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color: formData.category === category.value 
                      ? '#FFFFFF' 
                      : theme.colors.text,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Description *
        </Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="Describe your business..."
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.description}
          onChangeText={(value) => updateFormData('description', value)}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderContactDetails = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Phone Number *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="(555) 123-4567"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.phone}
          onChangeText={(value) => updateFormData('phone', value)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Email Address *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="business@example.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Website (Optional)
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="www.yourbusiness.com"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.website}
          onChangeText={(value) => updateFormData('website', value)}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Social Media (Optional)
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Facebook
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="facebook.com/yourbusiness"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.social_media.facebook}
          onChangeText={(value) => updateSocialMedia('facebook', value)}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Instagram
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="instagram.com/yourbusiness"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.social_media.instagram}
          onChangeText={(value) => updateSocialMedia('instagram', value)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  const renderLocation = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          Street Address *
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            },
          ]}
          placeholder="123 Main Street"
          placeholderTextColor={theme.colors.textSecondary}
          value={formData.address.street}
          onChangeText={(value) => updateAddress('street', value)}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            City *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="City"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.address.city}
            onChangeText={(value) => updateAddress('city', value)}
          />
        </View>

        <View style={[styles.inputGroup, styles.flex1, { marginLeft: 12 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            State *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="State"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.address.state}
            onChangeText={(value) => updateAddress('state', value)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            ZIP Code
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="12345"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.address.zip_code}
            onChangeText={(value) => updateAddress('zip_code', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, styles.flex1, { marginLeft: 12 }]}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Country
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder="United States"
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.address.country}
            onChangeText={(value) => updateAddress('country', value)}
          />
        </View>
      </View>
    </View>
  );

  const renderBusinessHours = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Business Hours
      </Text>
      <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
        Set your operating hours for each day of the week
      </Text>
      
      {Object.entries(formData.hours).map(([day, hours]) => (
        <View key={day} style={styles.hourRow}>
          <View style={styles.dayColumn}>
            <Text style={[styles.dayText, { color: theme.colors.text }]}>
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
          </View>
          
          <View style={styles.hoursColumn}>
            {hours.is_closed ? (
              <Text style={[styles.closedText, { color: theme.colors.textSecondary }]}>
                Closed
              </Text>
            ) : (
              <Text style={[styles.hoursText, { color: theme.colors.text }]}>
                {hours.open} - {hours.close}
              </Text>
            )}
          </View>
        </View>
      ))}
      
      <Text style={[styles.note, { color: theme.colors.textSecondary }]}>
        You can customize your hours after creating your profile
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Create Business Profile
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressStep,
                  {
                    backgroundColor: index <= currentStep 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              {
                backgroundColor: validateCurrentStep() ? theme.colors.primary : theme.colors.border,
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
            onPress={handleNext}
            disabled={!validateCurrentStep() || isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading 
                ? 'Creating...' 
                : currentStep === steps.length - 1 
                  ? 'Create Business' 
                  : 'Next'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  stepContent: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  categoryButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  dayColumn: {
    flex: 1,
  },
  hoursColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 16,
  },
  closedText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  note: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
  actions: {
    padding: 16,
  },
  nextButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});