import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface TrackingUpdate {
  id: string;
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  icon: string;
}

const mockTracking = {
  orderId: 'ORD-123456',
  serviceName: 'Deep Home Cleaning',
  providerName: 'Ramesh Kumar',
  providerRating: 4.9,
  providerPhone: '+91 98765 43210',
  eta: 12,
  distance: '2.5 km',
  status: 'on_the_way',
  updates: [
    {
      id: '1',
      title: 'Booking Confirmed',
      description: 'Your booking has been confirmed',
      time: '10:30 AM',
      status: 'completed',
      icon: 'checkmark-circle',
    },
    {
      id: '2',
      title: 'Provider Assigned',
      description: 'Ramesh Kumar will serve you',
      time: '10:35 AM',
      status: 'completed',
      icon: 'person',
    },
    {
      id: '3',
      title: 'On the Way',
      description: 'Provider is heading to your location',
      time: '10:45 AM',
      status: 'current',
      icon: 'car',
    },
    {
      id: '4',
      title: 'Arrived',
      description: 'Provider will reach shortly',
      time: '',
      status: 'pending',
      icon: 'location',
    },
    {
      id: '5',
      title: 'Service Started',
      description: 'Service in progress',
      time: '',
      status: 'pending',
      icon: 'construct',
    },
    {
      id: '6',
      title: 'Completed',
      description: 'Service completed successfully',
      time: '',
      status: 'pending',
      icon: 'shield-checkmark',
    },
  ] as TrackingUpdate[],
  location: {
    address: '123, Green Valley Apartments, Sector 15, Gurugram',
    landmark: 'Near City Mall',
  },
};

