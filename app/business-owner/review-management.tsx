import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  date: string;
  serviceName: string;
  comment: string;
  images?: string[];
  reply?: string;
  replyDate?: string;
  helpful: number;
  verified: boolean;
}

const reviews: Review[] = [
  {
    id: '1',
    customerName: 'Priya Sharma',
    customerAvatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=415D43&color=fff',
    rating: 5,
    date: 'Dec 22, 2024',
    serviceName: 'Deep Home Cleaning',
    comment: 'Absolutely fantastic service! The team was professional, punctual and thorough. My house has never looked cleaner. Highly recommend to everyone!',
    images: ['https://picsum.photos/200/200?random=1', 'https://picsum.photos/200/200?random=2'],
    reply: 'Thank you so much for your kind words, Priya! We truly appreciate your support and are thrilled you loved our service.',
    replyDate: 'Dec 23, 2024',
    helpful: 12,
    verified: true,
  },
  {
    id: '2',
    customerName: 'Rahul Kumar',
    customerAvatar: 'https://ui-avatars.com/api/?name=Rahul+Kumar&background=7D5A50&color=fff',
    rating: 4,
    date: 'Dec 20, 2024',
    serviceName: 'AC Servicing',
    comment: 'Good service overall. The technician was knowledgeable and fixed the issue quickly. Would have been 5 stars but arrived 15 minutes late.',
    helpful: 8,
    verified: true,
  },
  {
    id: '3',
    customerName: 'Anjali Patel',
    customerAvatar: 'https://ui-avatars.com/api/?name=Anjali+Patel&background=5D6D7E&color=fff',
    rating: 5,
    date: 'Dec 18, 2024',
    serviceName: 'Plumbing Repair',
    comment: 'Emergency plumbing service was amazing. They came within an hour and fixed the leak professionally. Very impressed!',
    reply: 'Thank you, Anjali! We\'re glad we could help in your emergency. Stay safe!',
    replyDate: 'Dec 18, 2024',
    helpful: 15,
    verified: true,
  },
  {
    id: '4',
    customerName: 'Vikram Singh',
    customerAvatar: 'https://ui-avatars.com/api/?name=Vikram+Singh&background=A0522D&color=fff',
    rating: 3,
    date: 'Dec 15, 2024',
    serviceName: 'Electrical Work',
    comment: 'The work was done but communication could have been better. Had to call multiple times for updates.',
    helpful: 5,
    verified: false,
  },
  {
    id: '5',
    customerName: 'Neha Gupta',
    customerAvatar: 'https://ui-avatars.com/api/?name=Neha+Gupta&background=2C3E50&color=fff',
    rating: 5,
    date: 'Dec 12, 2024',
    serviceName: 'Carpet Cleaning',
    comment: 'Best carpet cleaning service in town! My carpets look brand new. Very reasonable pricing too.',
    images: ['https://picsum.photos/200/200?random=3'],
    helpful: 20,
    verified: true,
  },
];

