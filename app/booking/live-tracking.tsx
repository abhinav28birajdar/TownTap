import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface TrackingState {
  status: 'assigned' | 'on-the-way' | 'nearby' | 'arrived' | 'in-progress' | 'completed';
  title: string;
  subtitle: string;
  time?: string;
}

const trackingStates: TrackingState[] = [
  { status: 'assigned', title: 'Provider Assigned', subtitle: 'Finding the best match for you', time: '10:15 AM' },
  { status: 'on-the-way', title: 'On The Way', subtitle: 'Your provider is heading to your location', time: '10:25 AM' },
  { status: 'nearby', title: 'Almost There', subtitle: 'Provider is 5 minutes away', time: '10:45 AM' },
  { status: 'arrived', title: 'Provider Arrived', subtitle: 'Your provider has arrived', time: '10:52 AM' },
  { status: 'in-progress', title: 'Service In Progress', subtitle: 'Work has started', time: '10:55 AM' },
  { status: 'completed', title: 'Service Completed', subtitle: 'Your service is complete', time: '01:30 PM' },
];

const provider = {
  name: 'Rajesh Kumar',
  avatar: 'https://randomuser.me/api/portraits/men/35.jpg',
  rating: 4.8,
  totalJobs: 1240,
  phone: '+91 98765 43210',
  vehicleNumber: 'MH 12 AB 1234',
};

const booking = {
  id: 'BK-12345',
  service: 'Deep Home Cleaning',
  scheduledTime: '11:00 AM',
  duration: '3-4 hours',
  address: 'Tower A, Flat 302, Green Valley Apartments, Andheri West',
};

