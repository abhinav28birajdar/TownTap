/**
 * Booking Confirmation Page - Phase 3
 * Review booking details before payment
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingConfirmationPage() {
  const { bookingData: bookingDataParam } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [processing, setProcessing] = useState(false);
  const bookingData = JSON.parse(bookingDataParam as string);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      // Create booking in database
      const { data: booking, error: bookingError } = await (supabase
        .from('bookings') as any)
        .insert({
          customer_id: user?.id,
          business_id: bookingData.businessId,
          booking_date: new Date(bookingData.date).toISOString(),
          time_slot: bookingData.timeSlot,
          status: 'pending',
          total_amount: bookingData.total,
          special_instructions: bookingData.specialInstructions,
          service_address_id: bookingData.address.id,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create booking services
      const serviceInserts = bookingData.services.map((service: any) => ({
        booking_id: booking.id,
        service_id: service.id,
        price: service.final_price,
      }));

      const { error: servicesError } = await (supabase
        .from('booking_services') as any)
        .insert(serviceInserts);

      if (servicesError) throw servicesError;

      // Create transaction
      const { error: transactionError } = await (supabase
        .from('transactions') as any)
        .insert({
          user_id: user?.id,
          booking_id: booking.id,
          amount: bookingData.total,
          status: 'pending',
          payment_method: 'card',
        });

      if (transactionError) throw transactionError;

      // Simulate payment gateway
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update booking status
      await (supabase
        .from('bookings') as any)
        .update({ status: 'confirmed', payment_status: 'paid' })
        .eq('id', booking.id);

      // Navigate to success page
      router.replace({
        pathname: '/booking/success',
        params: { bookingId: booking.id },
      });
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Confirm Booking</Text>
        </View>

        {/* Services Summary */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Services ({bookingData.services.length})
          </Text>
          {bookingData.services.map((service: any) => (
            <View key={service.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {service.name}
                </Text>
                {service.duration && (
                  <Text style={[styles.itemDetail, { color: colors.textSecondary }]}>
                    ⏱️ {service.duration} mins
                  </Text>
                )}
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                ₹{service.final_price}
              </Text>
            </View>
          ))}
        </Card>

        {/* Date & Time */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Date & Time
          </Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              📅 Date
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(bookingData.date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              ⏰ Time
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {bookingData.timeSlot}
            </Text>
          </View>
        </Card>

        {/* Service Address */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Service Address
          </Text>
          <View style={styles.addressBox}>
            <Text style={[styles.addressLabel, { color: colors.text }]}>
              📍 {bookingData.address.label}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {bookingData.address.address_line1}
            </Text>
            <Text style={[styles.addressText, { color: colors.textSecondary }]}>
              {bookingData.address.city}
            </Text>
          </View>
        </Card>

        {/* Special Instructions */}
        {bookingData.specialInstructions && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Special Instructions
            </Text>
            <Text style={[styles.instructionsText, { color: colors.textSecondary }]}>
              {bookingData.specialInstructions}
            </Text>
          </Card>
        )}

        {/* Payment Method */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          <View style={styles.paymentMethod}>
            <Text style={[styles.paymentText, { color: colors.text }]}>
              💳 Card Payment
            </Text>
            <TouchableOpacity>
              <Text style={[styles.changeText, { color: colors.primary }]}>Change</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Summary
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              Service Charge
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{bookingData.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              GST (18%)
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ₹{bookingData.tax.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Amount to Pay
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{bookingData.total.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            By confirming, you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms & Conditions</Text> and{' '}
            <Text style={{ color: colors.primary }}>Cancellation Policy</Text>
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
              Total Payable
            </Text>
            <Text style={[styles.footerAmount, { color: colors.text }]}>
              ₹{bookingData.total.toFixed(2)}
            </Text>
          </View>
          <Button
            title={processing ? '' : 'Pay & Confirm'}
            onPress={handlePayment}
            disabled={processing}
            style={styles.confirmButton}
          >
            {processing && <ActivityIndicator color="#FFFFFF" />}
          </Button>
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  itemDetail: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  addressBox: {
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '700',
  },
  termsSection: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
  confirmButton: {
    minWidth: 160,
  },
});
