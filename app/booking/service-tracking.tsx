import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const trackingData = {
  bookingId: 'BK-2024-1234',
  status: 'on-the-way',
  service: {
    name: 'Deep Home Cleaning',
    category: 'Cleaning',
    image: 'https://via.placeholder.com/100',
  },
  provider: {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    image: 'https://via.placeholder.com/100',
    rating: 4.8,
    verified: true,
    eta: '15 mins',
    distance: '2.5 km',
  },
  schedule: {
    date: 'Today',
    time: '10:00 AM - 2:00 PM',
  },
  address: {
    line1: '123, Green Valley Apartments',
    line2: 'Sector 42, Gurugram',
  },
  timeline: [
    { status: 'confirmed', title: 'Booking Confirmed', time: '9:00 AM', completed: true },
    { status: 'assigned', title: 'Provider Assigned', time: '9:15 AM', completed: true },
    { status: 'on-the-way', title: 'On the Way', time: '9:30 AM', completed: true, current: true },
    { status: 'arrived', title: 'Provider Arrived', time: '', completed: false },
    { status: 'in-progress', title: 'Service Started', time: '', completed: false },
    { status: 'completed', title: 'Service Completed', time: '', completed: false },
  ],
};

export default function ServiceTrackingScreen() {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for current status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    const currentIndex = trackingData.timeline.findIndex(t => t.current);
    const progress = (currentIndex / (trackingData.timeline.length - 1)) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  const handleCall = () => {
    Linking.openURL(`tel:${trackingData.provider.phone}`);
  };

  const handleMessage = () => {
    router.push('/messages/chat' as any);
  };

  const getStatusIcon = (status: string, completed: boolean, current: boolean) => {
    if (completed || current) {
      switch (status) {
        case 'confirmed': return 'checkmark-circle';
        case 'assigned': return 'person';
        case 'on-the-way': return 'car';
        case 'arrived': return 'location';
        case 'in-progress': return 'construct';
        case 'completed': return 'trophy';
        default: return 'ellipse';
      }
    }
    return 'ellipse-outline';
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Track Service</ThemedText>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <LinearGradient
            colors={[colors.primary + '30', colors.primary + '10']}
            style={styles.mapPlaceholder}
          >
            <View style={styles.mapContent}>
              <Ionicons name="map" size={48} color={colors.primary} />
              <ThemedText style={[styles.mapText, { color: colors.primary }]}>
                Live Tracking Map
              </ThemedText>
              <View style={[styles.etaBadge, { backgroundColor: colors.card }]}>
                <Ionicons name="time" size={18} color={colors.primary} />
                <ThemedText style={[styles.etaText, { color: colors.primary }]}>
                  ETA: {trackingData.provider.eta}
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Provider Card */}
        <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
          <View style={styles.providerInfo}>
            <Image source={{ uri: trackingData.provider.image }} style={styles.providerImage} />
            <View style={styles.providerDetails}>
              <View style={styles.providerHeader}>
                <ThemedText style={styles.providerName}>{trackingData.provider.name}</ThemedText>
                {trackingData.provider.verified && (
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                )}
              </View>
              <ThemedText style={[styles.serviceName, { color: colors.textSecondary }]}>
                {trackingData.service.name}
              </ThemedText>
              <View style={styles.providerMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <ThemedText style={styles.metaText}>{trackingData.provider.rating}</ThemedText>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Ionicons name="navigate" size={14} color={colors.textSecondary} />
                  <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                    {trackingData.provider.distance}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success + '15' }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={22} color={colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
              onPress={handleMessage}
            >
              <Ionicons name="chatbubble" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Status */}
        <View style={styles.currentStatusSection}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusCard}
          >
            <Animated.View style={[styles.statusIcon, { transform: [{ scale: pulseAnim }] }]}>
              <Ionicons name="car" size={32} color="#FFF" />
            </Animated.View>
            <View style={styles.statusInfo}>
              <ThemedText style={styles.statusTitle}>On the Way</ThemedText>
              <ThemedText style={styles.statusSubtitle}>
                {trackingData.provider.name} is heading to your location
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* Address */}
        <View style={[styles.addressCard, { backgroundColor: colors.card }]}>
          <View style={[styles.addressIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="location" size={22} color={colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <ThemedText style={[styles.addressLabel, { color: colors.textSecondary }]}>
              Service Location
            </ThemedText>
            <ThemedText style={styles.addressLine}>{trackingData.address.line1}</ThemedText>
            <ThemedText style={[styles.addressLine, { color: colors.textSecondary }]}>
              {trackingData.address.line2}
            </ThemedText>
          </View>
          <TouchableOpacity style={[styles.directionsButton, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="navigate" size={18} color={colors.info} />
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <ThemedText style={styles.sectionTitle}>Booking Progress</ThemedText>
          <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
            {trackingData.timeline.map((item, index) => (
              <View key={item.status} style={styles.timelineItem}>
                <View style={styles.timelineIndicator}>
                  <View style={[
                    styles.timelineIconContainer,
                    item.completed || item.current
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.border }
                  ]}>
                    <Ionicons
                      name={getStatusIcon(item.status, item.completed, item.current || false) as any}
                      size={16}
                      color={item.completed || item.current ? '#FFF' : colors.textSecondary}
                    />
                  </View>
                  {index !== trackingData.timeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      { backgroundColor: item.completed ? colors.primary : colors.border }
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <ThemedText style={[
                      styles.timelineTitle,
                      !item.completed && !item.current && { color: colors.textSecondary }
                    ]}>
                      {item.title}
                    </ThemedText>
                    {item.current && (
                      <View style={[styles.currentBadge, { backgroundColor: colors.success + '15' }]}>
                        <ThemedText style={[styles.currentBadgeText, { color: colors.success }]}>
                          Current
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {item.time && (
                    <ThemedText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                      {item.time}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="calendar" size={22} color={colors.warning} />
              </View>
              <ThemedText style={styles.quickActionText}>Reschedule</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </View>
              <ThemedText style={styles.quickActionText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="share" size={22} color={colors.info} />
              </View>
              <ThemedText style={styles.quickActionText}>Share</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
              <View style={[styles.quickActionIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="help" size={22} color={colors.success} />
              </View>
              <ThemedText style={styles.quickActionText}>Help</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Safety Tips */}
        <View style={[styles.safetyCard, { backgroundColor: colors.info + '10' }]}>
          <Ionicons name="shield-checkmark" size={24} color={colors.info} />
          <View style={styles.safetyContent}>
            <ThemedText style={[styles.safetyTitle, { color: colors.info }]}>Safety Tips</ThemedText>
            <ThemedText style={[styles.safetyText, { color: colors.textSecondary }]}>
              Verify provider identity with OTP before letting them in. All our providers are verified.
            </ThemedText>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  mapContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    gap: 8,
  },
  etaText: {
    fontSize: 15,
    fontWeight: '600',
  },
  providerCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  providerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  providerDetails: {
    flex: 1,
    marginLeft: 14,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 13,
    marginTop: 2,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStatusSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    gap: 16,
  },
  statusIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  addressIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  directionsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  timelineCard: {
    padding: 16,
    borderRadius: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 32,
  },
  timelineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 2,
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    width: (width - 42) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  safetyCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  safetyText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
