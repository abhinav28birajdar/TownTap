import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NotificationService } from '../../services/notificationService';
import { NotificationPreferences } from '../../types';
import { useAuthStore } from '../../stores/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationSettingsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const user = useAuthStore((state: any) => state.user);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    service_updates: true,
    chat_messages: true,
    promotional: true,
    payments: true,
    reminders: true,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    do_not_disturb: {
      enabled: false,
    },
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const prefs = await NotificationService.fetchNotificationPreferences(user.id);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev: NotificationPreferences) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleDndToggle = () => {
    setPreferences((prev: NotificationPreferences) => ({
      ...prev,
      do_not_disturb: {
        ...prev.do_not_disturb,
        enabled: !prev.do_not_disturb.enabled,
      },
    }));
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      await NotificationService.updateNotificationPreferences(user.id, preferences);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="calendar-outline" size={24} color="#4CAF50" style={styles.settingIcon} />
              <Text style={styles.settingText}>Service Updates</Text>
            </View>
            <Switch
              value={preferences.service_updates}
              onValueChange={() => handleToggle('service_updates')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.service_updates ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-outline" size={24} color="#2196F3" style={styles.settingIcon} />
              <Text style={styles.settingText}>Chat Messages</Text>
            </View>
            <Switch
              value={preferences.chat_messages}
              onValueChange={() => handleToggle('chat_messages')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.chat_messages ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="wallet-outline" size={24} color="#FF9800" style={styles.settingIcon} />
              <Text style={styles.settingText}>Payments</Text>
            </View>
            <Switch
              value={preferences.payments}
              onValueChange={() => handleToggle('payments')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.payments ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="alarm-outline" size={24} color="#9C27B0" style={styles.settingIcon} />
              <Text style={styles.settingText}>Reminders</Text>
            </View>
            <Switch
              value={preferences.reminders}
              onValueChange={() => handleToggle('reminders')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.reminders ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="pricetag-outline" size={24} color="#F44336" style={styles.settingIcon} />
              <Text style={styles.settingText}>Promotions & Offers</Text>
            </View>
            <Switch
              value={preferences.promotional}
              onValueChange={() => handleToggle('promotional')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.promotional ? '#2563EB' : '#f5f5f5'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="phone-portrait-outline" size={24} color="#2196F3" style={styles.settingIcon} />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={preferences.push_notifications}
              onValueChange={() => handleToggle('push_notifications')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.push_notifications ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="mail-outline" size={24} color="#4CAF50" style={styles.settingIcon} />
              <Text style={styles.settingText}>Email Notifications</Text>
            </View>
            <Switch
              value={preferences.email_notifications}
              onValueChange={() => handleToggle('email_notifications')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.email_notifications ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FF9800" style={styles.settingIcon} />
              <Text style={styles.settingText}>SMS Notifications</Text>
            </View>
            <Switch
              value={preferences.sms_notifications}
              onValueChange={() => handleToggle('sms_notifications')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.sms_notifications ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" style={styles.settingIcon} />
              <Text style={styles.settingText}>WhatsApp Notifications</Text>
            </View>
            <Switch
              value={preferences.whatsapp_notifications}
              onValueChange={() => handleToggle('whatsapp_notifications')}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.whatsapp_notifications ? '#2563EB' : '#f5f5f5'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Do Not Disturb</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon-outline" size={24} color="#9C27B0" style={styles.settingIcon} />
              <Text style={styles.settingText}>Do Not Disturb Mode</Text>
            </View>
            <Switch
              value={preferences.do_not_disturb.enabled}
              onValueChange={handleDndToggle}
              trackColor={{ false: '#e0e0e0', true: '#cce5ff' }}
              thumbColor={preferences.do_not_disturb.enabled ? '#2563EB' : '#f5f5f5'}
            />
          </View>
          
          {preferences.do_not_disturb.enabled && (
            <View style={styles.dndTimeContainer}>
              <TouchableOpacity style={styles.timePickerButton}>
                <Text style={styles.timeText}>
                  {preferences.do_not_disturb.start_time || '22:00'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.toText}>to</Text>
              <TouchableOpacity style={styles.timePickerButton}>
                <Text style={styles.timeText}>
                  {preferences.do_not_disturb.end_time || '07:00'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#a0aec0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#424242',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#212121',
  },
  dndTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  timePickerButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toText: {
    marginHorizontal: 16,
    color: '#757575',
  },
});

export default NotificationSettingsScreen;