export default function TrackProviderScreen() {
  const colors = useColors();
  const [eta, setEta] = useState(mockTracking.eta);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const carAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Car animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(carAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(carAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0],
  });

  const carTranslateX = carAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const getStatusColor = (status: TrackingUpdate['status']) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'current':
        return colors.primary;
      case 'pending':
        return colors.textSecondary;
    }
  };

  const handleCall = () => {
    // Implement call
  };

  const handleMessage = () => {
    router.push({
      pathname: '/messages/chat/[id]',
      params: { id: 'provider-123' },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Track Provider</ThemedText>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ETA Card */}
        <View style={styles.etaSection}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'DD']}
            style={styles.etaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.etaContent}>
              <View style={styles.etaMain}>
                <View style={styles.etaCircle}>
                  <Animated.View
                    style={[
                      styles.etaPulse,
                      {
                        transform: [{ scale: pulseScale }],
                        opacity: pulseOpacity,
                      },
                    ]}
                  />
                  <Animated.View style={{ transform: [{ translateX: carTranslateX }] }}>
                    <Ionicons name="car" size={32} color="#fff" />
                  </Animated.View>
                </View>
                <View style={styles.etaInfo}>
                  <ThemedText style={styles.etaLabel}>Arriving in</ThemedText>
                  <ThemedText style={styles.etaValue}>{eta} mins</ThemedText>
                  <ThemedText style={styles.etaDistance}>{mockTracking.distance} away</ThemedText>
                </View>
              </View>
              <View style={styles.etaStatus}>
                <View style={styles.statusDot} />
                <ThemedText style={styles.statusText}>On the Way</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Provider Card */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Provider</ThemedText>
          <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
            <View style={styles.providerInfo}>
              <View style={[styles.providerAvatar, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                  {mockTracking.providerName.split(' ').map((n) => n[0]).join('')}
                </ThemedText>
              </View>
              <View style={styles.providerDetails}>
                <ThemedText style={styles.providerName}>{mockTracking.providerName}</ThemedText>
                <View style={styles.providerMeta}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color="#FFC107" />
                    <ThemedText style={styles.ratingText}>{mockTracking.providerRating}</ThemedText>
                  </View>
                  <ThemedText style={[styles.serviceLabel, { color: colors.textSecondary }]}>
                    • {mockTracking.serviceName}
                  </ThemedText>
                </View>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.success + '15' }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color={colors.success} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactBtn, { backgroundColor: colors.primary + '15' }]}
                onPress={handleMessage}
              >
                <Ionicons name="chatbubble" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Location</ThemedText>
          <View style={[styles.locationCard, { backgroundColor: colors.card }]}>
            <View style={[styles.locationIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="location" size={22} color={colors.primary} />
            </View>
            <View style={styles.locationInfo}>
              <ThemedText style={styles.locationAddress}>
                {mockTracking.location.address}
              </ThemedText>
              <ThemedText style={[styles.locationLandmark, { color: colors.textSecondary }]}>
                {mockTracking.location.landmark}
              </ThemedText>
            </View>
            <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]}>
              <Ionicons name="navigate-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Timeline */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Live Updates</ThemedText>
          <View style={[styles.timelineCard, { backgroundColor: colors.card }]}>
            {mockTracking.updates.map((update, index) => (
              <View key={update.id} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.timelineIcon,
                      {
                        backgroundColor:
                          update.status === 'current'
                            ? colors.primary
                            : update.status === 'completed'
                            ? colors.success
                            : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={update.icon as any}
                      size={16}
                      color={update.status === 'pending' ? colors.textSecondary : '#fff'}
                    />
                  </View>
                  {index < mockTracking.updates.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor:
                            update.status === 'completed' ? colors.success : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.timelineHeader}>
                    <ThemedText
                      style={[
                        styles.timelineTitle,
                        update.status === 'pending' && { color: colors.textSecondary },
                      ]}
                    >
                      {update.title}
                    </ThemedText>
                    {update.time && (
                      <ThemedText style={[styles.timelineTime, { color: colors.textSecondary }]}>
                        {update.time}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={[styles.timelineDesc, { color: colors.textSecondary }]}>
                    {update.description}
                  </ThemedText>
                  {update.status === 'current' && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primary + '15' }]}>
                      <ThemedText style={[styles.currentText, { color: colors.primary }]}>
                        In Progress
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.card }]}
              onPress={() => {}}
            >
              <Ionicons name="share-social-outline" size={22} color={colors.text} />
              <ThemedText style={styles.quickBtnText}>Share Live Location</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: colors.card }]}
              onPress={() => router.push('/support/report-issue')}
            >
              <Ionicons name="alert-circle-outline" size={22} color={colors.error} />
              <ThemedText style={[styles.quickBtnText, { color: colors.error }]}>
                Report Issue
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Details Link */}
        <TouchableOpacity
          style={[styles.orderLink, { backgroundColor: colors.card }]}
          onPress={() =>
            router.push({
              pathname: '/orders/[id]' as any,
              params: { id: mockTracking.orderId },
            })
          }
        >
          <View style={styles.orderLinkContent}>
            <Ionicons name="receipt-outline" size={20} color={colors.primary} />
            <View style={styles.orderLinkText}>
              <ThemedText style={styles.orderLinkTitle}>View Order Details</ThemedText>
              <ThemedText style={[styles.orderLinkId, { color: colors.textSecondary }]}>
                Order #{mockTracking.orderId}
              </ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelBtn, { borderColor: colors.error }]}
          onPress={() => router.push('/booking/cancel')}
        >
          <ThemedText style={[styles.cancelText, { color: colors.error }]}>Cancel Booking</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rescheduleBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking/reschedule')}
        >
          <ThemedText style={styles.rescheduleText}>Reschedule</ThemedText>
        </TouchableOpacity>
      </View>
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
  etaSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  etaCard: {
    borderRadius: 20,
    padding: 20,
  },
  etaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  etaMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  etaCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  etaInfo: {},
  etaLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginBottom: 2,
  },
  etaValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  etaDistance: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  etaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  providerDetails: {},
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
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  serviceLabel: {
    fontSize: 13,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 2,
  },
  locationLandmark: {
    fontSize: 12,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCard: {
    padding: 16,
    borderRadius: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  timelineTime: {
    fontSize: 12,
  },
  timelineDesc: {
    fontSize: 13,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  currentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  orderLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
  },
  orderLinkContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderLinkText: {},
  orderLinkTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  orderLinkId: {
    fontSize: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rescheduleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rescheduleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
