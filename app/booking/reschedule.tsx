import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  slots: number;
}

interface DateOption {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
}

const timeSlots: TimeSlot[] = [
  { id: '1', time: '08:00 AM', available: true, slots: 3 },
  { id: '2', time: '09:00 AM', available: true, slots: 2 },
  { id: '3', time: '10:00 AM', available: false, slots: 0 },
  { id: '4', time: '11:00 AM', available: true, slots: 5 },
  { id: '5', time: '12:00 PM', available: true, slots: 4 },
  { id: '6', time: '01:00 PM', available: true, slots: 3 },
  { id: '7', time: '02:00 PM', available: false, slots: 0 },
  { id: '8', time: '03:00 PM', available: true, slots: 2 },
  { id: '9', time: '04:00 PM', available: true, slots: 1 },
  { id: '10', time: '05:00 PM', available: true, slots: 3 },
  { id: '11', time: '06:00 PM', available: true, slots: 2 },
];

const rescheduleReasons = [
  { id: '1', reason: 'Schedule conflict' },
  { id: '2', reason: 'Emergency came up' },
  { id: '3', reason: 'Provider unavailable' },
  { id: '4', reason: 'Weather conditions' },
  { id: '5', reason: 'Personal reasons' },
  { id: '6', reason: 'Other' },
];

const bookingDetails = {
  id: 'BK-12345',
  service: 'Deep Home Cleaning',
  provider: 'CleanPro Services',
  originalDate: 'Dec 15, 2024',
  originalTime: '10:00 AM',
  address: 'Tower A, Flat 302, Green Valley Apartments',
  price: 2299,
};

