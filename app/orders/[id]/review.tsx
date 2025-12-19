import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReviewData {
  businessId: string;
  businessName: string;
  businessImage: string;
  serviceName: string;
  rating: number;
  review: string;
  photos: string[];
}

export default function RateReviewScreen() {
  const params = useLocalSearchParams<{ orderId: string; businessId: string }>();
  const colors = useColors();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data - replace with actual data
  const orderDetails = {
    businessName: 'Cool Tech Services',
    businessImage: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
    serviceName: 'AC Repair & Service',
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  const handlePhotoUpload = () => {
    // Implement photo picker
    console.log('Upload photo');
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    
    // Navigate to success or back
    router.replace({
      pathname: '/orders',
      params: { reviewed: 'true' },
    });
  };

  const handleSkip = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Rate & Review</ThemedText>
        <TouchableOpacity onPress={handleSkip}>
          <ThemedText style={[styles.skipText, { color: colors.textSecondary }]}>Skip</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Info */}
        <View style={styles.businessSection}>
          <Image
            source={{ uri: orderDetails.businessImage }}
            style={styles.businessImage}
          />
          <ThemedText style={styles.businessName}>{orderDetails.businessName}</ThemedText>
          <ThemedText style={[styles.serviceName, { color: colors.textSecondary }]}>
            {orderDetails.serviceName}
          </ThemedText>
        </View>

        {/* Rating Section */}
        <View style={[styles.ratingSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.ratingLabel}>How was your experience?</ThemedText>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={42}
                  color={rating >= star ? '#FFB800' : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          {rating > 0 && (
            <View style={[styles.ratingBadge, { backgroundColor: colors.primary + '15' }]}>
              <ThemedText style={[styles.ratingText, { color: colors.primary }]}>
                {ratingLabels[rating]}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Review Section */}
        <View style={[styles.reviewSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.reviewLabel}>Tell us more (optional)</ThemedText>
          <ThemedText style={[styles.reviewHint, { color: colors.textSecondary }]}>
            Share details of your experience with this service
          </ThemedText>
          
          <TextInput
            style={[
              styles.reviewInput,
              { 
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.background,
              },
            ]}
            placeholder="What did you like or dislike? How was the service quality?"
            placeholderTextColor={colors.textSecondary}
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={500}
          />
          
          <ThemedText style={[styles.charCount, { color: colors.textSecondary }]}>
            {review.length}/500
          </ThemedText>
        </View>

        {/* Photo Upload Section */}
        <View style={[styles.photoSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.photoLabel}>Add Photos (optional)</ThemedText>
          <ThemedText style={[styles.photoHint, { color: colors.textSecondary }]}>
            Share photos of the completed work
          </ThemedText>
          
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photoThumbnail} />
                <TouchableOpacity
                  style={[styles.removePhoto, { backgroundColor: colors.error }]}
                  onPress={() => removePhoto(index)}
                >
                  <Ionicons name="close" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
            
            {photos.length < 5 && (
              <TouchableOpacity
                style={[styles.addPhotoButton, { borderColor: colors.border }]}
                onPress={handlePhotoUpload}
              >
                <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                <ThemedText style={[styles.addPhotoText, { color: colors.textSecondary }]}>
                  Add
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsSection, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="bulb-outline" size={20} color={colors.primary} />
          <View style={styles.tipsContent}>
            <ThemedText style={[styles.tipsTitle, { color: colors.primary }]}>
              Tips for a helpful review
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Mention specific aspects of the service
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Share if the provider was punctual and professional
            </ThemedText>
            <ThemedText style={[styles.tipText, { color: colors.textSecondary }]}>
              • Rate based on quality and value for money
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.bottomSection, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: rating > 0 ? colors.primary : colors.border },
          ]}
          onPress={handleSubmit}
          disabled={rating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={20} color="#FFF" />
              <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  skipText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  businessSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  businessImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    backgroundColor: '#E0E0E0',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
  },
  ratingSection: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewHint: {
    fontSize: 14,
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    height: 120,
    fontSize: 15,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  photoSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  photoHint: {
    fontSize: 14,
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    marginTop: 4,
  },
  tipsSection: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
