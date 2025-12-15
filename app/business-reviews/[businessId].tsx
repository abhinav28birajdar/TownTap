/**
 * Business Reviews List Page - Phase 5
 * Display all reviews for a business with filtering
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  customer: {
    full_name: string;
  };
  quality_rating: number;
  professionalism_rating: number;
  punctuality_rating: number;
  value_rating: number;
  helpful_count: number;
}

interface RatingBreakdown {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

export default function BusinessReviewsPage() {
  const { businessId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingBreakdown, setRatingBreakdown] = useState<RatingBreakdown | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadRatingBreakdown();
  }, [filter, sortBy]);

  const loadReviews = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          customer:users(full_name)
        `)
        .eq('business_id', businessId);

      if (filter === 'positive') {
        query = query.gte('rating', 4);
      } else if (filter === 'negative') {
        query = query.lte('rating', 2);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('helpful_count', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      if (data) setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatingBreakdown = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId);

      if (error) throw error;
      
      if (data) {
        const total = data.length;
        const sum = (data as any[]).reduce((acc, r) => acc + (r as any).rating, 0);
        const average = total > 0 ? sum / total : 0;

        const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach((r) => {
          distribution[Math.round((r as any).rating)] = (distribution[Math.round((r as any).rating)] || 0) + 1;
        });

        setRatingBreakdown({ average, total, distribution });
      }
    } catch (error) {
      console.error('Error loading rating breakdown:', error);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const { error } = await (supabase as any).rpc('increment_review_helpful', {
        review_id_param: reviewId,
      });

      if (error) throw error;
      loadReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderReviewCard = ({ item }: { item: Review }) => (
    <Card style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{item.customer.full_name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={[styles.reviewerName, { color: colors.text }]}>
              {item.customer.full_name}
            </Text>
            <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
        </View>
      </View>

      {item.review_text && (
        <Text style={[styles.reviewText, { color: colors.text }]}>
          {item.review_text}
        </Text>
      )}

      <View style={styles.categoryRatings}>
        <View style={styles.categoryRating}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Quality
          </Text>
          <Text style={styles.categoryValue}>⭐ {item.quality_rating}</Text>
        </View>
        <View style={styles.categoryRating}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Professional
          </Text>
          <Text style={styles.categoryValue}>⭐ {item.professionalism_rating}</Text>
        </View>
        <View style={styles.categoryRating}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Punctual
          </Text>
          <Text style={styles.categoryValue}>⭐ {item.punctuality_rating}</Text>
        </View>
        <View style={styles.categoryRating}>
          <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
            Value
          </Text>
          <Text style={styles.categoryValue}>⭐ {item.value_rating}</Text>
        </View>
      </View>

      <View style={styles.reviewFooter}>
        <TouchableOpacity
          style={styles.helpfulButton}
          onPress={() => handleMarkHelpful(item.id)}
        >
          <Text style={styles.helpfulIcon}>👍</Text>
          <Text style={[styles.helpfulText, { color: colors.textSecondary }]}>
            Helpful ({item.helpful_count})
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reviews</Text>
      </View>

      <FlatList
        data={reviews}
        renderItem={renderReviewCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Rating Summary */}
            {ratingBreakdown && (
              <Card style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.averageRating}>
                    <Text style={[styles.averageValue, { color: colors.text }]}>
                      {ratingBreakdown.average.toFixed(1)}
                    </Text>
                    <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
                    <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
                      Based on {ratingBreakdown.total} reviews
                    </Text>
                  </View>

                  <View style={styles.breakdown}>
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingBreakdown.distribution[star] || 0;
                      const percentage = ratingBreakdown.total > 0
                        ? (count / ratingBreakdown.total) * 100
                        : 0;

                      return (
                        <View key={star} style={styles.breakdownRow}>
                          <Text style={[styles.starLabel, { color: colors.text }]}>
                            {star}★
                          </Text>
                          <View style={styles.barContainer}>
                            <View
                              style={[
                                styles.barFill,
                                {
                                  width: `${percentage}%`,
                                  backgroundColor: colors.primary,
                                },
                              ]}
                            />
                          </View>
                          <Text style={[styles.countLabel, { color: colors.textSecondary }]}>
                            {count}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </Card>
            )}

            {/* Filters */}
            <View style={styles.filtersSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.filtersRow}>
                  {[
                    { key: 'all', label: 'All Reviews' },
                    { key: 'positive', label: 'Positive' },
                    { key: 'negative', label: 'Negative' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[
                        styles.filterChip,
                        filter === f.key && [
                          styles.filterChipActive,
                          { backgroundColor: colors.primary },
                        ],
                      ]}
                      onPress={() => setFilter(f.key as any)}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          filter === f.key && styles.filterTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <View style={styles.divider} />

                  <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setSortBy(sortBy === 'recent' ? 'helpful' : 'recent')}
                  >
                    <Text style={[styles.sortText, { color: colors.text }]}>
                      {sortBy === 'recent' ? '📅 Recent' : '👍 Helpful'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No reviews yet
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
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
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  listContent: {
    padding: spacing.md,
  },
  summaryCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  summaryTop: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  averageRating: {
    alignItems: 'center',
    minWidth: 100,
  },
  averageValue: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stars: {
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  totalReviews: {
    fontSize: 12,
  },
  breakdown: {
    flex: 1,
    gap: spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  starLabel: {
    fontSize: 12,
    width: 24,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  countLabel: {
    fontSize: 12,
    width: 32,
    textAlign: 'right',
  },
  filtersSection: {
    marginBottom: spacing.md,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: BorderRadius.md * 2,
    backgroundColor: '#F5F5F5',
  },
  filterChipActive: {},
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
  },
  ratingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFF3E0',
    borderRadius: BorderRadius.md,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
  },
  reviewText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  categoryRatings: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  categoryRating: {
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 10,
    marginBottom: spacing.xs,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  reviewFooter: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  helpfulIcon: {
    fontSize: 16,
  },
  helpfulText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
  },
});
