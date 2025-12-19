import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EmergencyService {
  id: string;
  name: string;
  icon: string;
  description: string;
  avgResponse: string;
  surcharge: string;
}

const emergencyServices: EmergencyService[] = [
  {
    id: 'plumber',
    name: 'Emergency Plumber',
    icon: 'water',
    description: 'Burst pipes, water leaks, clogged drains',
    avgResponse: '15-30 min',
    surcharge: '+₹200',
  },
  {
    id: 'electrician',
    name: 'Emergency Electrician',
    icon: 'flash',
    description: 'Power outages, electrical hazards, shorts',
    avgResponse: '20-40 min',
    surcharge: '+₹250',
  },
  {
    id: 'locksmith',
    name: 'Emergency Locksmith',
    icon: 'key',
    description: 'Locked out, broken locks, key replacement',
    avgResponse: '15-25 min',
    surcharge: '+₹150',
  },
  {
    id: 'ac_repair',
    name: 'Emergency AC Repair',
    icon: 'snow',
    description: 'AC breakdown, cooling issues, gas leaks',
    avgResponse: '30-45 min',
    surcharge: '+₹300',
  },
  {
    id: 'glass',
    name: 'Glass Repair',
    icon: 'browsers-outline',
    description: 'Broken windows, glass doors, mirrors',
    avgResponse: '25-40 min',
    surcharge: '+₹200',
  },
  {
    id: 'pest',
    name: 'Emergency Pest Control',
    icon: 'bug',
    description: 'Snake sighting, bee/wasp removal',
    avgResponse: '20-35 min',
    surcharge: '+₹350',
  },
];

export default function EmergencyServiceScreen() {
  const colors = useColors();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    startPulseAnimation();
    getLocation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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
  };

  const getLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is required for emergency services');
        setIsLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(loc);
    } catch (error) {
      setLocationError('Could not get your location. Please try again.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(selectedService === serviceId ? null : serviceId);
  };

  const handleEmergencyRequest = async () => {
    if (!selectedService || !location) return;
    
    setIsBooking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsBooking(false);
    
    // Navigate to booking confirmation
    router.push({
      pathname: '/booking/success',
      params: {
        type: 'emergency',
        serviceId: selectedService,
      },
    });
  };

  const selectedServiceData = emergencyServices.find(s => s.id === selectedService);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Emergency Service</ThemedText>
        <TouchableOpacity onPress={() => router.push('/customer/help-support')}>
          <Ionicons name="call-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Emergency Banner */}
        <LinearGradient
          colors={[colors.error, '#DC2626']}
          style={styles.emergencyBanner}
        >
          <Animated.View
            style={[
              styles.emergencyIconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Ionicons name="warning" size={48} color="#FFF" />
          </Animated.View>
          <ThemedText style={styles.emergencyTitle}>Need Immediate Help?</ThemedText>
          <ThemedText style={styles.emergencySubtitle}>
            Our emergency team is ready to assist you 24/7
          </ThemedText>
        </LinearGradient>

        {/* Location Status */}
        <TouchableOpacity
          style={[styles.locationCard, { backgroundColor: colors.card }]}
          onPress={getLocation}
          disabled={isLocating}
        >
          <View style={[styles.locationIcon, { 
            backgroundColor: location ? colors.success + '15' : colors.warning + '15' 
          }]}>
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name={location ? 'location' : 'location-outline'}
                size={24}
                color={location ? colors.success : colors.warning}
              />
            )}
          </View>
          
          <View style={styles.locationInfo}>
            <ThemedText style={styles.locationLabel}>
              {isLocating
                ? 'Getting your location...'
                : location
                ? 'Location detected'
                : 'Tap to detect location'}
            </ThemedText>
            {locationError && (
              <ThemedText style={[styles.locationError, { color: colors.error }]}>
                {locationError}
              </ThemedText>
            )}
          </View>
          
          {!isLocating && (
            <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          )}
        </TouchableOpacity>

        {/* Service Selection */}
        <View style={styles.servicesSection}>
          <ThemedText style={styles.sectionTitle}>Select Emergency Type</ThemedText>
          
          <View style={styles.servicesGrid}>
            {emergencyServices.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: selectedService === service.id ? colors.error : colors.border,
                    borderWidth: selectedService === service.id ? 2 : 1,
                  },
                ]}
                onPress={() => handleServiceSelect(service.id)}
              >
                <View style={[
                  styles.serviceIcon,
                  { 
                    backgroundColor: selectedService === service.id 
                      ? colors.error + '15' 
                      : colors.background 
                  }
                ]}>
                  <Ionicons
                    name={service.icon as any}
                    size={28}
                    color={selectedService === service.id ? colors.error : colors.textSecondary}
                  />
                </View>
                
                <ThemedText style={[
                  styles.serviceName,
                  selectedService === service.id && { color: colors.error }
                ]}>
                  {service.name}
                </ThemedText>
                
                <ThemedText style={[styles.serviceDescription, { color: colors.textSecondary }]}>
                  {service.description}
                </ThemedText>
                
                <View style={styles.serviceFooter}>
                  <View style={styles.serviceTime}>
                    <Ionicons name="time-outline" size={14} color={colors.success} />
                    <ThemedText style={[styles.serviceTimeText, { color: colors.success }]}>
                      {service.avgResponse}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.surcharge, { color: colors.warning }]}>
                    {service.surcharge}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Important Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.warning + '10' }]}>
          <Ionicons name="information-circle" size={24} color={colors.warning} />
          <View style={styles.noticeContent}>
            <ThemedText style={[styles.noticeTitle, { color: colors.warning }]}>
              Emergency Surcharge
            </ThemedText>
            <ThemedText style={[styles.noticeText, { color: colors.textSecondary }]}>
              Emergency services have additional charges due to immediate response and 
              priority handling. Regular service rates apply after the emergency is resolved.
            </ThemedText>
          </View>
        </View>

        {/* Selected Service Summary */}
        {selectedServiceData && (
          <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.summaryTitle}>Service Summary</ThemedText>
            
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Service Type
              </ThemedText>
              <ThemedText style={styles.summaryValue}>{selectedServiceData.name}</ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Est. Response Time
              </ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.success }]}>
                {selectedServiceData.avgResponse}
              </ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Emergency Surcharge
              </ThemedText>
              <ThemedText style={[styles.summaryValue, { color: colors.warning }]}>
                {selectedServiceData.surcharge}
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.emergencyButton,
            { 
              backgroundColor: selectedService && location ? colors.error : colors.border,
            },
          ]}
          onPress={handleEmergencyRequest}
          disabled={!selectedService || !location || isBooking}
        >
          {isBooking ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="warning" size={22} color="#FFF" />
              <ThemedText style={styles.emergencyButtonText}>
                Request Emergency Service
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
        
        <ThemedText style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          By requesting, you agree to the emergency service terms and surcharge
        </ThemedText>
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
  emergencyBanner: {
    margin: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  emergencyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emergencyTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emergencySubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  locationLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  locationError: {
    fontSize: 12,
    marginTop: 4,
  },
  servicesSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
  },
  serviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  surcharge: {
    fontSize: 11,
    fontWeight: '600',
  },
  noticeCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  summaryCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomAction: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  emergencyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 10,
  },
});
