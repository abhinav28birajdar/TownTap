/**
 * TownTap - Customer Favorites Tab
 * View and manage favorite businesses
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  accent: '#F59E0B',
  error: '#EF4444',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

export default function CustomerFavorites() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Load favorites from Supabase
    setRefreshing(false);
  };

  const removeFavorite = async (id: string) => {
    // TODO: Remove from favorites in Supabase
    setFavorites(prev => prev.filter(item => item.id !== id));
  };

  const renderFavorite = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.favoriteCard}
      onPress={() => router.push(`/customer/business/${item.business_id}`)}
    >
      <View style={styles.businessImage}>
        <Ionicons name="storefront-outline" size={32} color={Colors.gray} />
      </View>
      
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessCategory}>{item.category}</Text>
        
        <View style={styles.businessStats}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{item.rating || '0.0'}</Text>
            <Text style={styles.reviewCount}>({item.review_count || 0})</Text>
          </View>
          {item.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color={Colors.gray} />
              <Text style={styles.distanceText}>{item.distance}</Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="heart" size={24} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        {favorites.length > 0 && (
          <Text style={styles.countText}>{favorites.length} saved</Text>
        )}
      </View>

      {/* Favorites List */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderFavorite}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No Favorites Yet</Text>
            <Text style={styles.emptyStateText}>
              Save your favorite businesses to quickly find them later
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/customer/(tabs)/explore')}
            >
              <Text style={styles.exploreBtnText}>Explore Services</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  countText: {
    fontSize: 14,
    color: Colors.gray,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  businessImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  businessInfo: {
    flex: 1,
    marginLeft: 16,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  businessCategory: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  businessStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  reviewCount: {
    fontSize: 14,
    color: Colors.gray,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: Colors.gray,
  },
  favoriteBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  exploreBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 30,
  },
  exploreBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
