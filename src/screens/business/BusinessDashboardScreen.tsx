import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { BusinessProfile } from '../../types';

interface BusinessStats {
  totalViews: number;
  monthlyViews: number;
  totalOrders: number;
  monthlyOrders: number;
  rating: number;
  reviewCount: number;
}

export default function BusinessDashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, profile } = useAuthStore();
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [stats, setStats] = useState<BusinessStats>({
    totalViews: 0,
    monthlyViews: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    rating: 0,
    reviewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusinessData();
  }, [user]);

  const loadBusinessData = async () => {
    if (!user) return;

    try {
      // Load business profile
      const { data: business, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        throw businessError;
      }

      setBusinessProfile(business);

      // Load business stats if business exists
      if (business) {
        await loadBusinessStats(business.id);
      }
    } catch (error) {
      console.error('Error loading business data:', error);
      Alert.alert('Error', 'Failed to load business data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessStats = async (businessId: string) => {
    try {
      // In a real app, these would be actual database queries
      // For now, we'll use placeholder data
      setStats({
        totalViews: 1250,
        monthlyViews: 89,
        totalOrders: 156,
        monthlyOrders: 23,
        rating: 4.2,
        reviewCount: 34,
      });
    } catch (error) {
      console.error('Error loading business stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinessData();
    setRefreshing(false);
  };

  const handleCreateBusiness = () => {
    router.push('/business/registration');
  };

  const handleEditBusiness = () => {
    router.push('/business/edit');
  };

  const handleViewAnalytics = () => {
    router.push('/business/analytics');
  };

  const handleManageOrders = () => {
    router.push('/business/orders');
  };

  const handleManageReviews = () => {
    router.push('/business/reviews');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no business profile exists, show create business screen
  if (!businessProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.emptyStateContainer}>
            <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.surface }]}>
              <Text style={styles.emptyStateIconText}>🏪</Text>
            </View>
            
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              Welcome to TownTap Business
            </Text>
            
            <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
              Create your business profile to start connecting with local customers.
            </Text>
            
            <TouchableOpacity
              style={[styles.createBusinessButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateBusiness}
            >
              <Text style={styles.createBusinessButtonText}>
                Create Business Profile
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {businessProfile.business_name}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleEditBusiness}
          >
            <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Business Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              Business Status
            </Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: businessProfile.is_active ? theme.colors.success : theme.colors.warning }
            ]}>
              <Text style={styles.statusBadgeText}>
                {businessProfile.is_active ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          
          <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
            {businessProfile.is_active 
              ? 'Your business is visible to customers'
              : 'Your business is currently hidden from customers'
            }
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.totalViews}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Views
            </Text>
            <Text style={[styles.statChange, { color: theme.colors.success }]}>
              +{stats.monthlyViews} this month
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.totalOrders}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Orders
            </Text>
            <Text style={[styles.statChange, { color: theme.colors.success }]}>
              +{stats.monthlyOrders} this month
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {stats.rating.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Rating
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textSecondary }]}>
              {stats.reviewCount} reviews
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleViewAnalytics}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                View Analytics
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                See detailed insights
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleManageOrders}
            >
              <Text style={styles.actionIcon}>📦</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Manage Orders
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                Process orders
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleManageReviews}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Manage Reviews
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                Respond to reviews
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.colors.surface }]}
              onPress={handleEditBusiness}
            >
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>
                Edit Profile
              </Text>
              <Text style={[styles.actionSubtitle, { color: theme.colors.textSecondary }]}>
                Update information
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createBusinessButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  createBusinessButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '400',
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 4,
  },
  editButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  statSubtext: {
    fontSize: 12,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: '47%',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
});