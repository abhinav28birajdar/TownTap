import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  user: {
    name: string;
    image: string | null;
    verified: boolean;
  };
  rating: number;
  date: string;
  service: string;
  comment: string;
  images: string[];
  helpful: number;
  ownerReply?: {
    text: string;
    date: string;
  };
}

const mockReviews: Review[] = [
  {
    id: '1',
    user: { name: 'Priya Sharma', image: null, verified: true },
    rating: 5,
    date: 'Dec 15, 2024',
    service: 'Home Deep Cleaning',
    comment: 'Absolutely amazing service! The team was professional, punctual, and thorough. My home has never looked better. Highly recommend!',
    images: [],
    helpful: 24,
    ownerReply: {
      text: 'Thank you so much, Priya! We\'re thrilled you loved our service. Looking forward to serving you again!',
      date: 'Dec 16, 2024',
    },
  },
  {
    id: '2',
    user: { name: 'Rahul Verma', image: null, verified: true },
    rating: 4,
    date: 'Dec 12, 2024',
    service: 'AC Repair & Service',
    comment: 'Good service overall. The technician was knowledgeable and fixed the issue quickly. Only minor delay in arrival.',
    images: [],
    helpful: 12,
  },
  {
    id: '3',
    user: { name: 'Anita Patel', image: null, verified: false },
    rating: 5,
    date: 'Dec 10, 2024',
    service: 'Plumbing Repair',
    comment: 'Quick response and excellent work. Fixed a major leak that others couldn\'t diagnose. Very professional!',
    images: [],
    helpful: 18,
    ownerReply: {
      text: 'Thanks for your kind words, Anita! We take pride in solving complex issues. Glad we could help!',
      date: 'Dec 11, 2024',
    },
  },
  {
    id: '4',
    user: { name: 'Vikram Singh', image: null, verified: true },
    rating: 3,
    date: 'Dec 8, 2024',
    service: 'Electrical Work',
    comment: 'Service was okay. Work was done well but communication could be better. Had to follow up multiple times.',
    images: [],
    helpful: 8,
  },
  {
    id: '5',
    user: { name: 'Sneha Reddy', image: null, verified: true },
    rating: 5,
    date: 'Dec 5, 2024',
    service: 'Pest Control',
    comment: 'Excellent pest control service. No more cockroaches! The team was thorough and explained everything clearly.',
    images: [],
    helpful: 15,
  },
];

const filterOptions = [
  { id: 'all', label: 'All Reviews' },
  { id: '5', label: '5 Stars' },
  { id: '4', label: '4 Stars' },
  { id: '3', label: '3 Stars' },
  { id: '2', label: '2 Stars' },
  { id: '1', label: '1 Star' },
];

const sortOptions = [
  { id: 'recent', label: 'Most Recent' },
  { id: 'helpful', label: 'Most Helpful' },
  { id: 'highest', label: 'Highest Rated' },
  { id: 'lowest', label: 'Lowest Rated' },
];

