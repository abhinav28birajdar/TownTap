import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OrderDetails {
  id: string;
  service: string;
  businessName: string;
  businessImage: string;
  businessPhone: string;
  providerName: string;
  providerImage: string;
  status: 'confirmed' | 'on_the_way' | 'in_progress' | 'completed';
  eta: string;
  customerLocation: { latitude: number; longitude: number };
  providerLocation: { latitude: number; longitude: number };
  address: string;
}

const mockOrder: OrderDetails = {
  id: '1',
  service: 'AC Repair & Service',
  businessName: 'Cool Tech Services',
  businessImage: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
  businessPhone: '+1234567890',
  providerName: 'Rajesh Kumar',
  providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  status: 'on_the_way',
  eta: '15 mins',
  customerLocation: { latitude: 12.9716, longitude: 77.5946 },
  providerLocation: { latitude: 12.9756, longitude: 77.5996 },
  address: '123 Main Street, Apartment 4B, Bangalore',
};

const statusSteps = [
  { id: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
  { id: 'on_the_way', label: 'On the Way', icon: 'car' },
  { id: 'in_progress', label: 'In Progress', icon: 'construct' },
  { id: 'completed', label: 'Completed', icon: 'checkmark-done-circle' },
];

export default function OrderTrackingScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const mapRef = useRef<MapView>(null);
  const [order, setOrder] = useState<OrderDetails>(mockOrder);
  const [isExpanded, setIsExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start pulse animation for live status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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
  }, []);

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: false,
      friction: 10,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex(step => step.id === order.status);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${order.businessPhone}`);
  };

  const handleChat = () => {
    router.push(`/messages/chat/${order.id}`);
  };

  const handleCancelOrder = () => {
    router.push(`/orders/${order.id}/cancel` as any);
  };

  const openMaps = () => {
    const { latitude, longitude } = order.providerLocation;
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const bottomSheetHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.35, SCREEN_HEIGHT * 0.55],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: (order.customerLocation.latitude + order.providerLocation.latitude) / 2,
          longitude: (order.customerLocation.longitude + order.providerLocation.longitude) / 2,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Customer Location Marker */}
        <Marker coordinate={order.customerLocation}>
          <View style={[styles.markerContainer, { backgroundColor: colors.primary }]}>
            <Ionicons name="home" size={20} color="#FFF" />
          </View>
        </Marker>

        {/* Provider Location Marker */}
        <Marker coordinate={order.providerLocation}>
          <Animated.View style={[
            styles.providerMarker,
            { backgroundColor: colors.success, transform: [{ scale: pulseAnim }] }
          ]}>
            <Image
              source={{ uri: order.providerImage }}
              style={styles.providerMarkerImage}
            />
          </Animated.View>
        </Marker>

        {/* Route Line */}
        <Polyline
          coordinates={[order.providerLocation, order.customerLocation]}
          strokeColor={colors.primary}
          strokeWidth={3}
          lineDashPattern={[10, 5]}
        />
      </MapView>

      {/* Header Overlay */}
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.card }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={[styles.etaBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="time-outline" size={16} color="#FFF" />
          <ThemedText style={styles.etaText}>ETA: {order.eta}</ThemedText>
        </View>
        
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: colors.card }]}
          onPress={openMaps}
        >
          <Ionicons name="navigate" size={24} color={colors.primary} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.card, height: bottomSheetHeight },
        ]}
      >
        {/* Drag Handle */}
        <TouchableOpacity style={styles.dragHandle} onPress={toggleExpand}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Stepper */}
          <View style={styles.stepperContainer}>
            {statusSteps.map((step, index) => {
              const currentIndex = getCurrentStepIndex();
              const isCompleted = index <= currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <View key={step.id} style={styles.stepItem}>
                  <View style={styles.stepIndicator}>
                    <View
                      style={[
                        styles.stepCircle,
                        {
                          backgroundColor: isCompleted ? colors.primary : colors.border,
                          borderColor: isCurrent ? colors.primary : 'transparent',
                          borderWidth: isCurrent ? 2 : 0,
                        },
                      ]}
                    >
                      {isCompleted && (
                        <Ionicons
                          name={step.icon as any}
                          size={16}
                          color={isCompleted ? '#FFF' : colors.textSecondary}
                        />
                      )}
                    </View>
                    {index < statusSteps.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          { backgroundColor: isCompleted ? colors.primary : colors.border },
                        ]}
                      />
                    )}
                  </View>
                  <ThemedText
                    style={[
                      styles.stepLabel,
                      isCurrent && { color: colors.primary, fontWeight: '600' },
                      !isCompleted && { color: colors.textSecondary },
                    ]}
                  >
                    {step.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>

          {/* Service Provider Info */}
          <View style={styles.providerSection}>
            <Image
              source={{ uri: order.providerImage }}
              style={styles.providerImage}
            />
            <View style={styles.providerInfo}>
              <ThemedText style={styles.providerName}>{order.providerName}</ThemedText>
              <ThemedText style={[styles.businessLabel, { color: colors.textSecondary }]}>
                {order.businessName}
              </ThemedText>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#FFB800" />
                <ThemedText style={styles.ratingText}>4.8</ThemedText>
                <ThemedText style={[styles.ratingCount, { color: colors.textSecondary }]}>
                  (156 reviews)
                </ThemedText>
              </View>
            </View>
            <View style={styles.contactButtons}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary }]}
                onPress={handleCall}
              >
                <Ionicons name="call" size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.success }]}
                onPress={handleChat}
              >
                <Ionicons name="chatbubble" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Service Details */}
          <View style={[styles.serviceSection, { backgroundColor: colors.background }]}>
            <ThemedText style={styles.serviceTitle}>{order.service}</ThemedText>
            <View style={styles.addressRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <ThemedText style={[styles.addressText, { color: colors.textSecondary }]}>
                {order.address}
              </ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.error }]}
              onPress={handleCancelOrder}
            >
              <ThemedText style={[styles.cancelButtonText, { color: colors.error }]}>
                Cancel Order
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.helpButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/customer/help-support')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#FFF" />
              <ThemedText style={styles.helpButtonText}>Need Help?</ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  etaText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  providerMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  providerMarkerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  dragHandle: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepLine: {
    position: 'absolute',
    height: 3,
    width: '100%',
    left: '50%',
  },
  stepLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  providerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  providerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0E0E0',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  businessLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingCount: {
    fontSize: 12,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  helpButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
