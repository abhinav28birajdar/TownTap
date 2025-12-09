import { Ionicons } from '@expo/vector-icons';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import {
    Keyboard,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

// Import our components
import { Badge } from './Badge';
import { Button } from './button';
import { Card } from './Card';
import { Input } from './input';
import { Text } from './Text';

// Import hooks and services
import { useSearch } from '@/hooks/use-search';
import { SearchFilter, SearchSuggestion } from '@/lib/search-service';

// Import theme and constants
import { Colors, Spacing } from '@/constants/theme';
import { getThemeColors, useTheme } from '@/hooks/use-theme';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string, results: any[]) => void;
  onResultSelect?: (result: any) => void;
  enableFilters?: boolean;
  enableLocation?: boolean;
  autoSearch?: boolean;
  style?: any;
}

export function SearchBar({
  placeholder = "Search businesses, categories, locations...",
  onSearch,
  onResultSelect,
  enableFilters = true,
  enableLocation = true,
  autoSearch = false,
  style,
}: SearchBarProps) {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const {
    query,
    results,
    suggestions,
    isLoading,
    isLoadingSuggestions,
    error,
    userLocation,
    isLoadingLocation,
    filters,
    setQuery,
    search,
    updateFilters,
    clearFilters,
    requestLocation,
    selectSuggestion,
    formatDistance,
  } = useSearch({
    enableLocation,
    enableSuggestions: true,
    enableHistory: true,
    autoSearch,
    debounceMs: 300,
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef<any>(null);

  // Handle search submission
  const handleSearch = async () => {
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    await search();
    
    if (onSearch) {
      onSearch(query, results);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    selectSuggestion(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
    
    if (onSearch) {
      onSearch(suggestion.text, []);
    }
  };

  // Handle filter changes
  const handleFilterUpdate = (newFilters: Partial<SearchFilter>) => {
    updateFilters(newFilters);
    if (autoSearch && query.trim()) {
      search();
    }
  };

  // Focus handlers
  const handleFocus = () => {
    setIsSearchFocused(true);
    if (suggestions.length > 0 || query.trim()) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsSearchFocused(false);
    // Delay hiding suggestions to allow for suggestion taps
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  // Filter categories
  const categories = [
    { id: 'restaurant', label: 'Restaurants', icon: '🍽️' },
    { id: 'coffee', label: 'Coffee', icon: '☕' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' },
    { id: 'beauty', label: 'Beauty', icon: '💄' },
    { id: 'fitness', label: 'Fitness', icon: '💪' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'health', label: 'Health', icon: '🏥' },
    { id: 'services', label: 'Services', icon: '🔧' },
  ];

  // Get active filter count
  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilter];
    return value !== undefined && value !== null && value !== '';
  }).length;

  useEffect(() => {
    // Show suggestions when there are suggestions and input is focused
    if ((suggestions.length > 0 || query.trim()) && isSearchFocused) {
      setShowSuggestions(true);
    }
  }, [suggestions, query, isSearchFocused]);

  return (
    <View style={[styles.container, style]}>
      {/* Main Search Bar */}
      <Card variant="elevated" style={styles.searchCard}>
        <View style={styles.searchRow}>
          {/* Search Input */}
          <View style={styles.searchInputContainer}>
            <Input
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              placeholder={placeholder}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              leftIcon="search"
              rightIcon={query ? "close" : undefined}
              onRightIconPress={query ? () => setQuery('') : undefined}
              style={styles.searchInput}
              loading={isLoading}
            />
          </View>

          {/* Location Button */}
          {enableLocation && (
            <TouchableOpacity
              style={[
                styles.locationButton,
                { backgroundColor: userLocation ? colors.primary : colors.muted }
              ]}
              onPress={requestLocation}
              disabled={isLoadingLocation}
            >
              <Ionicons
                name={userLocation ? "location" : "location-outline"}
                size={20}
                color={userLocation ? colors.primaryForeground : colors.mutedForeground}
              />
            </TouchableOpacity>
          )}

          {/* Filters Button */}
          {enableFilters && (
            <TouchableOpacity
              style={[
                styles.filtersButton,
                { backgroundColor: activeFilterCount > 0 ? colors.primary : colors.muted }
              ]}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Ionicons
                name="options"
                size={20}
                color={activeFilterCount > 0 ? colors.primaryForeground : colors.mutedForeground}
              />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  size="sm"
                  style={styles.filterBadge}
                >
                  {activeFilterCount}
                </Badge>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={styles.errorContainer}
          >
            <Text variant="body-small" style={styles.errorText}>
              {error}
            </Text>
          </MotiView>
        )}
      </Card>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -10 }}
            transition={{ type: 'timing', duration: 200 }}
            style={styles.suggestionsContainer}
          >
            <Card variant="elevated" style={styles.suggestionsCard}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.suggestionsList}
              >
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={suggestion.id}
                    style={[
                      styles.suggestionItem,
                      index === suggestions.length - 1 && styles.lastSuggestionItem
                    ]}
                    onPress={() => handleSuggestionSelect(suggestion)}
                  >
                    <View style={styles.suggestionIcon}>
                      <Ionicons
                        name={getSuggestionIcon(suggestion.type)}
                        size={18}
                        color={colors.mutedForeground}
                      />
                    </View>
                    <View style={styles.suggestionContent}>
                      <Text variant="body-medium" numberOfLines={1}>
                        {suggestion.text}
                      </Text>
                      <Text variant="body-small" style={styles.suggestionType}>
                        {getSuggestionTypeLabel(suggestion.type)}
                      </Text>
                    </View>
                    <Ionicons
                      name="arrow-up-outline"
                      size={16}
                      color={colors.mutedForeground}
                      style={{ transform: [{ rotate: '45deg' }] }}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          </MotiView>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={styles.filtersContainer}
          >
            <Card variant="elevated" style={styles.filtersCard}>
              {/* Filter Header */}
              <View style={styles.filtersHeader}>
                <Text variant="title-medium">Filters</Text>
                <View style={styles.filtersActions}>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={clearFilters}
                    >
                      Clear All
                    </Button>
                  )}
                  <TouchableOpacity onPress={() => setShowFilters(false)}>
                    <Ionicons name="close" size={24} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text variant="body-medium" style={styles.filterLabel}>
                  Categories
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScrollView}
                >
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: filters.category === category.id
                            ? colors.primary
                            : colors.muted
                        }
                      ]}
                      onPress={() => handleFilterUpdate({
                        category: filters.category === category.id ? undefined : category.id
                      })}
                    >
                      <Text style={styles.categoryEmoji}>{category.icon}</Text>
                      <Text
                        variant="body-small"
                        style={[
                          styles.categoryLabel,
                          {
                            color: filters.category === category.id
                              ? colors.primaryForeground
                              : colors.mutedForeground
                          }
                        ]}
                      >
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Rating Filter */}
              <View style={styles.filterSection}>
                <Text variant="body-medium" style={styles.filterLabel}>
                  Minimum Rating
                </Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingButton,
                        {
                          backgroundColor: filters.minRating === rating
                            ? colors.primary
                            : colors.muted
                        }
                      ]}
                      onPress={() => handleFilterUpdate({
                        minRating: filters.minRating === rating ? undefined : rating
                      })}
                    >
                      <Text
                        variant="body-medium"
                        style={{
                          color: filters.minRating === rating
                            ? colors.primaryForeground
                            : colors.mutedForeground
                        }}
                      >
                        {rating}⭐+
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Distance Filter */}
              {userLocation && (
                <View style={styles.filterSection}>
                  <Text variant="body-medium" style={styles.filterLabel}>
                    Maximum Distance
                  </Text>
                  <View style={styles.distanceContainer}>
                    {[1000, 2000, 5000, 10000].map((distance) => (
                      <TouchableOpacity
                        key={distance}
                        style={[
                          styles.distanceButton,
                          {
                            backgroundColor: filters.maxDistance === distance
                              ? colors.primary
                              : colors.muted
                          }
                        ]}
                        onPress={() => handleFilterUpdate({
                          maxDistance: filters.maxDistance === distance ? undefined : distance
                        })}
                      >
                        <Text
                          variant="body-small"
                          style={{
                            color: filters.maxDistance === distance
                              ? colors.primaryForeground
                              : colors.mutedForeground
                          }}
                        >
                          {formatDistance(distance)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Quick Filters */}
              <View style={styles.filterSection}>
                <Text variant="body-medium" style={styles.filterLabel}>
                  Quick Filters
                </Text>
                <View style={styles.quickFiltersContainer}>
                  <TouchableOpacity
                    style={[
                      styles.quickFilterChip,
                      {
                        backgroundColor: filters.openNow
                          ? colors.primary
                          : colors.muted
                      }
                    ]}
                    onPress={() => handleFilterUpdate({
                      openNow: !filters.openNow
                    })}
                  >
                    <Text
                      variant="body-small"
                      style={{
                        color: filters.openNow
                          ? colors.primaryForeground
                          : colors.mutedForeground
                      }}
                    >
                      Open Now
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.quickFilterChip,
                      {
                        backgroundColor: filters.hasDelivery
                          ? colors.primary
                          : colors.muted
                      }
                    ]}
                    onPress={() => handleFilterUpdate({
                      hasDelivery: !filters.hasDelivery
                    })}
                  >
                    <Text
                      variant="body-small"
                      style={{
                        color: filters.hasDelivery
                          ? colors.primaryForeground
                          : colors.mutedForeground
                      }}
                    >
                      Delivery
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

// Helper functions
function getSuggestionIcon(type: string): string {
  switch (type) {
    case 'business':
      return 'business';
    case 'category':
      return 'list';
    case 'location':
      return 'location';
    case 'recent':
      return 'time';
    default:
      return 'search';
  }
}

function getSuggestionTypeLabel(type: string): string {
  switch (type) {
    case 'business':
      return 'Business';
    case 'category':
      return 'Category';
    case 'location':
      return 'Location';
    case 'recent':
      return 'Recent';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchCard: {
    marginBottom: 0,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  searchInputContainer: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  locationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filtersButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
  },
  errorContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  errorText: {
    color: Colors.red[500],
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
    marginTop: Spacing.xs,
  },
  suggestionsCard: {
    maxHeight: 300,
  },
  suggestionsList: {
    padding: Spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionIcon: {
    marginRight: Spacing.md,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionType: {
    color: Colors.gray[500],
    marginTop: 2,
  },
  filtersContainer: {
    marginTop: Spacing.sm,
  },
  filtersCard: {
    padding: Spacing.md,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filtersActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  categoryScrollView: {
    marginVertical: Spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginRight: Spacing.sm,
    minWidth: 80,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  categoryLabel: {
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  ratingButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  distanceButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  quickFiltersContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  quickFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
});

export default SearchBar;