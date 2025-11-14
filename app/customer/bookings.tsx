import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDemo } from '../../contexts/demo-context';

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

interface Booking {
  id: number;
  service: string;
  business: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  rating?: number;
  address: string;
}

const statusColors = {
  pending: '#F59E0B',
  confirmed: '#6366F1',
  'in-progress': '#10B981',
  completed: '#059669',
  cancelled: '#EF4444',
};

const statusIcons = {
  pending: 'time-outline',
  confirmed: 'checkmark-circle-outline',
  'in-progress': 'play-circle-outline',
  completed: 'checkmark-done-outline',
  cancelled: 'close-circle-outline',
};

export default function CustomerBookings() {
  const { isDemo, demoBookings } = useDemo();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    // In demo mode, use demo data, otherwise fetch from API
    if (isDemo) {
      // Transform demo bookings to match Booking interface
      const transformedBookings = demoBookings.map((booking: any) => ({
        id: booking.id,
        service: booking.service_id || 'Demo Service',
        business: 'Demo Business',
        date: booking.scheduled_for || new Date().toISOString(),
        time: '10:00 AM',
        status: booking.status,
        price: booking.price || 100,
        address: '123 Demo Street',
        rating: 5
      }));
      setBookings(transformedBookings as Booking[]);
    } else {
      // Fetch real bookings from API
      fetchBookings();
    }
  }, [isDemo]);

  const fetchBookings = async () => {
    // API call would go here
    setBookings([]);
  };

  const filteredBookings = bookings.filter(booking => 
    activeTab === 'active' 
      ? ['pending', 'confirmed', 'in-progress'].includes(booking.status)
      : ['completed', 'cancelled'].includes(booking.status)
  );

  const handleBookingPress = (booking: Booking) => {
    router.push({
      pathname: '/customer/booking-details' as any,
      params: { id: booking.id }
    });
  };

  const handleTrackBooking = (booking: Booking) => {
    router.push({
      pathname: '/customer/track-booking' as any,
      params: { id: booking.id }
    });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => handleBookingPress(item)}
    >
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.serviceName}>{item.service}</Text>
          <Text style={styles.businessName}>{item.business}</Text>
          <Text style={styles.bookingAddress}>📍 {item.address}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] + '20' }]}>
          <Ionicons 
            name={statusIcons[item.status] as any} 
            size={16} 
            color={statusColors[item.status]} 
          />
          <Text style={[styles.statusText, { color: statusColors[item.status] }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.dateTimeText}>{new Date(item.date).toDateString()}</Text>
          </View>
          <View style={styles.dateTime}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.dateTimeText}>{item.time}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>₹{item.price}</Text>
      </View>

      {item.status === 'in-progress' && (
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => handleTrackBooking(item)}
        >
          <Ionicons name="location-outline" size={16} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Track Service</Text>
        </TouchableOpacity>
      )}

      {item.status === 'completed' && item.rating && (
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          <View style={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <Ionicons
                key={i}
                name="star"
                size={16}
                color={i < item.rating! ? '#FBBF24' : '#E5E7EB'}
              />
            ))}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {/* Search functionality */}}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'active' && styles.activeTabText
            ]}>
              Active ({bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'completed' && styles.activeTabText
            ]}>
              History ({bookings.filter(b => ['completed', 'cancelled'].includes(b.status)).length})
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Bookings List */}
      <View style={styles.content}>
        {filteredBookings.length > 0 ? (
          <FlatList
            data={filteredBookings}
            renderItem={renderBooking}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bookingsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'active' ? 'calendar-outline' : 'checkmark-done-outline'} 
              size={64} 
              color="#9CA3AF" 
            />
            <Text style={styles.emptyStateText}>
              {activeTab === 'active' ? 'No active bookings' : 'No booking history'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'active' 
                ? 'Book a service to see your active bookings here'
                : 'Your completed and cancelled bookings will appear here'
              }
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/customer/search' as any)}
            >
              <Text style={styles.browseButtonText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#6366F1',
  },
  content: {
    flex: 1,
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  businessName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  bookingAddress: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    flex: 1,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#374151',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trackButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  stars: {
    flexDirection: 'row',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 24,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});