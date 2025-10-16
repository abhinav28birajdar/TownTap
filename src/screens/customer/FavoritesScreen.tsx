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
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

interface BusinessProfile {
  id: string;
  business_name: string;
  specialized_categories: string[];
  avg_rating: number;
  total_reviews: number;
  delivery_radius_km: number;
}

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const navigation = useNavigation();
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

      const favoriteBusinesses = data?.map(item => item.businesses).filter(Boolean) || [];
      setFavorites(favoriteBusinesses as BusinessProfile[]);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (businessId: string) => {
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
    navigation.navigate('BusinessDetail' as never, { businessId: business.id } as never);
  };

  const renderFavoriteCard = ({ item: business }: { item: BusinessProfile }) => (
    <View style={[styles.favoriteCard, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleBusinessPress(business)}
      >
        <Image
          source={{ uri: 'https://via.placeholder.com/80' }}
          style={styles.businessImage}
        />
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: theme.colors.text }]} numberOfLines={2}>
            {business.business_name}
          </Text>
          <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {business.specialized_categories?.[0] || 'Local Business'}
          </Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFD700" />
            <Text style={[styles.rating, { color: theme.colors.textSecondary }]}>
              {business.avg_rating?.toFixed(1) || '0.0'} ({business.total_reviews || 0})
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(business.id)}
      >
        <Icon name="heart" size={24} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your favorites...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Favorites</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {favorites.length} saved businesses
        </Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="heart-outline" size={80} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Businesses you favorite will appear here for easy access
          </Text>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('Explore' as never)}
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
    paddingVertical: 20,
  },
  favoriteCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  businessImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    marginLeft: 4,
  },
  removeButton: {
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
    marginTop: 24,
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