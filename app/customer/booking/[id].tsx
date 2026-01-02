/**
 * TownTap - Booking Detail Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

// Mock booking data
const mockBooking = {
  id: '1',
  business_name: 'Elite Salon & Spa',
  service_name: 'Premium Haircut',
  status: 'confirmed',
  date: 'January 15, 2026',
  time: '10:00 AM',
  duration: '45 min',
  price: 45.00,
  location: '123 Main Street, Downtown',
  provider_name: 'Sarah Johnson',
  booking_reference: 'TT-2026-001234',
  notes: 'Please arrive 10 minutes early',
};

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [booking] = useState(mockBooking);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: Colors.accentLight, text: Colors.accent };
      case 'confirmed':
        return { bg: Colors.primaryLight, text: Colors.primary };
      case 'completed':
        return { bg: Colors.secondaryLight, text: Colors.secondary };
      case 'cancelled':
        return { bg: Colors.errorLight, text: Colors.error };
      default:
        return { bg: Colors.grayLight, text: Colors.gray };
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleReschedule = () => {
    router.push('/booking/schedule');
  };

  const statusColor = getStatusColor(booking.status);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.reference}>Ref: {booking.booking_reference}</Text>
        </View>

        {/* Business Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.businessIcon}>
              <Ionicons name="storefront-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.businessInfo}>
              <Text style={styles.businessName}>{booking.business_name}</Text>
              <Text style={styles.serviceName}>{booking.service_name}</Text>
            </View>
          </View>
        </View>

        {/* Date & Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={Colors.gray} />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={Colors.gray} />
            <Text style={styles.detailText}>{booking.time} ({booking.duration})</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={Colors.gray} />
            <Text style={styles.detailText}>{booking.location}</Text>
          </View>
          <TouchableOpacity style={styles.mapBtn}>
            <Text style={styles.mapBtnText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Provider */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Service Provider</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Ionicons name="person-outline" size={24} color={Colors.gray} />
            </View>
            <View>
              <Text style={styles.providerName}>{booking.provider_name}</Text>
              <Text style={styles.providerRole}>Stylist</Text>
            </View>
            <TouchableOpacity style={styles.chatBtn}>
              <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Service Fee</Text>
            <Text style={styles.paymentValue}>${booking.price.toFixed(2)}</Text>
          </View>
          <View style={[styles.paymentRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${booking.price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {booking.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {booking.status === 'confirmed' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rescheduleBtn} onPress={handleReschedule}>
            <Text style={styles.rescheduleBtnText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.grayLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  content: { flex: 1, padding: 16 },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '600' },
  reference: { marginTop: 8, fontSize: 12, color: Colors.gray },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  businessIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessInfo: { flex: 1, marginLeft: 12 },
  businessName: { fontSize: 16, fontWeight: '600', color: Colors.grayDark },
  serviceName: { fontSize: 14, color: Colors.gray, marginTop: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: Colors.grayDark, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  detailText: { fontSize: 15, color: Colors.grayDark },
  mapBtn: { marginTop: 8 },
  mapBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  providerRow: { flexDirection: 'row', alignItems: 'center' },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerName: { fontSize: 15, fontWeight: '600', color: Colors.grayDark, marginLeft: 12 },
  providerRole: { fontSize: 13, color: Colors.gray, marginLeft: 12 },
  chatBtn: { marginLeft: 'auto', padding: 8 },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  paymentLabel: { fontSize: 14, color: Colors.gray },
  paymentValue: { fontSize: 14, color: Colors.grayDark },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 15, fontWeight: '600', color: Colors.grayDark },
  totalValue: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  notesText: { fontSize: 14, color: Colors.gray, lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.white,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: Colors.error },
  rescheduleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  rescheduleBtnText: { fontSize: 16, fontWeight: '600', color: Colors.white },
});
