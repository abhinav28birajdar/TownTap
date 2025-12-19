import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  type: 'toggle' | 'link' | 'value';
  value?: string | boolean;
  description?: string;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function BusinessSettingsScreen() {
  const colors = useColors();
  const [notificationSettings, setNotificationSettings] = useState({
    newBookings: true,
    bookingUpdates: true,
    customerMessages: true,
    promotionalAlerts: false,
    weeklyReports: true,
    paymentAlerts: true,
  });
  
  const [businessSettings, setBusinessSettings] = useState({
    instantBooking: true,
    autoConfirm: false,
    showLocation: true,
    allowReviews: true,
    chatEnabled: true,
    emergencyService: false,
  });

  const [showTimingModal, setShowTimingModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const sections: SettingSection[] = [
    {
      title: 'Business Settings',
      items: [
        { id: 'instant', title: 'Instant Booking', icon: 'flash-outline', type: 'toggle', value: businessSettings.instantBooking, description: 'Allow customers to book without approval' },
        { id: 'autoconfirm', title: 'Auto-Confirm Bookings', icon: 'checkmark-done-outline', type: 'toggle', value: businessSettings.autoConfirm },
        { id: 'location', title: 'Show Business Location', icon: 'location-outline', type: 'toggle', value: businessSettings.showLocation },
        { id: 'reviews', title: 'Allow Customer Reviews', icon: 'star-outline', type: 'toggle', value: businessSettings.allowReviews },
        { id: 'chat', title: 'Enable Chat', icon: 'chatbubble-outline', type: 'toggle', value: businessSettings.chatEnabled },
        { id: 'emergency', title: 'Emergency Services', icon: 'warning-outline', type: 'toggle', value: businessSettings.emergencyService, description: 'Accept emergency/urgent bookings' },
      ],
    },
    {
      title: 'Business Hours & Availability',
      items: [
        { id: 'timing', title: 'Business Hours', icon: 'time-outline', type: 'link', value: 'Mon-Sat, 9 AM - 8 PM' },
        { id: 'holidays', title: 'Holiday Schedule', icon: 'calendar-outline', type: 'link', value: '3 holidays set' },
        { id: 'slots', title: 'Booking Slots', icon: 'grid-outline', type: 'link', value: '30 min intervals' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { id: 'newbooking', title: 'New Booking Alerts', icon: 'notifications-outline', type: 'toggle', value: notificationSettings.newBookings },
        { id: 'updates', title: 'Booking Updates', icon: 'sync-outline', type: 'toggle', value: notificationSettings.bookingUpdates },
        { id: 'messages', title: 'Customer Messages', icon: 'chatbubbles-outline', type: 'toggle', value: notificationSettings.customerMessages },
        { id: 'promo', title: 'Promotional Alerts', icon: 'megaphone-outline', type: 'toggle', value: notificationSettings.promotionalAlerts },
        { id: 'reports', title: 'Weekly Reports', icon: 'bar-chart-outline', type: 'toggle', value: notificationSettings.weeklyReports },
        { id: 'payment', title: 'Payment Alerts', icon: 'wallet-outline', type: 'toggle', value: notificationSettings.paymentAlerts },
      ],
    },
    {
      title: 'Payments & Banking',
      items: [
        { id: 'bank', title: 'Bank Account', icon: 'business-outline', type: 'link', value: 'HDFC ****1234' },
        { id: 'upi', title: 'UPI ID', icon: 'phone-portrait-outline', type: 'link', value: 'business@upi' },
        { id: 'tax', title: 'Tax Information', icon: 'document-text-outline', type: 'link', value: 'GST Registered' },
      ],
    },
    {
      title: 'Policies',
      items: [
        { id: 'cancellation', title: 'Cancellation Policy', icon: 'close-circle-outline', type: 'link', value: '24h notice' },
        { id: 'refund', title: 'Refund Policy', icon: 'cash-outline', type: 'link', value: 'Full refund within 24h' },
        { id: 'terms', title: 'Service Terms', icon: 'document-outline', type: 'link' },
      ],
    },
    {
      title: 'Account',
      items: [
        { id: 'profile', title: 'Business Profile', icon: 'storefront-outline', type: 'link' },
        { id: 'security', title: 'Security Settings', icon: 'shield-outline', type: 'link' },
        { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', type: 'link' },
        { id: 'logout', title: 'Logout', icon: 'log-out-outline', type: 'link' },
      ],
    },
  ];

  const handleToggle = (sectionTitle: string, itemId: string, newValue: boolean) => {
    if (sectionTitle === 'Business Settings') {
      const key = {
        instant: 'instantBooking',
        autoconfirm: 'autoConfirm',
        location: 'showLocation',
        reviews: 'allowReviews',
        chat: 'chatEnabled',
        emergency: 'emergencyService',
      }[itemId];
      if (key) {
        setBusinessSettings(prev => ({ ...prev, [key]: newValue }));
      }
    } else if (sectionTitle === 'Notifications') {
      const key = {
        newbooking: 'newBookings',
        updates: 'bookingUpdates',
        messages: 'customerMessages',
        promo: 'promotionalAlerts',
        reports: 'weeklyReports',
        payment: 'paymentAlerts',
      }[itemId];
      if (key) {
        setNotificationSettings(prev => ({ ...prev, [key]: newValue }));
      }
    }
  };

  const handleLinkPress = (itemId: string) => {
    switch (itemId) {
      case 'timing':
        setShowTimingModal(true);
        break;
      case 'cancellation':
      case 'refund':
      case 'terms':
        setShowPolicyModal(true);
        break;
      case 'bank':
      case 'upi':
        setShowBankModal(true);
        break;
      case 'logout':
        router.replace('/auth/sign-in');
        break;
      default:
        break;
    }
  };

  const renderSettingItem = (section: SettingSection, item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, { borderBottomColor: colors.border }]}
      onPress={() => item.type === 'link' && handleLinkPress(item.id)}
      disabled={item.type === 'toggle'}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name={item.icon as any} size={20} color={colors.primary} />
      </View>
      <View style={styles.settingInfo}>
        <ThemedText style={styles.settingTitle}>{item.title}</ThemedText>
        {item.description && (
          <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
            {item.description}
          </ThemedText>
        )}
      </View>
      {item.type === 'toggle' ? (
        <Switch
          value={item.value as boolean}
          onValueChange={(value) => handleToggle(section.title, item.id, value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFF"
        />
      ) : item.type === 'value' || item.value ? (
        <View style={styles.settingValueContainer}>
          <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]}>
            {item.value as string}
          </ThemedText>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Business Settings</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </ThemedText>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item) => renderSettingItem(section, item))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <ThemedText style={[styles.versionText, { color: colors.textSecondary }]}>
            TownTap Business v1.0.0
          </ThemedText>
        </View>
      </ScrollView>

      {/* Business Hours Modal */}
      <Modal
        visible={showTimingModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTimingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Business Hours</ThemedText>
              <TouchableOpacity onPress={() => setShowTimingModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <View key={day} style={[styles.dayRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.dayInfo}>
                    <ThemedText style={styles.dayName}>{day}</ThemedText>
                    <Switch
                      value={day !== 'Sunday'}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#FFF"
                    />
                  </View>
                  {day !== 'Sunday' && (
                    <View style={styles.timeRow}>
                      <View style={[styles.timeInput, { backgroundColor: colors.background }]}>
                        <ThemedText style={[styles.timeText, { color: colors.text }]}>9:00 AM</ThemedText>
                      </View>
                      <ThemedText style={[styles.timeSeparator, { color: colors.textSecondary }]}>to</ThemedText>
                      <View style={[styles.timeInput, { backgroundColor: colors.background }]}>
                        <ThemedText style={[styles.timeText, { color: colors.text }]}>8:00 PM</ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              ))}

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Policy Modal */}
      <Modal
        visible={showPolicyModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Cancellation Policy</ThemedText>
              <TouchableOpacity onPress={() => setShowPolicyModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Cancellation Window
                </ThemedText>
                <View style={[styles.selectInput, { backgroundColor: colors.background }]}>
                  <ThemedText style={{ color: colors.text }}>24 hours before service</ThemedText>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Cancellation Fee
                </ThemedText>
                <View style={[styles.selectInput, { backgroundColor: colors.background }]}>
                  <ThemedText style={{ color: colors.text }}>No fee (full refund)</ThemedText>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Late Cancellation Fee
                </ThemedText>
                <View style={[styles.selectInput, { backgroundColor: colors.background }]}>
                  <ThemedText style={{ color: colors.text }}>25% of booking amount</ThemedText>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Policy Description
                </ThemedText>
                <TextInput
                  style={[styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Describe your cancellation policy..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  defaultValue="Free cancellation up to 24 hours before the scheduled service. Cancellations made within 24 hours will incur a 25% fee."
                />
              </View>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.saveButtonText}>Save Policy</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bank Details Modal */}
      <Modal
        visible={showBankModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBankModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Payment Details</ThemedText>
              <TouchableOpacity onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.bankCard, { backgroundColor: colors.background }]}>
                <View style={styles.bankHeader}>
                  <Ionicons name="business" size={24} color={colors.primary} />
                  <ThemedText style={styles.bankName}>HDFC Bank</ThemedText>
                  <View style={[styles.primaryBadge, { backgroundColor: colors.success + '20' }]}>
                    <ThemedText style={[styles.primaryBadgeText, { color: colors.success }]}>Primary</ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.accountNumber, { color: colors.textSecondary }]}>
                  Account: XXXX XXXX XXXX 1234
                </ThemedText>
                <ThemedText style={[styles.ifscCode, { color: colors.textSecondary }]}>
                  IFSC: HDFC0001234
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  UPI ID
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter UPI ID"
                  placeholderTextColor={colors.textSecondary}
                  defaultValue="business@upi"
                />
              </View>

              <TouchableOpacity style={[styles.addBankButton, { borderColor: colors.primary }]}>
                <Ionicons name="add" size={20} color={colors.primary} />
                <ThemedText style={[styles.addBankText, { color: colors.primary }]}>
                  Add Another Bank Account
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
              </TouchableOpacity>
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
  content: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    maxWidth: 100,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 13,
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
    maxHeight: '90%',
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
  dayRow: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  dayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  timeInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
  },
  timeSeparator: {
    fontSize: 14,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
  },
  textArea: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 14,
  },
  bankCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  bankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  primaryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  accountNumber: {
    fontSize: 14,
    marginBottom: 4,
  },
  ifscCode: {
    fontSize: 13,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 10,
  },
  addBankText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
