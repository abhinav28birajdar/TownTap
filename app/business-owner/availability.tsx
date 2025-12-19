import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TimeSlot {
  start: string;
  end: string;
  enabled: boolean;
}

interface DaySchedule {
  day: string;
  dayShort: string;
  enabled: boolean;
  slots: TimeSlot[];
}

const defaultSchedule: DaySchedule[] = [
  { day: 'Monday', dayShort: 'Mon', enabled: true, slots: [{ start: '09:00', end: '18:00', enabled: true }] },
  { day: 'Tuesday', dayShort: 'Tue', enabled: true, slots: [{ start: '09:00', end: '18:00', enabled: true }] },
  { day: 'Wednesday', dayShort: 'Wed', enabled: true, slots: [{ start: '09:00', end: '18:00', enabled: true }] },
  { day: 'Thursday', dayShort: 'Thu', enabled: true, slots: [{ start: '09:00', end: '18:00', enabled: true }] },
  { day: 'Friday', dayShort: 'Fri', enabled: true, slots: [{ start: '09:00', end: '18:00', enabled: true }] },
  { day: 'Saturday', dayShort: 'Sat', enabled: true, slots: [{ start: '10:00', end: '14:00', enabled: true }] },
  { day: 'Sunday', dayShort: 'Sun', enabled: false, slots: [] },
];

const timeOptions = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
  '22:00',
];

