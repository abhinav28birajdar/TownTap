/**
 * Explore/Browse Page - Phase 2
 * Tab navigation with mixed content feed
 */

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { BusinessCardSkeleton } from '@/components/ui/loading-skeleton';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'all' | 'new' | 'popular' | 'nearby';

interface Business {
  id: string;
  business_name: string;
  logo_url: string | null;
  average_rating: number;
  total_reviews: number;
  category: { name: string; color_code: string };
  is_online: boolean;
}

export default function ExplorePage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBusinesses();
  }, [activeTab]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('businesses')
        .select(`
          id,
          business_name,
          logo_url,
          average_rating,
          total_reviews,
          is_online,
          created_at,
          category:categories(name, color_code)
        `)
        .eq('status', 'active');

      // Apply filters based on tab
      switch (activeTab) {
        case 'new':
          query = query.order('created_at', { ascending: false }).limit(20);
          break;
        case 'popular':
          query = query.order('total_orders', { ascending: false }).limit(20);
          break;
        case 'nearby':
          // TODO: Add location-based filtering
          query = query.limit(20);
          break;
        default:
          query = query.limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setBusinesses(data as any);
    } catch (error) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadBusinesses();
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'popular', label: 'Popular' },
    { key: 'nearby', label: 'Nearby' },
  ] as const;

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <Card
      style={styles.businessCard}
      pressable
      onPress={() => router.push(`/business/${item.id}`)}
    >
      <View style={styles.cardContent}>
        {/* Business Image/Logo */}
        <View
          style={[
            styles.businessImage,
            { backgroundColor: item.category?.color_code || colors.primary },
          ]}
        >
          {item.logo_url ? (
            <Image source={{ uri: item.logo_url }} style={styles.logoImage} />
          ) : (
            <Text style={styles.logoText}>{item.business_name.charAt(0)}</Text>
          )}
        </View>

        {/* Business Info */}
        <View style={styles.businessInfo}>
          <View style={styles.headerRow}>
            <Text style={[styles.businessName, { color: colors.text }]} numberOfLines={1}>
              {item.business_name}
            </Text>
            {item.is_online && <Badge text="Open" variant="success" size="sm" />}
          </View>

          <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
            {item.category?.name}
          </Text>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>⭐ {item.average_rating.toFixed(1)}</Text>
            <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
              ({item.total_reviews} reviews)
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Explore Services</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && [
                  styles.activeTab,
                  { backgroundColor: colors.primary },
                ],
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.key ? '#FFFFFF' : colors.text },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <ScrollView style={styles.content}>
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
          <BusinessCardSkeleton />
        </ScrollView>
      ) : (
        <FlatList
          data={businesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  tabsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: spacing.sm,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  businessCard: {
    marginBottom: spacing.md,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  businessImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.md,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  businessInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  reviewCount: {
    fontSize: 12,
  },
});
