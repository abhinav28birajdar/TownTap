import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  title: string;
  address: string;
  landmark?: string;
  city: string;
  pincode: string;
  isDefault: boolean;
  icon: string;
}

interface NewAddressForm {
  type: 'home' | 'work' | 'other';
  title: string;
  address: string;
  landmark: string;
  city: string;
  pincode: string;
}

export default function SavedAddressesScreen() {
  const { t } = useTranslation();
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      title: 'Home',
      address: '456 Oak Avenue, Apt 2B, Sector 12',
      landmark: 'Near City Mall',
      city: 'Mumbai',
      pincode: '400001',
      isDefault: true,
      icon: '🏠',
    },
    {
      id: '2',
      type: 'work',
      title: 'Office',
      address: '789 Business Park, Tower A, Floor 15',
      landmark: 'Opposite Metro Station',
      city: 'Mumbai',
      pincode: '400070',
      isDefault: false,
      icon: '🏢',
    },
  ]);

  const [newAddress, setNewAddress] = useState<NewAddressForm>({
    type: 'home',
    title: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  });

  const addressTypes = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'work', label: 'Work', icon: '🏢' },
    { key: 'other', label: 'Other', icon: '📍' },
  ];

  const setDefaultAddress = (id: string) => {
    setAddresses(prev =>
      prev.map(address => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
    Alert.alert('Success', 'Default address updated');
  };

  const removeAddress = (id: string) => {
    Alert.alert(
      'Remove Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setAddresses(prev => prev.filter(address => address.id !== id));
          },
        },
      ]
    );
  };

  const handleAddAddress = () => {
    if (!newAddress.title || !newAddress.address || !newAddress.city || !newAddress.pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const addressIcon = addressTypes.find(type => type.key === newAddress.type)?.icon || '📍';
    const newAddressItem: Address = {
      id: Date.now().toString(),
      type: newAddress.type,
      title: newAddress.title,
      address: newAddress.address,
      landmark: newAddress.landmark,
      city: newAddress.city,
      pincode: newAddress.pincode,
      isDefault: false,
      icon: addressIcon,
    };

    setAddresses(prev => [...prev, newAddressItem]);
    setNewAddress({
      type: 'home',
      title: '',
      address: '',
      landmark: '',
      city: '',
      pincode: '',
    });
    setShowAddAddress(false);
    Alert.alert('Success', 'Address added successfully');
  };

  const renderAddress = (address: Address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressInfo}>
          <Text style={styles.addressIcon}>{address.icon}</Text>
          <View style={styles.addressText}>
            <Text style={styles.addressTitle}>{address.title}</Text>
            <Text style={styles.addressDetails}>{address.address}</Text>
            {address.landmark && (
              <Text style={styles.addressLandmark}>Near {address.landmark}</Text>
            )}
            <Text style={styles.addressLocation}>{address.city} - {address.pincode}</Text>
          </View>
        </View>
        {address.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultBadgeText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.addressActions}>
        {!address.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => setDefaultAddress(address.id)}
          >
            <Text style={styles.setDefaultButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeAddress(address.id)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddAddress(true)}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Location */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.currentLocationButton}>
            <Text style={styles.currentLocationIcon}>📍</Text>
            <View style={styles.currentLocationText}>
              <Text style={styles.currentLocationTitle}>Use Current Location</Text>
              <Text style={styles.currentLocationSubtitle}>We'll detect your location automatically</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Saved Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Addresses</Text>
          {addresses.map(renderAddress)}
        </View>

        {/* Address Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>📋 Address Guidelines</Text>
          <Text style={styles.guidelinesText}>
            • Provide complete address with apartment/house number{'\n'}
            • Include nearby landmarks for easy identification{'\n'}
            • Ensure pincode is correct for accurate delivery{'\n'}
            • Set a default address for faster checkout
          </Text>
        </View>
      </ScrollView>

      {/* Add Address Modal */}
      <Modal
        visible={showAddAddress}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddAddress(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Address</Text>
            <TouchableOpacity onPress={handleAddAddress}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Address Type */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Address Type</Text>
              <View style={styles.typeSelector}>
                {addressTypes.map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeOption,
                      newAddress.type === type.key && styles.typeOptionSelected,
                    ]}
                    onPress={() => setNewAddress({ ...newAddress, type: type.key as any })}
                  >
                    <Text style={styles.typeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      newAddress.type === type.key && styles.typeLabelSelected,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Address Title *</Text>
              <TextInput
                style={styles.formInput}
                value={newAddress.title}
                onChangeText={(text) => setNewAddress({ ...newAddress, title: text })}
                placeholder="e.g., Home, Office, Friend's Place"
              />
            </View>

            {/* Address */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Complete Address *</Text>
              <TextInput
                style={[styles.formInput, styles.multilineInput]}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                placeholder="House/Flat/Floor No., Building Name/Number, Area, Street"
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Landmark */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nearby Landmark</Text>
              <TextInput
                style={styles.formInput}
                value={newAddress.landmark}
                onChangeText={(text) => setNewAddress({ ...newAddress, landmark: text })}
                placeholder="e.g., Near City Mall, Opposite Metro Station"
              />
            </View>

            {/* City and Pincode */}
            <View style={styles.formRow}>
              <View style={styles.formSectionHalf}>
                <Text style={styles.formLabel}>City *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAddress.city}
                  onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                  placeholder="Mumbai"
                />
              </View>

              <View style={styles.formSectionHalf}>
                <Text style={styles.formLabel}>Pincode *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newAddress.pincode}
                  onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                  placeholder="400001"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Map Section */}
            <View style={styles.mapSection}>
              <TouchableOpacity style={styles.mapButton}>
                <Text style={styles.mapButtonIcon}>🗺️</Text>
                <Text style={styles.mapButtonText}>Choose on Map</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addButton: {
    padding: 4,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
    marginHorizontal: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  currentLocationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  currentLocationText: {
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  currentLocationSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#CED4DA',
    fontWeight: 'bold',
  },
  addressCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  addressIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  addressText: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  addressDetails: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    lineHeight: 20,
  },
  addressLandmark: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    fontStyle: 'italic',
  },
  addressLocation: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
    fontWeight: '500',
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  setDefaultButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  setDefaultButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFC107',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DC3545',
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  guidelinesSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  guidelinesText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  typeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#007AFF',
  },
  mapSection: {
    marginTop: 20,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  mapButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
