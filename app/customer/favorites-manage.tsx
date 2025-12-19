import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FavoriteItem {
  id: string;
  type: 'business' | 'service';
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  price?: number;
  category: string;
  addedAt: string;
  isAvailable: boolean;
}

const favorites: FavoriteItem[] = [
  {
    id: '1',
    type: 'business',
    name: 'Sparkle Cleaners',
    description: 'Professional home cleaning services',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.8,
    reviews: 234,
    category: 'Cleaning',
    addedAt: '2024-12-15',
    isAvailable: true,
  },
  {
    id: '2',
    type: 'service',
    name: 'Deep Home Cleaning',
    description: 'Complete 3-4 hour deep cleaning',
    image: 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
    rating: 4.9,
    reviews: 156,
    price: 999,
    category: 'Cleaning',
    addedAt: '2024-12-10',
    isAvailable: true,
  },
  {
    id: '3',
    type: 'business',
    name: 'Fix It Pro',
    description: 'Expert repair services',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    rating: 4.7,
    reviews: 312,
    category: 'Repairs',
    addedAt: '2024-12-08',
    isAvailable: true,
  },
  {
    id: '4',
    type: 'service',
    name: 'AC Gas Refill',
    description: 'Complete AC servicing with gas top-up',
    image: 'https://images.unsplash.com/photo-1631083215283-b1e563541c48?w=400',
    rating: 4.6,
    reviews: 89,
    price: 1499,
    category: 'AC Services',
    addedAt: '2024-12-05',
    isAvailable: false,
  },
  {
    id: '5',
    type: 'business',
    name: 'Beauty Plus Salon',
    description: 'Premium beauty and spa services',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    rating: 4.9,
    reviews: 567,
    category: 'Beauty & Spa',
    addedAt: '2024-11-28',
    isAvailable: true,
  },
];

const collections = [
  { id: '1', name: 'Home Essentials', count: 5, color: '#4A90D9' },
  { id: '2', name: 'Monthly Services', count: 3, color: '#E67E22' },
  { id: '3', name: 'Beauty', count: 2, color: '#9B59B6' },
];

