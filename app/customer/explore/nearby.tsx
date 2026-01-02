/**
 * TownTap - Nearby Services Screen
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

const nearbyServices = [
  {
    id: '1',
    name: 'Quick Clean Laundry',
    category: 'Laundry',
    rating: 4.6,
    reviews: 89,
    distance: '0.3 km',
    image: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400',
  },
  {
    id: '2',
    name: 'Pet Paradise',
    category: 'Pets',
    rating: 4.8,
    reviews: 156,
    distance: '0.5 km',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400',
  },
  {
    id: '3',
    name: 'FitZone Gym',
    category: 'Fitness',
    rating: 4.5,
    reviews: 234,
    distance: '0.7 km',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  },
  {
    id: '4',
    name: 'Green Thumb Gardens',
    category: 'Gardening',
    rating: 4.7,
    reviews: 67,
    distance: '1.0 km',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
  },
];

export default function NearbyServicesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderService = ({ item }: { item: typeof nearbyServices[0] }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => router.push(`/business/${item.id}`)}
    >
      <Image source={{ uri: item.image }} style={styles.serviceImage} />
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        <View style={styles.serviceMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewsText}>({item.reviews})</Text>
          </View>
          <View style={styles.distanceContainer}>
            <Ionicons name="location" size={14} color={Colors.primary} />
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
        <Text style={styles.headerTitle}>Nearby Services</Text>
        <TouchableOpacity style={styles.mapBtn} onPress={() => router.push('/customer/map-view')}>
          <Ionicons name="map-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.locationBar}>
        <Ionicons name="location" size={20} color={Colors.primary} />
        <Text style={styles.locationText}>Current Location</Text>
        <TouchableOpacity>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={nearbyServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No Services Nearby</Text>
            <Text style={styles.emptySubtitle}>Try expanding your search radius</Text>
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
  mapBtn: { padding: 8 },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primaryLight,
    gap: 8,
  },
  locationText: { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.grayDark },
  changeText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  listContent: { padding: 16 },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.grayLight,
  },
  serviceInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  serviceName: { fontSize: 16, fontWeight: '600', color: Colors.grayDark },
  serviceCategory: { fontSize: 13, color: Colors.gray, marginTop: 2 },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: Colors.grayDark },
  reviewsText: { fontSize: 13, color: Colors.gray },
  distanceContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  distanceText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8 },
});
