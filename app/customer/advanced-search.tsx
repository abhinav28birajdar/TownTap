/**
 * Advanced Search Page - Phase 2
 * Search with filters, sorting, and autocomplete
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { spacing , BorderRadius} from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Business {
  id: string;
  business_name: string;
  category: string;
  rating: number;
  total_reviews: number;
  is_verified: boolean;
  opening_time: string;
  closing_time: string;
}

interface SearchFilters {
  category?: string;
  minRating?: number;
  sortBy?: 'rating' | 'reviews' | 'distance';
  isOpen?: boolean;
  isVerified?: boolean;
}

export default function AdvancedSearchPage() {
  const { initialQuery } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const searchInputRef = useRef<TextInput>(null);

  const [searchQuery, setSearchQuery] = useState((initialQuery as string) || '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Salon near me',
    'AC Repair',
    'House Cleaning',
    'Plumber',
  ]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = [
    'All',
    'Salons',
    'Spa',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Repairs',
    'Appliances',
  ];

  useEffect(() => {
    if (searchQuery) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (initialQuery) {
      performSearch();
    }
  }, [initialQuery]);

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('business_name, category')
        .ilike('business_name', `%${searchQuery}%`)
        .limit(5);

      if (data) {
        const names = data.map((b) => b.business_name);
        const uniqueCategories = [...new Set(data.map((b) => b.category))];
        setSuggestions([...names, ...uniqueCategories]);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      // Apply search query
      query = query.or(
        `business_name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
      );

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters.isVerified) {
        query = query.eq('is_verified', true);
      }

      // Apply sorting
      if (filters.sortBy === 'rating') {
        query = query.order('rating', { ascending: false });
      } else if (filters.sortBy === 'reviews') {
        query = query.order('total_reviews', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setBusinesses(data);

      // Save to recent searches
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches.slice(0, 4)]);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch();
    setSuggestions([]);
  };

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    performSearch();
  };

  const toggleFilter = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/business/${item.id}`)}
    >
      <Card style={styles.businessCard}>
        <View style={styles.businessHeader}>
          <View style={styles.businessAvatar}>
            <Text style={styles.avatarText}>{item.business_name.charAt(0)}</Text>
          </View>
          <View style={styles.businessInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.businessName, { color: colors.text }]}>
                {item.business_name}
              </Text>
              {item.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
            </View>
            <Text style={[styles.category, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.rating}>
                <Text style={styles.ratingText}>⭐ {item.rating}</Text>
              </View>
              <Text style={[styles.reviews, { color: colors.textSecondary }]}>
                ({item.total_reviews} reviews)
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={[styles.timing, { color: colors.textSecondary }]}>
            ⏰ {item.opening_time} - {item.closing_time}
          </Text>
          <TouchableOpacity style={styles.bookButton}>
            <Text style={[styles.bookButtonText, { color: colors.primary }]}>
              Book Now →
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search services, businesses..."
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: colors.surface }]}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Text style={styles.suggestionIcon}>🔍</Text>
              <Text style={[styles.suggestionText, { color: colors.text }]}>
                {suggestion}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.surface }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={clearFilters}>
              <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <Text style={[styles.filterLabel, { color: colors.text }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    filters.category === category && styles.filterChipActive,
                  ]}
                  onPress={() => toggleFilter('category', category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.category === category && styles.filterChipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Rating Filter */}
          <Text style={[styles.filterLabel, { color: colors.text }]}>Minimum Rating</Text>
          <View style={styles.filterRow}>
            {[3, 3.5, 4, 4.5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.filterChip,
                  filters.minRating === rating && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('minRating', rating)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.minRating === rating && styles.filterChipTextActive,
                  ]}
                >
                  ⭐ {rating}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <Text style={[styles.filterLabel, { color: colors.text }]}>Sort By</Text>
          <View style={styles.filterRow}>
            {[
              { value: 'rating', label: 'Rating' },
              { value: 'reviews', label: 'Reviews' },
              { value: 'distance', label: 'Distance' },
            ].map((sort) => (
              <TouchableOpacity
                key={sort.value}
                style={[
                  styles.filterChip,
                  filters.sortBy === sort.value && styles.filterChipActive,
                ]}
                onPress={() => toggleFilter('sortBy', sort.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.sortBy === sort.value && styles.filterChipTextActive,
                  ]}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              setShowFilters(false);
              performSearch();
            }}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!searchQuery && suggestions.length === 0 ? (
        // Recent Searches
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Searches</Text>
          {recentSearches.map((search, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recentItem}
              onPress={() => {
                setSearchQuery(search);
                performSearch();
              }}
            >
              <Text style={styles.recentIcon}>🕐</Text>
              <Text style={[styles.recentText, { color: colors.text }]}>{search}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Search Results
        <FlatList
          data={businesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            businesses.length > 0 ? (
              <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                {businesses.length} results found
              </Text>
            ) : loading ? null : searchQuery ? (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No businesses found
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
  },
  backIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  clearButton: {
    padding: spacing.xs,
  },
  clearIcon: {
    fontSize: 16,
    color: '#999',
  },
  filterButton: {
    padding: spacing.xs,
  },
  filterIcon: {
    fontSize: 24,
  },
  suggestionsContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: spacing.md,
  },
  suggestionText: {
    fontSize: 14,
  },
  filtersPanel: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  recentIcon: {
    fontSize: 18,
    marginRight: spacing.md,
  },
  recentText: {
    fontSize: 14,
  },
  listContent: {
    padding: spacing.md,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  businessCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  businessHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  businessAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  businessInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
  },
  verifiedBadge: {
    fontSize: 16,
    color: colors.primary,
  },
  category: {
    fontSize: 14,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rating: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFF3E0',
    borderRadius: BorderRadius.md,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  reviews: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: spacing.md,
  },
  timing: {
    fontSize: 12,
  },
  bookButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