export default function ReviewManagementScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredReviews = reviews.filter(review => {
    if (filterRating === null) return true;
    return review.rating === filterRating;
  });

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100,
  }));

  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : star - rating < 1 ? 'star-half' : 'star-outline'}
            size={size}
            color={colors.warning}
          />
        ))}
      </View>
    );
  };

  const handleSubmitReply = (reviewId: string) => {
    if (replyText.trim()) {
      // Submit reply logic here
      console.log('Reply to', reviewId, ':', replyText);
      setReplyingTo(null);
      setReplyText('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reviews & Ratings</ThemedText>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rating Overview */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.ratingCard}
        >
          <View style={styles.ratingOverview}>
            <View style={styles.ratingMain}>
              <ThemedText style={styles.ratingValue}>{averageRating}</ThemedText>
              {renderStars(parseFloat(averageRating), 20)}
              <ThemedText style={styles.ratingCount}>Based on {reviews.length} reviews</ThemedText>
            </View>
            <View style={styles.ratingBars}>
              {ratingDistribution.map((dist) => (
                <View key={dist.rating} style={styles.ratingBarRow}>
                  <ThemedText style={styles.ratingBarLabel}>{dist.rating}</ThemedText>
                  <View style={styles.ratingBarContainer}>
                    <View
                      style={[
                        styles.ratingBarFill,
                        { width: `${dist.percentage}%` },
                      ]}
                    />
                  </View>
                  <ThemedText style={styles.ratingBarCount}>{dist.count}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatCard, { backgroundColor: colors.card }]}>
            <Ionicons name="chatbubbles" size={24} color={colors.info} />
            <ThemedText style={styles.quickStatValue}>
              {reviews.filter(r => !r.reply).length}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
              Pending Reply
            </ThemedText>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.card }]}>
            <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            <ThemedText style={styles.quickStatValue}>
              {reviews.filter(r => r.verified).length}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
              Verified
            </ThemedText>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.card }]}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <ThemedText style={styles.quickStatValue}>
              {reviews.filter(r => r.images).length}
            </ThemedText>
            <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>
              With Photos
            </ThemedText>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                filterRating === null && { backgroundColor: colors.primary }
              ]}
              onPress={() => setFilterRating(null)}
            >
              <ThemedText style={[
                styles.filterText,
                { color: filterRating === null ? '#FFF' : colors.textSecondary }
              ]}>
                All
              </ThemedText>
            </TouchableOpacity>
            {[5, 4, 3, 2, 1].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.filterTab,
                  filterRating === rating && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterRating(rating)}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={filterRating === rating ? '#FFF' : colors.warning}
                />
                <ThemedText style={[
                  styles.filterText,
                  { color: filterRating === rating ? '#FFF' : colors.textSecondary }
                ]}>
                  {rating}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews List */}
        <View style={styles.section}>
          {filteredReviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
              {/* Review Header */}
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.customerAvatar }} style={styles.reviewAvatar} />
                <View style={styles.reviewInfo}>
                  <View style={styles.reviewNameRow}>
                    <ThemedText style={styles.reviewName}>{review.customerName}</ThemedText>
                    {review.verified && (
                      <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '15' }]}>
                        <Ionicons name="checkmark-circle" size={12} color={colors.success} />
                        <ThemedText style={[styles.verifiedText, { color: colors.success }]}>
                          Verified
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.reviewMeta}>
                    {renderStars(review.rating)}
                    <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
                      • {review.date}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Service Tag */}
              <View style={[styles.serviceTag, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="construct-outline" size={12} color={colors.primary} />
                <ThemedText style={[styles.serviceTagText, { color: colors.primary }]}>
                  {review.serviceName}
                </ThemedText>
              </View>

              {/* Review Comment */}
              <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>

              {/* Review Images */}
              {review.images && (
                <View style={styles.reviewImages}>
                  {review.images.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
                  ))}
                </View>
              )}

              {/* Helpful Count */}
              <View style={styles.helpfulRow}>
                <TouchableOpacity style={styles.helpfulButton}>
                  <Ionicons name="thumbs-up-outline" size={14} color={colors.textSecondary} />
                  <ThemedText style={[styles.helpfulText, { color: colors.textSecondary }]}>
                    Helpful ({review.helpful})
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {/* Reply Section */}
              {review.reply ? (
                <View style={[styles.replySection, { backgroundColor: colors.background }]}>
                  <View style={styles.replyHeader}>
                    <Ionicons name="return-down-forward" size={16} color={colors.primary} />
                    <ThemedText style={[styles.replyLabel, { color: colors.primary }]}>
                      Your Response
                    </ThemedText>
                    <ThemedText style={[styles.replyDate, { color: colors.textSecondary }]}>
                      {review.replyDate}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.replyText, { color: colors.text }]}>
                    {review.reply}
                  </ThemedText>
                </View>
              ) : replyingTo === review.id ? (
                <View style={[styles.replyInput, { backgroundColor: colors.background }]}>
                  <TextInput
                    style={[styles.replyTextInput, { color: colors.text }]}
                    placeholder="Write your reply..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    value={replyText}
                    onChangeText={setReplyText}
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      <ThemedText style={[styles.cancelText, { color: colors.textSecondary }]}>
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitReplyButton, { backgroundColor: colors.primary }]}
                      onPress={() => handleSubmitReply(review.id)}
                    >
                      <ThemedText style={styles.submitReplyText}>Reply</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.addReplyButton, { borderColor: colors.primary }]}
                  onPress={() => setReplyingTo(review.id)}
                >
                  <Ionicons name="chatbubble-outline" size={14} color={colors.primary} />
                  <ThemedText style={[styles.addReplyText, { color: colors.primary }]}>
                    Reply to Review
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  ratingCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
  },
  ratingMain: {
    alignItems: 'center',
    marginRight: 20,
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  ratingValue: {
    color: '#FFF',
    fontSize: 48,
    fontWeight: '700',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 8,
  },
  ratingCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  ratingBars: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBarLabel: {
    color: '#FFF',
    fontSize: 12,
    width: 12,
  },
  ratingBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 3,
  },
  ratingBarCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    width: 16,
    textAlign: 'right',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 6,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 11,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  reviewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewName: {
    fontSize: 15,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  reviewDate: {
    fontSize: 12,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  reviewImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  helpfulRow: {
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 12,
  },
  replySection: {
    padding: 12,
    borderRadius: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  replyDate: {
    fontSize: 11,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyInput: {
    padding: 12,
    borderRadius: 12,
  },
  replyTextInput: {
    minHeight: 60,
    fontSize: 14,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '500',
  },
  submitReplyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  submitReplyText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  addReplyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  addReplyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
