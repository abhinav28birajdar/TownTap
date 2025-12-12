import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const MOCK_SHOPS = [
  { id: '1', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '👨‍⚕️' },
  { id: '2', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '🍔' },
  { id: '3', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '👨‍⚕️' },
  { id: '4', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '🍔' },
  { id: '5', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '👨‍⚕️' },
  { id: '6', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '🍔' },
  { id: '7', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '👨‍⚕️' },
  { id: '8', name: 'SpiceBite', category: 'MD Nasi Tantos', rating: 4.5, image: '🍔' },
];

export default function ShopListingScreen() {
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const categoryTitle = params.category as string || 'Shop';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications" size={24} color="#4A5F4E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title */}
        <Text style={styles.pageTitle}>{categoryTitle}</Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="search.."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={20} color="#999" />
          </View>
        </View>

        {/* Shop Grid */}
        <View style={styles.shopGrid}>
          {MOCK_SHOPS.map((shop) => (
            <TouchableOpacity
              key={shop.id}
              style={styles.shopCard}
              onPress={() => router.push(`/business/${shop.id}`)}
            >
              {/* Favorite Button */}
              <TouchableOpacity style={styles.favoriteButton}>
                <Ionicons name="star" size={16} color="#FFA000" />
                <Text style={styles.ratingText}>{shop.rating}</Text>
              </TouchableOpacity>

              {/* Shop Image/Icon */}
              <View style={styles.shopImageContainer}>
                <Text style={styles.shopIcon}>{shop.image}</Text>
              </View>

              {/* Shop Info */}
              <View style={styles.shopInfo}>
                <Text style={styles.shopName}>{shop.name}</Text>
                <Text style={styles.shopCategory}>{shop.category}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="toggle" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/search')}
        >
          <Ionicons name="location" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/bookings')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E7D4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  profileButton: {},
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A5F4E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  shopGrid: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  shopCard: {
    width: '47%',
    backgroundColor: '#A8D5AB',
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  favoriteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  shopImageContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  shopIcon: {
    fontSize: 48,
  },
  shopInfo: {
    marginBottom: Spacing.sm,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  shopCategory: {
    fontSize: 12,
    color: '#555',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4A5F4E',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    backgroundColor: '#6B8E6F',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
