import { ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockReviews = [
  {
    id: '1',
    businessName: 'QuickFix Plumbers',
    businessImage: null,
    rating: 5,
    comment: 'Excellent service! Very professional and punctual. Fixed my leaking pipe quickly.',
    date: '2025-12-10',
    images: [],
  },
  {
    id: '2',
    businessName: 'Sparkle Clean Services',
    businessImage: null,
    rating: 4,
    comment: 'Good cleaning service. They were thorough but arrived 15 minutes late.',
    date: '2025-12-08',
    images: [],
  },
  {
    id: '3',
    businessName: 'Bright Electricians',
    businessImage: null,
    rating: 5,
    comment: 'Amazing work! Rewired my entire house. Very knowledgeable and friendly.',
    date: '2025-12-05',
    images: [],
  },
];

export default function CustomerReviewsScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState(mockReviews);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFC107"
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Reviews</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Summary */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.summaryCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>{reviews.length}</ThemedText>
            <ThemedText style={styles.summaryLabel}>Total Reviews</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={styles.summaryValue}>
              {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.summaryLabel}>Avg Rating</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="star" size={32} color="#FFC107" />
          </View>
        </Animated.View>

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          {reviews.length === 0 ? (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.emptyState}
            >
              <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Reviews Yet</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Book a service and leave your first review
              </ThemedText>
              <TouchableOpacity
                style={[styles.exploreButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <ThemedText style={styles.exploreButtonText}>Explore Services</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            reviews.map((review, index) => (
              <Animated.View
                key={review.id}
                entering={FadeInDown.delay(200 + index * 100)}
              >
                <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.businessInfo}>
                      <View style={[styles.businessAvatar, { backgroundColor: colors.primary }]}>
                        <Ionicons name="business" size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.businessDetails}>
                        <ThemedText style={styles.businessName}>{review.businessName}</ThemedText>
                        <ThemedText style={styles.reviewDate}>{review.date}</ThemedText>
                      </View>
                    </View>
                    {renderStars(review.rating)}
                  </View>

                  <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>

                  {review.images && review.images.length > 0 && (
                    <View style={styles.imagesContainer}>
                      {review.images.map((image, idx) => (
                        <Image key={idx} source={{ uri: image }} style={styles.reviewImage} />
                      ))}
                    </View>
                  )}
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    opacity: 0.6,
  },
  reviewsContainer: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  businessInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  businessAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 13,
    opacity: 0.6,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
});
