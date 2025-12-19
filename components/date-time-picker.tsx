/**
 * Simple Date Picker Component
 * A basic date picker that works without native modules
 */

import { useColors } from '@/contexts/theme-context';
import React, { useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DateTimePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock';
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (event: any, date?: Date) => void;
}

export default function DateTimePicker({
  value,
  mode = 'date',
  minimumDate,
  maximumDate,
  onChange,
}: DateTimePickerProps) {
  const colors = useColors();
  const [showModal, setShowModal] = useState(true);
  const [selectedDate, setSelectedDate] = useState(value);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateDays = () => {
    const days = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isDisabled = 
        (minimumDate && date < minimumDate) || 
        (maximumDate && date > maximumDate);
      
      days.push({
        day: i,
        date,
        isDisabled,
        isSelected: selectedDate.getDate() === i,
      });
    }
    return days;
  };

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    onChange({ type: 'set' }, date);
    setShowModal(false);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleCancel = () => {
    onChange({ type: 'dismissed' }, undefined);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Text style={[styles.navButton, { color: colors.primary }]}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={[styles.monthYear, { color: colors.text }]}>
              {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Text style={[styles.navButton, { color: colors.primary }]}>{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.weekDays}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={[styles.weekDay, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.daysContainer}>
            {generateDays().map(({ day, date, isDisabled, isSelected }) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayButton,
                  isSelected && { backgroundColor: colors.primary },
                  isDisabled && styles.disabledDay,
                ]}
                onPress={() => !isDisabled && handleDayPress(date)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    isSelected && { color: '#FFF' },
                    isDisabled && { color: colors.textTertiary },
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
              <Text style={[styles.actionText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDayPress(selectedDate)}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.actionText, { color: '#FFF' }]}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 350,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    fontSize: 24,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  disabledDay: {
    opacity: 0.4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