export default function BusinessReviewsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reviews, setReviews] = useState(mockReviews);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('recent');
  const [showSortModal, setShowSortModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  // Business info
  const businessInfo = {
    name: 'CleanPro Services',
    rating: 4.8,
    totalReviews: 256,
    ratingBreakdown: [
      { stars: 5, count: 180, percentage: 70 },
      { stars: 4, count: 51, percentage: 20 },
      { stars: 3, count: 15, percentage: 6 },
      { stars: 2, count: 7, percentage: 3 },
      { stars: 1, count: 3, percentage: 1 },
    ],
  };

  const filteredReviews = reviews.filter((r) =>
    selectedFilter === 'all' ? true : r.rating === parseInt(selectedFilter)
  );

  const handleReply = () => {
    if (selectedReview && replyText.trim()) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === selectedReview.id
            ? {
                ...r,
                ownerReply: {
                  text: replyText,
                  date: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                },
              }
            : r
        )
      );
      setReplyText('');
      setShowReplyModal(false);
      setSelectedReview(null);
    }
  };

  const renderStars = (rating: number, size: number = 14) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFC107' : colors.border}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reviews</ThemedText>
        <TouchableOpacity onPress={() => setShowSortModal(true)}>
          <Ionicons name="funnel" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rating Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <View style={styles.overallRating}>
            <ThemedText style={styles.ratingNumber}>{businessInfo.rating}</ThemedText>
            {renderStars(Math.round(businessInfo.rating), 20)}
            <ThemedText style={[styles.totalReviews, { color: colors.textSecondary }]}>
              {businessInfo.totalReviews} reviews
            </ThemedText>
          </View>
          <View style={styles.ratingBreakdown}>
            {businessInfo.ratingBreakdown.map((item) => (
              <View key={item.stars} style={styles.breakdownRow}>
                <ThemedText style={styles.starLabel}>{item.stars}</ThemedText>
                <Ionicons name="star" size={12} color="#FFC107" />
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.percentage}%`, backgroundColor: colors.primary },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.countLabel, { color: colors.textSecondary }]}>
                  {item.count}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor:
                      selectedFilter === filter.id ? colors.primary : colors.card,
                    borderColor:
                      selectedFilter === filter.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.id)}
              >
                {filter.id !== 'all' && (
                  <Ionicons
                    name="star"
                    size={12}
                    color={selectedFilter === filter.id ? '#fff' : '#FFC107'}
                  />
                )}
                <ThemedText
                  style={[
                    styles.filterText,
                    { color: selectedFilter === filter.id ? '#fff' : colors.text },
                  ]}
                >
                  {filter.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          {filteredReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
              <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                No reviews found
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No reviews match your filter criteria
              </ThemedText>
            </View>
          ) : (
            filteredReviews.map((review) => (
              <View
                key={review.id}
                style={[styles.reviewCard, { backgroundColor: colors.card }]}
              >
                {/* Review Header */}
                <View style={styles.reviewHeader}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                    <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                      {review.user.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <ThemedText style={styles.userName}>{review.user.name}</ThemedText>
                      {review.user.verified && (
                        <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                      )}
                    </View>
                    <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
                      {review.date}
                    </ThemedText>
                  </View>
                  {renderStars(review.rating)}
                </View>

                {/* Service Tag */}
                <View
                  style={[
                    styles.serviceTag,
                    { backgroundColor: colors.primary + '10' },
                  ]}
                >
                  <Ionicons name="construct" size={12} color={colors.primary} />
                  <ThemedText style={[styles.serviceText, { color: colors.primary }]}>
                    {review.service}
                  </ThemedText>
                </View>

                {/* Review Content */}
                <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>

                {/* Review Actions */}
                <View style={styles.reviewActions}>
                  <TouchableOpacity style={styles.helpfulButton}>
                    <Ionicons name="thumbs-up-outline" size={16} color={colors.textSecondary} />
                    <ThemedText style={[styles.helpfulText, { color: colors.textSecondary }]}>
                      Helpful ({review.helpful})
                    </ThemedText>
                  </TouchableOpacity>
                  {!review.ownerReply && (
                    <TouchableOpacity
                      style={styles.replyButton}
                      onPress={() => {
                        setSelectedReview(review);
                        setShowReplyModal(true);
                      }}
                    >
                      <Ionicons name="chatbubble-outline" size={16} color={colors.primary} />
                      <ThemedText style={[styles.replyButtonText, { color: colors.primary }]}>
                        Reply
                      </ThemedText>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Owner Reply */}
                {review.ownerReply && (
                  <View
                    style={[
                      styles.ownerReplyCard,
                      { backgroundColor: colors.background },
                    ]}
                  >
                    <View style={styles.ownerReplyHeader}>
                      <View style={styles.ownerBadge}>
                        <Ionicons name="business" size={12} color={colors.primary} />
                        <ThemedText style={[styles.ownerLabel, { color: colors.primary }]}>
                          Owner Response
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.replyDate, { color: colors.textSecondary }]}>
                        {review.ownerReply.date}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.ownerReplyText, { color: colors.textSecondary }]}>
                      {review.ownerReply.text}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Sort Reviews</ThemedText>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => {
                  setSelectedSort(option.id);
                  setShowSortModal(false);
                }}
              >
                <ThemedText
                  style={[
                    styles.sortOptionText,
                    selectedSort === option.id && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {option.label}
                </ThemedText>
                {selectedSort === option.id && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reply Modal */}
      <Modal visible={showReplyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.replyModal, { backgroundColor: colors.card }]}>
            <View style={styles.replyModalHeader}>
              <ThemedText style={styles.modalTitle}>Reply to Review</ThemedText>
              <TouchableOpacity onPress={() => setShowReplyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            {selectedReview && (
              <View style={[styles.selectedReviewPreview, { backgroundColor: colors.background }]}>
                <View style={styles.previewHeader}>
                  <ThemedText style={styles.previewName}>{selectedReview.user.name}</ThemedText>
                  {renderStars(selectedReview.rating, 12)}
                </View>
                <ThemedText
                  style={[styles.previewComment, { color: colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {selectedReview.comment}
                </ThemedText>
              </View>
            )}
            <TextInput
              style={[
                styles.replyInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              placeholder="Write your reply..."
              placeholderTextColor={colors.textSecondary}
              value={replyText}
              onChangeText={setReplyText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.sendReplyButton,
                {
                  backgroundColor: replyText.trim() ? colors.primary : colors.border,
                },
              ]}
              onPress={handleReply}
              disabled={!replyText.trim()}
            >
              <ThemedText
                style={[
                  styles.sendReplyText,
                  { color: replyText.trim() ? '#fff' : colors.textSecondary },
                ]}
              >
                Send Reply
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
  },
  overallRating: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 13,
    marginTop: 4,
  },
  ratingBreakdown: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  starLabel: {
    width: 12,
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  countLabel: {
    width: 30,
    fontSize: 12,
    textAlign: 'right',
  },
  filterSection: {
    marginTop: 16,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  reviewsList: {
    padding: 16,
  },
  reviewCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 12,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 13,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  replyButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ownerReplyCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#415D43',
  },
  ownerReplyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ownerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyDate: {
    fontSize: 11,
  },
  ownerReplyText: {
    fontSize: 13,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sortModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  sortOptionText: {
    fontSize: 16,
  },
  replyModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  replyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedReviewPreview: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewComment: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 120,
  },
  sendReplyButton: {
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendReplyText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