export default function LiveTrackingScreen() {
  const colors = useColors();
  const [currentState, setCurrentState] = useState(1); // Start with 'on-the-way'
  const [showProviderCard, setShowProviderCard] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide in animation
    Animated.spring(slideAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // Simulate progress (for demo)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentState((prev) => {
        if (prev < trackingStates.length - 1) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const currentTrackingState = trackingStates[currentState];
  const isCompleted = currentState === trackingStates.length - 1;

  const getStatusColor = () => {
    if (isCompleted) return colors.success;
    if (currentState >= 3) return colors.primary;
    return colors.warning;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Live Tracking</ThemedText>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colors.card }]}>
        <LinearGradient
          colors={[colors.primary + '30', colors.primary + '10']}
          style={styles.mapPlaceholder}
        >
          <View style={styles.mapContent}>
            <Animated.View
              style={[
                styles.providerMarker,
                { backgroundColor: colors.primary },
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="person" size={20} color="#FFF" />
            </Animated.View>
            <View style={[styles.routeLine, { borderColor: colors.primary }]} />
            <View style={[styles.destinationMarker, { backgroundColor: colors.error }]}>
              <Ionicons name="home" size={16} color="#FFF" />
            </View>
          </View>
          <View style={[styles.mapOverlay, { backgroundColor: colors.background }]}>
            <Ionicons name="map" size={32} color={colors.primary} />
            <ThemedText style={[styles.mapText, { color: colors.textSecondary }]}>
              Map View
            </ThemedText>
          </View>
        </LinearGradient>

        {/* ETA Banner */}
        {!isCompleted && (
          <View style={[styles.etaBanner, { backgroundColor: colors.primary }]}>
            <View style={styles.etaLeft}>
              <View style={styles.liveIndicator}>
                <Animated.View
                  style={[
                    styles.liveDot,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                />
                <ThemedText style={styles.liveText}>LIVE</ThemedText>
              </View>
            </View>
            <View style={styles.etaCenter}>
              <ThemedText style={styles.etaLabel}>Estimated Arrival</ThemedText>
              <ThemedText style={styles.etaTime}>
                {currentState < 3 ? '5-8 min' : 'Arrived'}
              </ThemedText>
            </View>
            <View style={styles.etaRight}>
              <ThemedText style={styles.distanceText}>
                {currentState < 3 ? '2.3 km' : '0 km'}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      {/* Status Section */}
      <Animated.View
        style={[
          styles.statusSection,
          {
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [100, 0],
                }),
              },
            ],
          },
        ]}
      >
        {/* Current Status */}
        <View style={[styles.currentStatus, { backgroundColor: colors.card }]}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'navigate'}
              size={28}
              color={getStatusColor()}
            />
          </View>
          <View style={styles.statusInfo}>
            <ThemedText style={styles.statusTitle}>{currentTrackingState.title}</ThemedText>
            <ThemedText style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
              {currentTrackingState.subtitle}
            </ThemedText>
          </View>
          {currentTrackingState.time && (
            <ThemedText style={[styles.statusTime, { color: colors.textSecondary }]}>
              {currentTrackingState.time}
            </ThemedText>
          )}
        </View>

        {/* Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.timelineTitle}>Tracking Timeline</ThemedText>
          {trackingStates.slice(0, currentState + 1).map((state, index) => (
            <View key={state.status} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: index === currentState ? getStatusColor() : colors.success,
                    },
                  ]}
                >
                  {index < currentState && (
                    <Ionicons name="checkmark" size={12} color="#FFF" />
                  )}
                </View>
                {index < trackingStates.length - 1 && index < currentState && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.success }]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <ThemedText
                  style={[
                    styles.timelineText,
                    index === currentState && { fontWeight: '600' },
                  ]}
                >
                  {state.title}
                </ThemedText>
                <ThemedText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                  {state.time}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Provider Card */}
        {showProviderCard && (
          <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
            <Image source={{ uri: provider.avatar }} style={styles.providerAvatar} />
            <View style={styles.providerInfo}>
              <ThemedText style={styles.providerName}>{provider.name}</ThemedText>
              <View style={styles.providerMeta}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.providerRating}>{provider.rating}</ThemedText>
                <ThemedText style={[styles.providerJobs, { color: colors.textSecondary }]}>
                  • {provider.totalJobs} jobs
                </ThemedText>
              </View>
            </View>
            <View style={styles.providerActions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="call" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.info + '15' }]}
                onPress={() => router.push(`/chat/provider-1` as any)}
              >
                <Ionicons name="chatbubble" size={20} color={colors.info} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Booking Info */}
        <View style={[styles.bookingCard, { backgroundColor: colors.card }]}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingInfo}>
              <ThemedText style={styles.bookingService}>{booking.service}</ThemedText>
              <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
                {booking.id}
              </ThemedText>
            </View>
            <View style={[styles.bookingBadge, { backgroundColor: colors.primary + '15' }]}>
              <ThemedText style={[styles.bookingBadgeText, { color: colors.primary }]}>
                {booking.duration}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.bookingDivider, { backgroundColor: colors.border }]} />
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <ThemedText style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
              {booking.address}
            </ThemedText>
          </View>
        </View>

        {/* Actions */}
        {isCompleted ? (
          <View style={styles.completedActions}>
            <TouchableOpacity
              style={[styles.rateButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/booking/review?id=' + booking.id as any)}
            >
              <Ionicons name="star" size={20} color="#FFF" />
              <ThemedText style={styles.rateButtonText}>Rate & Review</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.homeButton, { borderColor: colors.border }]}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <ThemedText style={styles.homeButtonText}>Back to Home</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.supportButton, { borderColor: colors.border }]}
              onPress={() => router.push('/customer/help-support')}
            >
              <Ionicons name="headset" size={20} color={colors.text} />
              <ThemedText style={styles.supportButtonText}>Need Help?</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: colors.error + '15' }]}
            >
              <ThemedText style={[styles.cancelButtonText, { color: colors.error }]}>
                Cancel Booking
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
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
    height: height * 0.28,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '30%',
    left: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  routeLine: {
    width: 80,
    height: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  destinationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: '30%',
    right: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  mapOverlay: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
  mapText: {
    fontSize: 12,
    marginTop: 4,
  },
  etaBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  etaLeft: {},
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF0000',
  },
  liveText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  etaCenter: {
    flex: 1,
    alignItems: 'center',
  },
  etaLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginBottom: 2,
  },
  etaTime: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  etaRight: {},
  distanceText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statusSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  currentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: 14,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 13,
  },
  statusTime: {
    fontSize: 12,
  },
  timelineCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timelineLeft: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineText: {
    fontSize: 14,
  },
  timelineTime: {
    fontSize: 12,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerRating: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 2,
  },
  providerJobs: {
    fontSize: 13,
  },
  providerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {},
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 12,
  },
  bookingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDivider: {
    height: 1,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  completedActions: {
    gap: 10,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
