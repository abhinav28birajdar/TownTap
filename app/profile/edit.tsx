import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingScreen } from '@/components/ui/loading-screen';

import { useAuth } from '@/contexts/auth-context';
import { useFormWithValidation } from '@/hooks/use-form-validation';
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { performanceMonitor } from '@/lib/performance-monitor';
import { useBiometricAuth, useSecureStorage } from '@/lib/security-service';
import { ProfileFormData, profileSchema } from '@/lib/validation-schemas';

import { Spacing } from '@/constants/spacing';
import { BorderRadius, Shadows } from '@/constants/theme';

interface SecuritySettings {
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

interface NotificationSettings {
  bookingUpdates: boolean;
  promotions: boolean;
  businessUpdates: boolean;
  securityAlerts: boolean;
}

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>((user as any)?.avatar_url || null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  
  // Security settings
  const { isAvailable: biometricAvailable, authTypes } = useBiometricAuth();
  const { store: storeSecure, retrieve: retrieveSecure } = useSecureStorage();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    bookingUpdates: true,
    promotions: true,
    businessUpdates: false,
    securityAlerts: true,
  });

  const form = useFormWithValidation(profileSchema, {
    defaultValues: {
      firstName: (user as any)?.first_name || '',
      lastName: (user as any)?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: (user as any)?.date_of_birth || '',
    },
  });

  useEffect(() => {
    performanceMonitor.trackNavigation('profile/edit');
    loadSecuritySettings();
    loadNotificationSettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const savedSettings = await retrieveSecure('security_preferences');
      if (savedSettings) {
        setSecuritySettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load security settings:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      const savedSettings = await retrieveSecure('notification_preferences');
      if (savedSettings) {
        setNotificationSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSecuritySettings = async (newSettings: SecuritySettings) => {
    try {
      await storeSecure('security_preferences', JSON.stringify(newSettings));
      setSecuritySettings(newSettings);
    } catch (error) {
      console.error('Failed to save security settings:', error);
      Alert.alert('Error', 'Failed to save security settings');
    }
  };

  const saveNotificationSettings = async (newSettings: NotificationSettings) => {
    try {
      await storeSecure('notification_preferences', JSON.stringify(newSettings));
      setNotificationSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to update your profile picture.');
        return;
      }

      Alert.alert(
        'Update Profile Picture',
        'Choose how you\'d like to update your profile picture',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Photo Library', onPress: () => openLibrary() },
        ]
      );
    } catch (error) {
      console.error('Image picker permission error:', error);
      Alert.alert('Error', 'Failed to access photo library');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow camera access to take a photo.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image library error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
      return;
    }

    const newSettings = { ...securitySettings, biometricEnabled: enabled };
    await saveSecuritySettings(newSettings);
    
    if (enabled) {
      Alert.alert('Biometric Enabled', 'Biometric authentication has been enabled for secure login.');
    }
  };

  const handleSaveProfile = async (data: ProfileFormData) => {
    const startTime = Date.now();
    setIsLoading(true);

    try {
      await updateProfile({
        ...data,
        avatar_url: profileImage,
      });

      const duration = Date.now() - startTime;
      performanceMonitor.trackUserInteraction('profile_update_success', 'profile_edit', true, duration);
      
      Alert.alert('Success', 'Your profile has been updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Profile update error:', error);
      performanceMonitor.trackUserInteraction('profile_update_error', 'profile_edit', false);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabButton = (tab: typeof activeTab, title: string, icon: keyof typeof Ionicons.glyphMap) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        { backgroundColor: activeTab === tab ? colors.primary : 'transparent' }
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon}
        size={20}
        color={activeTab === tab ? '#FFFFFF' : colors.textSecondary}
      />
      <Text style={[
        styles.tabButtonText,
        { color: activeTab === tab ? '#FFFFFF' : colors.textSecondary }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderProfileTab = () => (
    <View style={styles.tabContent}>
      {/* Profile Picture */}
      <MotiView
        from={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 800 }}
        style={styles.avatarContainer}
      >
        <TouchableOpacity onPress={handleImagePicker}>
          <Avatar
            size={120}
            source={profileImage ? { uri: profileImage } : undefined}
            fallbackText={`${form.watch('firstName')?.[0] || 'U'}${form.watch('lastName')?.[0] || ''}`}
          />
          <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </MotiView>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <Input
          label="First Name"
          placeholder="Enter your first name"
          value={form.watch('firstName')}
          onChangeText={(value) => form.setValue('firstName', value)}
          error={form.formState.errors.firstName?.message}
          leftIcon="person-outline"
        />

        <Input
          label="Last Name"
          placeholder="Enter your last name"
          value={form.watch('lastName')}
          onChangeText={(value) => form.setValue('lastName', value)}
          error={form.formState.errors.lastName?.message}
          leftIcon="person-outline"
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          value={form.watch('email')}
          onChangeText={(value) => form.setValue('email', value)}
          error={form.formState.errors.email?.message}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
        />

        <Input
          label="Phone Number"
          placeholder="Enter your phone number"
          value={form.watch('phone')}
          onChangeText={(value) => form.setValue('phone', value)}
          error={form.formState.errors.phone?.message}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />

        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={form.watch('dateOfBirth')}
          onChangeText={(value) => form.setValue('dateOfBirth', value)}
          error={form.formState.errors.dateOfBirth?.message}
          leftIcon="calendar-outline"
        />
      </View>
    </View>
  );

  const renderSecurityTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.settingsCard}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Authentication
        </Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="finger-print" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Biometric Login
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Use fingerprint or Face ID to sign in
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: securitySettings.biometricEnabled ? colors.success : colors.border,
              }
            ]}
            onPress={() => handleBiometricToggle(!securitySettings.biometricEnabled)}
            disabled={!biometricAvailable}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: securitySettings.biometricEnabled ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Two-Factor Authentication
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Add an extra layer of security
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: securitySettings.twoFactorEnabled ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...securitySettings, twoFactorEnabled: !securitySettings.twoFactorEnabled };
              saveSecuritySettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: securitySettings.twoFactorEnabled ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Login Notifications
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Get notified of new logins
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: securitySettings.loginNotifications ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...securitySettings, loginNotifications: !securitySettings.loginNotifications };
              saveSecuritySettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: securitySettings.loginNotifications ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>
      </Card>

      {biometricAvailable && (
        <Card style={styles.settingsCard}>
          <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
            Available Biometric Methods
          </Text>
          {authTypes.includes(1) && (
            <View style={styles.biometricMethod}>
              <Ionicons name="finger-print" size={20} color={colors.success} />
              <Text style={[styles.biometricMethodText, { color: colors.text }]}>Fingerprint</Text>
            </View>
          )}
          {authTypes.includes(2) && (
            <View style={styles.biometricMethod}>
              <Ionicons name="happy-outline" size={20} color={colors.success} />
              <Text style={[styles.biometricMethodText, { color: colors.text }]}>Face Recognition</Text>
            </View>
          )}
        </Card>
      )}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Card style={styles.settingsCard}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Booking & Service Updates
        </Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Booking Updates
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Confirmations, reminders, and changes
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: notificationSettings.bookingUpdates ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...notificationSettings, bookingUpdates: !notificationSettings.bookingUpdates };
              saveNotificationSettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: notificationSettings.bookingUpdates ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="business" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Business Updates
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                New services and announcements
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: notificationSettings.businessUpdates ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...notificationSettings, businessUpdates: !notificationSettings.businessUpdates };
              saveNotificationSettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: notificationSettings.businessUpdates ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.settingsCard}>
        <Text style={[styles.settingsSectionTitle, { color: colors.text }]}>
          Marketing & Security
        </Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="megaphone" size={24} color={colors.primary} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Promotions & Deals
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Special offers from local businesses
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: notificationSettings.promotions ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...notificationSettings, promotions: !notificationSettings.promotions };
              saveNotificationSettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: notificationSettings.promotions ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="warning" size={24} color={colors.warning} />
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Security Alerts
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Important security notifications
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              {
                backgroundColor: notificationSettings.securityAlerts ? colors.success : colors.border,
              }
            ]}
            onPress={() => {
              const newSettings = { ...notificationSettings, securityAlerts: !notificationSettings.securityAlerts };
              saveNotificationSettings(newSettings);
            }}
          >
            <View style={[
              styles.toggleThumb,
              {
                transform: [{ translateX: notificationSettings.securityAlerts ? 20 : 2 }],
                backgroundColor: '#FFFFFF',
              }
            ]} />
          </TouchableOpacity>
        </View>
      </Card>
    </View>
  );

  if (isLoading) {
    return <LoadingScreen message="Updating your profile..." />;
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundSecondary]}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Tab Navigation */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          {renderTabButton('profile', 'Profile', 'person-outline')}
          {renderTabButton('security', 'Security', 'shield-outline')}
          {renderTabButton('notifications', 'Notifications', 'notifications-outline')}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </ScrollView>

        {/* Save Button - Only show for profile tab */}
        {activeTab === 'profile' && (
          <View style={[styles.saveContainer, { backgroundColor: colors.background }]}>
            <Button
              title="Save Changes"
              onPress={() => handleSaveProfile({ firstName: form.watch('firstName'), lastName: form.watch('lastName'), email: form.watch('email'), phone: form.watch('phone'), dateOfBirth: form.watch('dateOfBirth') })}
              disabled={!form.formState.isValid || isLoading}
              style={styles.saveButton}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Shadows.small,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginHorizontal: 2,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  tabContent: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  formContainer: {
    gap: Spacing.md,
  },
  settingsCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  settingsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  biometricMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  biometricMethodText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  saveContainer: {
    padding: Spacing.md,
    ...Shadows.small,
  },
  saveButton: {
    width: '100%',
  },
});