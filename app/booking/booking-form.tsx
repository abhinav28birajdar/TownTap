/**
 * Booking Form Page - Phase 3
 * Date, time, address selection
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Address {
  id: string;
  label: string;
  address_line1: string;
  city: string;
}

export default function BookingFormPage() {
  const { businessId, services: servicesParam } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const services = JSON.parse(servicesParam as string);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (data) {
      setAddresses(data);
      if (data.length > 0) setSelectedAddress(data[0]);
    }
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM',
  ];

  const calculateTotal = () => {
    const subtotal = services.reduce((sum: number, s: any) => sum + s.final_price, 0);
    const tax = subtotal * 0.18; // 18% GST
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress || !selectedTimeSlot) {
      alert('Please select date, time and address');
      return;
    }

    const bookingData = {
      businessId,
      services,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      address: selectedAddress,
      specialInstructions,
      ...calculateTotal(),
    };

    router.push({
      pathname: '/booking/confirmation',
      params: { bookingData: JSON.stringify(bookingData) },
    });
  };

  const { subtotal, tax, total } = calculateTotal();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Book Service</Text>
        </View>

        {/* Selected Services Summary */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Selected Services
          </Text>
          {services.map((service: any) => (
            <View key={service.id} style={styles.serviceRow}>
              <Text style={[styles.serviceName, { color: colors.text }]}>
                {service.name}
              </Text>
              <Text style={[styles.servicePrice, { color: colors.text }]}>
                ₹{service.final_price}
              </Text>
            </View>
          ))}
        </Card>

        {/* Date Selection */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Date</Text>
          <View style={styles.dateSelector}>
            <Text style={[styles.selectedDate, { color: colors.text }]}>
              {selectedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <TouchableOpacity>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Time Slot Selection */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Time Slot</Text>
          <View style={styles.timeSlotGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlot,
                  selectedTimeSlot === slot && [
                    styles.selectedTimeSlot,
                    { backgroundColor: colors.primary, borderColor: colors.primary },
                  ],
                ]}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    { color: selectedTimeSlot === slot ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Address Selection */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Service Address
            </Text>
            <TouchableOpacity onPress={() => router.push('/customer/addresses' as any)}>
              <Text style={[styles.changeText, { color: colors.primary }]}>
                + Add New
              </Text>
            </TouchableOpacity>
          </View>

          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress?.id === address.id && {
                  borderColor: colors.primary,
                  borderWidth: 2,
                },
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <View style={styles.addressHeader}>
                <Text style={[styles.addressLabel, { color: colors.text }]}>
                  {address.label}
                </Text>
                <View style={[styles.radio, { borderColor: colors.primary }]}>
                  {selectedAddress?.id === address.id && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
              </View>
              <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                {address.address_line1}, {address.city}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Special Instructions */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Special Instructions (Optional)
          </Text>
          <TextInput
            style={[
              styles.textArea,
              {
                color: colors.text,
                backgroundColor: colors.muted,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add any special requirements..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
          />
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Details</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Service Charge
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              GST (18%)
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{tax.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
              Total Amount
            </Text>
            <Text style={[styles.footerAmount, { color: colors.text }]}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
          <Button
            title="Proceed to Payment"
            onPress={handleProceedToPayment}
            style={styles.proceedButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    margin: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  serviceName: {
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDate: {
    fontSize: 14,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
  },
  addressCard: {
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.sm,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressText: {
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '700',
  },
  proceedButton: {
    minWidth: 160,
  },
});
