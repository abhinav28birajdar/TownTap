import { ThemedText } from '@/components/ui';
import { BusinessCard } from '@/components/ui/business-card';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/contexts/theme-context';
import { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type Business = Database['public']['Tables']['businesses']['Row'];

type FilterType = 'all' | 'rating' | 'distance' | 'price';
type SortType = 'relevance' | 'rating' | 'distance' | 'price_low' | 'price_high';

export default function SearchResultsScreen() {
  const colors = useColors();
  const params = useLocalSearchParams<{ query?: string; category?: string }>();
  const [results, setResults] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    searchBusinesses();
  }, [params.query, params.category, activeSort]);

  const searchBusinesses = async () => {
    try {
      setLoading(true);
      let query = supabase.from('businesses').select('*');

      // Apply search query
      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      // Apply category filter
      if (params.category) {
        query = query.eq('category', params.category);
      }

      // Apply sorting
      switch (activeSort) {
        case 'rating':
          query = query.order('avg_rating', { ascending: false });
          break;
        case 'distance':
          // TODO: Implement distance sorting based on user location
          break;
        case 'price_low':
          // TODO: Implement price sorting
          break;
        case 'price_high':
          // TODO: Implement price sorting
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters: { id: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'all', label: 'All', icon: 'list-outline' },
    { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
    { id: 'distance', label: 'Nearby', icon: 'location-outline' },
    { id: 'price', label: 'Price', icon: 'cash-outline' },
  ];

  const sortOptions: { id: SortType; label: string }[] = [
    { id: 'relevance', label: 'Most Relevant' },
    { id: 'rating', label: 'Highest Rated' },
    { id: 'distance', label: 'Nearest First' },
    { id: 'price_low', label: 'Price: Low to High' },
    { id: 'price_high', label: 'Price: High to Low' },
  ];

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Back Button & Title */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <ThemedText type="h3" weight="bold">
            Search Results
          </ThemedText>
          <ThemedText style={styles.resultCount}>
            {results.length} {results.length === 1 ? 'result' : 'results'} found
          </ThemedText>
        </View>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => router.push('/customer/map-view')}
        >
          <Ionicons name="map-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Query Display */}
      {params.query && (
        <View style={[styles.queryCard, { backgroundColor: colors.muted }]}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <ThemedText style={styles.queryText}>"{params.query}"</ThemedText>
        </View>
      )}

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              {
                backgroundColor: activeFilter === filter.id ? colors.primary : colors.card,
                borderColor: activeFilter === filter.id ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Ionicons
              name={filter.icon}
              size={18}
              color={activeFilter === filter.id ? '#fff' : colors.text}
            />
            <ThemedText
              style={[
                styles.filterText,
                { color: activeFilter === filter.id ? '#fff' : colors.text },
              ]}
            >
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <TouchableOpacity
        style={[styles.sortButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => setShowFilters(!showFilters)}
      >
        <Ionicons name="swap-vertical-outline" size={20} color={colors.text} />
        <ThemedText style={styles.sortText}>
          {sortOptions.find((opt) => opt.id === activeSort)?.label}
        </ThemedText>
        <Ionicons
          name={showFilters ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Sort Dropdown */}
      {showFilters && (
        <View style={[styles.sortDropdown, { backgroundColor: colors.card }]}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.sortOption,
                activeSort === option.id && { backgroundColor: colors.muted },
              ]}
              onPress={() => {
                setActiveSort(option.id);
                setShowFilters(false);
              }}
            >
              <ThemedText style={styles.sortOptionText}>{option.label}</ThemedText>
              {activeSort === option.id && (
                <Ionicons name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={80} color={colors.textTertiary} />
      <ThemedText type="h3" weight="bold" style={styles.emptyTitle}>
        No Results Found
      </ThemedText>
      <ThemedText style={styles.emptyText}>
        We couldn't find any businesses matching your search. Try different keywords or filters.
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <ThemedText style={styles.loadingText}>Searching...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BusinessCard
            business={item}
            onPress={() => router.push(`/business/${item.id}`)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  resultCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  mapButton: {
    padding: Spacing.sm,
  },
  queryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  filtersScroll: {
    marginBottom: Spacing.md,
  },
  filtersContent: {
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  sortText: {
    flex: 1,
    fontSize: 14,
  },
  sortDropdown: {
    marginTop: Spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  sortOptionText: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
  },
});
