import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

interface BusinessFormData {
  businessName: string;
  description: string;
  category: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
}

const businessCategories = [
  'Restaurant',
  'Retail Store',
  'Service Provider',
  'Healthcare',
  'Beauty & Wellness',
  'Automotive',
  'Home Services',
  'Professional Services',
  'Entertainment',
  'Other',
];

const initialHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '10:00', close: '16:00', closed: false },
  sunday: { open: '12:00', close: '16:00', closed: true },
};

export default function BusinessRegistrationScreen() {
  const { user, updateProfile } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<BusinessFormData>({
    businessName: '',
    description: '',
    category: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: user?.email || '',
    website: '',
    hours: initialHours,
  });

  const totalSteps = 3;

  const updateFormData = (field: keyof BusinessFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value,
        },
      },
    }));
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) {
          Alert.alert('Error', 'Business name is required');
          return false;
        }
        if (!formData.category) {
          Alert.alert('Error', 'Please select a category');
          return false;
        }
        if (!formData.description.trim()) {
          Alert.alert('Error', 'Business description is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
          Alert.alert('Error', 'Please fill in all address fields');
          return false;
        }
        if (!formData.phone.trim()) {
          Alert.alert('Error', 'Phone number is required');
          return false;
        }
        return true;
      case 3:
        return true; // Hours are optional
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Create business profile
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: formData.businessName,
          description: formData.description,
          category: formData.category,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          phone: formData.phone,
          email: formData.email,
          website: formData.website || null,
          hours: formData.hours,
          status: 'pending', // Business needs approval
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          business_name: formData.businessName,
          business_id: businessData.id,
          user_type: 'business',
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update local auth store
      await updateProfile({
        business_name: formData.businessName,
        business_id: businessData.id,
        user_type: 'business',
      });

      Alert.alert(
        'Success!',
        'Your business registration has been submitted for review. You will be notified once approved.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/business/dashboard'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Business registration error:', error);
      Alert.alert('Error', error.message || 'Failed to register business');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            currentStep > index + 1 && styles.stepDotCompleted,
            currentStep === index + 1 && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Business Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Business Name *</Text>
        <TextInput
          style={styles.input}
          value={formData.businessName}
          onChangeText={(text) => updateFormData('businessName', text)}
          placeholder="Enter your business name"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {businessCategories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                formData.category === category && styles.categoryButtonActive,
              ]}
              onPress={() => updateFormData('category', category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  formData.category === category && styles.categoryButtonTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          placeholder="Describe your business..."
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Contact & Location</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address *</Text>
        <TextInput
          style={styles.input}
          value={formData.address}
          onChangeText={(text) => updateFormData('address', text)}
          placeholder="Street address"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.flex1]}>
          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={formData.city}
            onChangeText={(text) => updateFormData('city', text)}
            placeholder="City"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
        <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            value={formData.state}
            onChangeText={(text) => updateFormData('state', text)}
            placeholder="State"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>ZIP Code</Text>
        <TextInput
          style={styles.input}
          value={formData.zipCode}
          onChangeText={(text) => updateFormData('zipCode', text)}
          placeholder="ZIP Code"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          value={formData.phone}
          onChangeText={(text) => updateFormData('phone', text)}
          placeholder="(555) 123-4567"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Website (Optional)</Text>
        <TextInput
          style={styles.input}
          value={formData.website}
          onChangeText={(text) => updateFormData('website', text)}
          placeholder="https://www.yourwebsite.com"
          placeholderTextColor="rgba(255, 255, 255, 0.6)"
          keyboardType="url"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Business Hours</Text>
      <Text style={styles.stepSubtitle}>Set your operating hours (optional - you can update this later)</Text>
      
      {Object.entries(formData.hours).map(([day, hours]) => (
        <View key={day} style={styles.hoursRow}>
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <TouchableOpacity
              style={styles.closedToggle}
              onPress={() => updateHours(day, 'closed', !hours.closed)}
            >
              <Text style={styles.closedToggleText}>
                {hours.closed ? 'Closed' : 'Open'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {!hours.closed && (
            <View style={styles.timeContainer}>
              <TextInput
                style={styles.timeInput}
                value={hours.open}
                onChangeText={(text) => updateHours(day, 'open', text)}
                placeholder="09:00"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
              <Text style={styles.timeText}>to</Text>
              <TextInput
                style={styles.timeInput}
                value={hours.close}
                onChangeText={(text) => updateHours(day, 'close', text)}
                placeholder="17:00"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Business Registration</Text>
          <Text style={styles.subtitle}>Step {currentStep} of {totalSteps}</Text>
          {renderStepIndicator()}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.footer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.button, styles.nextButton, currentStep === 1 && styles.fullWidth]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Submitting...' : currentStep === totalSteps ? 'Complete Registration' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepDotActive: {
    backgroundColor: '#ffffff',
  },
  stepDotCompleted: {
    backgroundColor: '#10b981',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 100,
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
  categoryScroll: {
    flexGrow: 0,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#ffffff',
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextActive: {
    color: '#667eea',
  },
  hoursRow: {
    marginBottom: 16,
  },
  dayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  closedToggle: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closedToggleText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  timeText: {
    color: '#ffffff',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#ffffff',
  },
  nextButtonText: {
    color: '#667eea',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fullWidth: {
    flex: 1,
  },
});