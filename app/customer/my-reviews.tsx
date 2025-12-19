import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
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
  bookingId: string;
  service: {
    name: string;
    category: string;
    image: string;
    provider: string;
  };
  rating: number;
  comment: string;
  date: string;
  images: string[];
  helpful: number;
  providerReply?: {
    message: string;
    date: string;
  };
}

const reviews: Review[] = [
  {
    id: '1',
    bookingId: 'BK-2024-1234',
    service: {
      name: 'Deep Home Cleaning',
      category: 'Cleaning',
      image: 'https://via.placeholder.com/100',
      provider: 'CleanPro Services',
    },
    rating: 5,
    comment: 'Excellent service! The team was very professional and thorough. My house looks spotless now. Would definitely recommend to others.',
    date: 'Dec 20, 2024',
    images: ['https://via.placeholder.com/150', 'https://via.placeholder.com/150'],
    helpful: 12,
    providerReply: {
      message: 'Thank you so much for your kind words! We\'re glad you loved our service. Looking forward to serving you again!',
      date: 'Dec 21, 2024',
    },
  },
  {
    id: '2',
    bookingId: 'BK-2024-1233',
    service: {
      name: 'AC Repair & Service',
      category: 'Appliance Repair',
      image: 'https://via.placeholder.com/100',
      provider: 'CoolFix Solutions',
    },
    rating: 4,
    comment: 'Good service overall. The technician was knowledgeable and fixed the issue quickly. Slight delay in arrival but they informed beforehand.',
    date: 'Dec 15, 2024',
    images: [],
    helpful: 5,
  },
  {
    id: '3',
    bookingId: 'BK-2024-1230',
    service: {
      name: 'Plumbing Service',
      category: 'Plumbing',
      image: 'https://via.placeholder.com/100',
      provider: 'QuickFix Plumbers',
    },
    rating: 5,
    comment: 'Fast and efficient service. Fixed the leaking pipe within an hour. Very reasonable pricing too.',
    date: 'Dec 10, 2024',
    images: ['https://via.placeholder.com/150'],
    helpful: 8,
  },
];

const pendingReviews = [
  {
    id: 'p1',
    bookingId: 'BK-2024-1240',
    service: {
      name: 'Electrical Work',
      category: 'Electrician',
      image: 'https://via.placeholder.com/100',
      provider: 'PowerFix Electricians',
    },
    date: 'Dec 22, 2024',
  },
  {
    id: 'p2',
    bookingId: 'BK-2024-1238',
    service: {
      name: 'Pest Control',
      category: 'Pest Control',
      image: 'https://via.placeholder.com/100',
      provider: 'SafeHome Pest Control',
    },
    date: 'Dec 21, 2024',
  },
];

