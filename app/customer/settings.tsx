/**
 * Settings Page - Phase 11
 * App preferences and account settings
 */

import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserSettings {
  notifications_enabled: boolean;
  push_notifications: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  booking_reminders: boolean;
  promotional_emails: boolean;
  dark_mode: boolean;
  language: string;
  currency: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user, signOut } = useAuthStore();

  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    booking_reminders: true,
    promotional_emails: false,
    dark_mode: colorScheme === 'dark',
    language: 'en',
    currency: 'INR',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id || '')
        .single();

      if (error) throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { error } = await (supabase
        .from('user_settings') as any)
        .upsert({
          user_id: user?.id || '',
          ...newSettings,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/sign-in');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement account deletion logic
            alert('Account deletion requested. Customer support will contact you.');
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
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* Notification Settings */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Enable Notifications
            </Text>
            <Switch
              value={settings.notifications_enabled}
              onValueChange={(value) => updateSetting('notifications_enabled', value)}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Push Notifications
            </Text>
            <Switch
              value={settings.push_notifications}
              onValueChange={(value) => updateSetting('push_notifications', value)}
              disabled={!settings.notifications_enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Email Notifications
            </Text>
            <Switch
              value={settings.email_notifications}
              onValueChange={(value) => updateSetting('email_notifications', value)}
              disabled={!settings.notifications_enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              SMS Notifications
            </Text>
            <Switch
              value={settings.sms_notifications}
              onValueChange={(value) => updateSetting('sms_notifications', value)}
              disabled={!settings.notifications_enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Booking Reminders
            </Text>
            <Switch
              value={settings.booking_reminders}
              onValueChange={(value) => updateSetting('booking_reminders', value)}
              disabled={!settings.notifications_enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Promotional Emails
            </Text>
            <Switch
              value={settings.promotional_emails}
              onValueChange={(value) => updateSetting('promotional_emails', value)}
            />
          </View>
        </Card>

        {/* Appearance */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Appearance
          </Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Dark Mode
            </Text>
            <Switch
              value={settings.dark_mode}
              onValueChange={(value) => updateSetting('dark_mode', value)}
            />
          </View>
        </Card>

        {/* Preferences */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preferences
          </Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Language
            </Text>
            <View style={styles.settingValue}>
              <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                English
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Currency
            </Text>
            <View style={styles.settingValue}>
              <Text style={[styles.valueText, { color: colors.textSecondary }]}>
                ₹ INR
              </Text>
              <Text style={styles.arrow}>›</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Privacy & Security */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Privacy & Security
          </Text>
          
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/privacy' as any)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Privacy Policy
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/settings/terms' as any)}
          >
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Terms of Service
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Change Password
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Two-Factor Authentication
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              App Version
            </Text>
            <Text style={[styles.valueText, { color: colors.textSecondary }]}>
              1.0.0
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Rate App
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              Share App
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Account Actions */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: '#F44336' }]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </Card>
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
  section: {
    margin: spacing.md,
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
  settingLabel: {
    fontSize: 16,
    flex: 1,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  valueText: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
  actionButton: {
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {},

  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
