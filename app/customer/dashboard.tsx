import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/auth-context';
import { useDemo } from '../../contexts/demo-context';

const { width: screenWidth } = Dimensions.get('window');

// Quick action items
const quickActions = [
  { id: 1, title: 'Find Services', icon: 'search-outline', route: '/customer/search' },
  { id: 2, title: 'Book Now', icon: 'calendar-outline', route: '/customer/booking' },
  { id: 3, title: 'My Bookings', icon: 'list-outline', route: '/customer/bookings' },
  { id: 4, title: 'Favorites', icon: 'heart-outline', route: '/customer/favorites' },
];

// Featured categories
const featuredCategories = [
  { id: 1, name: 'Home Services', icon: 'home-outline', count: 45, color: '#6366F1' },
  { id: 2, name: 'Beauty & Wellness', icon: 'flower-outline', count: 32, color: '#EC4899' },
  { id: 3, name: 'Automotive', icon: 'car-outline', count: 28, color: '#10B981' },
  { id: 4, name: 'Technology', icon: 'laptop-outline', count: 19, color: '#F59E0B' },
];

// Recent bookings sample
const recentBookings = [
  {
    id: 1,
    service: 'Plumbing Repair',
    business: 'QuickFix Plumbers',
    date: '2025-01-15',
    status: 'completed',
    rating: 5,
  },
  {
    id: 2,
    service: 'House Cleaning',
    business: 'Sparkle Clean',
    date: '2025-01-12',
    status: 'completed',
    rating: 4,
  },
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { isDemo, demoBookings, demoBusinesses } = useDemo();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const displayBookings = isDemo ? demoBookings.slice(0, 2) : recentBookings;

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  const handleCategoryPress = (category: any) => {
    router.push({
      pathname: '/customer/search' as any,
      params: { category: category.name }
    });
  };

  const handleViewAllBookings = () => {
    router.push('/customer/bookings' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.userName}>
                {user?.user_metadata?.name || user?.email?.split('@')[0] || 'Customer'}
              </Text>
              {isDemo && (
                <Text style={styles.demoLabel}>Demo Mode</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => router.push('/customer/search' as any)}
          >
            <Ionicons name="search" size={20} color="#6B7280" />
            <Text style={styles.searchPlaceholder}>Search for services...</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionItem}
                onPress={() => handleQuickAction(action.route)}
              >
                <View style={styles.quickActionIcon}>
                  <Ionicons name={action.icon as any} size={24} color="#6366F1" />
                </View>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
          <View style={styles.categoriesGrid}>
            {featuredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { borderLeftColor: category.color }]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}15` }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>{category.count} services</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={handleViewAllBookings}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {displayBookings.length > 0 ? (
            displayBookings.map((booking: any, index: number) => (
              <View key={booking.id || index} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View>
                    <Text style={styles.bookingService}>{booking.service}</Text>
                    <Text style={styles.bookingBusiness}>{booking.business}</Text>
                  </View>
                  <View style={styles.bookingStatus}>
                    <View style={[
                      styles.statusBadge,
                      booking.status === 'completed' && styles.completedBadge
                    ]}>
                      <Text style={[
                        styles.statusText,
                        booking.status === 'completed' && styles.completedText
                      ]}>
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.bookingFooter}>
                  <Text style={styles.bookingDate}>
                    {new Date(booking.date).toLocaleDateString()}
                  </Text>
                  {booking.rating && (
                    <View style={styles.ratingContainer}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons
                          key={i}
                          name="star"
                          size={14}
                          color={i < booking.rating! ? '#FBBF24' : '#E5E7EB'}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyStateText}>No recent bookings</Text>
              <Text style={styles.emptyStateSubtext}>Start by exploring services in your area</Text>
            </View>
          )}
        </View>

        {/* Promotional Banner */}
        <TouchableOpacity style={styles.promoCard}>
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Special Offer!</Text>
              <Text style={styles.promoSubtitle}>Get 20% off your first booking</Text>
              <Text style={styles.promoAction}>Book Now</Text>
            </View>
            <Ionicons name="gift-outline" size={40} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  demoLabel: {
    fontSize: 12,
    color: '#FBBF24',
    fontWeight: '600',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchPlaceholder: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6B7280',
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  quickActionItem: {
    width: (screenWidth - 60) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  categoriesGrid: {
    marginTop: 16,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryCount: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  bookingBusiness: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  bookingStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  completedText: {
    color: '#166534',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  promoCard: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  promoAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 100,
  },
});