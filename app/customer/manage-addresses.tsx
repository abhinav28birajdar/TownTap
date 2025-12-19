import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
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
  type: 'home' | 'work' | 'other';
  label: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

const addresses: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    fullAddress: '123, Maple Street, Andheri West, Mumbai, Maharashtra',
    landmark: 'Near City Mall',
    pincode: '400058',
    isDefault: true,
    lat: 19.1234,
    lng: 72.8567,
  },
  {
    id: '2',
    type: 'work',
    label: 'Office',
    fullAddress: '456, Tech Park, Whitefield, Bangalore, Karnataka',
    landmark: 'Opposite Metro Station',
    pincode: '560066',
    isDefault: false,
    lat: 12.9876,
    lng: 77.7654,
  },
  {
    id: '3',
    type: 'other',
    label: 'Parents House',
    fullAddress: '789, Green Valley, Koregaon Park, Pune, Maharashtra',
    pincode: '411001',
    isDefault: false,
    lat: 18.5367,
    lng: 73.8936,
  },
];

export default function ManageAddressesScreen() {
  const colors = useColors();
  const [addressList, setAddressList] = useState<Address[]>(addresses);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    fullAddress: '',
    landmark: '',
    pincode: '',
  });

  const getTypeIcon = (type: Address['type']) => {
    switch (type) {
      case 'home': return 'home';
      case 'work': return 'business';
      case 'other': return 'location';
      default: return 'location';
    }
  };

  const getTypeColor = (type: Address['type']) => {
    switch (type) {
      case 'home': return colors.primary;
      case 'work': return colors.info;
      case 'other': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = addressList.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddressList(updated);
    setShowDetailModal(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = addressList.filter(addr => addr.id !== id);
    setAddressList(updated);
    setShowDetailModal(false);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={[styles.addressCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedAddress(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.addressHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '15' }]}>
          <Ionicons name={getTypeIcon(item.type)} size={20} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.addressLabelRow}>
            <ThemedText style={styles.addressLabel}>{item.label}</ThemedText>
            {item.isDefault && (
              <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                  Default
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.fullAddress}
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
      {item.landmark && (
        <View style={styles.landmarkRow}>
          <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.landmarkText, { color: colors.textSecondary }]}>
            {item.landmark}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Manage Addresses</ThemedText>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Ionicons name="location" size={24} color="#FFF" />
            <ThemedText style={styles.statValue}>{addressList.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Saved Addresses</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* Current Location */}
      <TouchableOpacity style={[styles.currentLocation, { backgroundColor: colors.card }]}>
        <View style={[styles.currentLocationIcon, { backgroundColor: colors.info + '15' }]}>
          <Ionicons name="navigate" size={20} color={colors.info} />
        </View>
        <View style={styles.currentLocationInfo}>
          <ThemedText style={styles.currentLocationTitle}>Use Current Location</ThemedText>
          <ThemedText style={[styles.currentLocationDesc, { color: colors.textSecondary }]}>
            Enable location to auto-detect address
          </ThemedText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Address List */}
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Saved Addresses</ThemedText>
        <FlatList
          data={addressList}
          renderItem={renderAddress}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Addresses Saved</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Add an address to get started
              </ThemedText>
            </View>
          }
        />
      </View>

      {/* Address Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Address Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedAddress && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Address Card */}
                <View style={[styles.detailCard, { backgroundColor: colors.background }]}>
                  <View style={styles.detailHeader}>
                    <View style={[
                      styles.detailTypeIcon,
                      { backgroundColor: getTypeColor(selectedAddress.type) + '15' }
                    ]}>
                      <Ionicons
                        name={getTypeIcon(selectedAddress.type)}
                        size={24}
                        color={getTypeColor(selectedAddress.type)}
                      />
                    </View>
                    <View style={styles.detailInfo}>
                      <ThemedText style={styles.detailLabel}>{selectedAddress.label}</ThemedText>
                      {selectedAddress.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.success + '15' }]}>
                          <ThemedText style={[styles.defaultText, { color: colors.success }]}>
                            Default
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                    <ThemedText style={styles.detailText}>{selectedAddress.fullAddress}</ThemedText>
                  </View>

                  {selectedAddress.landmark && (
                    <View style={styles.detailRow}>
                      <Ionicons name="flag-outline" size={18} color={colors.warning} />
                      <ThemedText style={styles.detailText}>{selectedAddress.landmark}</ThemedText>
                    </View>
                  )}

                  <View style={styles.detailRow}>
                    <Ionicons name="mail-outline" size={18} color={colors.info} />
                    <ThemedText style={styles.detailText}>PIN: {selectedAddress.pincode}</ThemedText>
                  </View>
                </View>

                {/* Map Preview */}
                <View style={[styles.mapPreview, { backgroundColor: colors.background }]}>
                  <Ionicons name="map-outline" size={48} color={colors.textSecondary} />
                  <ThemedText style={[styles.mapPlaceholder, { color: colors.textSecondary }]}>
                    Map Preview
                  </ThemedText>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  {!selectedAddress.isDefault && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.success }]}
                      onPress={() => handleSetDefault(selectedAddress.id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                      <ThemedText style={styles.actionButtonText}>Set as Default</ThemedText>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.info }]}
                  >
                    <Ionicons name="create" size={18} color="#FFF" />
                    <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: colors.error }]}
                  onPress={() => handleDeleteAddress(selectedAddress.id)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.error} />
                  <ThemedText style={[styles.deleteButtonText, { color: colors.error }]}>
                    Delete Address
                  </ThemedText>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add New Address</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Address Type */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Address Type
                </ThemedText>
                <View style={styles.typeSelector}>
                  {[
                    { type: 'home', icon: 'home', label: 'Home' },
                    { type: 'work', icon: 'business', label: 'Work' },
                    { type: 'other', icon: 'location', label: 'Other' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.typeOption,
                        newAddress.type === item.type && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => setNewAddress({ ...newAddress, type: item.type as any })}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={newAddress.type === item.type ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText style={[
                        styles.typeOptionText,
                        { color: newAddress.type === item.type ? colors.primary : colors.textSecondary }
                      ]}>
                        {item.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Label */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Save As (Label)
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., My Home"
                  placeholderTextColor={colors.textSecondary}
                  value={newAddress.label}
                  onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
                />
              </View>

              {/* Full Address */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Full Address
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    { backgroundColor: colors.background, color: colors.text }
                  ]}
                  placeholder="House/Flat No., Building, Street, Area"
                  placeholderTextColor={colors.textSecondary}
                  value={newAddress.fullAddress}
                  onChangeText={(text) => setNewAddress({ ...newAddress, fullAddress: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Landmark */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Landmark (Optional)
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="e.g., Near City Mall"
                  placeholderTextColor={colors.textSecondary}
                  value={newAddress.landmark}
                  onChangeText={(text) => setNewAddress({ ...newAddress, landmark: text })}
                />
              </View>

              {/* Pincode */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Pincode
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor={colors.textSecondary}
                  value={newAddress.pincode}
                  onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>

              {/* Use Current Location */}
              <TouchableOpacity style={[styles.locationButton, { borderColor: colors.primary }]}>
                <Ionicons name="navigate" size={18} color={colors.primary} />
                <ThemedText style={[styles.locationButtonText, { color: colors.primary }]}>
                  Use Current Location
                </ThemedText>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={styles.submitButtonText}>Save Address</ThemedText>
              </TouchableOpacity>
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
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  currentLocationIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentLocationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  currentLocationDesc: {
    fontSize: 13,
  },
  section: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  addressCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  landmarkText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailInfo: {
    flex: 1,
    marginLeft: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  mapPreview: {
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  mapPlaceholder: {
    fontSize: 13,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  locationButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
