import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function CustomerTrackingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Service</Text>
        <TouchableOpacity>
          <Ionicons name="call-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <Ionicons name="location" size={80} color="#4A5F4E" />
        <Text style={styles.mapText}>Live tracking map will be displayed here</Text>
      </View>

      {/* Service Info */}
      <View style={styles.infoContainer}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusDot} />
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>Service Provider is on the way</Text>
            <Text style={styles.etaText}>Estimated arrival: 15 minutes</Text>
          </View>
        </View>

        {/* Provider Info */}
        <View style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <Ionicons name="person" size={30} color="#2D3E2F" />
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Mike Johnson</Text>
            <Text style={styles.providerService}>Plumbing Repair</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View>
          </View>
          <View style={styles.providerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="clipboard-outline" size={20} color="#6B8E6F" />
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>#TT12345</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color="#6B8E6F" />
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>Today, 2:30 PM</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color="#6B8E6F" />
            <Text style={styles.detailLabel}>Service Address</Text>
            <Text style={styles.detailValue}>123 Main St</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={20} color="#6B8E6F" />
            <Text style={styles.detailLabel}>Total Amount</Text>
            <Text style={styles.detailValue}>₹850</Text>
          </View>
        </View>

        {/* Help Button */}
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={20} color="#EF4444" />
          <Text style={styles.helpButtonText}>Need Help?</Text>
        </TouchableOpacity>
      </View>
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
  mapContainer: {
    height: 300,
    backgroundColor: '#A8D5AB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  mapText: {
    fontSize: 14,
    color: '#2D3E2F',
    fontWeight: '500',
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    gap: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F620',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  statusInfo: {
    flex: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  etaText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 60,
    height: 60,
    backgroundColor: '#A8D5AB',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInfo: {
    flex: 1,
    gap: 4,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  providerService: {
    fontSize: 14,
    color: '#6B8E6F',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B8E6F',
  },
  providerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4A5F4E',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    gap: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6B8E6F',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3E2F',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
});
