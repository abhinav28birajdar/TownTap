import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomerOrderDetailScreen() {
  const colors = useColors();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  // This would come from route params in real app
  const orderDetails = {
    id: '1',
    serviceName: 'Plumbing Repair',
    businessName: 'QuickFix Plumbers',
    date: '2025-12-15',
    time: '10:00 AM',
    status: 'completed',
    amount: 550,
    address: '123 Main Street, Apt 4B',
    providerName: 'John Smith',
    providerPhone: '+1 234 567 8900',
    description: 'Kitchen sink leak repair and pipe replacement',
    rating: 5,
  };

  const handleSubmitReview = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    Alert.alert(
      'Review Submitted',
      'Thank you for your feedback!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCallProvider = () => {
    Alert.alert('Call Provider', `Call ${orderDetails.providerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => console.log('Calling provider') },
    ]);
  };

  const handleMessageProvider = () => {
    router.push(`/messages/chat/${orderDetails.id}` as any);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#FF9800';
      case 'completed':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          style={[styles.statusCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.statusHeader}>
            <ThemedText style={styles.orderNumber}>Order #{orderDetails.id}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(orderDetails.status) + '20' }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(orderDetails.status) }]}>
                {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Service Details */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.detailCard, { backgroundColor: colors.card }]}
        >
          <ThemedText style={styles.sectionTitle}>Service Details</ThemedText>
          <View style={styles.detailRow}>
            <Ionicons name="construct" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Service</ThemedText>
              <ThemedText style={styles.detailValue}>{orderDetails.serviceName}</ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="business" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Provider</ThemedText>
              <ThemedText style={styles.detailValue}>{orderDetails.businessName}</ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Date & Time</ThemedText>
              <ThemedText style={styles.detailValue}>
                {orderDetails.date} at {orderDetails.time}
              </ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Address</ThemedText>
              <ThemedText style={styles.detailValue}>{orderDetails.address}</ThemedText>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="document-text" size={20} color={colors.primary} />
            <View style={styles.detailContent}>
              <ThemedText style={styles.detailLabel}>Description</ThemedText>
              <ThemedText style={styles.detailValue}>{orderDetails.description}</ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Provider Contact */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          style={[styles.detailCard, { backgroundColor: colors.card }]}
        >
          <ThemedText style={styles.sectionTitle}>Provider Contact</ThemedText>
          <View style={styles.contactRow}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.providerName}>{orderDetails.providerName}</ThemedText>
                <ThemedText style={styles.providerPhone}>{orderDetails.providerPhone}</ThemedText>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary }]}
                onPress={handleCallProvider}
              >
                <Ionicons name="call" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary }]}
                onPress={handleMessageProvider}
              >
                <Ionicons name="chatbubble" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Payment Details */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          style={[styles.detailCard, { backgroundColor: colors.card }]}
        >
          <ThemedText style={styles.sectionTitle}>Payment Details</ThemedText>
          <View style={styles.paymentRow}>
            <ThemedText style={styles.paymentLabel}>Service Charge</ThemedText>
            <ThemedText style={styles.paymentValue}>₹{orderDetails.amount}</ThemedText>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.paymentRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={[styles.totalValue, { color: colors.primary }]}>
              ₹{orderDetails.amount}
            </ThemedText>
          </View>
        </Animated.View>

        {/* Rating & Review (for completed orders) */}
        {orderDetails.status === 'completed' && (
          <Animated.View
            entering={FadeInDown.delay(500)}
            style={[styles.detailCard, { backgroundColor: colors.card }]}
          >
            <ThemedText style={styles.sectionTitle}>Rate Your Experience</ThemedText>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color="#FFC107"
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[
                styles.reviewInput,
                { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Write your review..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              value={review}
              onChangeText={setReview}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmitReview}
            >
              <ThemedText style={styles.submitButtonText}>Submit Review</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 20 }} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  statusCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerPhone: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    marginHorizontal: 4,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
