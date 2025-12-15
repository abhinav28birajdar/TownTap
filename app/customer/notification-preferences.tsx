/**
 * Notification Preferences - Phase 7
 * Configure notification settings
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NotificationPreferences {
  // Booking Notifications
  booking_confirmation: boolean;
  booking_reminder: boolean;
  booking_status_updates: boolean;
  provider_assigned: boolean;
  provider_on_way: boolean;
  service_completed: boolean;
  booking_cancelled: boolean;

  // Message Notifications
  new_messages: boolean;
  message_replies: boolean;

  // Review & Rating
  review_requests: boolean;
  review_responses: boolean;

  // Payment Notifications
  payment_received: boolean;
  payment_failed: boolean;
  refund_processed: boolean;

  // Promotional
  offers_deals: boolean;
  loyalty_rewards: boolean;
  referral_updates: boolean;
  new_services: boolean;

  // Account
  security_alerts: boolean;
  account_updates: boolean;

  // Channels
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
}

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    booking_confirmation: true,
    booking_reminder: true,
    booking_status_updates: true,
    provider_assigned: true,
    provider_on_way: true,
    service_completed: true,
    booking_cancelled: true,
    new_messages: true,
    message_replies: true,
    review_requests: true,
    review_responses: false,
    payment_received: true,
    payment_failed: true,
    refund_processed: true,
    offers_deals: false,
    loyalty_rewards: true,
    referral_updates: true,
    new_services: false,
    security_alerts: true,
    account_updates: true,
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id || '')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const { error } = await (supabase.from('notification_preferences') as any).upsert({
        user_id: user?.id || '',
        ...preferences,
      });

      if (error) throw error;

      alert('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleEnableAll = () => {
    const allEnabled = Object.keys(preferences).reduce((acc, key) => {
      acc[key as keyof NotificationPreferences] = true;
      return acc;
    }, {} as NotificationPreferences);
    setPreferences(allEnabled);
  };

  const handleDisableAll = () => {
    const allDisabled = Object.keys(preferences).reduce((acc, key) => {
      acc[key as keyof NotificationPreferences] = false;
      return acc;
    }, {} as NotificationPreferences);
    setPreferences(allDisabled);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Notification Settings
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="Enable All"
            onPress={handleEnableAll}
            style={styles.quickButton}
          />
          <Button
            title="Disable All"
            onPress={handleDisableAll}
            style={([styles.quickButton, styles.disableButton] as any)}
          />
        </View>

        {/* Notification Channels */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notification Channels
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📱</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Push Notifications
              </Text>
            </View>
            <Switch
              value={preferences.push_enabled}
              onValueChange={(value) => updatePreference('push_enabled', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>📧</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                Email Notifications
              </Text>
            </View>
            <Switch
              value={preferences.email_enabled}
              onValueChange={(value) => updatePreference('email_enabled', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingIcon}>💬</Text>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                SMS Notifications
              </Text>
            </View>
            <Switch
              value={preferences.sms_enabled}
              onValueChange={(value) => updatePreference('sms_enabled', value)}
            />
          </View>
        </Card>

        {/* Booking Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Booking Updates
          </Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Booking Confirmation
            </Text>
            <Switch
              value={preferences.booking_confirmation}
              onValueChange={(value) =>
                updatePreference('booking_confirmation', value)
              }
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Booking Reminders
            </Text>
            <Switch
              value={preferences.booking_reminder}
              onValueChange={(value) => updatePreference('booking_reminder', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Status Updates
            </Text>
            <Switch
              value={preferences.booking_status_updates}
              onValueChange={(value) =>
                updatePreference('booking_status_updates', value)
              }
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Provider Assigned
            </Text>
            <Switch
              value={preferences.provider_assigned}
              onValueChange={(value) => updatePreference('provider_assigned', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Provider On Way
            </Text>
            <Switch
              value={preferences.provider_on_way}
              onValueChange={(value) => updatePreference('provider_on_way', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Service Completed
            </Text>
            <Switch
              value={preferences.service_completed}
              onValueChange={(value) =>
                updatePreference('service_completed', value)
              }
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Booking Cancelled
            </Text>
            <Switch
              value={preferences.booking_cancelled}
              onValueChange={(value) =>
                updatePreference('booking_cancelled', value)
              }
            />
          </View>
        </Card>

        {/* Message Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Messages</Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              New Messages
            </Text>
            <Switch
              value={preferences.new_messages}
              onValueChange={(value) => updatePreference('new_messages', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Message Replies
            </Text>
            <Switch
              value={preferences.message_replies}
              onValueChange={(value) => updatePreference('message_replies', value)}
            />
          </View>
        </Card>

        {/* Review Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Reviews & Ratings
          </Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Review Requests
            </Text>
            <Switch
              value={preferences.review_requests}
              onValueChange={(value) => updatePreference('review_requests', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Review Responses
            </Text>
            <Switch
              value={preferences.review_responses}
              onValueChange={(value) => updatePreference('review_responses', value)}
            />
          </View>
        </Card>

        {/* Payment Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payments</Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Payment Received
            </Text>
            <Switch
              value={preferences.payment_received}
              onValueChange={(value) => updatePreference('payment_received', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Payment Failed
            </Text>
            <Switch
              value={preferences.payment_failed}
              onValueChange={(value) => updatePreference('payment_failed', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Refund Processed
            </Text>
            <Switch
              value={preferences.refund_processed}
              onValueChange={(value) =>
                updatePreference('refund_processed', value)
              }
            />
          </View>
        </Card>

        {/* Promotional Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Promotions & Rewards
          </Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Offers & Deals
            </Text>
            <Switch
              value={preferences.offers_deals}
              onValueChange={(value) => updatePreference('offers_deals', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Loyalty Rewards
            </Text>
            <Switch
              value={preferences.loyalty_rewards}
              onValueChange={(value) => updatePreference('loyalty_rewards', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Referral Updates
            </Text>
            <Switch
              value={preferences.referral_updates}
              onValueChange={(value) => updatePreference('referral_updates', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              New Services
            </Text>
            <Switch
              value={preferences.new_services}
              onValueChange={(value) => updatePreference('new_services', value)}
            />
          </View>
        </Card>

        {/* Account Notifications */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account & Security
          </Text>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Security Alerts
            </Text>
            <Switch
              value={preferences.security_alerts}
              onValueChange={(value) => updatePreference('security_alerts', value)}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Account Updates
            </Text>
            <Switch
              value={preferences.account_updates}
              onValueChange={(value) => updatePreference('account_updates', value)}
            />
          </View>
        </Card>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <Button
            title={saving ? 'Saving...' : 'Save Preferences'}
            onPress={handleSave}
            disabled={saving}
            style={([styles.saveButton, { backgroundColor: colors.primary }] as any)}
          />
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
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  disableButton: {
    backgroundColor: '#999',
  },
  section: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    fontSize: 16,
  },
  saveSection: {
    padding: spacing.md,
  },
  saveButton: {},

});
