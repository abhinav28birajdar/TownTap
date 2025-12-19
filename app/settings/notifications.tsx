import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  category: string;
}

export default function NotificationSettingsScreen() {
  const colors = useColors();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showQuietHoursModal, setShowQuietHoursModal] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Orders & Bookings
    { id: 'order_updates', title: 'Order Updates', description: 'Status changes, confirmations', enabled: true, category: 'orders' },
    { id: 'provider_assigned', title: 'Provider Assigned', description: 'When a service provider is assigned', enabled: true, category: 'orders' },
    { id: 'provider_enroute', title: 'Provider En Route', description: 'When provider is on the way', enabled: true, category: 'orders' },
    { id: 'service_complete', title: 'Service Complete', description: 'Completion notifications', enabled: true, category: 'orders' },
    { id: 'reschedule', title: 'Reschedule Alerts', description: 'Changes to booking schedule', enabled: true, category: 'orders' },
    
    // Payments & Wallet
    { id: 'payment_success', title: 'Payment Success', description: 'Successful payment confirmations', enabled: true, category: 'payments' },
    { id: 'refund_processed', title: 'Refund Processed', description: 'Refund status updates', enabled: true, category: 'payments' },
    { id: 'wallet_credits', title: 'Wallet Credits', description: 'When credits are added', enabled: true, category: 'payments' },
    
    // Promotions & Offers
    { id: 'promotions', title: 'Promotions & Offers', description: 'Discounts and special deals', enabled: true, category: 'marketing' },
    { id: 'personalized', title: 'Personalized Recommendations', description: 'Services based on your preferences', enabled: false, category: 'marketing' },
    { id: 'price_drops', title: 'Price Drop Alerts', description: 'Price reductions on saved services', enabled: true, category: 'marketing' },
    
    // Communication
    { id: 'chat_messages', title: 'Chat Messages', description: 'Messages from service providers', enabled: true, category: 'communication' },
    { id: 'reviews', title: 'Review Reminders', description: 'Rate your completed services', enabled: true, category: 'communication' },
    { id: 'support', title: 'Support Updates', description: 'Responses to your queries', enabled: true, category: 'communication' },
    
    // Account & Security
    { id: 'login_alerts', title: 'Login Alerts', description: 'New device sign-ins', enabled: true, category: 'security' },
    { id: 'password_changes', title: 'Password Changes', description: 'Security-related updates', enabled: true, category: 'security' },
    
    // Loyalty & Rewards
    { id: 'points_earned', title: 'Points Earned', description: 'When you earn loyalty points', enabled: true, category: 'rewards' },
    { id: 'rewards_expiring', title: 'Rewards Expiring', description: 'Expiring points reminder', enabled: true, category: 'rewards' },
    { id: 'tier_updates', title: 'Tier Updates', description: 'Loyalty tier changes', enabled: true, category: 'rewards' },
  ]);

  const categories = [
    { id: 'orders', title: 'Orders & Bookings', icon: 'calendar' },
    { id: 'payments', title: 'Payments & Wallet', icon: 'card' },
    { id: 'marketing', title: 'Promotions & Offers', icon: 'pricetag' },
    { id: 'communication', title: 'Communication', icon: 'chatbubble' },
    { id: 'security', title: 'Account & Security', icon: 'shield-checkmark' },
    { id: 'rewards', title: 'Loyalty & Rewards', icon: 'gift' },
  ];

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const toggleAllInCategory = (category: string, enabled: boolean) => {
    setSettings(settings.map(s => 
      s.category === category ? { ...s, enabled } : s
    ));
  };

  const isCategoryEnabled = (category: string) => {
    const categorySettings = settings.filter(s => s.category === category);
    return categorySettings.every(s => s.enabled);
  };

  const handleMasterToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (!enabled) {
      Alert.alert(
        'Disable Notifications?',
        'You will miss important updates about your bookings. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setNotificationsEnabled(true) },
          { text: 'Disable', style: 'destructive', onPress: () => {} },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Notification Settings</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Master Toggle */}
        <View style={[styles.masterCard, { backgroundColor: colors.card }]}>
          <View style={styles.masterContent}>
            <View style={[styles.masterIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="notifications" size={28} color={colors.primary} />
            </View>
            <View style={styles.masterInfo}>
              <ThemedText style={styles.masterTitle}>Push Notifications</ThemedText>
              <ThemedText style={[styles.masterDescription, { color: colors.textSecondary }]}>
                {notificationsEnabled ? 'All notifications enabled' : 'All notifications disabled'}
              </ThemedText>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleMasterToggle}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={notificationsEnabled ? colors.primary : colors.textSecondary}
          />
        </View>

        {/* Quiet Hours */}
        <TouchableOpacity
          style={[styles.quietHoursCard, { backgroundColor: colors.card }]}
          onPress={() => setShowQuietHoursModal(true)}
        >
          <View style={styles.quietHoursLeft}>
            <View style={[styles.quietIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="moon" size={22} color={colors.info} />
            </View>
            <View>
              <ThemedText style={styles.quietTitle}>Quiet Hours</ThemedText>
              <ThemedText style={[styles.quietDescription, { color: colors.textSecondary }]}>
                {quietHoursEnabled 
                  ? `${quietHoursStart} - ${quietHoursEnd}`
                  : 'No quiet hours set'}
              </ThemedText>
            </View>
          </View>
          <View style={styles.quietHoursRight}>
            <Switch
              value={quietHoursEnabled}
              onValueChange={setQuietHoursEnabled}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={quietHoursEnabled ? colors.primary : colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Category Settings */}
        {categories.map((category) => {
          const categorySettings = settings.filter(s => s.category === category.id);
          const allEnabled = isCategoryEnabled(category.id);
          
          return (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <Ionicons name={category.icon as any} size={20} color={colors.textSecondary} />
                  <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                </View>
                <TouchableOpacity 
                  onPress={() => toggleAllInCategory(category.id, !allEnabled)}
                >
                  <ThemedText style={[styles.toggleAllText, { color: colors.primary }]}>
                    {allEnabled ? 'Disable All' : 'Enable All'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.settingsList, { backgroundColor: colors.card }]}>
                {categorySettings.map((setting, index) => (
                  <View
                    key={setting.id}
                    style={[
                      styles.settingItem,
                      index < categorySettings.length - 1 && { 
                        borderBottomWidth: 1, 
                        borderBottomColor: colors.border 
                      },
                    ]}
                  >
                    <View style={styles.settingInfo}>
                      <ThemedText style={[
                        styles.settingTitle,
                        !notificationsEnabled && { color: colors.textSecondary }
                      ]}>
                        {setting.title}
                      </ThemedText>
                      <ThemedText style={[styles.settingDescription, { color: colors.textSecondary }]}>
                        {setting.description}
                      </ThemedText>
                    </View>
                    <Switch
                      value={setting.enabled && notificationsEnabled}
                      onValueChange={() => toggleSetting(setting.id)}
                      disabled={!notificationsEnabled}
                      trackColor={{ false: colors.border, true: colors.primary + '50' }}
                      thumbColor={setting.enabled && notificationsEnabled ? colors.primary : colors.textSecondary}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Email Preferences */}
        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryLeft}>
              <Ionicons name="mail" size={20} color={colors.textSecondary} />
              <ThemedText style={styles.categoryTitle}>Email Preferences</ThemedText>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.emailOption, { backgroundColor: colors.card }]}
            onPress={() => router.push('/settings/email-preferences' as any)}
          >
            <ThemedText style={styles.emailOptionText}>Manage email notifications</ThemedText>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.info + '10' }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Important notifications like booking confirmations and security alerts 
            cannot be disabled for your account's safety.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Quiet Hours Modal */}
      <Modal
        visible={showQuietHoursModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowQuietHoursModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Quiet Hours</ThemedText>
              <TouchableOpacity onPress={() => setShowQuietHoursModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={[styles.modalDescription, { color: colors.textSecondary }]}>
              During quiet hours, you won't receive push notifications. 
              Important notifications will still be delivered.
            </ThemedText>
            
            <View style={styles.timePickerContainer}>
              <View style={styles.timePicker}>
                <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  Start Time
                </ThemedText>
                <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.background }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <ThemedText style={styles.timeValue}>{quietHoursStart}</ThemedText>
                </TouchableOpacity>
              </View>
              
              <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
              
              <View style={styles.timePicker}>
                <ThemedText style={[styles.timeLabel, { color: colors.textSecondary }]}>
                  End Time
                </ThemedText>
                <TouchableOpacity style={[styles.timeButton, { backgroundColor: colors.background }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                  <ThemedText style={styles.timeValue}>{quietHoursEnd}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowQuietHoursModal(false)}
            >
              <ThemedText style={styles.saveButtonText}>Save Settings</ThemedText>
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
  masterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    padding: 16,
    borderRadius: 16,
  },
  masterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  masterIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterInfo: {
    marginLeft: 12,
    flex: 1,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  masterDescription: {
    fontSize: 13,
  },
  quietHoursCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  quietHoursLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quietIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quietTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  quietDescription: {
    fontSize: 12,
  },
  quietHoursRight: {},
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleAllText: {
    fontSize: 13,
    fontWeight: '500',
  },
  settingsList: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  emailOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  emailOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timePicker: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
