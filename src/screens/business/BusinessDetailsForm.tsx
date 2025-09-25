// FILE: src/screens/business/BusinessDetailsForm.tsx
// PURPOSE: Business details form for business registration

import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusinessCategory, BusinessSubcategory } from '../../constants/businessCategories';

interface RouteParams {
  category: BusinessCategory;
  subcategory: BusinessSubcategory;
}

interface BusinessDetails {
  businessName: string;
  description: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  openingHours: {
    [key: string]: { open: string; close: string; isOpen: boolean };
  };
  deliveryRadius: string;
  minimumOrder: string;
  estimatedDeliveryTime: string;
}

export const BusinessDetailsForm: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { category, subcategory } = route.params as RouteParams;

  const [businessDetails, setBusinessDetails] = useState<BusinessDetails>({
    businessName: '',
    description: '',
    address: '',
    city: '',
    pincode: '',
    phone: '',
    email: '',
    website: '',
    openingHours: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '22:00', isOpen: true },
      sunday: { open: '10:00', close: '20:00', isOpen: true },
    },
    deliveryRadius: '5',
    minimumOrder: '100',
    estimatedDeliveryTime: subcategory.averageDeliveryTime || '30-45 mins',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const updateBusinessDetail = (field: keyof BusinessDetails, value: string) => {
    setBusinessDetails(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    const requiredFields = ['businessName', 'description', 'address', 'city', 'pincode', 'phone'];
    const missingFields = requiredFields.filter(field => !businessDetails[field as keyof BusinessDetails]);

    if (missingFields.length > 0) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    // Submit business registration
    console.log('Submitting business registration:', {
      category,
      subcategory,
      businessDetails,
    });

    Alert.alert(
      'Registration Submitted',
      'Your business registration has been submitted for review. You will be notified once approved.',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Auth'),
        },
      ]
    );
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            index + 1 <= currentStep ? styles.activeStepDot : styles.inactiveStepDot,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about your business</Text>

      <View style={styles.selectedCategoryBanner}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <View>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.subcategoryName}>{subcategory.name}</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Name *</Text>
        <TextInput
          style={styles.textInput}
          value={businessDetails.businessName}
          onChangeText={(text) => updateBusinessDetail('businessName', text)}
          placeholder="Enter your business name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Description *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={businessDetails.description}
          onChangeText={(text) => updateBusinessDetail('description', text)}
          placeholder="Describe your business and what makes it special"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Phone *</Text>
        <TextInput
          style={styles.textInput}
          value={businessDetails.phone}
          onChangeText={(text) => updateBusinessDetail('phone', text)}
          placeholder="Enter business phone number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Email</Text>
        <TextInput
          style={styles.textInput}
          value={businessDetails.email}
          onChangeText={(text) => updateBusinessDetail('email', text)}
          placeholder="Enter business email (optional)"
          keyboardType="email-address"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Location & Service Area</Text>
      <Text style={styles.stepSubtitle}>Where are you located and where do you serve?</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Business Address *</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={businessDetails.address}
          onChangeText={(text) => updateBusinessDetail('address', text)}
          placeholder="Enter your complete business address"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>City *</Text>
          <TextInput
            style={styles.textInput}
            value={businessDetails.city}
            onChangeText={(text) => updateBusinessDetail('city', text)}
            placeholder="City"
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Pincode *</Text>
          <TextInput
            style={styles.textInput}
            value={businessDetails.pincode}
            onChangeText={(text) => updateBusinessDetail('pincode', text)}
            placeholder="Pincode"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Radius (km)</Text>
        <TextInput
          style={styles.textInput}
          value={businessDetails.deliveryRadius}
          onChangeText={(text) => updateBusinessDetail('deliveryRadius', text)}
          placeholder="How far do you deliver? (in km)"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Website (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={businessDetails.website}
          onChangeText={(text) => updateBusinessDetail('website', text)}
          placeholder="https://yourwebsite.com"
          keyboardType="url"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Business Settings</Text>
      <Text style={styles.stepSubtitle}>Configure your business operations</Text>

      <View style={styles.row}>
        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Minimum Order (₹)</Text>
          <TextInput
            style={styles.textInput}
            value={businessDetails.minimumOrder}
            onChangeText={(text) => updateBusinessDetail('minimumOrder', text)}
            placeholder="Minimum order amount"
            keyboardType="numeric"
          />
        </View>

        <View style={[styles.inputGroup, styles.halfWidth]}>
          <Text style={styles.inputLabel}>Delivery Time</Text>
          <TextInput
            style={styles.textInput}
            value={businessDetails.estimatedDeliveryTime}
            onChangeText={(text) => updateBusinessDetail('estimatedDeliveryTime', text)}
            placeholder="e.g., 30-45 mins"
          />
        </View>
      </View>

      <View style={styles.operatingHoursSection}>
        <Text style={styles.sectionTitle}>Operating Hours</Text>
        <Text style={styles.sectionSubtitle}>Set your business hours for each day</Text>
        
        {Object.entries(businessDetails.openingHours).map(([day, hours]) => (
          <View key={day} style={styles.dayRow}>
            <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
            <View style={styles.hoursContainer}>
              <TextInput
                style={styles.timeInput}
                value={hours.open}
                placeholder="09:00"
              />
              <Text style={styles.timeSeparator}>to</Text>
              <TextInput
                style={styles.timeInput}
                value={hours.close}
                placeholder="21:00"
              />
              <TouchableOpacity
                style={[styles.toggleButton, hours.isOpen ? styles.openButton : styles.closedButton]}
              >
                <Text style={styles.toggleButtonText}>
                  {hours.isOpen ? 'Open' : 'Closed'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Register Your Business</Text>
        {renderStepIndicator()}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentStep === totalSteps ? 'Submit Registration' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  activeStepDot: {
    backgroundColor: '#3498DB',
  },
  inactiveStepDot: {
    backgroundColor: '#BDC3C7',
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 24,
  },
  selectedCategoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF4FD',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  subcategoryName: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  operatingHoursSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    width: 80,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 8,
    color: '#7F8C8D',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
  },
  openButton: {
    backgroundColor: '#27AE60',
  },
  closedButton: {
    backgroundColor: '#E74C3C',
  },
  toggleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    backgroundColor: '#3498DB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});