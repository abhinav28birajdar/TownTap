import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { useAIRecommendations } from '../../hooks/useAIRecommendations';
import { useLocationBasedRealtime } from '../../hooks/useLocationBasedRealtime';
import { useAuthStore } from '../../stores/authStore';
import { Business } from '../../types';
import { AIRecommendation } from '../../types/ai';

const HomeScreen: React.FC = () => {
  const { colors } = useModernTheme();
  const { user } = useAuthStore();
  const { businesses, userLocation, loading, error, refetch } = useLocationBasedRealtime(20);
  const { getRecommendations, getPersonalizedGreeting, isLoading: aiLoading } = useAIRecommendations();
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('Hello!');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    loadAIContent();
  }, [user, userLocation]);

  const loadAIContent = async () => {
    if (user && userLocation) {
      // Get personalized greeting
      const personalizedGreeting = await getPersonalizedGreeting(
        user.email?.split('@')[0],
        {
          timeOfDay: getTimeOfDay(),
          lastVisit: user.updated_at ? new Date(user.updated_at) : undefined,
          previousOrders: 0 // We'll update this when we have the order history
        }
      );
      setGreeting(personalizedGreeting);

      // Get AI recommendations
      const recommendationsResult = await getRecommendations({
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        previousOrders: [], // We'll update this when we have the order history
        timeOfDay: getTimeOfDay(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      });

      if (recommendationsResult) {
        const aiRecommendations: AIRecommendation[] = recommendationsResult.businesses.map(business => ({
          businessId: business.id,
          score: business.rating || 0,
          reason: `Recommended based on your preferences and location`,
          confidence: 0.8,
          relevantFeatures: [
            'location',
            business.category.toLowerCase(),
            business.is_open ? 'open_now' : 'closed',
            business.delivery_available ? 'delivery' : 'pickup_only'
          ]
        }));
        setRecommendations(aiRecommendations);
      }
    }
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), loadAIContent()]);
    setRefreshing(false);
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity 
      style={[styles.businessCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
      onPress={() => {
        // Navigate to business detail
        console.log('Navigate to business:', item.id);
      }}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.colors?.text || '#1E293B' }]}>
            {item.business_name || item.name}
          </Text>
          <Text style={[styles.businessCategory, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.category || 'Business'}
          </Text>
          <Text style={[styles.businessAddress, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.address}, {item.city}
          </Text>
        </View>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.colors?.text || '#1E293B' }]}>
              {item.rating?.toFixed(1) || '0.0'}
            </Text>
          </View>
          <Text style={[styles.distance, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.distance_km?.toFixed(1) || '0.0'} km
          </Text>
        </View>
      </View>
      
      <View style={styles.businessFooter}>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.is_open ? '#10B981' : '#EF4444' }
          ]} />
          <Text style={[styles.statusText, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.is_open ? 'Open' : 'Closed'}
          </Text>
        </View>
        
        {item.delivery_available && (
          <View style={styles.deliveryBadge}>
            <Ionicons name="bicycle-outline" size={14} color={colors.colors?.primary || '#3B82F6'} />
            <Text style={[styles.deliveryText, { color: colors.colors?.primary || '#3B82F6' }]}>
              Delivery
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && businesses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors?.primary || '#3B82F6'} />
          <Text style={[styles.loadingText, { color: colors.colors?.text || '#1E293B' }]}>
            Finding nearby businesses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}>
        <View>
          <Text style={styles.greeting}>
            {greeting}
          </Text>
          <Text style={styles.subtitle}>
            Discover local businesses near you
          </Text>
        </View>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="location-outline" size={20} color="#FFFFFF" />
          <Text style={styles.locationText}>
            {userLocation ? `${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)}` : 'Getting location...'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
          <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
            {businesses.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
            Nearby Businesses
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
          <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
            20km
          </Text>
          <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
            Search Radius
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
          <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
            {businesses.filter(b => b.is_open).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
            Open Now
          </Text>
        </View>
      </View>

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={[styles.sectionTitle, { color: colors.colors?.text || '#1E293B' }]}>
                Recommended for You
              </Text>
              {recommendations.map((recommendation) => {
                const business = businesses.find(b => b.id === recommendation.businessId);
                if (!business) return null;
                return (
                  <View key={recommendation.businessId} style={styles.recommendedCard}>
                    <View style={styles.recommendedHeader}>
                      <Ionicons name="sparkles" size={16} color="#F59E0B" />
                      <Text style={[styles.recommendedLabel, { color: colors.colors?.primary || '#3B82F6' }]}>
                        Personal Recommendation
                      </Text>
                    </View>
                    {renderBusinessItem({ item: business })}
                    <Text style={[styles.recommendationReason, { color: colors.colors?.textSecondary || '#64748B' }]}>
                      {recommendation.reason}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Business List */}
          <View style={styles.businessListContainer}>
            <Text style={[styles.sectionTitle, { color: colors.colors?.text || '#1E293B' }]}>
              Nearby Businesses
            </Text>        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: '#EF4444' }]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}
              onPress={onRefresh}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={businesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.colors?.primary || '#3B82F6']}
              tintColor={colors.colors?.primary || '#3B82F6'}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="business-outline" 
                size={48} 
                color={colors.colors?.textSecondary || '#64748B'} 
              />
              <Text style={[styles.emptyText, { color: colors.colors?.textSecondary || '#64748B' }]}>
                No businesses found nearby
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.colors?.textSecondary || '#64748B' }]}>
                Try adjusting your location or refresh
              </Text>
            </View>
          }
          contentContainerStyle={businesses.length === 0 ? styles.emptyList : undefined}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  recommendationsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  recommendedCard: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recommendedLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationReason: {
    fontSize: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  businessListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  businessCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 12,
  },
  businessMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
  },
  deliveryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deliveryText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default HomeScreen;
