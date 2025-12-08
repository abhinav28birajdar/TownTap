import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Import modern components
import { LoadingScreen, SearchBar } from '@/components/ui';
import { OptimizedBusinessList } from '@/components/ui/optimized-business-list';

// Import hooks and services
import { useMemoryOptimization } from '@/hooks/use-memory-optimization';
import { useSearch } from '@/hooks/use-search';
import { performanceMonitor } from '@/lib/performance-monitor';
import { SearchResult } from '@/lib/search-service';

// Import theme and constants
import { Colors } from '@/constants/theme';
import { useColors } from '@/contexts/theme-context';

export default function CustomerSearch() {
  const colors = useColors();
  
  // Performance and memory optimization
  const memoryOpt = useMemoryOptimization({
    autoCleanup: true,
    cleanupThreshold: 120, // MB
    preloadLimit: 10,
  });
  
  // State for UI
  const [/* removed */, /* removed */] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [/* removed */, /* removed */] = useState(false);
  
  // Search hook with all the advanced features
  const search = useSearch({
    enableLocation: true,
    enableSuggestions: true,
    enableHistory: true,
    autoSearch: true,
    debounceMs: memoryOpt?.shouldReduceQuality ? 500 : 300,
  });

  // Initialize performance monitoring
  useEffect(() => {
    performanceMonitor.initialize();
    performanceMonitor.trackNavigation('customer/search');
    
    return () => {
      performanceMonitor.stop();
    };
  }, []);

  // Results processing
  const displayResults = useMemo(() => {
    return search.results;
  }, [search.results]);

  // Handle business selection
  const handleBusinessPress = (result: SearchResult) => {
    const startTime = Date.now();
    
    router.push({
      pathname: '/business/[id]' as any,
      params: { id: result.business.id }
    });
    
    const duration = Date.now() - startTime;
    performanceMonitor.trackUserInteraction('business_select', 'search_results', true, duration);
  };

  // Handle search
  const handleSearch = (query: string, results: any[]) => {
    performanceMonitor.trackCustomMetric('search_results_count', results.length, {
      query_length: query.length.toString(),
      has_location: search.userLocation ? 'true' : 'false',
    });
    console.log('Search performed:', query, results.length);
  };

  // Handle refresh
  const handleRefresh = async () => {
    /* removed */(true);
    const startTime = Date.now();
    
    try {
      await search.requestLocation();
      if (search.query.trim()) {
        await search.search();
      }
      
      const duration = Date.now() - startTime;
      performanceMonitor.trackUserInteraction('refresh', 'search_screen', true, duration);
    } catch (error) {
      console.error('Refresh error:', error);
      performanceMonitor.trackUserInteraction('refresh', 'search_screen', false);
    } finally {
      /* removed */(false);
    }
  };

  // Filter by category
  const handleCategoryFilter = (categoryId: string) => {
    const startTime = Date.now();
    
    if (/* removed */ === categoryId) {
      /* removed */(null);
      search.updateFilters({ category: undefined });
    } else {
      /* removed */(categoryId);
      search.updateFilters({ category: categoryId });
    }
    
    const duration = Date.now() - startTime;
    performanceMonitor.trackUserInteraction('category_filter', 'category_chips', true, duration);
  };

  // Popular categories for quick access
  const popularCategories = [
    { id: 'restaurant', name: 'Restaurants', icon: '🍽️', color: Colors.orange[500] },
    { id: 'coffee', name: 'Coffee', icon: '☕', color: Colors.amber[600] },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: Colors.pink[500] },
    { id: 'beauty', name: 'Beauty', icon: '💄', color: Colors.purple[500] },
    { id: 'fitness', name: 'Fitness', icon: '💪', color: Colors.green[500] },
    { id: 'entertainment', name: 'Fun', icon: '🎬', color: Colors.blue[500] },
  ];

  // Empty state
  const renderEmptyState = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.emptyStateContainer}
    >
      <ThemedText style={styles.emptyStateIcon}>🔍</ThemedText>
      <ThemedText variant="title-medium" style={styles.emptyStateTitle}>
        {search.query.trim() ? 'No Results Found' : 'Start Your Search'}
      </ThemedText>
      <ThemedText variant="body-medium" style={styles.emptyStateMessage}>
        {search.query.trim() 
          ? 'Try adjusting your search terms or filters' 
          : 'Search for businesses, food, services and more'}
      </ThemedText>
      
      {!search.userLocation && (
        <ThemedButton
          variant="outline"
          size="sm"
          onPress={search.requestLocation}
          loading={search.isLoadingLocation}
          style={styles.locationButton}
          leftIcon="location"
        >
          Enable Location
        </ThemedButton>
      )}
    </MotiView>
  );

  // Loading state
  if (search.isLoading && displayResults.length === 0) {
    return <LoadingScreen message="Searching businesses..." />;
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerContent}>
          <ThemedText variant="title-large" style={styles.headerTitle}>
            Search
          </ThemedText>
          
          {/* Header Actions */}
          <View style={styles.headerActions}>
            {search.userLocation && (
              <TouchableOpacity
                style={[
                  styles.headerButton,
                  { backgroundColor: showMap ? colors.primary : colors.muted }
                ]}
                onPress={() => setShowMap(!showMap)}
              >
                <Ionicons
                  name={showMap ? "list" : "map"}
                  size={20}
                  color={showMap ? colors.primaryForeground : colors.mutedForeground}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          placeholder="Search businesses, food, services..."
          onSearch={handleSearch}
          onResultSelect={(result) => handleBusinessPress(result)}
          enableFilters={true}
          enableLocation={true}
          autoSearch={true}
          style={styles.searchBar}
        />
      </View>

      {/* Quick Categories */}
      {!search.query.trim() && (
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          style={styles.categoriesContainer}
        >
          <ThemedText variant="title-small" style={styles.categoriesTitle}>
            Popular Categories
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScrollContainer}
          >
            {popularCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: /* removed */ === category.id 
                      ? category.color 
                      : colors.muted,
                    borderColor: /* removed */ === category.id 
                      ? category.color 
                      : 'transparent',
                  }
                ]}
                onPress={() => handleCategoryFilter(category.id)}
              >
                <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                <ThemedText
                  variant="body-small"
                  style={[
                    styles.categoryName,
                    {
                      color: /* removed */ === category.id
                        ? colors.primaryForeground
                        : colors.foreground
                    }
                  ]}
                >
                  {category.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </MotiView>
      )}

      {/* Results Header */}
      {displayResults.length > 0 && (
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.resultsHeader}
        >
          <ThemedText variant="body-medium" style={styles.resultsCount}>
            {displayResults.length} {displayResults.length === 1 ? 'business' : 'businesses'} found
            {search.userLocation && ' nearby'}
          </ThemedText>
          
          {/* Sort Options */}
          <TouchableOpacity style={styles.sortButton}>
            <ThemedText variant="body-small" style={styles.sortText}>Sort</ThemedText>
            <Ionicons name="chevron-down" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Results List */}
      <View style={styles.resultsContainer}>
        <OptimizedBusinessList
          data={displayResults}
          onBusinessPress={handleBusinessPress}
          onRefresh={handleRefresh}
          /* removed */={/* removed */}
          loading={search.isLoading}
          showDistance={!!search.userLocation}
          showReviews={true}
          showOpenStatus={true}
          enableVirtualization={displayResults.length > 20}
          preloadImages={!memoryOpt?.shouldReduceQuality}
          estimatedItemSize={memoryOpt?.shouldReduceQuality ? 150 : 200}
          onViewableItemsChanged={(items) => {
            performanceMonitor.trackCustomMetric('visible_businesses', items.length);
          }}
          emptyComponent={renderEmptyState()}
        />
      </View>

      {/* Search Loading Overlay */}
      <AnimatePresence>
        {search.isLoading && displayResults.length > 0 && (
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.searchOverlay}
          >
            <View style={[styles.searchOverlayContent, { backgroundColor: colors.card }]}>
              <LoadingScreen message="Updating results..." fullScreen={false} />
            </View>
          </MotiView>
        )}
      </AnimatePresence>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  selectedCategoryChip: {
    backgroundColor: '#6366F1',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 8,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6366F1',
  },
  businessList: {
    flex: 1,
  },
  businessListContent: {
    paddingHorizontal: 20,
  },
  businessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  businessCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  businessRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  businessDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 240,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 240,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerContent: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingVertical: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoriesScrollContainer: {
    paddingHorizontal: 16,
  },
  categoryIcon: {
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchOverlayContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
  },
});
