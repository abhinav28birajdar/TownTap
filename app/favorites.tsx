import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../src/context/ModernThemeContext';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/lib/supabase';

interface BusinessProfile {
  id: string;
  business_name: string;
  specialized_categories: string[];
  avg_rating: number;
  total_reviews: number;
  delivery_radius_km: number;
}

export default function Favorites() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          business_id,
          businesses (
            id,
            business_name,
            specialized_categories,
            avg_rating,
            total_reviews,
            delivery_radius_km
          )
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      const favoriteBusinesses = data?.map(item => item.businesses).filter(Boolean).flat() as BusinessProfile[] || [];
      setFavorites(favoriteBusinesses);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (businessId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);
      
      if (error) throw error;
      setFavorites(prev => prev.filter(business => business.id !== businessId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleBusinessPress = (business: BusinessProfile) => {
    router.push({
      pathname: '/customer/unified-business-detail',
      params: { businessId: business.id }
    });
  };

  const renderFavoriteCard = ({ item: business }: { item: BusinessProfile }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => handleBusinessPress(business)}
    >
      <Image
        source={{ uri: 'https://via.placeholder.com/60' }}
        style={styles.businessImage}
      />
      <View style={styles.businessInfo}>
        <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={1}>
          {business.business_name}
        </Text>
        <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {business.specialized_categories?.[0] || 'Local Business'}
        </Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
              {(business.avg_rating || 0).toFixed(1)} ({business.total_reviews || 0})
            </Text>
          </View>
          <Text style={[styles.distance, { color: theme.colors.textSecondary }]}>
            {business.delivery_radius_km ? `${business.delivery_radius_km.toFixed(1)} km` : ''}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleRemoveFavorite(business.id)}
      >
        <Ionicons name="heart" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            My Favorites
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          My Favorites
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {favorites.length} saved businesses
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Start exploring businesses and save your favorites here for quick access
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Businesses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <FlatList
            data={favorites}
            renderItem={renderFavoriteCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  list: {
    paddingTop: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
  },
  favoriteButton: {
    padding: 8,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});