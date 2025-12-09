import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
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

type Business = Database['public']['Tables']['businesses']['Row'];

export default function CustomerFavorites() {
  const { user } = useAuth();
  const colors = useColors();
  const [favorites, setFavorites] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*, business:businesses(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data?.map((f: any) => f.business).filter(Boolean) || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromFavorites = (businessId: number) => {
    setFavorites((prev: any[]) => prev.filter((business: any) => business.id !== businessId));
  };

  const handleBusinessPress = (business: any) => {
    router.push({
      pathname: '/business/[id]' as any,
      params: { id: business.id }
    });
  };

  const handleBookNow = (business: any) => {
    router.push({
      pathname: '/customer/booking' as any,
      params: { businessId: business.id }
    });
  };

  const renderFavorite = ({ item }: { item: any }) => (
    <View style={styles.favoriteCard}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => handleBusinessPress(item)}
      >
        <View style={styles.businessHeader}>
          <View style={styles.businessIcon}>
            <Ionicons name={item.icon} size={24} color="#6366F1" />
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{item.name}</Text>
            <Text style={styles.businessCategory}>{item.category}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleRemoveFromFavorites(item.id)}
          >
            <Ionicons name="heart" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.businessDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.businessDetails}>
          <Text style={styles.distanceText}>📍 {item.distance} km away</Text>
          <Text style={styles.priceText}>From ₹{item.startingPrice}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {/* Call functionality */}}
        >
          <Ionicons name="call-outline" size={16} color="#6366F1" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookNow(item)}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
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
          <Text style={styles.headerTitle}>My Favorites</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/customer/search' as any)}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerStats}>
          <Text style={styles.favoritesCount}>
            {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.headerSubtext}>
            Your trusted service providers
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={renderFavorite}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.favoritesList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No favorites yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Save your favorite service providers for quick access
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/customer/search' as any)}
            >
              <Text style={styles.browseButtonText}>Explore Services</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Floating Action Button */}
      {favorites.length > 0 && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={() => router.push('/customer/search' as any)}
        >
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}
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
    marginBottom: 16,
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
  headerStats: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  favoritesCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  favoritesList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  favoriteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  favoriteButton: {
    padding: 8,
  },
  businessDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  callButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  bookButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#6366F1',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  fabButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});