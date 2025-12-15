/**
 * Booking Tracking Page - Phase 4
 * Real-time booking status tracking with timeline
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
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface BookingData {
  id: string;
  booking_code: string;
  booking_date: string;
  time_slot: string;
  status: string;
  payment_status: string;
  total_amount: number;
  business: {
    business_name: string;
    phone: string;
    email: string;
  };
  address: {
    address_line1: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  service_provider?: {
    full_name: string;
    phone: string;
  };
  services: Array<{
    service_name: string;
    price: number;
  }>;
}

type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';

export default function BookingTrackingPage() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookingDetails();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      }, (payload) => {
        setBooking((prev) => prev ? { ...prev, ...payload.new } : null);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          business:businesses(business_name, phone, email),
          address:addresses(address_line1, city, latitude, longitude),
          service_provider:users(full_name, phone),
          booking_services(
            services(name),
            price
          )
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      if (data) {
        const formattedData = {
          ...(data as any),
          services: (data as any).booking_services?.map((bs: any) => ({
            service_name: bs.services.name,
            price: bs.price,
          })) || [],
        };
        setBooking(formattedData);
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookingDetails();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: '#FFA500',
      confirmed: '#2196F3',
      in_progress: '#9C27B0',
      completed: '#4CAF50',
      cancelled: '#F44336',
    };
    return colors[status] || '#999';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Booking Pending',
      confirmed: 'Booking Confirmed',
      in_progress: 'Service In Progress',
      completed: 'Service Completed',
      cancelled: 'Booking Cancelled',
    };
    return texts[status] || status;
  };

  const getTimelineSteps = () => {
    const steps = [
      { key: 'pending', label: 'Booking Placed', icon: '📝' },
      { key: 'confirmed', label: 'Confirmed', icon: '✓' },
      { key: 'in_progress', label: 'Service Started', icon: '🔧' },
      { key: 'completed', label: 'Completed', icon: '✓' },
    ];

    const statusOrder = ['pending', 'confirmed', 'in_progress', 'completed'];
    const currentIndex = statusOrder.indexOf(booking?.status || 'pending');

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const handleCancelBooking = async () => {
    try {
      const { error } = await (supabase
        .from('bookings') as any)
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (error) throw error;
      alert('Booking cancelled successfully');
      loadBookingDetails();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  if (loading || !booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: colors.text }]}>Track Booking</Text>
            <Text style={[styles.bookingCode, { color: colors.textSecondary }]}>
              #{booking.booking_code}
            </Text>
          </View>
        </View>

        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: getStatusColor(booking.status) + '20' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(booking.status) },
            ]}
          >
            {getStatusText(booking.status)}
          </Text>
        </View>

        {/* Timeline */}
        <Card style={styles.timelineCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Booking Progress
          </Text>
          <View style={styles.timeline}>
            {timelineSteps.map((step, index) => (
              <View key={step.key} style={styles.timelineStep}>
                <View style={styles.timelineLeftColumn}>
                  <View
                    style={[
                      styles.timelineIcon,
                      {
                        backgroundColor: step.completed
                          ? colors.primary
                          : colors.muted,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.timelineIconText,
                        { color: step.completed ? '#FFFFFF' : colors.textSecondary },
                      ]}
                    >
                      {step.icon}
                    </Text>
                  </View>
                  {index < timelineSteps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: step.completed
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      {
                        color: step.completed ? colors.text : colors.textSecondary,
                        fontWeight: step.active ? '700' : '500',
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Live Tracking */}
        {booking.status === 'in_progress' && (
          <Card style={styles.liveTrackingCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Live Tracking
            </Text>
            <TouchableOpacity
              style={[styles.trackButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/customer/live-tracking/${bookingId}` as any)}
            >
              <Text style={styles.trackButtonText}>View Live Location 🗺️</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Service Provider Info */}
        {booking.service_provider && (
          <Card style={styles.providerCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Service Provider
            </Text>
            <View style={styles.providerInfo}>
              <View style={[styles.providerAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.providerAvatarText}>
                  {booking.service_provider.full_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.providerDetails}>
                <Text style={[styles.providerName, { color: colors.text }]}>
                  {booking.service_provider.full_name}
                </Text>
                <Text style={[styles.providerPhone, { color: colors.textSecondary }]}>
                  📞 {booking.service_provider.phone}
                </Text>
              </View>
              <TouchableOpacity style={[styles.callButton, { backgroundColor: colors.primary }]}>
                <Text style={styles.callButtonText}>📞</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Booking Details */}
        <Card style={styles.detailsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Booking Details
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Business
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.business.business_name}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Date & Time
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(booking.booking_date).toLocaleDateString('en-IN')} • {booking.time_slot}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Location
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {booking.address.address_line1}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              Services
            </Text>
            <View style={styles.servicesColumn}>
              {booking.services.map((service, index) => (
                <Text key={index} style={[styles.detailValue, { color: colors.text }]}>
                  • {service.service_name}
                </Text>
              ))}
            </View>
          </View>

          <View style={[styles.detailRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Amount
            </Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{booking.total_amount.toFixed(2)}
            </Text>
          </View>
        </Card>

        {/* Actions */}
        {booking.status === 'pending' && (
          <View style={styles.actionsCard}>
            <Button
              title="Cancel Booking"
              onPress={handleCancelBooking}
              style={styles.cancelButton}
            />
          </View>
        )}

        {booking.status === 'completed' && (
          <View style={styles.actionsCard}>
            <Button
              title="Write Review"
              onPress={() => router.push(`/customer/review/${bookingId}` as any)}
              style={styles.actionButton}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl * 2,
    fontSize: 16,
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
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  bookingCode: {
    fontSize: 14,
    marginTop: spacing.xs,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  timeline: {
    paddingLeft: spacing.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineLeftColumn: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineIconText: {
    fontSize: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginVertical: spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  timelineLabel: {
    fontSize: 14,
  },
  liveTrackingCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  trackButton: {
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  providerCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  providerAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  providerPhone: {
    fontSize: 14,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  detailsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
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
  servicesColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalRow: {
    borderTopWidth: 2,
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
  actionsCard: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#F44336',
  },
});
