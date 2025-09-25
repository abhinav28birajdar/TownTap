import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { useLocationBasedRealtime } from '../../hooks/useLocationBasedRealtime';
import { Business } from '../../types';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'grid-outline' },
  { id: 'restaurant', name: 'Food', icon: 'restaurant-outline' },
  { id: 'retail', name: 'Shopping', icon: 'bag-outline' },
  { id: 'service', name: 'Services', icon: 'construct-outline' },
  { id: 'healthcare', name: 'Health', icon: 'medical-outline' },
  { id: 'entertainment', name: 'Fun', icon: 'game-controller-outline' },
];

const ExploreScreen: React.FC = () => {
  const { colors } = useModernTheme();
  const { businesses, loading, error } = useLocationBasedRealtime(50); // Wider search for explore
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    let filtered = businesses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(business => 
        business.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(business =>
        business.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBusinesses(filtered);
  }, [businesses, searchQuery, selectedCategory]);

  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => {
    const isSelected = selectedCategory === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { 
            backgroundColor: isSelected 
              ? colors.colors?.primary || '#3B82F6' 
              : colors.colors?.surface || '#FFFFFF',
            borderColor: isSelected 
              ? colors.colors?.primary || '#3B82F6' 
              : colors.colors?.border || '#E5E7EB'
          }
        ]}
        onPress={() => setSelectedCategory(item.id)}
      >
        <Ionicons 
          name={item.icon as any} 
          size={20} 
          color={isSelected ? '#FFFFFF' : colors.colors?.text || '#1E293B'} 
        />
        <Text style={[
          styles.categoryText,
          { color: isSelected ? '#FFFFFF' : colors.colors?.text || '#1E293B' }
        ]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderBusinessItem = ({ item }: { item: Business }) => (
    <TouchableOpacity 
      style={[styles.businessCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
      onPress={() => {
        console.log('Navigate to business:', item.id);
      }}
    >
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Text style={[styles.businessName, { color: colors.colors?.text || '#1E293B' }]}>
            {item.business_name}
          </Text>
          <Text style={[styles.businessCategory, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.category || 'Business'}
          </Text>
          <Text style={[styles.businessDescription, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.description || 'No description available'}
          </Text>
          <Text style={[styles.businessAddress, { color: colors.colors?.textSecondary || '#64748B' }]}>
            📍 {item.address}, {item.city}
          </Text>
        </View>
        <View style={styles.businessMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.rating, { color: colors.colors?.text || '#1E293B' }]}>
              {item.rating?.toFixed(1) || '0.0'}
            </Text>
          </View>
          <Text style={[styles.distance, { color: colors.colors?.textSecondary || '#64748B' }]}>
            {item.distance_km?.toFixed(1) || '0.0'} km
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.is_open ? '#10B981' : '#EF4444' }
          ]}>
            <Text style={styles.statusText}>
              {item.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.businessFooter}>
        <View style={styles.businessTags}>
          {item.delivery_available && (
            <View style={[styles.tag, { backgroundColor: colors.colors?.primaryLight || '#DBEAFE' }]}>
              <Ionicons name="bicycle-outline" size={12} color={colors.colors?.primary || '#3B82F6'} />
              <Text style={[styles.tagText, { color: colors.colors?.primary || '#3B82F6' }]}>
                Delivery
              </Text>
            </View>
          )}
          {item.phone && (
            <View style={[styles.tag, { backgroundColor: colors.colors?.primaryLight || '#DBEAFE' }]}>
              <Ionicons name="call-outline" size={12} color={colors.colors?.primary || '#3B82F6'} />
              <Text style={[styles.tagText, { color: colors.colors?.primary || '#3B82F6' }]}>
                Call
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity style={[styles.viewButton, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}>
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.colors?.text || '#1E293B' }]}>
          Explore
        </Text>
        <Text style={[styles.subtitle, { color: colors.colors?.textSecondary || '#64748B' }]}>
          Discover amazing local businesses
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.colors?.textSecondary || '#64748B'} 
          />
          <TextInput
            style={[styles.searchInput, { color: colors.colors?.text || '#1E293B' }]}
            placeholder="Search businesses..."
            placeholderTextColor={colors.colors?.textSecondary || '#64748B'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={colors.colors?.textSecondary || '#64748B'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsTitle, { color: colors.colors?.text || '#1E293B' }]}>
          {searchQuery ? `Results for "${searchQuery}"` : selectedCategory === 'all' ? 'All Businesses' : CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </Text>
        <Text style={[styles.resultsCount, { color: colors.colors?.textSecondary || '#64748B' }]}>
          {filteredBusinesses.length} found
        </Text>
      </View>

      {/* Business List */}
      {loading && filteredBusinesses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors?.primary || '#3B82F6'} />
          <Text style={[styles.loadingText, { color: colors.colors?.text || '#1E293B' }]}>
            Loading businesses...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBusinesses}
          renderItem={renderBusinessItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.businessList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="search-outline" 
                size={48} 
                color={colors.colors?.textSecondary || '#64748B'} 
              />
              <Text style={[styles.emptyText, { color: colors.colors?.textSecondary || '#64748B' }]}>
                No businesses found
              </Text>
              <Text style={[styles.emptySubtext, { color: colors.colors?.textSecondary || '#64748B' }]}>
                Try adjusting your search or category
              </Text>
            </View>
          }
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: '#EF4444' }]}>
            {error}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultsCount: {
    fontSize: 14,
  },
  businessList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  businessCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  businessInfo: {
    flex: 1,
    marginRight: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: 4,
  },
  businessDescription: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  businessAddress: {
    fontSize: 12,
  },
  businessMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessTags: {
    flexDirection: 'row',
    flex: 1,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  viewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 16,
    margin: 20,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ExploreScreen;
