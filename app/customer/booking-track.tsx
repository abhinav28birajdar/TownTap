import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingTrackScreen() {
  const [notes, setNotes] = useState('Please ring the doorbell twice');
  const [currentLocation, setCurrentLocation] = useState('Fetching location...');

  const handleGetCurrentLocation = () => {
    setCurrentLocation('123 Main Street, Mumbai, Maharashtra');
    Alert.alert('Location Updated', 'Current location has been set');
  };

  const handleAddAddress = () => {
    router.push('/customer/add-address' as any);
  };

  const savedAddresses = [
    { id: '1', label: 'Home', address: '123 Main St, Mumbai' },
    { id: '2', label: 'Work', address: '456 Business Park, Mumbai' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title and Icon */}
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🗺️</Text>
          </View>
          <Text style={styles.title}>Track your service provider</Text>
        </View>

        {/* Map Card - Main Content Area */}
        <View style={styles.mainCard}>
          <View style={styles.mapPlaceholder}>
            <Ionicons name="location" size={48} color="#415D43" />
            <Text style={styles.mapText}>Provider is on the way</Text>
            <Text style={styles.mapSubtext}>Estimated arrival: 15 mins</Text>
          </View>
          
          {/* Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
          >
            <Ionicons name="locate" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Expand Icon */}
          <TouchableOpacity style={styles.expandIcon}>
            <Ionicons name="expand" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Saved Addresses */}
        <View style={styles.addressSection}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          {savedAddresses.map((addr) => (
            <TouchableOpacity key={addr.id} style={styles.addressCard}>
              <Ionicons name="location" size={20} color="#415D43" />
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>{addr.label}</Text>
                <Text style={styles.addressText}>{addr.address}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
          <TouchableOpacity 
            style={styles.addAddressButton}
            onPress={handleAddAddress}
          >
            <Ionicons name="add-circle" size={20} color="#415D43" />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </TouchableOpacity>
        </View>

        {/* Additional Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any special instructions..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            onPress={() => Alert.alert('Cancel', 'Do you want to cancel this service?', [
              { text: 'No', style: 'cancel' },
              { text: 'Yes', style: 'destructive', onPress: () => router.back() }
            ])}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Cancel{'\n'}Service</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#415D43' }]}
            onPress={() => Alert.alert('Payment', 'Redirecting to payment gateway...')}
          >
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Online{'\n'}Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#29422B' }]}
            onPress={() => router.push('/messages/chat/provider-123' as any)}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Contact{'\n'}Provider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation - removed as per requirements */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E7D4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  mainCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: '#A8D5AB',
    borderRadius: 30,
    minHeight: 300,
    marginBottom: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    position: 'relative',
  },
  mapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: Spacing.md,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: Spacing.sm,
  },
  currentLocationButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#415D43',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  expandIcon: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: Spacing.md,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: '#415D43',
    borderStyle: 'dashed',
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#415D43',
  },
  notesSection: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: Spacing.md,
    minHeight: 100,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    backgroundColor: '#6B8E6F',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