export default function FavoritesScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'all' | 'businesses' | 'services'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FavoriteItem | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'businesses') return item.type === 'business' && matchesSearch;
    if (activeTab === 'services') return item.type === 'service' && matchesSearch;
    return matchesSearch;
  });

  const handleRemoveFavorite = (item: FavoriteItem) => {
    Alert.alert(
      'Remove from Favorites',
      `Remove ${item.name} from your favorites?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {} 
        },
      ]
    );
  };

  const renderFavorite = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: colors.card }]}
      onPress={() => {
        if (item.type === 'business') {
          router.push(`/business/${item.id}`);
        } else {
          router.push(`/booking/select-service?id=${item.id}`);
        }
      }}
    >
      <Image source={{ uri: item.image }} style={styles.favoriteImage} />
      
      {/* Type Badge */}
      <View style={[styles.typeBadge, { backgroundColor: item.type === 'business' ? colors.info : colors.success }]}>
        <Ionicons 
          name={item.type === 'business' ? 'business' : 'construct'} 
          size={10} 
          color="#FFF" 
        />
        <ThemedText style={styles.typeBadgeText}>
          {item.type === 'business' ? 'Business' : 'Service'}
        </ThemedText>
      </View>

      {/* Availability Badge */}
      {!item.isAvailable && (
        <View style={[styles.unavailableBadge, { backgroundColor: colors.error }]}>
          <ThemedText style={styles.unavailableText}>Unavailable</ThemedText>
        </View>
      )}

      <View style={styles.favoriteContent}>
        <View style={styles.favoriteHeader}>
          <ThemedText style={styles.favoriteName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <TouchableOpacity 
            onPress={() => handleRemoveFavorite(item)}
            style={styles.heartButton}
          >
            <Ionicons name="heart" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>

        <ThemedText 
          style={[styles.favoriteDescription, { color: colors.textSecondary }]} 
          numberOfLines={1}
        >
          {item.description}
        </ThemedText>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          <ThemedText style={[styles.reviewsText, { color: colors.textSecondary }]}>
            ({item.reviews} reviews)
          </ThemedText>
        </View>

        <View style={styles.favoriteFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
            <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
              {item.category}
            </ThemedText>
          </View>
          {item.price && (
            <ThemedText style={[styles.priceText, { color: colors.primary }]}>
              ₹{item.price}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.primary }]}
          onPress={() => {
            if (item.type === 'business') {
              router.push(`/business/${item.id}`);
            } else {
              router.push('/booking/form');
            }
          }}
        >
          <Ionicons name="calendar" size={16} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAction, { backgroundColor: colors.background }]}
          onPress={() => {
            setSelectedItem(item);
            setShowCollectionModal(true);
          }}
        >
          <Ionicons name="folder-outline" size={16} color={colors.text} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Favorites</ThemedText>
        <TouchableOpacity onPress={() => setShowCollectionModal(true)}>
          <Ionicons name="folder-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search favorites..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Collections Preview */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.collectionsScroll}
      >
        {collections.map((collection) => (
          <TouchableOpacity
            key={collection.id}
            style={[styles.collectionChip, { backgroundColor: collection.color + '15' }]}
          >
            <View style={[styles.collectionDot, { backgroundColor: collection.color }]} />
            <ThemedText style={[styles.collectionName, { color: collection.color }]}>
              {collection.name}
            </ThemedText>
            <ThemedText style={[styles.collectionCount, { color: colors.textSecondary }]}>
              {collection.count}
            </ThemedText>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.collectionChip, { backgroundColor: colors.card, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border }]}
          onPress={() => setShowCollectionModal(true)}
        >
          <Ionicons name="add" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.collectionName, { color: colors.textSecondary }]}>
            New Collection
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Tabs */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        {(['all', 'businesses', 'services'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText style={[
              styles.tabText,
              { color: activeTab === tab ? colors.primary : colors.textSecondary }
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'all' && ` (${favorites.length})`}
              {tab === 'businesses' && ` (${favorites.filter(f => f.type === 'business').length})`}
              {tab === 'services' && ` (${favorites.filter(f => f.type === 'service').length})`}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Favorites List */}
      <FlatList
        data={filteredFavorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No favorites yet</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              {searchQuery ? 'No results found for your search' : 'Save your favorite businesses and services here for quick access'}
            </ThemedText>
            <TouchableOpacity
              style={[styles.browseButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <ThemedText style={styles.browseButtonText}>Browse Services</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Collection Modal */}
      <Modal
        visible={showCollectionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCollectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {selectedItem ? 'Add to Collection' : 'My Collections'}
              </ThemedText>
              <TouchableOpacity onPress={() => {
                setShowCollectionModal(false);
                setSelectedItem(null);
              }}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Collections List */}
            <ScrollView style={styles.collectionsList}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[styles.collectionRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    if (selectedItem) {
                      setShowCollectionModal(false);
                      setSelectedItem(null);
                    }
                  }}
                >
                  <View style={styles.collectionInfo}>
                    <View style={[styles.collectionIcon, { backgroundColor: collection.color + '20' }]}>
                      <Ionicons name="folder" size={20} color={collection.color} />
                    </View>
                    <View>
                      <ThemedText style={styles.collectionRowName}>{collection.name}</ThemedText>
                      <ThemedText style={[styles.collectionRowCount, { color: colors.textSecondary }]}>
                        {collection.count} items
                      </ThemedText>
                    </View>
                  </View>
                  {selectedItem ? (
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Create New Collection */}
            <View style={styles.newCollectionSection}>
              <ThemedText style={[styles.newCollectionLabel, { color: colors.textSecondary }]}>
                Create New Collection
              </ThemedText>
              <View style={styles.newCollectionInput}>
                <TextInput
                  style={[styles.collectionInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Collection name"
                  placeholderTextColor={colors.textSecondary}
                  value={newCollectionName}
                  onChangeText={setNewCollectionName}
                />
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: colors.primary }]}
                  disabled={!newCollectionName.trim()}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  collectionsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  collectionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  collectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  collectionName: {
    fontSize: 13,
    fontWeight: '500',
  },
  collectionCount: {
    fontSize: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  favoriteCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  favoriteImage: {
    width: '100%',
    height: 140,
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  typeBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  unavailableBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  unavailableText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteContent: {
    padding: 14,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  heartButton: {
    padding: 4,
  },
  favoriteDescription: {
    fontSize: 13,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewsText: {
    fontSize: 12,
  },
  favoriteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  quickActions: {
    position: 'absolute',
    right: 10,
    top: 100,
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  collectionsList: {
    maxHeight: 300,
  },
  collectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  collectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionRowName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  collectionRowCount: {
    fontSize: 12,
  },
  newCollectionSection: {
    padding: 20,
  },
  newCollectionLabel: {
    fontSize: 12,
    marginBottom: 10,
  },
  newCollectionInput: {
    flexDirection: 'row',
    gap: 10,
  },
  collectionInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  createButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
