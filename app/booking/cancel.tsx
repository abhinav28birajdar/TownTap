import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CancellationReason {
  id: string;
  reason: string;
  refundPercentage: number;
}

const cancellationReasons: CancellationReason[] = [
  { id: '1', reason: 'Found a better option', refundPercentage: 100 },
  { id: '2', reason: 'Schedule conflict', refundPercentage: 100 },
  { id: '3', reason: 'Provider unresponsive', refundPercentage: 100 },
  { id: '4', reason: 'Service no longer needed', refundPercentage: 100 },
  { id: '5', reason: 'Emergency came up', refundPercentage: 100 },
  { id: '6', reason: 'Price concerns', refundPercentage: 90 },
  { id: '7', reason: 'Wrong service booked', refundPercentage: 100 },
  { id: '8', reason: 'Other', refundPercentage: 90 },
];

const bookingDetails = {
  id: 'BK-12345',
  service: 'Deep Home Cleaning',
  provider: 'CleanPro Services',
  scheduledDate: 'Dec 15, 2024',
  scheduledTime: '10:00 AM',
  address: 'Tower A, Flat 302, Green Valley Apartments',
  price: 2299,
  paymentMethod: 'UPI - **** 4589',
};

export default function CancelBookingScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalFeedback, setAdditionalFeedback] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getSelectedReason = () => {
    return cancellationReasons.find(r => r.id === selectedReason);
  };

  const calculateRefund = () => {
    const reason = getSelectedReason();
    if (!reason) return 0;
    return Math.round(bookingDetails.price * (reason.refundPercentage / 100));
  };

  const handleCancel = () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for cancellation.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmCancellation = () => {
    setShowConfirmModal(false);
    // Simulate API call
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Cancel Booking</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Warning Banner */}
        <LinearGradient
          colors={[colors.error + '20', colors.error + '08']}
          style={styles.warningBanner}
        >
          <View style={[styles.warningIcon, { backgroundColor: colors.error + '25' }]}>
            <Ionicons name="warning" size={24} color={colors.error} />
          </View>
          <View style={styles.warningContent}>
            <ThemedText style={[styles.warningTitle, { color: colors.error }]}>
              Are you sure you want to cancel?
            </ThemedText>
            <ThemedText style={[styles.warningText, { color: colors.textSecondary }]}>
              Cancellation may affect your future booking priority and rewards.
            </ThemedText>
          </View>
        </LinearGradient>

        {/* Booking Details */}
        <View style={[styles.bookingCard, { backgroundColor: colors.card }]}>
          <View style={styles.bookingHeader}>
            <View style={[styles.bookingIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="document-text" size={20} color={colors.primary} />
            </View>
            <View style={styles.bookingInfo}>
              <ThemedText style={styles.bookingLabel}>Booking Details</ThemedText>
              <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
                {bookingDetails.id}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Service</ThemedText>
            <ThemedText style={styles.detailValue}>{bookingDetails.service}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Provider</ThemedText>
            <ThemedText style={styles.detailValue}>{bookingDetails.provider}</ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Scheduled</ThemedText>
            <ThemedText style={styles.detailValue}>
              {bookingDetails.scheduledDate} at {bookingDetails.scheduledTime}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount Paid</ThemedText>
            <ThemedText style={[styles.detailValue, { color: colors.primary, fontWeight: '700' }]}>
              ₹{bookingDetails.price}
            </ThemedText>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={[styles.policyCard, { backgroundColor: colors.info + '10' }]}>
          <View style={styles.policyHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.info} />
            <ThemedText style={[styles.policyTitle, { color: colors.info }]}>
              Cancellation Policy
            </ThemedText>
          </View>
          <View style={styles.policyList}>
            <View style={styles.policyItem}>
              <View style={[styles.policyDot, { backgroundColor: colors.success }]} />
              <ThemedText style={styles.policyText}>
                <ThemedText style={{ fontWeight: '600' }}>24+ hours before: </ThemedText>
                100% refund
              </ThemedText>
            </View>
            <View style={styles.policyItem}>
              <View style={[styles.policyDot, { backgroundColor: colors.warning }]} />
              <ThemedText style={styles.policyText}>
                <ThemedText style={{ fontWeight: '600' }}>12-24 hours before: </ThemedText>
                90% refund
              </ThemedText>
            </View>
            <View style={styles.policyItem}>
              <View style={[styles.policyDot, { backgroundColor: colors.error }]} />
              <ThemedText style={styles.policyText}>
                <ThemedText style={{ fontWeight: '600' }}>Less than 12 hours: </ThemedText>
                50% refund
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Why are you cancelling?</ThemedText>
          <View style={styles.reasonsList}>
            {cancellationReasons.map((item) => {
              const isSelected = selectedReason === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.reasonOption,
                    { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
                  ]}
                  onPress={() => setSelectedReason(item.id)}
                >
                  <View style={[
                    styles.radioOuter,
                    { borderColor: isSelected ? colors.primary : colors.border }
                  ]}>
                    {isSelected && (
                      <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <ThemedText style={styles.reasonText}>{item.reason}</ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Additional Feedback */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Feedback (Optional)</ThemedText>
          <TextInput
            style={[styles.feedbackInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Tell us more about your experience..."
            placeholderTextColor={colors.textSecondary}
            value={additionalFeedback}
            onChangeText={setAdditionalFeedback}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Refund Summary */}
        {selectedReason && (
          <View style={[styles.refundCard, { backgroundColor: colors.success + '10' }]}>
            <LinearGradient
              colors={[colors.success + '15', colors.success + '05']}
              style={styles.refundGradient}
            >
              <View style={styles.refundHeader}>
                <Ionicons name="wallet" size={24} color={colors.success} />
                <ThemedText style={[styles.refundTitle, { color: colors.success }]}>
                  Refund Summary
                </ThemedText>
              </View>
              <View style={styles.refundRow}>
                <ThemedText style={[styles.refundLabel, { color: colors.textSecondary }]}>
                  Original Amount
                </ThemedText>
                <ThemedText style={styles.refundValue}>₹{bookingDetails.price}</ThemedText>
              </View>
              <View style={styles.refundRow}>
                <ThemedText style={[styles.refundLabel, { color: colors.textSecondary }]}>
                  Refund Rate
                </ThemedText>
                <ThemedText style={[styles.refundValue, { color: colors.success }]}>
                  {getSelectedReason()?.refundPercentage}%
                </ThemedText>
              </View>
              <View style={[styles.refundTotalRow, { borderTopColor: colors.border }]}>
                <ThemedText style={styles.refundTotalLabel}>You'll Receive</ThemedText>
                <ThemedText style={[styles.refundTotalValue, { color: colors.success }]}>
                  ₹{calculateRefund()}
                </ThemedText>
              </View>
              <View style={styles.refundNote}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <ThemedText style={[styles.refundNoteText, { color: colors.textSecondary }]}>
                  Refund will be processed within 3-5 business days to {bookingDetails.paymentMethod}
                </ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Alternative Suggestions */}
        <View style={[styles.alternativeCard, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.alternativeTitle}>Before you cancel...</ThemedText>
          <TouchableOpacity
            style={[styles.alternativeOption, { backgroundColor: colors.background }]}
            onPress={() => router.push('/booking/reschedule')}
          >
            <View style={[styles.alternativeIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.alternativeInfo}>
              <ThemedText style={styles.alternativeOptionTitle}>Reschedule Instead</ThemedText>
              <ThemedText style={[styles.alternativeOptionText, { color: colors.textSecondary }]}>
                Change your booking date/time without cancelling
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.alternativeOption, { backgroundColor: colors.background }]}>
            <View style={[styles.alternativeIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color={colors.info} />
            </View>
            <View style={styles.alternativeInfo}>
              <ThemedText style={styles.alternativeOptionTitle}>Contact Support</ThemedText>
              <ThemedText style={[styles.alternativeOptionText, { color: colors.textSecondary }]}>
                We can help resolve any issues
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.keepButton, { borderColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <ThemedText style={[styles.keepButtonText, { color: colors.primary }]}>Keep Booking</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.cancelBookingButton,
            { backgroundColor: colors.error },
            !selectedReason && { opacity: 0.5 }
          ]}
          onPress={handleCancel}
          disabled={!selectedReason}
        >
          <ThemedText style={styles.cancelBookingButtonText}>Cancel Booking</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Confirm Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: colors.card }]}>
            <View style={[styles.confirmIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="close-circle" size={48} color={colors.error} />
            </View>
            <ThemedText style={styles.confirmTitle}>Cancel Booking?</ThemedText>
            <ThemedText style={[styles.confirmText, { color: colors.textSecondary }]}>
              This action cannot be undone. You will receive a refund of{' '}
              <ThemedText style={{ fontWeight: '700', color: colors.success }}>
                ₹{calculateRefund()}
              </ThemedText>
              {' '}to your original payment method.
            </ThemedText>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmGoBackBtn, { borderColor: colors.border }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText style={styles.confirmGoBackText}>Go Back</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmCancelBtn, { backgroundColor: colors.error }]}
                onPress={confirmCancellation}
              >
                <ThemedText style={styles.confirmCancelText}>Yes, Cancel</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
            <ThemedText style={styles.successTitle}>Booking Cancelled</ThemedText>
            <ThemedText style={[styles.successText, { color: colors.textSecondary }]}>
              Your booking has been successfully cancelled.
            </ThemedText>
            <View style={[styles.refundInfo, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.refundInfoLabel, { color: colors.textSecondary }]}>
                Refund Amount
              </ThemedText>
              <ThemedText style={[styles.refundInfoAmount, { color: colors.success }]}>
                ₹{calculateRefund()}
              </ThemedText>
              <ThemedText style={[styles.refundInfoNote, { color: colors.textSecondary }]}>
                Will be credited in 3-5 business days
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(tabs)/orders');
              }}
            >
              <ThemedText style={styles.successButtonText}>Done</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bookAgainLink}>
              <ThemedText style={[styles.bookAgainText, { color: colors.primary }]}>
                Book Another Service
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
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  warningIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bookingCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    marginLeft: 12,
  },
  bookingLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookingId: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  policyCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  policyList: {
    gap: 8,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  policyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  policyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  reasonsList: {
    gap: 10,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  reasonText: {
    fontSize: 15,
  },
  feedbackInput: {
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  refundCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  refundGradient: {
    padding: 16,
  },
  refundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  refundTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refundLabel: {
    fontSize: 14,
  },
  refundValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  refundTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  refundTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  refundTotalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  refundNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  refundNoteText: {
    flex: 1,
    fontSize: 12,
  },
  alternativeCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  alternativeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  alternativeIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternativeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alternativeOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  alternativeOptionText: {
    fontSize: 12,
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
  keepButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  keepButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  cancelBookingButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBookingButtonText: {
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
  confirmModal: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  confirmText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmGoBackBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  confirmGoBackText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmCancelText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  refundInfo: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  refundInfoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  refundInfoAmount: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  refundInfoNote: {
    fontSize: 12,
  },
  successButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookAgainLink: {
    padding: 8,
  },
  bookAgainText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
