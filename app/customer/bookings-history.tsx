/**
 * Bookings History Page - Phase 4
 * List of all customer bookings with filters
 */

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Booking {
  id: string;
  booking_code: string;
  booking_date: string;
  time_slot: string;
  status: string;
  total_amount: number;
  business: {
    business_name: string;
    category: string;
  };
  services_count: number;
}

type FilterType = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function BookingsHistoryPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          business:businesses(business_name, category),
          booking_services(count)
        `)
        .eq('customer_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (filter === 'upcoming') {
        query = query.in('status', ['pending', 'confirmed', 'in_progress']);
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'cancelled');
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        const formattedData = data.map((booking: any) => ({
          ...booking,
          services_count: booking.booking_services?.length || 0,
        }));
        setBookings(formattedData);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const getStatusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      pending: 'warning',
      confirmed: 'info',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error',
    };
    return variants[status] || 'info';
  };

  const renderBookingCard = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/customer/booking-tracking?bookingId=${item.id}`)}
    >
      <Card style={styles.bookingCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.bookingCode, { color: colors.text }]}>
              #{item.booking_code}
            </Text>
            <Text style={[styles.businessName, { color: colors.textSecondary }]}>
              {item.business.business_name}
            </Text>
          </View>
          <Badge
            text={item.status.replace('_', ' ')}
            variant={getStatusBadgeVariant(item.status)}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {new Date(item.booking_date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {item.time_slot}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏷️</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {item.services_count} service(s)
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.amount, { color: colors.primary }]}>
            ₹{item.total_amount.toFixed(2)}
          </Text>
          <TouchableOpacity>
            <Text style={[styles.viewDetails, { color: colors.primary }]}>
              View Details →
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const filters: Array<{ key: FilterType; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterChip,
              filter === f.key && [
                styles.filterChipActive,
                { backgroundColor: colors.primary },
              ],
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f.key && styles.filterTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No bookings found
            </Text>
          </View>
        }
      />
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
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F5F5F5',
  },
  filterChipActive: {
    // backgroundColor will be set inline
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
  },
  bookingCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  bookingCode: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  businessName: {
    fontSize: 14,
  },
  cardContent: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoIcon: {
    fontSize: 16,
  },
  infoText: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: spacing.md,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
  },
});
