import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { useLocationBasedRealtime } from '../../hooks/useLocationBasedRealtime';

const ExploreScreen: React.FC = () => {
  const { colors } = useModernTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get real-time businesses within 20km
  const { businesses, userLocation, loading, error } = useLocationBasedRealtime(20);

  // Filter businesses based on search and category
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses;

    if (searchQuery.trim()) {
      filtered = filtered.filter(business => 
        business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(business => 
        business.category === selectedCategory
      );
    }

    return filtered;
  }, [businesses, searchQuery, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const categorySet = new Set(businesses.map(b => b.category).filter(Boolean));
    return Array.from(categorySet);
  }, [businesses]);

  const renderBusinessItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.businessCard, { backgroundColor: colors.colors.surface }]}
      activeOpacity={0.7}
    >
      <View style={styles.businessHeader}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.businessImage} />
        ) : (
          <View style={[styles.businessImage, styles.placeholderImage, { backgroundColor: colors.colors.backgroundSecondary }]}>
            <Ionicons name="storefront-outline" size={30} color={colors.colors.textSecondary} />
          </View>
        )}
        
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.colors.text }]}>
            {item.business_name}
          </Text>
          <Text style={[styles.businessCategory, { color: colors.colors.textSecondary }]}>
            {item.category}
          </Text>
          <Text style={[styles.businessDistance, { color: colors.colors.primary }]}>
            📍 {item.distance_km?.toFixed(1)}km away
          </Text>
        </View>
        
        <View style={styles.businessStatus}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.is_open ? '#4CAF50' : '#F44336' }
          ]} />
          <Text style={[
            styles.statusText, 
            { color: item.is_open ? '#4CAF50' : '#F44336' }
          ]}>
            {item.is_open ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={[styles.businessDescription, { color: colors.colors.textSecondary }]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.businessFooter}>
        <Text style={[styles.businessAddress, { color: colors.colors.textSecondary }]}>
          {item.address}
        </Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.ratingText, { color: colors.colors.text }]}>
            {item.rating?.toFixed(1) || 'New'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryChip = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        { 
          backgroundColor: selectedCategory === category 
            ? colors.colors.primary 
            : colors.colors.backgroundSecondary 
        }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === category ? null : category)}
    >
      <Text style={[
        styles.categoryChipText,
        { 
          color: selectedCategory === category 
            ? 'white' 
            : colors.colors.text 
        }
      ]}>
        {category}
      </Text>
    </TouchableOpacity>
  );

  if (loading && businesses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.colors.primary} />
          <Text style={[styles.loadingText, { color: colors.colors.textSecondary }]}>
            Finding nearby businesses...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.colors.text }]}>Explore Businesses</Text>
        <View style={styles.realtimeIndicator}>
          <View style={styles.realtimeDot} />
          <Text style={styles.realtimeText}>📡 Live Updates</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.colors.text }]}
          placeholder="Search businesses..."
          placeholderTextColor={colors.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <FlatList
          data={categories}
          renderItem={({ item }) => renderCategoryChip(item)}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesList}
        />
      )}

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsText, { color: colors.colors.text }]}>
          {filteredBusinesses.length} businesses found within 20km
        </Text>
        {userLocation && (
          <Text style={[styles.locationText, { color: colors.colors.textSecondary }]}>
            📍 Near {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>

      {/* Business List */}
      <FlatList
        data={filteredBusinesses}
        renderItem={renderBusinessItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.businessList}
        refreshing={loading}
        onRefresh={() => window.location.reload()} // Simple refresh
      />

      {/* Empty State */}
      {filteredBusinesses.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Ionicons name="storefront-outline" size={64} color={colors.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.colors.text }]}>
            No businesses found
          </Text>
          <Text style={[styles.emptyMessage, { color: colors.colors.textSecondary }]}>
            {searchQuery || selectedCategory 
              ? 'Try adjusting your search or filters'
              : 'No businesses available in your area'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  realtimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  realtimeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 4,
  },
  realtimeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2E7D32',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoriesList: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsInfo: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 12,
    marginTop: 2,
  },
  businessList: {
    paddingHorizontal: 16,
  },
  businessCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  businessHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  businessImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  businessDistance: {
    fontSize: 12,
    fontWeight: '500',
  },
  businessStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  businessDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessAddress: {
    fontSize: 12,
    flex: 1,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ExploreScreen;
