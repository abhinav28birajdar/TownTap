/**
 * Write Review Page - Phase 5
 * Submit rating and review for completed booking
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface BookingInfo {
  id: string;
  business_id: string;
  business_name: string;
  service_provider_id?: string;
}

export default function WriteReviewPage() {
  const { bookingId } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ratingCategories = [
    { key: 'quality', label: 'Service Quality', rating: 0 },
    { key: 'professionalism', label: 'Professionalism', rating: 0 },
    { key: 'punctuality', label: 'Punctuality', rating: 0 },
    { key: 'value', label: 'Value for Money', rating: 0 },
  ];

  const [categoryRatings, setCategoryRatings] = useState(ratingCategories);

  useEffect(() => {
    loadBookingInfo();
  }, [bookingId]);

  const loadBookingInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          business_id,
          service_provider_id,
          business:businesses(business_name)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      
      if (data && typeof data === 'object') {
        const bookingData = data as any;
        setBooking({
          id: bookingData.id,
          business_id: bookingData.business_id,
          business_name: bookingData.business?.business_name || '',
          service_provider_id: bookingData.service_provider_id,
        });
      }
    } catch (error) {
      console.error('Error loading booking:', error);
    }
  };

  const handleCategoryRating = (index: number, newRating: number) => {
    const updated = [...categoryRatings];
    updated[index].rating = newRating;
    setCategoryRatings(updated);

    // Calculate average rating
    const avg = updated.reduce((sum, cat) => sum + cat.rating, 0) / updated.length;
    setRating(Math.round(avg * 10) / 10);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      // Insert review
      const { data: reviewData, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId as string,
          business_id: booking?.business_id || '',
          customer_id: user?.id || '',
          service_provider_id: booking?.service_provider_id,
          rating,
          review_text: review,
          quality_rating: categoryRatings[0].rating,
          professionalism_rating: categoryRatings[1].rating,
          punctuality_rating: categoryRatings[2].rating,
          value_rating: categoryRatings[3].rating,
        } as any)
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Update business rating
      await supabase.rpc('update_business_rating', {
        business_id_param: booking?.business_id || '',
      } as any);

      alert('Review submitted successfully!');
      router.back();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, onPress: (rating: number) => void) => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onPress(star)}
          style={styles.starButton}
        >
          <Text style={styles.star}>
            {star <= currentRating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Write Review</Text>
        </View>

        {/* Business Info */}
        <Card style={styles.businessCard}>
          <Text style={[styles.businessName, { color: colors.text }]}>
            {booking.business_name}
          </Text>
          <Text style={[styles.helpText, { color: colors.textSecondary }]}>
            Share your experience to help others
          </Text>
        </Card>

        {/* Overall Rating */}
        <Card style={styles.ratingCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overall Rating
          </Text>
          <View style={styles.overallRating}>
            {renderStars(Math.round(rating), setRating)}
            {rating > 0 && (
              <Text style={[styles.ratingValue, { color: colors.primary }]}>
                {rating.toFixed(1)}
              </Text>
            )}
          </View>
        </Card>

        {/* Category Ratings */}
        <Card style={styles.categoriesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Rate Different Aspects
          </Text>
          {categoryRatings.map((category, index) => (
            <View key={category.key} style={styles.categoryRow}>
              <Text style={[styles.categoryLabel, { color: colors.text }]}>
                {category.label}
              </Text>
              {renderStars(category.rating, (newRating) =>
                handleCategoryRating(index, newRating)
              )}
            </View>
          ))}
        </Card>

        {/* Review Text */}
        <Card style={styles.reviewCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Write Your Review (Optional)
          </Text>
          <TextInput
            style={[
              styles.reviewInput,
              {
                color: colors.text,
                backgroundColor: colors.muted,
                borderColor: colors.border,
              },
            ]}
            placeholder="Share details of your experience..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            value={review}
            onChangeText={setReview}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: colors.textSecondary }]}>
            {review.length}/500
          </Text>
        </Card>

        {/* Tips */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            💡 Tips for writing a helpful review:
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Be specific about what you liked or didn't like
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Mention if the service matched your expectations
          </Text>
          <Text style={[styles.tipText, { color: colors.textSecondary }]}>
            • Share any tips for future customers
          </Text>
        </Card>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <Button
          title={submitting ? '' : 'Submit Review'}
          onPress={handleSubmit}
          disabled={submitting || rating === 0}
          style={styles.submitButton}
        >
          {submitting && <ActivityIndicator color="#FFFFFF" />}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: spacing.xl * 2,
    fontSize: 16,
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
  businessCard: {
    margin: spacing.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  helpText: {
    fontSize: 14,
  },
  ratingCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  overallRating: {
    alignItems: 'center',
    gap: spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  star: {
    fontSize: 32,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  categoriesCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  reviewCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    minHeight: 120,
    fontSize: 14,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  tipsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: 12,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    width: '100%',
  },
});