export default function RescheduleScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Generate dates for next 14 days starting from tomorrow
  const getDateOptions = (): DateOption[] => {
    const dates: DateOption[] = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    return dates;
  };

  const dateOptions = getDateOptions();

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSelectedTime = () => {
    const slot = timeSlots.find(s => s.id === selectedSlot);
    return slot?.time || '';
  };

  const handleReschedule = () => {
    if (!selectedDate || !selectedSlot || !selectedReason) {
      Alert.alert('Missing Information', 'Please select a new date, time, and reason for rescheduling.');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmReschedule = () => {
    setShowConfirmModal(false);
    // Simulate API call
    setTimeout(() => {
      setShowSuccessModal(true);
    }, 500);
  };

  const renderDateOption = ({ item }: { item: DateOption }) => {
    const isSelected = selectedDate?.toDateString() === item.date.toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.dateCard,
          { backgroundColor: isSelected ? colors.primary : colors.card },
        ]}
        onPress={() => setSelectedDate(item.date)}
      >
        <ThemedText style={[styles.dayName, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
          {item.dayName}
        </ThemedText>
        <ThemedText style={[styles.dayNumber, { color: isSelected ? '#FFF' : colors.text }]}>
          {item.dayNumber}
        </ThemedText>
        <ThemedText style={[styles.monthName, { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
          {item.monthName}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Reschedule Booking</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Current Booking Info */}
        <View style={[styles.currentBookingCard, { backgroundColor: colors.card }]}>
          <View style={styles.bookingHeader}>
            <View style={[styles.bookingIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="calendar" size={20} color={colors.warning} />
            </View>
            <View style={styles.bookingInfo}>
              <ThemedText style={styles.bookingLabel}>Current Booking</ThemedText>
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
            <ThemedText style={[styles.detailValue, { color: colors.error }]}>
              {bookingDetails.originalDate} at {bookingDetails.originalTime}
            </ThemedText>
          </View>
        </View>

        {/* Reschedule Notice */}
        <View style={[styles.noticeCard, { backgroundColor: colors.info + '15' }]}>
          <Ionicons name="information-circle" size={22} color={colors.info} />
          <ThemedText style={[styles.noticeText, { color: colors.info }]}>
            Free rescheduling available up to 24 hours before the appointment. Charges may apply for last-minute changes.
          </ThemedText>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select New Date</ThemedText>
          <FlatList
            data={dateOptions}
            renderItem={renderDateOption}
            keyExtractor={(item) => item.date.toISOString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesList}
          />
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select New Time Slot</ThemedText>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    { backgroundColor: colors.card },
                    !slot.available && { opacity: 0.5 },
                    isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => slot.available && setSelectedSlot(slot.id)}
                  disabled={!slot.available}
                >
                  <ThemedText style={[
                    styles.slotTime,
                    { color: isSelected ? '#FFF' : colors.text },
                    !slot.available && { color: colors.textSecondary }
                  ]}>
                    {slot.time}
                  </ThemedText>
                  <ThemedText style={[
                    styles.slotAvailability,
                    { color: isSelected ? 'rgba(255,255,255,0.8)' : slot.available ? colors.success : colors.error }
                  ]}>
                    {slot.available ? `${slot.slots} slots` : 'Full'}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reason Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Reason for Rescheduling</ThemedText>
          <View style={styles.reasonsList}>
            {rescheduleReasons.map((item) => {
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

        {/* Additional Notes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Notes (Optional)</ThemedText>
          <TextInput
            style={[styles.notesInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Any additional information..."
            placeholderTextColor={colors.textSecondary}
            value={additionalNotes}
            onChangeText={setAdditionalNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* New Schedule Summary */}
        {selectedDate && selectedSlot && (
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '10' }]}>
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '05']}
              style={styles.summaryGradient}
            >
              <View style={styles.summaryHeader}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                <ThemedText style={[styles.summaryTitle, { color: colors.primary }]}>
                  New Schedule
                </ThemedText>
              </View>
              <ThemedText style={styles.summaryDate}>{formatSelectedDate()}</ThemedText>
              <ThemedText style={[styles.summaryTime, { color: colors.textSecondary }]}>
                at {getSelectedTime()}
              </ThemedText>
            </LinearGradient>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rescheduleButton,
            { backgroundColor: colors.primary },
            (!selectedDate || !selectedSlot || !selectedReason) && { opacity: 0.5 }
          ]}
          onPress={handleReschedule}
          disabled={!selectedDate || !selectedSlot || !selectedReason}
        >
          <ThemedText style={styles.rescheduleButtonText}>Reschedule</ThemedText>
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
            <View style={[styles.confirmIcon, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="calendar-outline" size={40} color={colors.warning} />
            </View>
            <ThemedText style={styles.confirmTitle}>Confirm Reschedule</ThemedText>
            <ThemedText style={[styles.confirmText, { color: colors.textSecondary }]}>
              Are you sure you want to reschedule your booking to:
            </ThemedText>
            <View style={[styles.confirmDetails, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.confirmDate}>{formatSelectedDate()}</ThemedText>
              <ThemedText style={[styles.confirmTime, { color: colors.primary }]}>
                {getSelectedTime()}
              </ThemedText>
            </View>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText style={styles.confirmCancelText}>Go Back</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                onPress={confirmReschedule}
              >
                <ThemedText style={styles.confirmBtnText}>Confirm</ThemedText>
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
            <ThemedText style={styles.successTitle}>Rescheduled!</ThemedText>
            <ThemedText style={[styles.successText, { color: colors.textSecondary }]}>
              Your booking has been successfully rescheduled to:
            </ThemedText>
            <View style={[styles.successDetails, { backgroundColor: colors.background }]}>
              <ThemedText style={styles.successDate}>{formatSelectedDate()}</ThemedText>
              <ThemedText style={[styles.successTime, { color: colors.primary }]}>
                {getSelectedTime()}
              </ThemedText>
            </View>
            <ThemedText style={[styles.successNote, { color: colors.textSecondary }]}>
              A confirmation has been sent to your email and phone.
            </ThemedText>
            <TouchableOpacity
              style={[styles.successButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setShowSuccessModal(false);
                router.back();
              }}
            >
              <ThemedText style={styles.successButtonText}>Done</ThemedText>
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
  currentBookingCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
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
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  datesList: {
    gap: 10,
  },
  dateCard: {
    width: 70,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  dayName: {
    fontSize: 11,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 11,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: (width - 52) / 3,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotAvailability: {
    fontSize: 10,
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
  notesInput: {
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  summaryCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryGradient: {
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  summaryDate: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryTime: {
    fontSize: 14,
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
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  rescheduleButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  rescheduleButtonText: {
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
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmDetails: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  confirmTime: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  successDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  successDate: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  successTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  successNote: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  successButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
