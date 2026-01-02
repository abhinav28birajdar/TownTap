/**
 * TownTap - Featured Businesses Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    Image,
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
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
  accent: '#F59E0B',
};

const featuredBusinesses = [
  {
    id: '1',
    name: 'Elite Salon & Spa',
    category: 'Beauty',
    rating: 4.9,
    reviews: 256,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    featured: true,
  },
  {
    id: '2',
    name: 'ProFix Home Services',
    category: 'Home Services',
    rating: 4.8,
    reviews: 189,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    featured: true,
  },
  {
    id: '3',
    name: 'AutoCare Plus',
    category: 'Auto',
    rating: 4.7,
    reviews: 312,
    distance: '2.5 km',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400',
    featured: true,
  },
];

export default function FeaturedBusinessesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderBusiness = ({ item }: { item: typeof featuredBusinesses[0] }) => (
    <TouchableOpacity
      style={styles.businessCard}
      onPress={() => router.push(`/business/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.businessImage} />
      <View style={styles.featuredBadge}>
        <Ionicons name="star" size={12} color={Colors.white} />
        <Text style={styles.featuredText}>Featured</Text>
      </View>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.name}</Text>
        <Text style={styles.businessCategory}>{item.category}</Text>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="location-outline" size={14} color={Colors.gray} />
            <Text style={styles.distanceText}>{item.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Featured Businesses</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={featuredBusinesses}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Featured Businesses</Text>
            <Text style={styles.emptySubtitle}>Check back soon for top-rated services</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  listContent: { padding: 16 },
  businessCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  businessImage: {
    width: '100%',
    height: 180,
    backgroundColor: Colors.grayLight,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: { fontSize: 12, fontWeight: '600', color: Colors.white },
  businessInfo: { padding: 16 },
  businessName: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  businessCategory: { fontSize: 14, color: Colors.gray, marginTop: 4 },
  businessMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: Colors.grayDark },
  reviewsText: { fontSize: 14, color: Colors.gray },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { fontSize: 14, color: Colors.gray },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8 },
});
