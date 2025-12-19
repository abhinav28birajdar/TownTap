import { ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockAddresses = [
  {
    id: '1',
    label: 'Home',
    address: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Work',
    address: '456 Business Park, Tower A',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
    isDefault: false,
  },
  {
    id: '3',
    label: 'Parent\'s Home',
    address: '789 Garden Street',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411001',
    isDefault: false,
  },
];

export default function SavedAddressesScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState(mockAddresses);

  const handleAddAddress = () => {
    router.push('/customer/add-address' as any);
  };

  const handleEditAddress = (addressId: string) => {
    router.push(`/customer/edit-address?id=${addressId}` as any);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== addressId));
            Alert.alert('Success', 'Address deleted successfully');
          },
        },
      ]
    );
  };

  const handleSetDefault = (addressId: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    })));
    Alert.alert('Success', 'Default address updated');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Saved Addresses</ThemedText>
        <TouchableOpacity onPress={handleAddAddress}>
          <Ionicons name="add" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.emptyState}
          >
            <Ionicons name="location-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Addresses Saved</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Add your addresses for quick booking
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: '#415D43' }]}
              onPress={handleAddAddress}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>Add Address</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.addressesContainer}>
            {addresses.map((address, index) => (
              <Animated.View
                key={address.id}
                entering={FadeInDown.delay(100 + index * 50)}
              >
                <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
                  <View style={styles.addressHeader}>
                    <View style={styles.labelContainer}>
                      <Ionicons
                        name={
                          address.label === 'Home'
                            ? 'home'
                            : address.label === 'Work'
                            ? 'briefcase'
                            : 'location'
                        }
                        size={20}
                        color="#415D43"
                      />
                      <ThemedText style={styles.addressLabel}>{address.label}</ThemedText>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <ThemedText style={styles.defaultText}>Default</ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEditAddress(address.id)}
                      >
                        <Ionicons name="create-outline" size={20} color={colors.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleDeleteAddress(address.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.addressContent}>
                    <ThemedText style={styles.addressText}>{address.address}</ThemedText>
                    <ThemedText style={styles.addressText}>
                      {address.city}, {address.state} - {address.pincode}
                    </ThemedText>
                  </View>

                  {!address.isDefault && (
                    <TouchableOpacity
                      style={[styles.setDefaultButton, { borderColor: '#415D43' }]}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <ThemedText style={[styles.setDefaultText, { color: '#415D43' }]}>
                        Set as Default
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            ))}

            <TouchableOpacity
              style={[styles.addNewCard, { backgroundColor: colors.card, borderColor: '#415D43' }]}
              onPress={handleAddAddress}
            >
              <Ionicons name="add-circle-outline" size={32} color="#415D43" />
              <ThemedText style={[styles.addNewText, { color: '#415D43' }]}>
                Add New Address
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addressesContainer: {
    paddingVertical: 8,
  },
  addressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#415D43',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  addressContent: {
    marginBottom: 16,
  },
  addressText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  setDefaultButton: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  setDefaultText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addNewCard: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  addNewText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
