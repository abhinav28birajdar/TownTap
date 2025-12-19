import { ThemedButton, ThemedText } from '@/components/ui';
import { Spacing } from '@/constants/spacing';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface Appointment {
  id: string;
  customerName: string;
  serviceName: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  customerAvatar?: string;
}

export default function BusinessCalendarScreen() {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      customerName: 'John Doe',
      serviceName: 'Haircut',
      time: '10:00 AM',
      status: 'confirmed',
    },
    {
      id: '2',
      customerName: 'Jane Smith',
      serviceName: 'Hair Coloring',
      time: '2:00 PM',
      status: 'pending',
    },
    {
      id: '3',
      customerName: 'Mike Johnson',
      serviceName: 'Beard Trim',
      time: '4:30 PM',
      status: 'confirmed',
    },
  ]);

  // Generate days for current month
  const generateCalendarDays = () => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const changeMonth = (direction: 1 | -1) => {
    const date = new Date(selectedDate);
    date.setMonth(date.getMonth() + direction);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleDayPress = (day: number) => {
    if (!day) return;
    const date = new Date(selectedDate);
    date.setDate(day);
    setSelectedDate(date.toISOString().split('T')[0]);
    // TODO: Load appointments for selected date
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'completed':
        return colors.primary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textTertiary;
    }
  };

  const handleAppointmentAction = (appointmentId: string, action: 'confirm' | 'cancel' | 'complete') => {
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${action} this appointment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            // TODO: Implement appointment status update
            Alert.alert('Success', `Appointment ${action}ed successfully`);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="h2" weight="bold">
            Calendar & Schedule
          </ThemedText>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => Alert.alert('Info', 'Add appointment coming soon')}
          >
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
          {/* Month Header */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <ThemedText type="h3" weight="bold">
              {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </ThemedText>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Weekday Headers */}
          <View style={styles.weekdayRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <View key={day} style={styles.weekdayCell}>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                  {day}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysContainer}>
            {generateCalendarDays().map((day, index) => {
              const isSelected = day === new Date(selectedDate).getDate();
              const isToday = day === new Date().getDate() && 
                new Date(selectedDate).getMonth() === new Date().getMonth();
              
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: colors.primary },
                    isToday && !isSelected && { borderWidth: 2, borderColor: colors.primary },
                  ]}
                  onPress={() => handleDayPress(day as number)}
                  disabled={!day}
                >
                  {day && (
                    <ThemedText
                      style={{
                        color: isSelected ? '#fff' : colors.text,
                        fontWeight: isSelected || isToday ? '700' : '500',
                      }}
                    >
                      {day}
                    </ThemedText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Appointments for Selected Date */}
        <View style={styles.appointmentsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h3" weight="bold">
              Appointments on {new Date(selectedDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
              })}
            </ThemedText>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <ThemedText style={[styles.badgeText, { color: '#fff' }]}>
                {appointments.length}
              </ThemedText>
            </View>
          </View>

          {appointments.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.muted }]}>
              <Ionicons name="calendar-outline" size={60} color={colors.textTertiary} />
              <ThemedText style={styles.emptyText}>No appointments for this date</ThemedText>
              <ThemedButton
                title="Add Appointment"
                onPress={() => Alert.alert('Info', 'Add appointment coming soon')}
                style={styles.emptyButton}
              />
            </View>
          ) : (
            appointments.map((appointment) => (
              <View
                key={appointment.id}
                style={[styles.appointmentCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.customerInfo}>
                    <View
                      style={[
                        styles.customerAvatar,
                        { backgroundColor: colors.primary + '20' },
                      ]}
                    >
                      <Ionicons name="person" size={24} color={colors.primary} />
                    </View>
                    <View style={styles.customerDetails}>
                      <ThemedText weight="bold">{appointment.customerName}</ThemedText>
                      <ThemedText style={styles.serviceName}>
                        {appointment.serviceName}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(appointment.status) + '20' },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.statusText,
                        { color: getStatusColor(appointment.status) },
                      ]}
                    >
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.appointmentTime}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <ThemedText style={styles.timeText}>{appointment.time}</ThemedText>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {appointment.status === 'pending' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.success }]}
                        onPress={() => handleAppointmentAction(appointment.id, 'confirm')}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <ThemedText style={styles.actionButtonText}>Confirm</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.error }]}
                        onPress={() => handleAppointmentAction(appointment.id, 'cancel')}
                      >
                        <Ionicons name="close" size={18} color="#fff" />
                        <ThemedText style={styles.actionButtonText}>Cancel</ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                  {appointment.status === 'confirmed' && (
                    <>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleAppointmentAction(appointment.id, 'complete')}
                      >
                        <Ionicons name="checkmark-done" size={18} color="#fff" />
                        <ThemedText style={styles.actionButtonText}>Complete</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.error },
                        ]}
                        onPress={() => handleAppointmentAction(appointment.id, 'cancel')}
                      >
                        <Ionicons name="close" size={18} color={colors.error} />
                        <ThemedText style={[styles.actionButtonText, { color: colors.error }]}>
                          Cancel
                        </ThemedText>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  addButton: {
    padding: Spacing.xs,
  },
  calendarContainer: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    padding: Spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  appointmentsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    borderRadius: 16,
  },
  emptyText: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    opacity: 0.6,
  },
  emptyButton: {
    minWidth: 200,
  },
  appointmentCard: {
    padding: Spacing.lg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  customerDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    gap: Spacing.xs,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
