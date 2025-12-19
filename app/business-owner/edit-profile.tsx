import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface BusinessProfile {
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  logo: string | null;
  coverImage: string | null;
  isVerified: boolean;
  establishedYear: string;
}

const mockProfile: BusinessProfile = {
  name: 'HomeCare Pro Services',
  description:
    'Professional home maintenance and repair services with over 10 years of experience. We specialize in plumbing, electrical work, AC repair, and home cleaning services.',
  category: 'Home Services',
  phone: '+91 98765 43210',
  email: 'contact@homecarepro.com',
  website: 'www.homecarepro.com',
  address: '123 Business Hub, Sector 15',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  gstNumber: 'GSTIN12345678',
  logo: null,
  coverImage: null,
  isVerified: true,
  establishedYear: '2014',
};

const categories = [
  'Home Services',
  'Cleaning Services',
  'Repair & Maintenance',
  'Beauty & Wellness',
  'Health Services',
  'Events & Entertainment',
  'Education & Tutoring',
  'Professional Services',
  'Other',
];

export default function BusinessProfileEditScreen() {
  const colors = useColors();
  const [profile, setProfile] = useState(mockProfile);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateField = (field: keyof BusinessProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save logic here
    setHasChanges(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Edit Business Profile</ThemedText>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges}
          style={[styles.saveHeaderButton, { opacity: hasChanges ? 1 : 0.5 }]}
        >
          <ThemedText style={[styles.saveHeaderText, { color: colors.primary }]}>
            Save
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        <View style={[styles.coverSection, { backgroundColor: colors.card }]}>
          <View style={[styles.coverImage, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="image-outline" size={32} color={colors.primary} />
            <ThemedText style={[styles.coverText, { color: colors.primary }]}>
              Cover Image
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.changeCoverButton, { backgroundColor: colors.card }]}>
            <Ionicons name="camera" size={18} color={colors.text} />
            <ThemedText style={styles.changeCoverText}>Change Cover</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.logo, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.logoInitial, { color: colors.primary }]}>
                {profile.name.charAt(0)}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.editLogoButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          {profile.isVerified && (
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <ThemedText style={[styles.verifiedText, { color: colors.success }]}>
                Verified Business
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Basic Info Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Basic Information</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Business Name *</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.name}
                onChangeText={(text) => updateField('name', text)}
                placeholder="Enter business name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Category *</ThemedText>
              <TouchableOpacity
                style={[styles.selectInput, { backgroundColor: colors.background }]}
                onPress={() => setShowCategoryModal(true)}
              >
                <ThemedText style={{ color: colors.text }}>{profile.category}</ThemedText>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Description</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                value={profile.description}
                onChangeText={(text) => updateField('description', text)}
                placeholder="Describe your business..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <ThemedText style={[styles.charCount, { color: colors.textSecondary }]}>
                {profile.description.length}/500
              </ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Established Year</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.establishedYear}
                onChangeText={(text) => updateField('establishedYear', text)}
                placeholder="e.g., 2014"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Contact Info Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="call" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Phone Number *</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Email Address *</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="business@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Website (Optional)</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.website}
                onChangeText={(text) => updateField('website', text)}
                placeholder="www.yourbusiness.com"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Address Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Business Address</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Street Address *</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.address}
                onChangeText={(text) => updateField('address', text)}
                placeholder="Enter street address"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>City *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={profile.city}
                  onChangeText={(text) => updateField('city', text)}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>State *</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                  value={profile.state}
                  onChangeText={(text) => updateField('state', text)}
                  placeholder="State"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>PIN Code *</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: colors.background, color: colors.text, width: '50%' },
                ]}
                value={profile.pincode}
                onChangeText={(text) => updateField('pincode', text)}
                placeholder="400001"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
          </View>

          {/* Tax Info Section */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Tax Information</ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>GST Number (Optional)</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                value={profile.gstNumber}
                onChangeText={(text) => updateField('gstNumber', text)}
                placeholder="Enter GST number"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="information-circle" size={18} color={colors.info} />
              <ThemedText style={[styles.infoBoxText, { color: colors.textSecondary }]}>
                Adding GST number enables you to provide tax invoices to customers
              </ThemedText>
            </View>
          </View>

          {/* Danger Zone */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="warning" size={20} color={colors.error} />
              <ThemedText style={[styles.sectionTitle, { color: colors.error }]}>
                Danger Zone
              </ThemedText>
            </View>

            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: colors.error }]}
              onPress={() => {}}
            >
              <Ionicons name="pause-circle-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.dangerButtonText, { color: colors.error }]}>
                Temporarily Pause Business
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dangerButton, { borderColor: colors.error, marginTop: 8 }]}
              onPress={() => {}}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.dangerButtonText, { color: colors.error }]}>
                Delete Business Account
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Save Button */}
      {hasChanges && (
        <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Modal */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor:
                        profile.category === cat ? colors.primary + '15' : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    updateField('category', cat);
                    setShowCategoryModal(false);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.categoryText,
                      { color: profile.category === cat ? colors.primary : colors.text },
                    ]}
                  >
                    {cat}
                  </ThemedText>
                  {profile.category === cat && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  saveHeaderButton: {
    padding: 4,
  },
  saveHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coverSection: {
    position: 'relative',
    marginBottom: 50,
  },
  coverImage: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  changeCoverButton: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  changeCoverText: {
    fontSize: 13,
    fontWeight: '500',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: -50,
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    borderRadius: 50,
    padding: 4,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 36,
    fontWeight: '700',
  },
  editLogoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 10,
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 10,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 16,
  },
});
