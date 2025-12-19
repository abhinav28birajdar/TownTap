import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Rating {
  category: string;
  value: number;
  icon: string;
}

const ratingCategories: Rating[] = [
  { category: 'Service Quality', value: 0, icon: 'sparkles' },
  { category: 'Punctuality', value: 0, icon: 'time' },
  { category: 'Professionalism', value: 0, icon: 'briefcase' },
  { category: 'Value for Money', value: 0, icon: 'cash' },
  { category: 'Communication', value: 0, icon: 'chatbubbles' },
];

const quickTags = [
  'Professional', 'On Time', 'Friendly', 'Thorough', 'Quick', 
  'Helpful', 'Clean', 'Polite', 'Skilled', 'Efficient'
];

const bookingDetails = {
  id: 'BK-12345',
  service: 'Deep Home Cleaning',
  provider: {
    name: 'CleanPro Services',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    professional: 'Rajesh Kumar',
    professionalAvatar: 'https://randomuser.me/api/portraits/men/35.jpg',
  },
  completedDate: 'Dec 15, 2024',
  completedTime: '12:30 PM',
  duration: '3 hours 30 minutes',
  price: 2299,
};

export default function ReviewScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState<Rating[]>(ratingCategories);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [tipAmount, setTipAmount] = useState<number | null>(null);

  const tipOptions = [0, 50, 100, 200, 500];

  const updateCategoryRating = (index: number, value: number) => {
    const updated = [...categoryRatings];
    updated[index] = { ...updated[index], value };
    setCategoryRatings(updated);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'Tap to rate';
    if (rating === 1) return 'Poor';
    if (rating === 2) return 'Fair';
    if (rating === 3) return 'Good';
    if (rating === 4) return 'Very Good';
    return 'Excellent';
  };

  const getRatingColor = (rating: number) => {
    if (rating === 0) return colors.textSecondary;
    if (rating <= 2) return colors.error;
    if (rating === 3) return colors.warning;
    return colors.success;
  };

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating.');
      return;
    }
    // Simulate API call
    setShowSuccessModal(true);
  };

  const renderStars = (rating: number, onRate: (value: number) => void, size: number = 28) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRate(star)} style={styles.starButton}>
            <Ionicons
              name={rating >= star ? 'star' : 'star-outline'}
              size={size}
              color={rating >= star ? '#FFD700' : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Leave a Review</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Booking Summary */}
        <View style={[styles.bookingCard, { backgroundColor: colors.card }]}>
          <View style={styles.bookingRow}>
            <View style={styles.serviceInfo}>
              <ThemedText style={styles.serviceName}>{bookingDetails.service}</ThemedText>
              <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
                {bookingDetails.id}
              </ThemedText>
              <ThemedText style={[styles.completedAt, { color: colors.success }]}>
                Completed on {bookingDetails.completedDate}
              </ThemedText>
            </View>
            <View style={[styles.completedBadge, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          </View>
        </View>

        {/* Provider Info */}
        <View style={[styles.providerCard, { backgroundColor: colors.card }]}>
          <View style={styles.providerRow}>
            <Image
              source={{ uri: bookingDetails.provider.professionalAvatar }}
              style={styles.providerAvatar}
            />
            <View style={styles.providerInfo}>
              <ThemedText style={styles.providerName}>
                {bookingDetails.provider.professional}
              </ThemedText>
              <ThemedText style={[styles.businessName, { color: colors.textSecondary }]}>
                {bookingDetails.provider.name}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Overall Experience</ThemedText>
          <View style={[styles.ratingCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.ratingLabel, { color: getRatingColor(overallRating) }]}>
              {getRatingLabel(overallRating)}
            </ThemedText>
            {renderStars(overallRating, setOverallRating, 40)}
          </View>
        </View>

        {/* Category Ratings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Rate by Category</ThemedText>
          <View style={[styles.categoriesCard, { backgroundColor: colors.card }]}>
            {categoryRatings.map((cat, index) => (
              <View key={cat.category} style={styles.categoryRow}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name={cat.icon as any} size={16} color={colors.primary} />
                  </View>
                  <ThemedText style={styles.categoryName}>{cat.category}</ThemedText>
                </View>
                {renderStars(cat.value, (v) => updateCategoryRating(index, v), 22)}
              </View>
            ))}
          </View>
        </View>

        {/* Quick Tags */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>What did you like?</ThemedText>
          <View style={styles.tagsContainer}>
            {quickTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    { backgroundColor: isSelected ? colors.primary : colors.card },
                  ]}
                  onPress={() => toggleTag(tag)}
                >
                  <ThemedText
                    style={[styles.tagText, { color: isSelected ? '#FFF' : colors.text }]}
                  >
                    {tag}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Review Text */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Write Your Review</ThemedText>
          <TextInput
            style={[styles.reviewInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Share your experience with others..."
            placeholderTextColor={colors.textSecondary}
            value={reviewText}
            onChangeText={setReviewText}
            multiline
            numberOfLines={5}
          />
          <ThemedText style={[styles.charCount, { color: colors.textSecondary }]}>
            {reviewText.length}/500 characters
          </ThemedText>
        </View>

        {/* Would Recommend */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Would you recommend this provider?</ThemedText>
          <View style={styles.recommendContainer}>
            <TouchableOpacity
              style={[
                styles.recommendOption,
                { backgroundColor: colors.card },
                wouldRecommend === true && { backgroundColor: colors.success + '20', borderColor: colors.success },
              ]}
              onPress={() => setWouldRecommend(true)}
            >
              <Ionicons
                name={wouldRecommend === true ? 'thumbs-up' : 'thumbs-up-outline'}
                size={28}
                color={wouldRecommend === true ? colors.success : colors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.recommendText,
                  { color: wouldRecommend === true ? colors.success : colors.text }
                ]}
              >
                Yes!
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.recommendOption,
                { backgroundColor: colors.card },
                wouldRecommend === false && { backgroundColor: colors.error + '20', borderColor: colors.error },
              ]}
              onPress={() => setWouldRecommend(false)}
            >
              <Ionicons
                name={wouldRecommend === false ? 'thumbs-down' : 'thumbs-down-outline'}
                size={28}
                color={wouldRecommend === false ? colors.error : colors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.recommendText,
                  { color: wouldRecommend === false ? colors.error : colors.text }
                ]}
              >
                No
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tip Section */}
        <View style={styles.section}>
          <View style={styles.tipHeader}>
            <ThemedText style={styles.sectionTitle}>Add a Tip</ThemedText>
            <ThemedText style={[styles.tipNote, { color: colors.textSecondary }]}>
              (Optional)
            </ThemedText>
          </View>
          <LinearGradient
            colors={[colors.primary + '15', colors.primary + '05']}
            style={styles.tipCard}
          >
            <View style={styles.tipOptions}>
              {tipOptions.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipOption,
                    { backgroundColor: colors.card },
                    tipAmount === amount && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setTipAmount(amount)}
                >
                  <ThemedText
                    style={[
                      styles.tipAmount,
                      { color: tipAmount === amount ? '#FFF' : colors.text }
                    ]}
                  >
                    {amount === 0 ? 'No Tip' : `₹${amount}`}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            {tipAmount && tipAmount > 0 && (
              <View style={styles.tipMessage}>
                <Ionicons name="heart" size={16} color={colors.primary} />
                <ThemedText style={[styles.tipMessageText, { color: colors.textSecondary }]}>
                  Your tip goes 100% to {bookingDetails.provider.professional}
                </ThemedText>
              </View>
            )}
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.skipButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.skipButtonText}>Skip</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
        >
          <ThemedText style={styles.submitButtonText}>
            Submit Review{tipAmount && tipAmount > 0 ? ` + ₹${tipAmount} Tip` : ''}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.successModal, { backgroundColor: colors.card }]}>
            <View style={[styles.successIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={60} color={colors.success} />
            </View>
            <ThemedText style={styles.successTitle}>Thank You!</ThemedText>
            <ThemedText style={[styles.successText, { color: colors.textSecondary }]}>
              Your review has been submitted successfully. Your feedback helps us improve.
            </ThemedText>

            {tipAmount && tipAmount > 0 && (
              <View style={[styles.tipConfirmation, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="heart" size={20} color={colors.primary} />
                <ThemedText style={[styles.tipConfirmText, { color: colors.primary }]}>
                  Your ₹{tipAmount} tip has been sent to {bookingDetails.provider.professional}
                </ThemedText>
              </View>
            )}

            <View style={styles.rewardInfo}>
              <View style={[styles.rewardIcon, { backgroundColor: '#FFD700' + '20' }]}>
                <Ionicons name="star" size={24} color="#FFD700" />
              </View>
              <View style={styles.rewardContent}>
                <ThemedText style={styles.rewardTitle}>+50 Reward Points</ThemedText>
                <ThemedText style={[styles.rewardText, { color: colors.textSecondary }]}>
                  Added to your account
                </ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <ThemedText style={styles.doneButtonText}>Done</ThemedText>
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
  bookingCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {},
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingId: {
    fontSize: 13,
    marginBottom: 4,
  },
  completedAt: {
    fontSize: 13,
    fontWeight: '500',
  },
  completedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerCard: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  providerInfo: {
    marginLeft: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  businessName: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  categoriesCard: {
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewInput: {
    padding: 14,
    borderRadius: 14,
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
  },
  recommendContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  tipNote: {
    fontSize: 14,
  },
  tipCard: {
    padding: 16,
    borderRadius: 16,
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  tipOption: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tipAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  tipMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  tipMessageText: {
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    gap: 12,
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  tipConfirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  tipConfirmText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  rewardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardContent: {},
  rewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  rewardText: {
    fontSize: 13,
  },
  doneButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
