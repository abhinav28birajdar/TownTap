import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CustomerBookingScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Service Info */}
        <View style={styles.serviceCard}>
          <View style={styles.serviceImage}>
            <Ionicons name="construct-outline" size={40} color="#4A5F4E" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>Plumbing Repair</Text>
            <Text style={styles.providerName}>Mike's Plumbing</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>4.8 (120 reviews)</Text>
            </View>
            <Text style={styles.priceText}>₹850</Text>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="Choose a date"
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeSlot, selectedTime === time && styles.timeSlotActive]}
                onPress={() => setSelectedTime(time)}
              >
                <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextActive]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          <TouchableOpacity 
            style={styles.addressCard}
            onPress={() => router.push('/customer/location')}
          >
            <Ionicons name="location-outline" size={24} color="#4A5F4E" />
            <View style={styles.addressInfo}>
              <Text style={styles.addressTitle}>Home</Text>
              <Text style={styles.addressText}>123 Main Street, City, State 123456</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B8E6F" />
          </TouchableOpacity>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Any specific requirements or instructions..."
            multiline
            numberOfLines={4}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Book Button */}
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
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
    gap: 24,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  serviceImage: {
    width: 80,
    height: 80,
    backgroundColor: '#A8D5AB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  providerName: {
    fontSize: 14,
    color: '#6B8E6F',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5F4E',
    marginTop: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2D3E2F',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotActive: {
    backgroundColor: '#4A5F4E',
    borderColor: '#4A5F4E',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B8E6F',
  },
  timeSlotTextActive: {
    color: '#fff',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  addressInfo: {
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
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#2D3E2F',
    height: 100,
    textAlignVertical: 'top',
  },
  bookButton: {
    backgroundColor: '#4A5F4E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
