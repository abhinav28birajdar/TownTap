/**
 * Live Tracking Page - Phase 4
 * Real-time location tracking of service provider
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Location {
  latitude: number;
  longitude: number;
}

export default function LiveTrackingPage() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [providerLocation, setProviderLocation] = useState<Location | null>(null);
  const [customerLocation, setCustomerLocation] = useState<Location | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('15 mins');
  const [distance, setDistance] = useState('2.3 km');

  useEffect(() => {
    loadLocations();

    // Subscribe to real-time location updates
    const subscription = supabase
      .channel(`tracking:${bookingId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_provider_locations',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const newData = payload.new as any;
          setProviderLocation({
            latitude: newData.latitude,
            longitude: newData.longitude,
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  const loadLocations = async () => {
    try {
      // Load customer address
      const { data: booking } = await supabase
        .from('bookings')
        .select('address:addresses(latitude, longitude)')
        .eq('id', bookingId)
        .single();

      if (booking && typeof booking === 'object') {
        const bookingData = booking as any;
        if (bookingData?.address) {
          setCustomerLocation({
            latitude: bookingData.address.latitude,
            longitude: bookingData.address.longitude,
          });
        }
      }

      // Load provider location
      const { data: location } = await supabase
        .from('service_provider_locations')
        .select('latitude, longitude')
        .eq('booking_id', bookingId)
        .single();

      if (location && typeof location === 'object') {
        const locationData = location as any;
        setProviderLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        });
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map View */}
      <View style={[styles.mapContainer, { backgroundColor: colors.muted }]}>
        <Text style={[styles.mapPlaceholder, { color: colors.textSecondary }]}>
          🗺️ Live Map
        </Text>
        <Text style={[styles.mapHint, { color: colors.textSecondary }]}>
          Google Maps with live tracking
        </Text>

        {/* Provider Marker */}
        {providerLocation && (
          <View style={[styles.providerMarker, { top: '40%', left: '50%' }]}>
            <View style={[styles.providerMarkerInner, { backgroundColor: colors.primary }]}>
              <Text style={styles.markerText}>🚗</Text>
            </View>
            <View style={[styles.pulse, { backgroundColor: colors.primary }]} />
          </View>
        )}

        {/* Customer Marker */}
        {customerLocation && (
          <View style={[styles.customerMarker, { top: '70%', left: '50%' }]}>
            <Text style={styles.markerText}>📍</Text>
          </View>
        )}
      </View>

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Info Card */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handle} />

        <Card style={styles.infoCard}>
          <View style={styles.estimateRow}>
            <View style={styles.estimateItem}>
              <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
                Estimated Time
              </Text>
              <Text style={[styles.estimateValue, { color: colors.primary }]}>
                {estimatedTime}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.estimateItem}>
              <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>
                Distance
              </Text>
              <Text style={[styles.estimateValue, { color: colors.primary }]}>
                {distance}
              </Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              Service provider is on the way
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🚨</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>SOS</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholder: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  mapHint: {
    fontSize: 14,
  },
  providerMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerMarkerInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  pulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.3,
    zIndex: 1,
  },
  customerMarker: {
    position: 'absolute',
    fontSize: 32,
  },
  markerText: {
    fontSize: 28,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.md * 2,
    borderTopRightRadius: BorderRadius.md * 2,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  infoCard: {
    padding: spacing.md,
  },
  estimateRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  estimateItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: spacing.md,
  },
  estimateLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  estimateValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.md,
    marginBottom: spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
