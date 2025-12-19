import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isOpen: boolean;
  slots: TimeSlot[];
}

interface WeekSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

const defaultSchedule: WeekSchedule = {
  monday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
  tuesday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
  wednesday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
  thursday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
  friday: { isOpen: true, slots: [{ start: '09:00', end: '18:00' }] },
  saturday: { isOpen: true, slots: [{ start: '10:00', end: '16:00' }] },
  sunday: { isOpen: false, slots: [] },
};

const mockBlockedDates: BlockedDate[] = [
  { id: '1', date: '2024-02-14', reason: 'Valentine\'s Day - Closed' },
  { id: '2', date: '2024-03-25', reason: 'Holi Festival' },
  { id: '3', date: '2024-04-14', reason: 'Personal Leave' },
];

export default function ScheduleManagementScreen() {
  const colors = useColors();
  const [schedule, setSchedule] = useState(defaultSchedule);
  const [blockedDates, setBlockedDates] = useState(mockBlockedDates);
  const [activeTab, setActiveTab] = useState<'weekly' | 'blocked'>('weekly');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof WeekSchedule | null>(null);

  // Form state for editing time slots
  const [editStartTime, setEditStartTime] = useState('09:00');
  const [editEndTime, setEditEndTime] = useState('18:00');

  // Form state for blocking dates
  const [blockDate, setBlockDate] = useState('');
  const [blockReason, setBlockReason] = useState('');

  const days: { key: keyof WeekSchedule; label: string; short: string }[] = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00',
  ];

  const toggleDayOpen = (day: keyof WeekSchedule) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        slots: prev[day].isOpen ? [] : [{ start: '09:00', end: '18:00' }],
      },
    }));
  };

  const handleEditDay = () => {
    if (selectedDay) {
      setSchedule((prev) => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          slots: [{ start: editStartTime, end: editEndTime }],
        },
      }));
      setShowEditModal(false);
      setSelectedDay(null);
    }
  };

  const handleBlockDate = () => {
    if (blockDate && blockReason) {
      const newBlocked: BlockedDate = {
        id: Date.now().toString(),
        date: blockDate,
        reason: blockReason,
      };
      setBlockedDates((prev) => [...prev, newBlocked]);
      setBlockDate('');
      setBlockReason('');
      setShowBlockModal(false);
    }
  };

  const removeBlockedDate = (id: string) => {
    setBlockedDates((prev) => prev.filter((d) => d.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Schedule Management</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'weekly' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('weekly')}
        >
          <Ionicons
            name="calendar"
            size={18}
            color={activeTab === 'weekly' ? '#fff' : colors.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === 'weekly' ? '#fff' : colors.textSecondary },
            ]}
          >
            Weekly Hours
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'blocked' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setActiveTab('blocked')}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={activeTab === 'blocked' ? '#fff' : colors.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === 'blocked' ? '#fff' : colors.textSecondary },
            ]}
          >
            Blocked Dates
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'weekly' ? (
          <View style={styles.content}>
            {/* Quick Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="time" size={24} color={colors.primary} />
                <ThemedText style={styles.statValue}>
                  {days.filter((d) => schedule[d.key].isOpen).length}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Days Open
                </ThemedText>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                <Ionicons name="today" size={24} color={colors.success} />
                <ThemedText style={styles.statValue}>
                  {schedule.monday.isOpen && schedule.monday.slots.length > 0
                    ? `${schedule.monday.slots[0].start} - ${schedule.monday.slots[0].end}`
                    : 'Closed'}
                </ThemedText>
                <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Typical Hours
                </ThemedText>
              </View>
            </View>

            {/* Weekly Schedule */}
            <ThemedText style={styles.sectionTitle}>Weekly Schedule</ThemedText>
            {days.map((day) => (
              <View key={day.key} style={[styles.dayRow, { backgroundColor: colors.card }]}>
                <View style={styles.dayInfo}>
                  <View
                    style={[
                      styles.dayIndicator,
                      { backgroundColor: schedule[day.key].isOpen ? colors.success : colors.border },
                    ]}
                  />
                  <View>
                    <ThemedText style={styles.dayName}>{day.label}</ThemedText>
                    {schedule[day.key].isOpen && schedule[day.key].slots.length > 0 ? (
                      <ThemedText style={[styles.dayHours, { color: colors.textSecondary }]}>
                        {schedule[day.key].slots[0].start} - {schedule[day.key].slots[0].end}
                      </ThemedText>
                    ) : (
                      <ThemedText style={[styles.dayHours, { color: colors.error }]}>
                        Closed
                      </ThemedText>
                    )}
                  </View>
                </View>
                <View style={styles.dayActions}>
                  {schedule[day.key].isOpen && (
                    <TouchableOpacity
                      style={[styles.editButton, { backgroundColor: colors.primary + '15' }]}
                      onPress={() => {
                        setSelectedDay(day.key);
                        if (schedule[day.key].slots.length > 0) {
                          setEditStartTime(schedule[day.key].slots[0].start);
                          setEditEndTime(schedule[day.key].slots[0].end);
                        }
                        setShowEditModal(true);
                      }}
                    >
                      <Ionicons name="create-outline" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <Switch
                    value={schedule[day.key].isOpen}
                    onValueChange={() => toggleDayOpen(day.key)}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={schedule[day.key].isOpen ? colors.primary : '#ccc'}
                  />
                </View>
              </View>
            ))}

            {/* Quick Apply */}
            <View style={[styles.quickApplyCard, { backgroundColor: colors.card }]}>
              <View style={styles.quickApplyHeader}>
                <Ionicons name="flash" size={20} color={colors.primary} />
                <ThemedText style={styles.quickApplyTitle}>Quick Apply</ThemedText>
              </View>
              <ThemedText style={[styles.quickApplyDesc, { color: colors.textSecondary }]}>
                Apply same hours to all open days
              </ThemedText>
              <View style={styles.quickApplyButtons}>
                <TouchableOpacity
                  style={[styles.quickButton, { borderColor: colors.border }]}
                  onPress={() => {
                    const newSchedule = { ...schedule };
                    days.forEach((day) => {
                      if (newSchedule[day.key].isOpen) {
                        newSchedule[day.key].slots = [{ start: '09:00', end: '18:00' }];
                      }
                    });
                    setSchedule(newSchedule);
                  }}
                >
                  <ThemedText style={styles.quickButtonText}>9 AM - 6 PM</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickButton, { borderColor: colors.border }]}
                  onPress={() => {
                    const newSchedule = { ...schedule };
                    days.forEach((day) => {
                      if (newSchedule[day.key].isOpen) {
                        newSchedule[day.key].slots = [{ start: '10:00', end: '20:00' }];
                      }
                    });
                    setSchedule(newSchedule);
                  }}
                >
                  <ThemedText style={styles.quickButtonText}>10 AM - 8 PM</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickButton, { borderColor: colors.border }]}
                  onPress={() => {
                    const newSchedule = { ...schedule };
                    days.forEach((day) => {
                      if (newSchedule[day.key].isOpen) {
                        newSchedule[day.key].slots = [{ start: '08:00', end: '17:00' }];
                      }
                    });
                    setSchedule(newSchedule);
                  }}
                >
                  <ThemedText style={styles.quickButtonText}>8 AM - 5 PM</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Blocked Dates Header */}
            <View style={styles.blockedHeader}>
              <View>
                <ThemedText style={styles.sectionTitle}>Blocked Dates</ThemedText>
                <ThemedText style={[styles.sectionDesc, { color: colors.textSecondary }]}>
                  Days when you won't accept bookings
                </ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.addBlockButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowBlockModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <ThemedText style={styles.addBlockText}>Block Date</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Blocked Dates List */}
            {blockedDates.length > 0 ? (
              blockedDates.map((blocked) => (
                <View key={blocked.id} style={[styles.blockedCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.blockedIcon, { backgroundColor: colors.error + '15' }]}>
                    <Ionicons name="close-circle" size={24} color={colors.error} />
                  </View>
                  <View style={styles.blockedInfo}>
                    <ThemedText style={styles.blockedDate}>{formatDate(blocked.date)}</ThemedText>
                    <ThemedText style={[styles.blockedReason, { color: colors.textSecondary }]}>
                      {blocked.reason}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: colors.background }]}
                    onPress={() => removeBlockedDate(blocked.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.border} />
                <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
                  No blocked dates
                </ThemedText>
                <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Block specific dates for holidays or personal time
                </ThemedText>
              </View>
            )}

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="information-circle" size={24} color={colors.info} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoTitle}>How it works</ThemedText>
                <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                  Blocked dates will show as unavailable in your booking calendar. Customers won't be able to book services on these days.
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Time Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.editModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Edit {selectedDay ? days.find((d) => d.key === selectedDay)?.label : ''} Hours
              </ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.timeSelectors}>
              <View style={styles.timeSelect}>
                <ThemedText style={styles.timeLabel}>Start Time</ThemedText>
                <ScrollView
                  style={[styles.timePicker, { backgroundColor: colors.background }]}
                  showsVerticalScrollIndicator={false}
                >
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        editStartTime === time && { backgroundColor: colors.primary + '15' },
                      ]}
                      onPress={() => setEditStartTime(time)}
                    >
                      <ThemedText
                        style={[
                          styles.timeOptionText,
                          editStartTime === time && { color: colors.primary, fontWeight: '600' },
                        ]}
                      >
                        {time}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.timeSelect}>
                <ThemedText style={styles.timeLabel}>End Time</ThemedText>
                <ScrollView
                  style={[styles.timePicker, { backgroundColor: colors.background }]}
                  showsVerticalScrollIndicator={false}
                >
                  {timeOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeOption,
                        editEndTime === time && { backgroundColor: colors.primary + '15' },
                      ]}
                      onPress={() => setEditEndTime(time)}
                    >
                      <ThemedText
                        style={[
                          styles.timeOptionText,
                          editEndTime === time && { color: colors.primary, fontWeight: '600' },
                        ]}
                      >
                        {time}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleEditDay}
            >
              <ThemedText style={styles.saveText}>Save Changes</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Block Date Modal */}
      <Modal visible={showBlockModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.blockModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Block a Date</ThemedText>
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Date</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="YYYY-MM-DD (e.g., 2024-03-15)"
                placeholderTextColor={colors.textSecondary}
                value={blockDate}
                onChangeText={setBlockDate}
              />
            </View>

            <View style={styles.formSection}>
              <ThemedText style={styles.formLabel}>Reason</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="e.g., Holiday, Personal leave"
                placeholderTextColor={colors.textSecondary}
                value={blockReason}
                onChangeText={setBlockReason}
              />
            </View>

            {/* Quick Reasons */}
            <View style={styles.quickReasons}>
              <ThemedText style={[styles.quickReasonsLabel, { color: colors.textSecondary }]}>
                Quick reasons:
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Holiday', 'Personal Leave', 'Maintenance', 'Festival', 'Training'].map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.quickReasonChip,
                      {
                        backgroundColor:
                          blockReason === reason ? colors.primary + '15' : colors.background,
                        borderColor: blockReason === reason ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setBlockReason(reason)}
                  >
                    <ThemedText
                      style={[
                        styles.quickReasonText,
                        { color: blockReason === reason ? colors.primary : colors.text },
                      ]}
                    >
                      {reason}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor:
                    blockDate && blockReason ? colors.primary : colors.border,
                },
              ]}
              onPress={handleBlockDate}
              disabled={!blockDate || !blockReason}
            >
              <ThemedText
                style={[
                  styles.saveText,
                  { color: blockDate && blockReason ? '#fff' : colors.textSecondary },
                ]}
              >
                Block Date
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  dayHours: {
    fontSize: 13,
  },
  dayActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickApplyCard: {
    padding: 16,
    borderRadius: 14,
    marginTop: 12,
  },
  quickApplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  quickApplyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickApplyDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  quickApplyButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  blockedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  addBlockText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  blockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  blockedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockedInfo: {
    flex: 1,
  },
  blockedDate: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  blockedReason: {
    fontSize: 13,
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  editModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  blockModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  timeSelectors: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  timeSelect: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timePicker: {
    height: 200,
    borderRadius: 12,
  },
  timeOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
  },
  timeOptionText: {
    fontSize: 15,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  quickReasons: {
    marginBottom: 20,
  },
  quickReasonsLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  quickReasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  quickReasonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
