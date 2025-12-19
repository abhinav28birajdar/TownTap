import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BusinessInfo {
  name: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface WorkingHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const categories = [
  { id: '1', name: 'Cleaning Services', icon: 'sparkles' },
  { id: '2', name: 'Home Repairs', icon: 'hammer' },
  { id: '3', name: 'Beauty & Wellness', icon: 'flower' },
  { id: '4', name: 'Electrical', icon: 'flash' },
  { id: '5', name: 'Plumbing', icon: 'water' },
  { id: '6', name: 'Moving & Packing', icon: 'cube' },
  { id: '7', name: 'Painting', icon: 'color-palette' },
  { id: '8', name: 'Pest Control', icon: 'bug' },
  { id: '9', name: 'Gardening', icon: 'leaf' },
  { id: '10', name: 'Other', icon: 'apps' },
];

const defaultHours: WorkingHours[] = [
  { day: 'Monday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '09:00 AM', closeTime: '06:00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '10:00 AM', closeTime: '04:00 PM' },
  { day: 'Sunday', isOpen: false, openTime: '10:00 AM', closeTime: '04:00 PM' },
];

export default function BusinessSetupScreen() {
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState(1);
  const [businessLogo, setBusinessLogo] = useState<string | null>(null);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>(defaultHours);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Mumbai']);

  const totalSteps = 4;

  const updateBusinessInfo = (field: keyof BusinessInfo, value: string) => {
    setBusinessInfo({ ...businessInfo, [field]: value });
  };

  const toggleWorkingDay = (index: number) => {
    const updated = [...workingHours];
    updated[index].isOpen = !updated[index].isOpen;
    setWorkingHours(updated);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { backgroundColor: colors.primary, width: `${(currentStep / totalSteps) * 100}%` }
          ]} 
        />
      </View>
      <ThemedText style={[styles.progressText, { color: colors.textSecondary }]}>
        Step {currentStep} of {totalSteps}
      </ThemedText>
    </View>
  );

  const renderStep1 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Basic Information</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Tell us about your business
      </ThemedText>

      {/* Logo Upload */}
      <View style={styles.logoSection}>
        <TouchableOpacity
          style={[styles.logoUpload, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {businessLogo ? (
            <Image source={{ uri: businessLogo }} style={styles.logoImage} />
          ) : (
            <>
              <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <ThemedText style={[styles.logoText, { color: colors.textSecondary }]}>
                Upload Business Logo
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Business Name */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Business Name *</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={businessInfo.name}
          onChangeText={(v) => updateBusinessInfo('name', v)}
          placeholder="Enter your business name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Category */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Business Category *</ThemedText>
        <TouchableOpacity
          style={[styles.selectInput, { backgroundColor: colors.card }]}
          onPress={() => setShowCategoryModal(true)}
        >
          <ThemedText style={[
            styles.selectText,
            { color: businessInfo.category ? colors.text : colors.textSecondary }
          ]}>
            {businessInfo.category || 'Select category'}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Business Description</ThemedText>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          value={businessInfo.description}
          onChangeText={(v) => updateBusinessInfo('description', v)}
          placeholder="Tell customers about your business..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Contact Details</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        How can customers reach you?
      </ThemedText>

      {/* Phone */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Phone Number *</ThemedText>
        <View style={[styles.phoneInput, { backgroundColor: colors.card }]}>
          <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
            <ThemedText>+91</ThemedText>
          </View>
          <TextInput
            style={[styles.phoneField, { color: colors.text }]}
            value={businessInfo.phone}
            onChangeText={(v) => updateBusinessInfo('phone', v)}
            placeholder="Enter phone number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Email Address *</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
          value={businessInfo.email}
          onChangeText={(v) => updateBusinessInfo('email', v)}
          placeholder="business@email.com"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Address */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Business Address *</ThemedText>
        <TextInput
          style={[styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
          value={businessInfo.address}
          onChangeText={(v) => updateBusinessInfo('address', v)}
          placeholder="Full address with landmarks"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* City, State, Pincode */}
      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={styles.inputLabel}>City *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={businessInfo.city}
            onChangeText={(v) => updateBusinessInfo('city', v)}
            placeholder="City"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={styles.inputLabel}>Pincode *</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={businessInfo.pincode}
            onChangeText={(v) => updateBusinessInfo('pincode', v)}
            placeholder="400001"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Service Areas */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.inputLabel}>Service Areas</ThemedText>
        <View style={styles.tagsContainer}>
          {serviceAreas.map((area) => (
            <View key={area} style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
              <ThemedText style={[styles.tagText, { color: colors.primary }]}>{area}</ThemedText>
              <TouchableOpacity onPress={() => setServiceAreas(serviceAreas.filter(a => a !== area))}>
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.addTag, { borderColor: colors.border }]}>
            <Ionicons name="add" size={18} color={colors.primary} />
            <ThemedText style={[styles.addTagText, { color: colors.primary }]}>Add Area</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Working Hours</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Set your business availability
      </ThemedText>

      <View style={styles.hoursContainer}>
        {workingHours.map((day, index) => (
          <View 
            key={day.day} 
            style={[styles.dayRow, { backgroundColor: colors.card }]}
          >
            <View style={styles.dayInfo}>
              <Switch
                value={day.isOpen}
                onValueChange={() => toggleWorkingDay(index)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={day.isOpen ? colors.primary : '#f4f3f4'}
              />
              <ThemedText style={[
                styles.dayName,
                !day.isOpen && { color: colors.textSecondary }
              ]}>
                {day.day}
              </ThemedText>
            </View>
            {day.isOpen ? (
              <View style={styles.timeRange}>
                <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.timeText}>{day.openTime}</ThemedText>
                </TouchableOpacity>
                <ThemedText style={[styles.timeSeparator, { color: colors.textSecondary }]}>to</ThemedText>
                <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.timeText}>{day.closeTime}</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <ThemedText style={[styles.closedText, { color: colors.textSecondary }]}>
                Closed
              </ThemedText>
            )}
          </View>
        ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ThemedText style={styles.stepTitle}>Review & Confirm</ThemedText>
      <ThemedText style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
        Review your business details
      </ThemedText>

      {/* Business Preview Card */}
      <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD']}
          style={styles.previewHeader}
        >
          <View style={styles.previewLogo}>
            <Ionicons name="storefront" size={32} color="#FFF" />
          </View>
          <ThemedText style={styles.previewName}>
            {businessInfo.name || 'Your Business Name'}
          </ThemedText>
          <ThemedText style={styles.previewCategory}>
            {businessInfo.category || 'Category'}
          </ThemedText>
        </LinearGradient>

        <View style={styles.previewDetails}>
          <View style={styles.previewRow}>
            <Ionicons name="call" size={18} color={colors.primary} />
            <ThemedText style={styles.previewValue}>
              +91 {businessInfo.phone || 'Phone Number'}
            </ThemedText>
          </View>
          <View style={styles.previewRow}>
            <Ionicons name="mail" size={18} color={colors.primary} />
            <ThemedText style={styles.previewValue}>
              {businessInfo.email || 'Email Address'}
            </ThemedText>
          </View>
          <View style={styles.previewRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <ThemedText style={styles.previewValue} numberOfLines={2}>
              {businessInfo.address || 'Business Address'}, {businessInfo.city}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Working Hours Preview */}
      <View style={[styles.hoursPreview, { backgroundColor: colors.card }]}>
        <View style={styles.hoursPreviewHeader}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <ThemedText style={styles.hoursPreviewTitle}>Working Hours</ThemedText>
        </View>
        <View style={styles.hoursPreviewList}>
          {workingHours.filter(d => d.isOpen).slice(0, 3).map((day) => (
            <View key={day.day} style={styles.hoursPreviewItem}>
              <ThemedText style={[styles.hoursPreviewDay, { color: colors.textSecondary }]}>
                {day.day.slice(0, 3)}
              </ThemedText>
              <ThemedText style={styles.hoursPreviewTime}>
                {day.openTime} - {day.closeTime}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Terms Agreement */}
      <View style={[styles.termsCard, { backgroundColor: colors.info + '10' }]}>
        <Ionicons name="information-circle" size={22} color={colors.info} />
        <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
          By continuing, you agree to our{' '}
          <ThemedText style={{ color: colors.primary }}>Terms of Service</ThemedText>
          {' '}and{' '}
          <ThemedText style={{ color: colors.primary }}>Business Guidelines</ThemedText>
        </ThemedText>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Business Setup</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {renderProgressBar()}

      <View style={styles.content}>
        {renderCurrentStep()}
      </View>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.backBtn, { borderColor: colors.border }]}
            onPress={handleBack}
          >
            <ThemedText style={styles.backBtnText}>Back</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: colors.primary }, currentStep === 1 && { flex: 1 }]}
          onPress={handleNext}
        >
          <ThemedText style={styles.nextBtnText}>
            {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
          </ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.categoryModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.categoriesList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    { backgroundColor: colors.background },
                    businessInfo.category === cat.name && { 
                      backgroundColor: colors.primary + '15',
                      borderColor: colors.primary,
                    }
                  ]}
                  onPress={() => {
                    updateBusinessInfo('category', cat.name);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={cat.icon as any} size={22} color={colors.primary} />
                  </View>
                  <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
                  {businessInfo.category === cat.name && (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            </View>
            <ThemedText style={styles.successTitle}>Setup Complete!</ThemedText>
            <ThemedText style={[styles.successText, { color: colors.textSecondary }]}>
              Your business profile has been created. You can now start adding services and receiving bookings.
            </ThemedText>
            <TouchableOpacity
              style={[styles.dashboardButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/business-owner/dashboard');
              }}
            >
              <ThemedText style={styles.dashboardButtonText}>Go to Dashboard</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addServicesLink}
              onPress={() => {
                setShowSuccessModal(false);
                router.push('/business-owner/service-management');
              }}
            >
              <ThemedText style={[styles.addServicesText, { color: colors.primary }]}>
                Add Services First
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 12,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
  },
  selectText: {
    fontSize: 15,
  },
  phoneInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
  },
  phoneField: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursContainer: {
    gap: 10,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  timeSeparator: {
    fontSize: 13,
  },
  closedText: {
    fontSize: 14,
  },
  previewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewHeader: {
    padding: 20,
    alignItems: 'center',
  },
  previewLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  previewName: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewCategory: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  previewDetails: {
    padding: 16,
    gap: 12,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewValue: {
    flex: 1,
    fontSize: 14,
  },
  hoursPreview: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  hoursPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  hoursPreviewTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  hoursPreviewList: {
    gap: 8,
  },
  hoursPreviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursPreviewDay: {
    fontSize: 13,
  },
  hoursPreviewTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  termsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 12,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  nextBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  categoryModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoriesList: {
    padding: 16,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
  successModal: {
    marginHorizontal: 24,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  dashboardButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addServicesLink: {
    padding: 8,
  },
  addServicesText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
