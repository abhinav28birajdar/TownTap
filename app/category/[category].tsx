import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Sample shop data - in a real app, this would come from an API
const shopsByCategory: any = {
  plumber: [
    { id: '1', name: "Mike's Plumbing", rating: 4.8, reviews: 120, distance: '1.2 km', price: '₹500-1000' },
    { id: '2', name: 'Quick Fix Plumbing', rating: 4.6, reviews: 85, distance: '2.5 km', price: '₹600-1200' },
    { id: '3', name: 'Expert Plumbers', rating: 4.9, reviews: 200, distance: '3.1 km', price: '₹700-1500' },
  ],
  electrician: [
    { id: '1', name: 'Power Solutions', rating: 4.7, reviews: 150, distance: '1.5 km', price: '₹800-1500' },
    { id: '2', name: 'Bright Electricals', rating: 4.8, reviews: 110, distance: '2.2 km', price: '₹700-1300' },
  ],
  painter: [
    { id: '1', name: 'Color Masters', rating: 4.9, reviews: 180, distance: '2.0 km', price: '₹2000-5000' },
    { id: '2', name: 'Perfect Paint', rating: 4.7, reviews: 95, distance: '3.5 km', price: '₹1800-4500' },
  ],
  carpenter: [
    { id: '1', name: 'Wood Works', rating: 4.8, reviews: 140, distance: '1.8 km', price: '₹1000-3000' },
    { id: '2', name: 'Crafted Carpentry', rating: 4.6, reviews: 90, distance: '2.9 km', price: '₹1200-3500' },
  ],
  gardener: [
    { id: '1', name: 'Green Thumbs', rating: 4.7, reviews: 75, distance: '1.3 km', price: '₹500-1200' },
    { id: '2', name: 'Garden Paradise', rating: 4.9, reviews: 120, distance: '2.7 km', price: '₹600-1400' },
  ],
  housemaid: [
    { id: '1', name: 'Clean Home Services', rating: 4.8, reviews: 200, distance: '1.0 km', price: '₹300-800' },
    { id: '2', name: 'Sparkling Clean', rating: 4.6, reviews: 150, distance: '2.3 km', price: '₹400-900' },
  ],
  food: [
    { id: '1', name: 'Tasty Kitchen', rating: 4.9, reviews: 500, distance: '0.8 km', price: '₹200-600' },
    { id: '2', name: 'Food Paradise', rating: 4.7, reviews: 350, distance: '1.5 km', price: '₹250-700' },
  ],
  doctor: [
    { id: '1', name: 'City Hospital', rating: 4.8, reviews: 300, distance: '2.0 km', price: '₹500-2000' },
    { id: '2', name: 'HealthCare Clinic', rating: 4.9, reviews: 250, distance: '3.0 km', price: '₹600-2500' },
  ],
};

export default function CategoryShopsScreen() {
  const { category } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const categoryName = typeof category === 'string' ? category : 'service';
  const shops = shopsByCategory[categoryName.toLowerCase()] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}
        </Text>
        <TouchableOpacity>
          <Ionicons name="options-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B8E6F" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${categoryName}s...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterPill, sortBy === 'rating' && styles.filterPillActive]}
          onPress={() => setSortBy('rating')}
        >
          <Ionicons name="star" size={14} color={sortBy === 'rating' ? '#fff' : '#6B8E6F'} />
          <Text style={[styles.filterText, sortBy === 'rating' && styles.filterTextActive]}>
            Top Rated
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterPill, sortBy === 'distance' && styles.filterPillActive]}
          onPress={() => setSortBy('distance')}
        >
          <Ionicons name="location" size={14} color={sortBy === 'distance' ? '#fff' : '#6B8E6F'} />
          <Text style={[styles.filterText, sortBy === 'distance' && styles.filterTextActive]}>
            Nearest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, sortBy === 'price' && styles.filterPillActive]}
          onPress={() => setSortBy('price')}
        >
          <Ionicons name="cash" size={14} color={sortBy === 'price' ? '#fff' : '#6B8E6F'} />
          <Text style={[styles.filterText, sortBy === 'price' && styles.filterTextActive]}>
            Price
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shops List */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.shopCard}
            onPress={() => router.push('/customer/booking')}
          >
            <View style={styles.shopImage}>
              <Ionicons name="business-outline" size={40} color="#4A5F4E" />
            </View>
            
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{item.name}</Text>
              
              <View style={styles.shopMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewsText}>({item.reviews})</Text>
                </View>
                
                <View style={styles.metaDivider} />
                
                <View style={styles.distanceContainer}>
                  <Ionicons name="location-outline" size={14} color="#6B8E6F" />
                  <Text style={styles.distanceText}>{item.distance}</Text>
                </View>
              </View>

              <Text style={styles.priceRange}>{item.price}</Text>

              <View style={styles.shopActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Ionicons name="call-outline" size={16} color="#4A5F4E" />
                  <Text style={styles.actionBtnText}>Call</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.bookBtn}
                  onPress={() => router.push('/customer/booking')}
                >
                  <Text style={styles.bookBtnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3E2F',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#4A5F4E',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B8E6F',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  shopCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  shopImage: {
    width: 80,
    height: 80,
    backgroundColor: '#A8D5AB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopInfo: {
    flex: 1,
    gap: 8,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  shopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2D3E2F',
  },
  reviewsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  priceRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5F4E',
  },
  shopActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4A5F4E',
  },
  bookBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#4A5F4E',
    borderRadius: 8,
    alignItems: 'center',
  },
  bookBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
