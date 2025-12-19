import DateTimePicker from '@/components/date-time-picker';
import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface RecurrenceOption {
  id: string;
  label: string;
  description: string;
}

const timeSlots: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '10:00 AM', available: true },
  { id: '3', time: '11:00 AM', available: false },
  { id: '4', time: '12:00 PM', available: true },
  { id: '5', time: '01:00 PM', available: true },
  { id: '6', time: '02:00 PM', available: true },
  { id: '7', time: '03:00 PM', available: false },
  { id: '8', time: '04:00 PM', available: true },
  { id: '9', time: '05:00 PM', available: true },
  { id: '10', time: '06:00 PM', available: true },
];

const recurrenceOptions: RecurrenceOption[] = [
  { id: 'once', label: 'One Time', description: 'Book for a single day' },
  { id: 'daily', label: 'Daily', description: 'Repeat every day' },
  { id: 'weekly', label: 'Weekly', description: 'Same day every week' },
  { id: 'biweekly', label: 'Bi-Weekly', description: 'Every two weeks' },
  { id: 'monthly', label: 'Monthly', description: 'Same date every month' },
];

export default function ScheduleBookingScreen() {
  const colors = useColors();
  const { serviceId, businessId } = useLocalSearchParams<{
    serviceId?: string;
    businessId?: string;
  }>();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState('once');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [notes, setNotes] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(false);
    if (date) {
      setEndDate(date);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysFromNow = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const getRecurrenceCount = () => {
    if (recurrence === 'once' || !endDate) return 1;
    
    const start = new Date(selectedDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    switch (recurrence) {
      case 'daily': return diffDays + 1;
      case 'weekly': return Math.floor(diffDays / 7) + 1;
      case 'biweekly': return Math.floor(diffDays / 14) + 1;
      case 'monthly': return Math.floor(diffDays / 30) + 1;
      default: return 1;
    }
  };

  const handleContinue = () => {
    if (!selectedTime) {
      Alert.alert('Select Time', 'Please select a time slot to continue');
      return;
    }
    
    if (recurrence !== 'once' && !endDate) {
      Alert.alert('Select End Date', 'Please select an end date for recurring bookings');
      return;
    }
    
    router.push({
      pathname: '/booking/form',
      params: {
        serviceId,
        businessId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        recurrence,
        endDate: endDate?.toISOString(),
        notes,
        isFlexible: isFlexible ? 'true' : 'false',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Schedule Booking</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
          
          <TouchableOpacity
            style={[styles.dateSelector, { backgroundColor: colors.card }]}
            onPress={() => setShowDatePicker(true)}
          >
            <View style={[styles.dateIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="calendar" size={24} color={colors.primary} />
            </View>
            <View style={styles.dateInfo}>
              <ThemedText style={styles.selectedDate}>{formatDate(selectedDate)}</ThemedText>
              <ThemedText style={[styles.daysFromNow, { color: colors.success }]}>
                {getDaysFromNow(selectedDate)}
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          {/* Quick Date Selection */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.quickDates}
            contentContainerStyle={styles.quickDatesContent}
          >
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.quickDateCard,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <ThemedText style={[
                    styles.quickDateDay,
                    { color: isSelected ? '#FFF' : colors.textSecondary }
                  ]}>
                    {date.toLocaleDateString('en-IN', { weekday: 'short' })}
                  </ThemedText>
                  <ThemedText style={[
                    styles.quickDateNum,
                    { color: isSelected ? '#FFF' : colors.text }
                  ]}>
                    {date.getDate()}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Select Time</ThemedText>
            <TouchableOpacity
              style={styles.flexibleToggle}
              onPress={() => setIsFlexible(!isFlexible)}
            >
              <View style={[
                styles.checkbox,
                {
                  backgroundColor: isFlexible ? colors.primary : 'transparent',
                  borderColor: isFlexible ? colors.primary : colors.border,
                }
              ]}>
                {isFlexible && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <ThemedText style={[styles.flexibleText, { color: colors.textSecondary }]}>
                I'm flexible
              </ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  {
                    backgroundColor: !slot.available
                      ? colors.border + '50'
                      : selectedTime === slot.time
                      ? colors.primary
                      : colors.card,
                    borderColor: selectedTime === slot.time ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => slot.available && setSelectedTime(slot.time)}
                disabled={!slot.available}
              >
                <ThemedText style={[
                  styles.timeText,
                  {
                    color: !slot.available
                      ? colors.textSecondary
                      : selectedTime === slot.time
                      ? '#FFF'
                      : colors.text,
                  }
                ]}>
                  {slot.time}
                </ThemedText>
                {!slot.available && (
                  <ThemedText style={[styles.unavailableText, { color: colors.error }]}>
                    Unavailable
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recurrence Options */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Frequency</ThemedText>
          
          <View style={styles.recurrenceList}>
            {recurrenceOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.recurrenceOption,
                  {
                    backgroundColor: colors.card,
                    borderColor: recurrence === option.id ? colors.primary : 'transparent',
                    borderWidth: recurrence === option.id ? 2 : 0,
                  },
                ]}
                onPress={() => setRecurrence(option.id)}
              >
                <View style={[
                  styles.radioButton,
                  {
                    borderColor: recurrence === option.id ? colors.primary : colors.border,
                  }
                ]}>
                  {recurrence === option.id && (
                    <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={styles.recurrenceInfo}>
                  <ThemedText style={styles.recurrenceLabel}>{option.label}</ThemedText>
                  <ThemedText style={[styles.recurrenceDesc, { color: colors.textSecondary }]}>
                    {option.description}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* End Date for Recurring */}
          {recurrence !== 'once' && (
            <TouchableOpacity
              style={[styles.endDateSelector, { backgroundColor: colors.card }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <View style={styles.endDateInfo}>
                <ThemedText style={[styles.endDateLabel, { color: colors.textSecondary }]}>
                  End Date
                </ThemedText>
                <ThemedText style={styles.endDateValue}>
                  {endDate ? formatDate(endDate) : 'Select end date'}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              minimumDate={selectedDate}
              onChange={handleEndDateChange}
            />
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Notes</ThemedText>
          <TextInput
            style={[styles.notesInput, {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            }]}
            placeholder="Any special instructions or requirements..."
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Summary */}
        {recurrence !== 'once' && endDate && (
          <View style={[styles.summaryCard, { backgroundColor: colors.primary + '10' }]}>
            <Ionicons name="repeat" size={24} color={colors.primary} />
            <View style={styles.summaryContent}>
              <ThemedText style={[styles.summaryTitle, { color: colors.primary }]}>
                {getRecurrenceCount()} Bookings
              </ThemedText>
              <ThemedText style={[styles.summaryDesc, { color: colors.textSecondary }]}>
                {recurrence.charAt(0).toUpperCase() + recurrence.slice(1)} from{' '}
                {formatDate(selectedDate)} to {formatDate(endDate)}
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      <View style={[styles.bottomAction, { backgroundColor: colors.card }]}>
        <View style={styles.selectedInfo}>
          <ThemedText style={[styles.selectedLabel, { color: colors.textSecondary }]}>
            Selected
          </ThemedText>
          <ThemedText style={styles.selectedValue}>
            {formatDate(selectedDate)} • {selectedTime || 'No time selected'}
          </ThemedText>
        </View>
        
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: selectedTime ? colors.primary : colors.border }
          ]}
          onPress={handleContinue}
          disabled={!selectedTime}
        >
          <ThemedText style={styles.continueButtonText}>Continue</ThemedText>
          <Ionicons name="arrow-forward" size={18} color="#FFF" />
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
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  dateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {
    flex: 1,
    marginLeft: 14,
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  daysFromNow: {
    fontSize: 13,
  },
  quickDates: {
    marginTop: 16,
  },
  quickDatesContent: {
    gap: 10,
  },
  quickDateCard: {
    width: 56,
    height: 70,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickDateDay: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 6,
  },
  quickDateNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  flexibleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexibleText: {
    fontSize: 13,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: '31%',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  unavailableText: {
    fontSize: 10,
    marginTop: 4,
  },
  recurrenceList: {
    gap: 10,
  },
  recurrenceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recurrenceInfo: {
    marginLeft: 14,
  },
  recurrenceLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  recurrenceDesc: {
    fontSize: 12,
  },
  endDateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
  },
  endDateInfo: {
    flex: 1,
  },
  endDateLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  endDateValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    gap: 14,
    marginBottom: 100,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryDesc: {
    fontSize: 13,
  },
  bottomAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedInfo: {},
  selectedLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  selectedValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
