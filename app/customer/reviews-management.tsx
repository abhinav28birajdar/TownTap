/**
 * Reviews Management - Phase 5
 * Manage customer's own reviews
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Review {
  id: string;
  booking_id: string;
  business_name: string;
  service_name: string;
  overall_rating: number;
  quality_rating: number;
  professionalism_rating: number;
  punctuality_rating: number;
  value_rating: number;
  comment: string;
  tips_amount?: number;
  created_at: string;
  helpful_count: number;
}

export default function ReviewsManagementPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'recent' | 'helpful'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [filter]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('reviews')
        .select(`
          id,
          booking_id,
          overall_rating,
          quality_rating,
          professionalism_rating,
          punctuality_rating,
          value_rating,
          comment,
          tips_amount,
          created_at,
          helpful_count,
          bookings (
            id,
            businesses (
              business_name
            ),
            booking_services (
              services (
                name
              )
            )
          )
        `)
        .eq('customer_id', user?.id || '');

      if (filter === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (filter === 'helpful') {
        query = query.order('helpful_count', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setReviews(
          data.map((r: any) => ({
            id: r.id,
            booking_id: r.booking_id,
            business_name: r.bookings?.businesses?.business_name || 'Unknown',
            service_name:
              r.bookings?.booking_services?.[0]?.services?.name || 'Unknown',
            overall_rating: r.overall_rating,
            quality_rating: r.quality_rating,
            professionalism_rating: r.professionalism_rating,
            punctuality_rating: r.punctuality_rating,
            value_rating: r.value_rating,
            comment: r.comment,
            tips_amount: r.tips_amount,
            created_at: r.created_at,
            helpful_count: r.helpful_count,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (reviewId: string, bookingId: string) => {
    router.push(`/customer/review/${bookingId}?edit=true&reviewId=${reviewId}` as any);
  };

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('reviews')
                .delete()
                .eq('id', reviewId);

              if (error) throw error;

              loadReviews();
              alert('Review deleted successfully');
            } catch (error) {
              console.error('Error deleting review:', error);
              alert('Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return '⭐'.repeat(Math.round(rating));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Reviews</Text>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'all' && styles.filterTabActive,
              filter === 'all' && { backgroundColor: colors.primary },
            ] as any}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.filterTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'recent' && styles.filterTabActive,
              filter === 'recent' && { backgroundColor: colors.primary },
            ] as any}
            onPress={() => setFilter('recent')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'recent' && styles.filterTextActive,
              ]}
            >
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'helpful' && styles.filterTabActive,
              filter === 'helpful' && { backgroundColor: colors.primary },
            ] as any}
            onPress={() => setFilter('helpful')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'helpful' && styles.filterTextActive,
              ]}
            >
              Most Helpful
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {reviews.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Reviews
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {reviews.reduce((sum, r) => sum + r.helpful_count, 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Helpful Votes
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {reviews.length > 0
                  ? (
                      reviews.reduce((sum, r) => sum + r.overall_rating, 0) /
                      reviews.length
                    ).toFixed(1)
                  : '0'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Avg Rating
              </Text>
            </View>
          </View>
        </Card>

        {/* Reviews List */}
        {reviews.map((review) => (
          <Card key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewHeaderLeft}>
                <Text style={[styles.businessName, { color: colors.text }]}>
                  {review.business_name}
                </Text>
                <Text style={[styles.serviceName, { color: colors.textSecondary }]}>
                  {review.service_name}
                </Text>
              </View>
              <View style={styles.reviewActions}>
                <TouchableOpacity
                  onPress={() => handleEditReview(review.id, review.booking_id)}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteReview(review.id)}>
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.ratingRow}>
              <Text style={styles.stars}>
                {renderStars(review.overall_rating)}
              </Text>
              <Text style={[styles.ratingValue, { color: colors.text }]}>
                {review.overall_rating.toFixed(1)}
              </Text>
            </View>

            {/* Category Ratings */}
            <View style={styles.categoryRatings}>
              <View style={styles.categoryItem}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  Quality
                </Text>
                <Text style={[styles.categoryValue, { color: colors.primary }]}>{review.quality_rating}</Text>
              </View>
              <View style={styles.categoryItem}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  Professional
                </Text>
                <Text style={[styles.categoryValue, { color: colors.primary }]}>
                  {review.professionalism_rating}
                </Text>
              </View>
              <View style={styles.categoryItem}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  Punctual
                </Text>
                <Text style={[styles.categoryValue, { color: colors.primary }]}>{review.punctuality_rating}</Text>
              </View>
              <View style={styles.categoryItem}>
                <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                  Value
                </Text>
                <Text style={[styles.categoryValue, { color: colors.primary }]}>{review.value_rating}</Text>
              </View>
            </View>

            {review.comment && (
              <Text style={[styles.comment, { color: colors.textSecondary }]}>
                {review.comment}
              </Text>
            )}

            <View style={styles.reviewFooter}>
              <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                {new Date(review.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              {review.helpful_count > 0 && (
                <Badge
                  text={`${review.helpful_count} found helpful`}
                  variant="success"
                />
              )}
              {review.tips_amount && review.tips_amount > 0 && (
                <Badge text={`₹${review.tips_amount} tip`} variant="info" />
              )}
            </View>
          </Card>
        ))}

        {reviews.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              You haven't written any reviews yet
            </Text>
            <Button
              title="Browse Services"
              onPress={() => router.push('/explore')}
              style={styles.browseButton}
            />
          </Card>
        )}
      </ScrollView>
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterTabActive: {},

  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  reviewCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  serviceName: {
    fontSize: 14,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stars: {
    fontSize: 16,
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryRatings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  comment: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  reviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewDate: {
    fontSize: 12,
    flex: 1,
  },
  emptyCard: {
    margin: spacing.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: spacing.xl,
  },
  browseButton: {
    paddingHorizontal: spacing.xl,
  },
});
