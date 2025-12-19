import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

export default function SearchFiltersScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();

  // Category Filters
  const [categories, setCategories] = useState<FilterOption[]>([
    { id: '1', label: 'Home Services', selected: true },
    { id: '2', label: 'Beauty & Spa', selected: false },
    { id: '3', label: 'Cleaning', selected: false },
    { id: '4', label: 'Repairs', selected: true },
    { id: '5', label: 'Pest Control', selected: false },
    { id: '6', label: 'Appliances', selected: false },
    { id: '7', label: 'Painting', selected: false },
    { id: '8', label: 'Shifting', selected: false },
  ]);

  // Sort Options
  const [sortBy, setSortBy] = useState<string>('relevance');
  const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'rating', label: 'Rating (High to Low)' },
    { id: 'price-low', label: 'Price (Low to High)' },
    { id: 'price-high', label: 'Price (High to Low)' },
    { id: 'distance', label: 'Distance (Nearest)' },
    { id: 'popular', label: 'Popularity' },
  ];

  // Price Range
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const priceRanges = [
    { id: '1', label: 'Under ₹500', min: 0, max: 500 },
    { id: '2', label: '₹500 - ₹1000', min: 500, max: 1000 },
    { id: '3', label: '₹1000 - ₹2000', min: 1000, max: 2000 },
    { id: '4', label: '₹2000 - ₹5000', min: 2000, max: 5000 },
    { id: '5', label: 'Above ₹5000', min: 5000, max: 999999 },
  ];
  const [selectedPriceRange, setSelectedPriceRange] = useState<string | null>(null);

  // Rating Filter
  const [minRating, setMinRating] = useState<number>(0);

  // Distance Filter
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const distanceOptions = [2, 5, 10, 15, 25];

  // Availability
  const [availableNow, setAvailableNow] = useState(false);
  const [openWeekends, setOpenWeekends] = useState(false);
  const [open24Hours, setOpen24Hours] = useState(false);

  // Additional Filters
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [hasOffers, setHasOffers] = useState(false);
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [instantBooking, setInstantBooking] = useState(false);

  // Payment Options
  const [paymentOptions, setPaymentOptions] = useState<FilterOption[]>([
    { id: 'cash', label: 'Cash', selected: true },
    { id: 'upi', label: 'UPI', selected: true },
    { id: 'cards', label: 'Cards', selected: false },
    { id: 'wallet', label: 'Wallet', selected: false },
  ]);

  const toggleCategory = (id: string) => {
    setCategories(cats =>
      cats.map(cat =>
        cat.id === id ? { ...cat, selected: !cat.selected } : cat
      )
    );
  };

  const togglePaymentOption = (id: string) => {
    setPaymentOptions(opts =>
      opts.map(opt =>
        opt.id === id ? { ...opt, selected: !opt.selected } : opt
      )
    );
  };

  const clearAllFilters = () => {
    setCategories(cats => cats.map(c => ({ ...c, selected: false })));
    setSortBy('relevance');
    setMinPrice('');
    setMaxPrice('');
    setSelectedPriceRange(null);
    setMinRating(0);
    setMaxDistance(10);
    setAvailableNow(false);
    setOpenWeekends(false);
    setOpen24Hours(false);
    setVerifiedOnly(false);
    setHasOffers(false);
    setFreeCancellation(false);
    setInstantBooking(false);
    setPaymentOptions(opts => opts.map(o => ({ ...o, selected: false })));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    count += categories.filter(c => c.selected).length;
    if (sortBy !== 'relevance') count++;
    if (minPrice || maxPrice || selectedPriceRange) count++;
    if (minRating > 0) count++;
    if (maxDistance !== 10) count++;
    if (availableNow) count++;
    if (openWeekends) count++;
    if (open24Hours) count++;
    if (verifiedOnly) count++;
    if (hasOffers) count++;
    if (freeCancellation) count++;
    if (instantBooking) count++;
    count += paymentOptions.filter(p => p.selected).length;
    return count;
  };

  const applyFilters = () => {
    // In real app, pass filters back to search results
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Filters</ThemedText>
        <TouchableOpacity onPress={clearAllFilters}>
          <ThemedText style={[styles.clearText, { color: colors.primary }]}>Clear All</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sort By */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sort By</ThemedText>
          <View style={styles.sortOptions}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  { 
                    backgroundColor: sortBy === option.id ? colors.primary : colors.card,
                    borderColor: sortBy === option.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setSortBy(option.id)}
              >
                <ThemedText style={[
                  styles.sortOptionText,
                  { color: sortBy === option.id ? '#FFF' : colors.text }
                ]}>
                  {option.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
          <View style={styles.chipContainer}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: category.selected ? colors.primary : colors.card,
                    borderColor: category.selected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <ThemedText style={[
                  styles.chipText,
                  { color: category.selected ? '#FFF' : colors.text }
                ]}>
                  {category.label}
                </ThemedText>
                {category.selected && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Price Range</ThemedText>
          
          {/* Quick Select */}
          <View style={styles.chipContainer}>
            {priceRanges.map((range) => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: selectedPriceRange === range.id ? colors.primary : colors.card,
                    borderColor: selectedPriceRange === range.id ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => {
                  setSelectedPriceRange(range.id === selectedPriceRange ? null : range.id);
                  if (range.id !== selectedPriceRange) {
                    setMinPrice(range.min.toString());
                    setMaxPrice(range.max === 999999 ? '' : range.max.toString());
                  } else {
                    setMinPrice('');
                    setMaxPrice('');
                  }
                }}
              >
                <ThemedText style={[
                  styles.chipText,
                  { color: selectedPriceRange === range.id ? '#FFF' : colors.text }
                ]}>
                  {range.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Range */}
          <View style={styles.priceInputs}>
            <View style={[styles.priceInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.priceInputPrefix, { color: colors.textSecondary }]}>₹</ThemedText>
              <TextInput
                style={[styles.priceInputField, { color: colors.text }]}
                placeholder="Min"
                placeholderTextColor={colors.textSecondary}
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
            </View>
            <ThemedText style={[styles.priceSeparator, { color: colors.textSecondary }]}>to</ThemedText>
            <View style={[styles.priceInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.priceInputPrefix, { color: colors.textSecondary }]}>₹</ThemedText>
              <TextInput
                style={[styles.priceInputField, { color: colors.text }]}
                placeholder="Max"
                placeholderTextColor={colors.textSecondary}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Rating Filter */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Minimum Rating</ThemedText>
          <View style={styles.ratingOptions}>
            {[0, 3, 3.5, 4, 4.5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingOption,
                  { 
                    backgroundColor: minRating === rating ? colors.primary : colors.card,
                    borderColor: minRating === rating ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setMinRating(rating)}
              >
                {rating > 0 ? (
                  <View style={styles.ratingContent}>
                    <ThemedText style={[
                      styles.ratingText,
                      { color: minRating === rating ? '#FFF' : colors.text }
                    ]}>
                      {rating}+
                    </ThemedText>
                    <Ionicons 
                      name="star" 
                      size={14} 
                      color={minRating === rating ? '#FFF' : '#FFB800'} 
                    />
                  </View>
                ) : (
                  <ThemedText style={[
                    styles.ratingText,
                    { color: minRating === rating ? '#FFF' : colors.text }
                  ]}>
                    Any
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Maximum Distance</ThemedText>
            <ThemedText style={[styles.distanceValue, { color: colors.primary }]}>
              {maxDistance} km
            </ThemedText>
          </View>
          <View style={styles.distanceOptions}>
            {distanceOptions.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceOption,
                  { 
                    backgroundColor: maxDistance === distance ? colors.primary : colors.card,
                    borderColor: maxDistance === distance ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => setMaxDistance(distance)}
              >
                <ThemedText style={[
                  styles.distanceText,
                  { color: maxDistance === distance ? '#FFF' : colors.text }
                ]}>
                  {distance} km
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Availability */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Availability</ThemedText>
          
          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchLabel}>
              <Ionicons name="flash-outline" size={20} color={colors.primary} />
              <ThemedText style={styles.switchText}>Available Now</ThemedText>
            </View>
            <Switch
              value={availableNow}
              onValueChange={setAvailableNow}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={availableNow ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchLabel}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <ThemedText style={styles.switchText}>Open on Weekends</ThemedText>
            </View>
            <Switch
              value={openWeekends}
              onValueChange={setOpenWeekends}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={openWeekends ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <ThemedText style={styles.switchText}>Open 24 Hours</ThemedText>
            </View>
            <Switch
              value={open24Hours}
              onValueChange={setOpen24Hours}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={open24Hours ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Additional Filters */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Filters</ThemedText>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchLabel}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
              <ThemedText style={styles.switchText}>Verified Providers Only</ThemedText>
            </View>
            <Switch
              value={verifiedOnly}
              onValueChange={setVerifiedOnly}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={verifiedOnly ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchLabel}>
              <Ionicons name="pricetag-outline" size={20} color={colors.warning} />
              <ThemedText style={styles.switchText}>Has Offers/Discounts</ThemedText>
            </View>
            <Switch
              value={hasOffers}
              onValueChange={setHasOffers}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={hasOffers ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={[styles.switchRow, { borderBottomColor: colors.border }]}>
            <View style={styles.switchLabel}>
              <Ionicons name="close-circle-outline" size={20} color={colors.error} />
              <ThemedText style={styles.switchText}>Free Cancellation</ThemedText>
            </View>
            <Switch
              value={freeCancellation}
              onValueChange={setFreeCancellation}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={freeCancellation ? colors.primary : colors.textSecondary}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabel}>
              <Ionicons name="flash" size={20} color={colors.info} />
              <ThemedText style={styles.switchText}>Instant Booking</ThemedText>
            </View>
            <Switch
              value={instantBooking}
              onValueChange={setInstantBooking}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={instantBooking ? colors.primary : colors.textSecondary}
            />
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Payment Options</ThemedText>
          <View style={styles.chipContainer}>
            {paymentOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.chip,
                  { 
                    backgroundColor: option.selected ? colors.primary : colors.card,
                    borderColor: option.selected ? colors.primary : colors.border,
                  }
                ]}
                onPress={() => togglePaymentOption(option.id)}
              >
                <ThemedText style={[
                  styles.chipText,
                  { color: option.selected ? '#FFF' : colors.text }
                ]}>
                  {option.label}
                </ThemedText>
                {option.selected && (
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <View style={styles.footerContent}>
          <ThemedText style={[styles.filterCount, { color: colors.textSecondary }]}>
            {getActiveFiltersCount()} filters applied
          </ThemedText>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={applyFilters}
          >
            <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  clearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  sortOptionText: {
    fontSize: 13,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 12,
  },
  priceInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  priceInputPrefix: {
    fontSize: 14,
    marginRight: 4,
  },
  priceInputField: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  priceSeparator: {
    fontSize: 14,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  ratingOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  ratingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  distanceOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  distanceOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  distanceText: {
    fontSize: 13,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchText: {
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterCount: {
    fontSize: 13,
  },
  applyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