export default function MyReviewsScreen() {
  const colors = useColors();
  const [activeTab, setActiveTab] = useState<'given' | 'pending'>('given');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  const stats = {
    total: reviews.length,
    averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length,
    fiveStars: reviews.filter(r => r.rating === 5).length,
    withPhotos: reviews.filter(r => r.images.length > 0).length,
  };

  const renderStars = (rating: number, size: number = 16, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color="#FFB800"
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderReview = ({ item }: { item: Review }) => (
    <TouchableOpacity
      style={[styles.reviewCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedReview(item);
        setShowDetailModal(true);
      }}
    >
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.service.image }} style={styles.serviceImage} />
        <View style={styles.reviewServiceInfo}>
          <ThemedText style={styles.serviceName}>{item.service.name}</ThemedText>
          <ThemedText style={[styles.providerName, { color: colors.textSecondary }]}>
            {item.service.provider}
          </ThemedText>
          <View style={styles.ratingRow}>
            {renderStars(item.rating)}
            <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
              {item.date}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText style={[styles.reviewComment, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.comment}
      </ThemedText>
      {item.images.length > 0 && (
        <View style={styles.reviewImages}>
          {item.images.slice(0, 3).map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.reviewImageThumb} />
          ))}
          {item.images.length > 3 && (
            <View style={[styles.moreImages, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.moreImagesText, { color: colors.textSecondary }]}>
                +{item.images.length - 3}
              </ThemedText>
            </View>
          )}
        </View>
      )}
      <View style={styles.reviewFooter}>
        <View style={styles.helpfulContainer}>
          <Ionicons name="thumbs-up-outline" size={16} color={colors.textSecondary} />
          <ThemedText style={[styles.helpfulText, { color: colors.textSecondary }]}>
            {item.helpful} found helpful
          </ThemedText>
        </View>
        {item.providerReply && (
          <View style={[styles.replyBadge, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="chatbubble" size={12} color={colors.success} />
            <ThemedText style={[styles.replyBadgeText, { color: colors.success }]}>
              Replied
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPendingReview = ({ item }: { item: typeof pendingReviews[0] }) => (
    <TouchableOpacity
      style={[styles.pendingCard, { backgroundColor: colors.card }]}
      onPress={() => setShowWriteModal(true)}
    >
      <Image source={{ uri: item.service.image }} style={styles.pendingImage} />
      <View style={styles.pendingInfo}>
        <ThemedText style={styles.pendingServiceName}>{item.service.name}</ThemedText>
        <ThemedText style={[styles.pendingProvider, { color: colors.textSecondary }]}>
          {item.service.provider}
        </ThemedText>
        <ThemedText style={[styles.pendingDate, { color: colors.textSecondary }]}>
          Completed on {item.date}
        </ThemedText>
      </View>
      <TouchableOpacity style={[styles.writeButton, { backgroundColor: colors.primary }]}>
        <ThemedText style={styles.writeButtonText}>Write</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Reviews</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Stats Card */}
      <LinearGradient
        colors={[colors.primary, colors.primary + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statsCard}
      >
        <View style={styles.statsMain}>
          <ThemedText style={styles.statsRating}>{stats.averageRating.toFixed(1)}</ThemedText>
          {renderStars(Math.round(stats.averageRating), 18)}
          <ThemedText style={styles.statsTotalReviews}>
            Based on {stats.total} reviews
          </ThemedText>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.total}</ThemedText>
            <ThemedText style={styles.statLabel}>Total</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.fiveStars}</ThemedText>
            <ThemedText style={styles.statLabel}>5 Stars</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.withPhotos}</ThemedText>
            <ThemedText style={styles.statLabel}>With Photos</ThemedText>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'given' && { backgroundColor: colors.primary + '20' }]}
          onPress={() => setActiveTab('given')}
        >
          <ThemedText style={[
            styles.tabText,
            { color: activeTab === 'given' ? colors.primary : colors.textSecondary }
          ]}>
            Given ({reviews.length})
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && { backgroundColor: colors.primary + '20' }]}
          onPress={() => setActiveTab('pending')}
        >
          <ThemedText style={[
            styles.tabText,
            { color: activeTab === 'pending' ? colors.primary : colors.textSecondary }
          ]}>
            Pending ({pendingReviews.length})
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'given' ? (
        <FlatList
          data={reviews}
          renderItem={renderReview}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="star-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Reviews Yet</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Your reviews will appear here after booking services
              </ThemedText>
            </View>
          }
        />
      ) : (
        <FlatList
          data={pendingReviews}
          renderItem={renderPendingReview}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color={colors.success} />
              <ThemedText style={styles.emptyTitle}>All Caught Up!</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                You have reviewed all your completed bookings
              </ThemedText>
            </View>
          }
        />
      )}

      {/* Review Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Review Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Service Info */}
                <View style={styles.detailServiceInfo}>
                  <Image source={{ uri: selectedReview.service.image }} style={styles.detailServiceImage} />
                  <View style={styles.detailServiceDetails}>
                    <ThemedText style={styles.detailServiceName}>{selectedReview.service.name}</ThemedText>
                    <ThemedText style={[styles.detailProvider, { color: colors.textSecondary }]}>
                      {selectedReview.service.provider}
                    </ThemedText>
                    <ThemedText style={[styles.detailBookingId, { color: colors.primary }]}>
                      {selectedReview.bookingId}
                    </ThemedText>
                  </View>
                </View>

                {/* Rating */}
                <View style={[styles.ratingSection, { backgroundColor: colors.background }]}>
                  <ThemedText style={styles.ratingLabel}>Your Rating</ThemedText>
                  <View style={styles.ratingDisplay}>
                    {renderStars(selectedReview.rating, 28)}
                    <ThemedText style={[styles.ratingValue, { color: colors.primary }]}>
                      {selectedReview.rating}/5
                    </ThemedText>
                  </View>
                </View>

                {/* Comment */}
                <View style={styles.commentSection}>
                  <ThemedText style={styles.commentLabel}>Your Review</ThemedText>
                  <ThemedText style={[styles.commentText, { color: colors.textSecondary }]}>
                    {selectedReview.comment}
                  </ThemedText>
                  <ThemedText style={[styles.commentDate, { color: colors.textSecondary }]}>
                    Posted on {selectedReview.date}
                  </ThemedText>
                </View>

                {/* Images */}
                {selectedReview.images.length > 0 && (
                  <View style={styles.imagesSection}>
                    <ThemedText style={styles.imagesLabel}>Attached Photos</ThemedText>
                    <View style={styles.imagesGrid}>
                      {selectedReview.images.map((img, index) => (
                        <Image key={index} source={{ uri: img }} style={styles.detailImage} />
                      ))}
                    </View>
                  </View>
                )}

                {/* Provider Reply */}
                {selectedReview.providerReply && (
                  <View style={[styles.replySection, { backgroundColor: colors.success + '10' }]}>
                    <View style={styles.replyHeader}>
                      <Ionicons name="chatbubble" size={18} color={colors.success} />
                      <ThemedText style={[styles.replyLabel, { color: colors.success }]}>
                        Provider Response
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.replyText, { color: colors.text }]}>
                      {selectedReview.providerReply.message}
                    </ThemedText>
                    <ThemedText style={[styles.replyDate, { color: colors.textSecondary }]}>
                      {selectedReview.providerReply.date}
                    </ThemedText>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.detailActions}>
                  <TouchableOpacity style={[styles.detailAction, { backgroundColor: colors.background }]}>
                    <Ionicons name="pencil" size={18} color={colors.primary} />
                    <ThemedText style={[styles.detailActionText, { color: colors.primary }]}>
                      Edit Review
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.detailAction, { backgroundColor: colors.background }]}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <ThemedText style={[styles.detailActionText, { color: colors.error }]}>
                      Delete
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Write Review Modal */}
      <Modal
        visible={showWriteModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowWriteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Write Review</ThemedText>
              <TouchableOpacity onPress={() => setShowWriteModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Rating Selection */}
              <View style={styles.ratingSelection}>
                <ThemedText style={styles.ratingSelectionLabel}>Rate your experience</ThemedText>
                {renderStars(newRating, 36, setNewRating)}
                <ThemedText style={[styles.ratingSelectionHint, { color: colors.textSecondary }]}>
                  {newRating === 5 ? 'Excellent!' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Good' : newRating === 2 ? 'Fair' : 'Poor'}
                </ThemedText>
              </View>

              {/* Comment */}
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Your Review</ThemedText>
                <TextInput
                  style={[styles.commentInput, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Share your experience with this service..."
                  placeholderTextColor={colors.textSecondary}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Add Photos */}
              <TouchableOpacity style={[styles.addPhotosButton, { borderColor: colors.border }]}>
                <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
                <ThemedText style={[styles.addPhotosText, { color: colors.textSecondary }]}>
                  Add Photos (Optional)
                </ThemedText>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
              </TouchableOpacity>
            </ScrollView>
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
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
  },
  statsMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statsRating: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '700',
    marginBottom: 4,
  },
  statsTotalReviews: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  serviceImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  reviewServiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  providerName: {
    fontSize: 13,
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewDate: {
    fontSize: 12,
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
  reviewImageThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  moreImages: {
    width: 60,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 12,
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  replyBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  pendingImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  pendingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  pendingServiceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  pendingProvider: {
    fontSize: 13,
    marginBottom: 4,
  },
  pendingDate: {
    fontSize: 12,
  },
  writeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  writeButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  detailServiceInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailServiceImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  detailServiceDetails: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  detailServiceName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailProvider: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailBookingId: {
    fontSize: 12,
    fontWeight: '500',
  },
  ratingSection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  commentSection: {
    marginBottom: 16,
  },
  commentLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  commentDate: {
    fontSize: 12,
  },
  imagesSection: {
    marginBottom: 16,
  },
  imagesLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  imagesGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  detailImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  replySection: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  replyLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  replyDate: {
    fontSize: 12,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  detailAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSelection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingSelectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  ratingSelectionHint: {
    fontSize: 14,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  commentInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 10,
    marginBottom: 20,
  },
  addPhotosText: {
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
