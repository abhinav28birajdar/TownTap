import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Address {
  id: string;
  label: string;
  type: 'home' | 'work' | 'other';
  address: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

const mockAddresses: Address[] = [
  {
    id: '1',
    label: 'Home',
    type: 'home',
    address: '42, Green Valley Apartments, MG Road',
    landmark: 'Near City Mall',
    city: 'Mumbai',
    pincode: '400001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    type: 'work',
    address: 'Tower B, 5th Floor, Tech Park',
    landmark: 'Opposite Metro Station',
    city: 'Mumbai',
    pincode: '400076',
    isDefault: false,
  },
  {
    id: '3',
    label: "Parent's Home",
    type: 'other',
    address: '15, Sunshine Society, Andheri West',
    city: 'Mumbai',
    pincode: '400058',
    isDefault: false,
  },
];

export default function AddressDetailScreen() {
  const colors = useColors();
  const { id: addressId } = useLocalSearchParams<{ id: string }>();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [editMode, setEditMode] = useState(false);
  
  const address = addresses.find((a) => a.id === addressId) || addresses[0];
  const [formData, setFormData] = useState({
    label: address.label,
    type: address.type,
    address: address.address,
    landmark: address.landmark || '',
    city: address.city,
    pincode: address.pincode,
  });

  const addressTypes = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'work', icon: 'briefcase', label: 'Work' },
    { id: 'other', icon: 'location', label: 'Other' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return 'home';
      case 'work':
        return 'briefcase';
      default:
        return 'location';
    }
  };

  const handleSave = () => {
    setAddresses((prev) =>
      prev.map((a) =>
        a.id === address.id
          ? {
              ...a,
              ...formData,
            }
          : a
      )
    );
    setEditMode(false);
  };

  const handleSetDefault = () => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === address.id,
      }))
    );
  };

  const handleDelete = () => {
    // In real app, confirm and delete
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {editMode ? 'Edit Address' : 'Address Details'}
        </ThemedText>
        {!editMode ? (
          <TouchableOpacity onPress={() => setEditMode(true)}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setEditMode(false)}>
            <ThemedText style={[styles.cancelText, { color: colors.error }]}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Preview */}
        <View style={[styles.mapPreview, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary + '30', colors.primary + '10']}
            style={styles.mapGradient}
          >
            <View style={[styles.mapMarker, { backgroundColor: colors.primary }]}>
              <Ionicons name="location" size={24} color="#fff" />
            </View>
            <View style={[styles.mapPin, { backgroundColor: colors.primary }]} />
          </LinearGradient>
          <TouchableOpacity style={[styles.mapOverlay, { backgroundColor: colors.card }]}>
            <Ionicons name="expand" size={18} color={colors.primary} />
            <ThemedText style={[styles.mapOverlayText, { color: colors.primary }]}>
              View on Map
            </ThemedText>
          </TouchableOpacity>
        </View>

        {!editMode ? (
          /* View Mode */
          <>
            {/* Address Info Card */}
            <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
              <View style={styles.addressHeader}>
                <View
                  style={[
                    styles.typeIconContainer,
                    { backgroundColor: colors.primary + '15' },
                  ]}
                >
                  <Ionicons name={getTypeIcon(address.type) as any} size={24} color={colors.primary} />
                </View>
                <View style={styles.addressHeaderInfo}>
                  <View style={styles.labelRow}>
                    <ThemedText style={styles.addressLabel}>{address.label}</ThemedText>
                    {address.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                        <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                          Default
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={[styles.addressType, { color: colors.textSecondary }]}>
                    {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.addressDetails}>
                <View style={styles.detailRow}>
                  <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
                  <View style={styles.detailContent}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Address
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{address.address}</ThemedText>
                  </View>
                </View>

                {address.landmark && (
                  <View style={styles.detailRow}>
                    <Ionicons name="flag-outline" size={18} color={colors.textSecondary} />
                    <View style={styles.detailContent}>
                      <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        Landmark
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>{address.landmark}</ThemedText>
                    </View>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
                  <View style={styles.detailContent}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      City
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{address.city}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                  <View style={styles.detailContent}>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Pincode
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{address.pincode}</ThemedText>
                  </View>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsSection}>
              {!address.isDefault && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '10' }]}
                  onPress={handleSetDefault}
                >
                  <Ionicons name="star" size={20} color={colors.primary} />
                  <ThemedText style={[styles.actionButtonText, { color: colors.primary }]}>
                    Set as Default
                  </ThemedText>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.card }]}
                onPress={() => router.push(`/booking/form?addressId=${address.id}`)}
              >
                <Ionicons name="calendar" size={20} color={colors.text} />
                <ThemedText style={styles.actionButtonText}>Book Service Here</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton, { backgroundColor: colors.error + '10' }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={20} color={colors.error} />
                <ThemedText style={[styles.actionButtonText, { color: colors.error }]}>
                  Delete Address
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Recent Services */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Recent Services at This Address</ThemedText>
              <View style={[styles.emptyServices, { backgroundColor: colors.card }]}>
                <Ionicons name="time-outline" size={32} color={colors.textSecondary} />
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No services booked at this address yet
                </ThemedText>
              </View>
            </View>
          </>
        ) : (
          /* Edit Mode */
          <View style={styles.editForm}>
            {/* Address Type */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Address Type</ThemedText>
              <View style={styles.typeOptions}>
                {addressTypes.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          formData.type === type.id ? colors.primary + '15' : colors.card,
                        borderColor:
                          formData.type === type.id ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, type: type.id as any })}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={22}
                      color={formData.type === type.id ? colors.primary : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.typeOptionText,
                        { color: formData.type === type.id ? colors.primary : colors.text },
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Label */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Address Label</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="e.g., Home, Office, Parent's House"
                placeholderTextColor={colors.textSecondary}
                value={formData.label}
                onChangeText={(text) => setFormData({ ...formData, label: text })}
              />
            </View>

            {/* Full Address */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Full Address</ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="House/Flat No., Building Name, Street"
                placeholderTextColor={colors.textSecondary}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Landmark */}
            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Landmark (Optional)</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="Near Mall, Opposite Park, etc."
                placeholderTextColor={colors.textSecondary}
                value={formData.landmark}
                onChangeText={(text) => setFormData({ ...formData, landmark: text })}
              />
            </View>

            {/* City & Pincode */}
            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>City</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="City"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
              </View>
              <View style={[styles.formSection, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Pincode</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="Pincode"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.pincode}
                  onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Use Current Location */}
            <TouchableOpacity
              style={[styles.locationButton, { borderColor: colors.primary }]}
            >
              <Ionicons name="navigate" size={20} color={colors.primary} />
              <ThemedText style={[styles.locationButtonText, { color: colors.primary }]}>
                Use Current Location
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button (Edit Mode) */}
      {editMode && (
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        </View>
      )}
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
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mapPreview: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    width: 4,
    height: 20,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -4,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  mapOverlayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addressCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressHeaderInfo: {
    flex: 1,
    marginLeft: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressType: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  addressDetails: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteButton: {
    marginTop: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyServices: {
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  editForm: {
    padding: 16,
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    height: 80,
    paddingTop: 14,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  locationButtonText: {
    fontSize: 15,
    fontWeight: '600',
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
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
