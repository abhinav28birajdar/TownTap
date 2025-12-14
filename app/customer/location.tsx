import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const savedAddresses = [
  { id: '1', title: 'Home', address: '123 Main Street, City, State 123456', icon: 'home' },
  { id: '2', title: 'Work', address: '456 Office Plaza, Business District, State 654321', icon: 'briefcase' },
];

export default function CustomerLocationScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Location */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B8E6F" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for area, street name..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Current Location */}
        <TouchableOpacity 
          style={styles.currentLocationButton}
          onPress={() => router.push('/customer/tracking')}
        >
          <View style={styles.locationIcon}>
            <Ionicons name="locate" size={24} color="#4A5F4E" />
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.locationTitle}>Use Current Location</Text>
            <Text style={styles.locationSubtitle}>Enable GPS to detect location</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B8E6F" />
        </TouchableOpacity>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={60} color="#A8D5AB" />
          <Text style={styles.mapPlaceholderText}>Map view will be displayed here</Text>
        </View>

        {/* Saved Addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {savedAddresses.map((item) => (
            <TouchableOpacity key={item.id} style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons name={item.icon as any} size={20} color="#4A5F4E" />
              </View>
              <View style={styles.addressDetails}>
                <Text style={styles.addressTitle}>{item.title}</Text>
                <Text style={styles.addressText}>{item.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B8E6F" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.addAddressButton}>
            <Ionicons name="add-circle-outline" size={20} color="#4A5F4E" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3E2F',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  locationIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#A8D5AB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
    gap: 4,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  locationSubtitle: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  addressIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#A8D5AB',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addressDetails: {
    flex: 1,
    gap: 4,
  },
  addressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  addressText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A5F4E',
  },
  confirmButton: {
    backgroundColor: '#4A5F4E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
