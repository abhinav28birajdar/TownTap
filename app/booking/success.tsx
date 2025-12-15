/**
 * Booking Success Page - Phase 3
 * Confirmation screen after successful booking
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface BookingDetails {
  id: string;
  booking_code: string;
  booking_date: string;
  time_slot: string;
  status: string;
  total_amount: number;
  business: {
    business_name: string;
    phone: string;
  };
  address: {
    address_line1: string;
    city: string;
  };
}

export default function BookingSuccessPage() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          business:businesses(business_name, phone),
          address:addresses(address_line1, city)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      if (data) setBooking(data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    router.replace('/customer/dashboard');
  };

  const handleViewBooking = () => {
    router.push('/customer/bookings' as any);
  };

  if (loading || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={[styles.successIcon, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Success Message */}
        <Text style={[styles.title, { color: colors.text }]}>
          Booking Confirmed!
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your service has been successfully booked
        </Text>

        {/* Booking Code */}
        <Card style={styles.codeCard}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
            Booking Code
          </Text>
          <Text style={[styles.codeValue, { color: colors.primary }]}>
            {booking.booking_code}
          </Text>
          <Text style={[styles.codeHint, { color: colors.textSecondary }]}>
            Save this code for future reference
          </Text>
        </Card>

        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Booking Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Service Provider
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.business.business_name}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(booking.booking_date).toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Time
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.time_slot}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Service Address
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.address.address_line1}, {booking.address.city}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Amount Paid
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{booking.total_amount.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Contact Information */}
        <Card style={styles.contactCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Information
          </Text>
          <Text style={[styles.contactText, { color: colors.textSecondary }]}>
            The service provider will contact you on your registered phone number for any updates
          </Text>
          <TouchableOpacity style={styles.phoneButton}>
            <Text style={[styles.phoneText, { color: colors.primary }]}>
              📞 {booking.business.phone}
            </Text>
          </TouchableOpacity>
        </Card>

        {/* What's Next */}
        <Card style={styles.nextStepsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What's Next?
          </Text>
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Service provider will confirm your booking
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                You'll receive updates on your booking status
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Professional will arrive at your location
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title="View Booking"
          onPress={handleViewBooking}
          style={styles.primaryButton}
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoHome}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
            Go to Home
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingTop: spacing.xl * 2,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl * 2,
    fontSize: 16,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  codeCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  codeValue: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  codeHint: {
    fontSize: 12,
  },
  detailsCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    marginTop: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: '#E0E0E0',
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
  contactCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  phoneButton: {
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextStepsCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  stepsList: {
    gap: spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  footer: {
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
