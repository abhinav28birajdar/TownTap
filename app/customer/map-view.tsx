/**
 * Map View Page - Phase 2
 * Show businesses on map with markers and filters
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { spacing , BorderRadius} from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Business {
  id: string;
  business_name: string;
  category: string;
  rating: number;
  latitude: number;
  longitude: number;
  distance?: number;
}

export default function MapViewPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState({ latitude: 28.6139, longitude: 77.2090 });

  const categories = [
    'All',
    'Salons',
    'Spa',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Repairs',
  ];

  useEffect(() => {
    loadBusinesses();
  }, [selectedCategory]);

  const loadBusinesses = async () => {
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory && selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      if (data) {
        // Calculate distances
        const withDistance = data.map((business) => ({
          ...business,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            business.latitude,
            business.longitude
          ),
        }));
        setBusinesses(withDistance);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleBusinessPress = (business: Business) => {
    setSelectedBusiness(business);
  };

  const handleViewDetails = () => {
    if (selectedBusiness) {
      router.push(`/business/${selectedBusiness.id}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                backgroundColor: colors.surface,
              },
            ]}
            placeholder="Search businesses..."
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category === 'All' ? null : category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colors.muted }]}>
        <Text style={[styles.mapPlaceholder, { color: colors.textSecondary }]}>
          🗺️ Map View
        </Text>
        <Text style={[styles.mapHint, { color: colors.textSecondary }]}>
          Google Maps integration required
        </Text>
        
        {/* Markers Simulation */}
        {businesses.slice(0, 10).map((business, index) => (
          <TouchableOpacity
            key={business.id}
            style={[
              styles.marker,
              {
                top: `${20 + (index * 7)}%`,
                left: `${15 + (index * 8)}%`,
                backgroundColor: selectedBusiness?.id === business.id ? colors.primary : Colors.secondary,
              },
            ]}
            onPress={() => handleBusinessPress(business)}
          >
            <Text style={styles.markerText}>📍</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Business Card */}
      {selectedBusiness && (
        <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
          <View style={styles.handle} />
          <Card style={styles.businessCard}>
            <View style={styles.businessHeader}>
              <View style={styles.businessAvatar}>
                <Text style={styles.avatarText}>
                  {selectedBusiness.business_name.charAt(0)}
                </Text>
              </View>
              <View style={styles.businessInfo}>
                <Text style={[styles.businessName, { color: colors.text }]}>
                  {selectedBusiness.business_name}
                </Text>
                <Text style={[styles.businessCategory, { color: colors.textSecondary }]}>
                  {selectedBusiness.category}
                </Text>
                <View style={styles.businessMeta}>
                  <View style={styles.rating}>
                    <Text style={styles.ratingText}>⭐ {selectedBusiness.rating}</Text>
                  </View>
                  {selectedBusiness.distance && (
                    <Text style={[styles.distance, { color: colors.textSecondary }]}>
                      📍 {selectedBusiness.distance.toFixed(1)} km
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={[styles.directionButton, { borderColor: colors.primary }]}
              >
                <Text style={[styles.directionButtonText, { color: colors.primary }]}>
                  🧭 Directions
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewButton, { backgroundColor: colors.primary }]}
                onPress={handleViewDetails}
              >
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}

      {/* My Location Button */}
      <TouchableOpacity style={styles.myLocationButton}>
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>
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
  },
  searchInput: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: BorderRadius.lg,
    fontSize: 14,
  },
  filterButton: {
    padding: spacing.xs,
  },
  filterIcon: {
    fontSize: 24,
  },
  categoriesContainer: {
    paddingBottom: spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapPlaceholder: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  mapHint: {
    fontSize: 14,
  },
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    fontSize: 24,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  businessCard: {
    padding: spacing.md,
  },
  businessHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  businessAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  businessCategory: {
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  businessMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  distance: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  directionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
  },
  directionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  myLocationButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: 180,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  myLocationIcon: {
    fontSize: 24,
  },
});
