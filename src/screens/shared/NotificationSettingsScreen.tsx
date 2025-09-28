import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  promotionalOffers: boolean;
  newMessages: boolean;
  reviewAlerts: boolean;
  businessUpdates: boolean;
  systemMaintenance: boolean;
  weeklyReports: boolean;
  marketingEmails: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

const defaultSettings: NotificationSettings = {
  pushNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  orderUpdates: true,
  promotionalOffers: true,
  newMessages: true,
  reviewAlerts: true,
  businessUpdates: true,
  systemMaintenance: true,
  weeklyReports: false,
  marketingEmails: false,
  soundEnabled: true,
  vibrationEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
};

export default function NotificationSettingsScreen() {
  const { user, profile } = useAuthStore();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw error;
      }

      if (data) {
        setSettings({
          ...defaultSettings,
          ...data.settings,
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error: any) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const renderSettingItem = (
    title: string,
    subtitle: string,
    key: keyof NotificationSettings,
    value: boolean
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => updateSetting(key, newValue)}
        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#10b981' }}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
      />
    </View>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notification Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Notifications */}
        {renderSection(
          'General Notifications',
          <>
            {renderSettingItem(
              'Push Notifications',
              'Receive notifications on your device',
              'pushNotifications',
              settings.pushNotifications
            )}
            {renderSettingItem(
              'Email Notifications',
              'Receive notifications via email',
              'emailNotifications',
              settings.emailNotifications
            )}
            {renderSettingItem(
              'SMS Notifications',
              'Receive important updates via SMS',
              'smsNotifications',
              settings.smsNotifications
            )}
          </>
        )}

        {/* Order & Business Updates */}
        {renderSection(
          'Order & Business Updates',
          <>
            {renderSettingItem(
              'Order Updates',
              'Get notified about order status changes',
              'orderUpdates',
              settings.orderUpdates
            )}
            {renderSettingItem(
              'New Messages',
              'Notifications for new chat messages',
              'newMessages',
              settings.newMessages
            )}
            {renderSettingItem(
              'Review Alerts',
              'Get notified about new reviews',
              'reviewAlerts',
              settings.reviewAlerts
            )}
            {profile?.user_type === 'business' && renderSettingItem(
              'Business Updates',
              'Important updates about your business',
              'businessUpdates',
              settings.businessUpdates
            )}
          </>
        )}

        {/* Marketing & Promotions */}
        {renderSection(
          'Marketing & Promotions',
          <>
            {renderSettingItem(
              'Promotional Offers',
              'Special deals and discounts',
              'promotionalOffers',
              settings.promotionalOffers
            )}
            {renderSettingItem(
              'Marketing Emails',
              'Product updates and news',
              'marketingEmails',
              settings.marketingEmails
            )}
            {profile?.user_type === 'business' && renderSettingItem(
              'Weekly Reports',
              'Business performance summaries',
              'weeklyReports',
              settings.weeklyReports
            )}
          </>
        )}

        {/* System Notifications */}
        {renderSection(
          'System Notifications',
          <>
            {renderSettingItem(
              'System Maintenance',
              'Scheduled maintenance and updates',
              'systemMaintenance',
              settings.systemMaintenance
            )}
          </>
        )}

        {/* Notification Preferences */}
        {renderSection(
          'Notification Preferences',
          <>
            {renderSettingItem(
              'Sound',
              'Play sound for notifications',
              'soundEnabled',
              settings.soundEnabled
            )}
            {renderSettingItem(
              'Vibration',
              'Vibrate for notifications',
              'vibrationEnabled',
              settings.vibrationEnabled
            )}
            {renderSettingItem(
              'Quiet Hours',
              'Limit notifications during specified hours',
              'quietHoursEnabled',
              settings.quietHoursEnabled
            )}
          </>
        )}

        {/* Quiet Hours Settings */}
        {settings.quietHoursEnabled && (
          <View style={styles.quietHoursContainer}>
            <Text style={styles.quietHoursTitle}>Quiet Hours Schedule</Text>
            <Text style={styles.quietHoursSubtitle}>
              Notifications will be silenced during these hours
            </Text>
            <View style={styles.timeRow}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>From</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeText}>{settings.quietHoursStart}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>To</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeText}>{settings.quietHoursEnd}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  quietHoursContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
  },
  quietHoursTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
  },
  quietHoursSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 20,
  },
  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  timeText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
  footer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
});