export default function AvailabilityScreen() {
  const colors = useColors();
  const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule);
  const [selectedDay, setSelectedDay] = useState<DaySchedule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{ start: string; end: string } | null>(null);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectingTimeFor, setSelectingTimeFor] = useState<'start' | 'end' | null>(null);

  // Settings
  const [settings, setSettings] = useState({
    acceptSameDayBookings: true,
    minimumNotice: '2',
    bookingBuffer: '30',
    maxBookingsPerSlot: '3',
    autoAcceptBookings: false,
    showBusySlots: true,
  });

  const toggleDayEnabled = (dayIndex: number) => {
    const newSchedule = [...schedule];
    newSchedule[dayIndex].enabled = !newSchedule[dayIndex].enabled;
    if (newSchedule[dayIndex].enabled && newSchedule[dayIndex].slots.length === 0) {
      newSchedule[dayIndex].slots = [{ start: '09:00', end: '18:00', enabled: true }];
    }
    setSchedule(newSchedule);
  };

  const openEditModal = (day: DaySchedule) => {
    setSelectedDay(day);
    setEditingSlot(day.slots[0] ? { ...day.slots[0] } : { start: '09:00', end: '18:00' });
    setShowEditModal(true);
  };

  const saveSlotChanges = () => {
    if (!selectedDay || !editingSlot) return;
    
    const newSchedule = schedule.map(day => {
      if (day.day === selectedDay.day) {
        return {
          ...day,
          slots: [{ ...editingSlot, enabled: true }],
        };
      }
      return day;
    });
    setSchedule(newSchedule);
    setShowEditModal(false);
  };

  const selectTime = (time: string) => {
    if (!editingSlot || !selectingTimeFor) return;
    
    setEditingSlot({
      ...editingSlot,
      [selectingTimeFor]: time,
    });
    setShowTimeModal(false);
    setSelectingTimeFor(null);
  };

  const activeHours = schedule.reduce((acc, day) => {
    if (day.enabled && day.slots.length > 0) {
      const slot = day.slots[0];
      const start = parseInt(slot.start.split(':')[0]);
      const end = parseInt(slot.end.split(':')[0]);
      return acc + (end - start);
    }
    return acc;
  }, 0);

  const workingDays = schedule.filter(d => d.enabled).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Availability</ThemedText>
        <TouchableOpacity>
          <ThemedText style={[styles.saveButton, { color: colors.primary }]}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <LinearGradient
          colors={[colors.primary, '#2d4a2f']}
          style={styles.statsCard}
        >
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Ionicons name="calendar" size={28} color="#FFF" />
              <ThemedText style={styles.statValue}>{workingDays}</ThemedText>
              <ThemedText style={styles.statLabel}>Working Days</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.statBlock}>
              <Ionicons name="time" size={28} color="#FFF" />
              <ThemedText style={styles.statValue}>{activeHours}</ThemedText>
              <ThemedText style={styles.statLabel}>Hours/Week</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Weekly Schedule */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Weekly Schedule</ThemedText>
          {schedule.map((day, index) => (
            <View key={day.day} style={[styles.dayCard, { backgroundColor: colors.card }]}>
              <View style={styles.dayHeader}>
                <Switch
                  value={day.enabled}
                  onValueChange={() => toggleDayEnabled(index)}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={day.enabled ? colors.primary : colors.textSecondary}
                />
                <View style={styles.dayInfo}>
                  <ThemedText style={[
                    styles.dayName,
                    !day.enabled && { color: colors.textSecondary }
                  ]}>
                    {day.day}
                  </ThemedText>
                  {day.enabled && day.slots.length > 0 ? (
                    <ThemedText style={[styles.daySlots, { color: colors.textSecondary }]}>
                      {day.slots[0].start} - {day.slots[0].end}
                    </ThemedText>
                  ) : (
                    <ThemedText style={[styles.daySlots, { color: colors.textSecondary }]}>
                      {day.enabled ? 'No slots configured' : 'Closed'}
                    </ThemedText>
                  )}
                </View>
                {day.enabled && (
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => openEditModal(day)}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              onPress={() => {
                const newSchedule = schedule.map(day => ({
                  ...day,
                  enabled: day.day !== 'Sunday',
                  slots: day.day !== 'Sunday' ? [{ start: '09:00', end: '18:00', enabled: true }] : [],
                }));
                setSchedule(newSchedule);
              }}
            >
              <Ionicons name="business-outline" size={24} color={colors.info} />
              <ThemedText style={styles.quickActionText}>Standard Hours</ThemedText>
              <ThemedText style={[styles.quickActionDesc, { color: colors.textSecondary }]}>
                Mon-Sat, 9AM-6PM
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.card }]}
              onPress={() => {
                const newSchedule = schedule.map(day => ({
                  ...day,
                  enabled: true,
                  slots: [{ start: '08:00', end: '20:00', enabled: true }],
                }));
                setSchedule(newSchedule);
              }}
            >
              <Ionicons name="sunny-outline" size={24} color={colors.warning} />
              <ThemedText style={styles.quickActionText}>Extended Hours</ThemedText>
              <ThemedText style={[styles.quickActionDesc, { color: colors.textSecondary }]}>
                All days, 8AM-8PM
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Booking Settings</ThemedText>
          <View style={[styles.settingsCard, { backgroundColor: colors.card }]}>
            {/* Same Day Bookings */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Same-Day Bookings</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Allow customers to book for today
                </ThemedText>
              </View>
              <Switch
                value={settings.acceptSameDayBookings}
                onValueChange={(value) => setSettings({ ...settings, acceptSameDayBookings: value })}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={settings.acceptSameDayBookings ? colors.primary : colors.textSecondary}
              />
            </View>

            {/* Minimum Notice */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Minimum Notice</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Hours before booking starts
                </ThemedText>
              </View>
              <View style={[styles.inputSmall, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.text }]}
                  value={settings.minimumNotice}
                  onChangeText={(text) => setSettings({ ...settings, minimumNotice: text })}
                  keyboardType="numeric"
                />
                <ThemedText style={[styles.inputUnit, { color: colors.textSecondary }]}>hrs</ThemedText>
              </View>
            </View>

            {/* Buffer Time */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Buffer Between Bookings</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Break time between appointments
                </ThemedText>
              </View>
              <View style={[styles.inputSmall, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.text }]}
                  value={settings.bookingBuffer}
                  onChangeText={(text) => setSettings({ ...settings, bookingBuffer: text })}
                  keyboardType="numeric"
                />
                <ThemedText style={[styles.inputUnit, { color: colors.textSecondary }]}>min</ThemedText>
              </View>
            </View>

            {/* Max Per Slot */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Max Bookings Per Slot</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Concurrent appointments allowed
                </ThemedText>
              </View>
              <View style={[styles.inputSmall, { backgroundColor: colors.background }]}>
                <TextInput
                  style={[styles.inputText, { color: colors.text }]}
                  value={settings.maxBookingsPerSlot}
                  onChangeText={(text) => setSettings({ ...settings, maxBookingsPerSlot: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Auto Accept */}
            <View style={[styles.settingRow, { borderBottomWidth: 0 }]}>
              <View style={styles.settingInfo}>
                <ThemedText style={styles.settingLabel}>Auto-Accept Bookings</ThemedText>
                <ThemedText style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Automatically confirm new bookings
                </ThemedText>
              </View>
              <Switch
                value={settings.autoAcceptBookings}
                onValueChange={(value) => setSettings({ ...settings, autoAcceptBookings: value })}
                trackColor={{ false: colors.border, true: colors.primary + '60' }}
                thumbColor={settings.autoAcceptBookings ? colors.primary : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        {/* Vacation Mode */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.vacationCard, { backgroundColor: colors.warning + '15' }]}
            onPress={() => Alert.alert('Vacation Mode', 'This will temporarily disable all bookings.')}
          >
            <Ionicons name="airplane" size={24} color={colors.warning} />
            <View style={styles.vacationInfo}>
              <ThemedText style={[styles.vacationTitle, { color: colors.warning }]}>
                Vacation Mode
              </ThemedText>
              <ThemedText style={[styles.vacationDesc, { color: colors.textSecondary }]}>
                Temporarily pause all bookings
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.warning} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit Day Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Edit {selectedDay?.day} Hours
              </ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {editingSlot && (
              <View style={styles.slotEditor}>
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                      Start Time
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.timeSelector, { backgroundColor: colors.background }]}
                      onPress={() => {
                        setSelectingTimeFor('start');
                        setShowTimeModal(true);
                      }}
                    >
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <ThemedText style={styles.timeValue}>{editingSlot.start}</ThemedText>
                    </TouchableOpacity>
                  </View>
                  <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
                  <View style={styles.timeInput}>
                    <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                      End Time
                    </ThemedText>
                    <TouchableOpacity
                      style={[styles.timeSelector, { backgroundColor: colors.background }]}
                      onPress={() => {
                        setSelectingTimeFor('end');
                        setShowTimeModal(true);
                      }}
                    >
                      <Ionicons name="time-outline" size={18} color={colors.primary} />
                      <ThemedText style={styles.timeValue}>{editingSlot.end}</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.saveSlotButton, { backgroundColor: colors.primary }]}
                  onPress={saveSlotChanges}
                >
                  <ThemedText style={styles.saveSlotText}>Save Changes</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.timeModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Select {selectingTimeFor === 'start' ? 'Start' : 'End'} Time
              </ThemedText>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.timeList}>
              {timeOptions.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeOption,
                    editingSlot && editingSlot[selectingTimeFor || 'start'] === time && {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                  onPress={() => selectTime(time)}
                >
                  <ThemedText style={[
                    styles.timeOptionText,
                    editingSlot && editingSlot[selectingTimeFor || 'start'] === time && {
                      color: colors.primary,
                      fontWeight: '600',
                    },
                  ]}>
                    {time}
                  </ThemedText>
                  {editingSlot && editingSlot[selectingTimeFor || 'start'] === time && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
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
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  statDivider: {
    width: 1,
    height: 60,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  dayCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  daySlots: {
    fontSize: 13,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  settingsCard: {
    borderRadius: 16,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  inputSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
  },
  inputText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 30,
  },
  inputUnit: {
    fontSize: 12,
    marginLeft: 4,
  },
  vacationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  vacationInfo: {
    flex: 1,
  },
  vacationTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  vacationDesc: {
    fontSize: 12,
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
  },
  timeModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
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
  slotEditor: {
    paddingBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveSlotButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveSlotText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  timeList: {
    maxHeight: 400,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 4,
  },
  timeOptionText: {
    fontSize: 16,
  },
});
