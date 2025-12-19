import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();

  // Mock order data - replace with real data from Supabase
  const order = {
    id: id as string,
    customer: 'John Smith',
    phone: '+91 98765 43210',
    email: 'john@example.com',
    service: 'House Cleaning',
    category: 'Cleaning',
    amount: 1500,
    status: 'pending',
    bookingDate: '2024-01-20',
    bookingTime: '10:00 AM',
    address: '123 Main Street, Apartment 4B, City Name, 400001',
    specialInstructions: 'Please bring eco-friendly cleaning products. Pet-friendly home.',
    createdAt: '2024-01-15 09:30 AM',
  };

  const handleAccept = () => {
    console.log('Accept order:', id);
    Alert.alert(
      'Accept Order',
      'Are you sure you want to accept this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Update order status in database
            Alert.alert('Success', 'Order accepted successfully!');
            router.back();
          },
        },
      ]
    );
  };

  const handleReject = () => {
    console.log('Reject order:', id);
    Alert.alert(
      'Reject Order',
      'Are you sure you want to reject this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            // Update order status in database
            Alert.alert('Order Rejected', 'The customer will be notified.');
            router.back();
          },
        },
      ]
    );
  };

  const handleComplete = () => {
    console.log('Complete order:', id);
    Alert.alert(
      'Complete Order',
      'Mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // Update order status in database
            Alert.alert('Success', 'Order marked as completed!');
            router.back();
          },
        },
      ]
    );
  };

  const handleContact = () => {
    console.log('Contact customer:', order.phone);
    Alert.alert(
      'Contact Customer',
      `Call ${order.customer}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // Implement phone call functionality
            console.log('Calling:', order.phone);
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#415D43';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {order.status.toUpperCase()}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Customer Information</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.customer}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.phone}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.email}</ThemedText>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Customer</Text>
          </TouchableOpacity>
        </View>

        {/* Service Info */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Service Details</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="briefcase-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.service}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="pricetag-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.category}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>₹{order.amount}</ThemedText>
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <ThemedText style={styles.sectionTitle}>Booking Details</ThemedText>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.bookingDate}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.bookingTime}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={theme.colors.text} />
            <ThemedText style={styles.infoText}>{order.address}</ThemedText>
          </View>
        </View>

        {/* Special Instructions */}
        {order.specialInstructions && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Special Instructions</ThemedText>
            <ThemedText style={styles.instructionsText}>{order.specialInstructions}</ThemedText>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: theme.colors.card }]}>
        {order.status === 'pending' && (
          <>
            <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
              <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </>
        )}
        {order.status === 'accepted' && (
          <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color="#fff" />
            <Text style={styles.completeButtonText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#415D43',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginRight: 8,
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#415D43',
    padding: 16,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
