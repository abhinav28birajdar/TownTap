import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuthStore } from '../../stores/authStore';

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'switch' | 'navigation' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  icon: string;
  color?: string;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = useAuthStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLanguageChange = () => {
    Alert.alert(
      t('settings.language'),
      t('settings.selectLanguage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'English',
          onPress: () => i18n.changeLanguage('en'),
        },
        {
          text: 'हिंदी',
          onPress: () => i18n.changeLanguage('hi'),
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: () => {
            signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            });
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('settings.deleteAccount'),
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            console.log('Delete account requested');
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: t('settings.account'),
      items: [
        {
          id: 'profile',
          title: t('settings.profile'),
          subtitle: t('settings.profileSubtitle'),
          type: 'navigation' as const,
          icon: 'person-outline',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          id: 'language',
          title: t('settings.language'),
          subtitle: i18n.language === 'hi' ? 'हिंदी' : 'English',
          type: 'navigation' as const,
          icon: 'language-outline',
          onPress: handleLanguageChange,
        },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        {
          id: 'notifications',
          title: t('settings.notifications'),
          subtitle: t('settings.notificationsSubtitle'),
          type: 'switch' as const,
          icon: 'notifications-outline',
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          id: 'location',
          title: t('settings.location'),
          subtitle: t('settings.locationSubtitle'),
          type: 'switch' as const,
          icon: 'location-outline',
          value: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          id: 'biometric',
          title: t('settings.biometric'),
          subtitle: t('settings.biometricSubtitle'),
          type: 'switch' as const,
          icon: 'finger-print-outline',
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          id: 'darkMode',
          title: t('settings.darkMode'),
          subtitle: t('settings.darkModeSubtitle'),
          type: 'switch' as const,
          icon: 'moon-outline',
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
      ],
    },
    {
      title: t('settings.support'),
      items: [
        {
          id: 'help',
          title: t('settings.help'),
          subtitle: t('settings.helpSubtitle'),
          type: 'navigation' as const,
          icon: 'help-circle-outline',
          onPress: () => {
            // Navigate to help/FAQ
            console.log('Navigate to help');
          },
        },
        {
          id: 'contact',
          title: t('settings.contactSupport'),
          subtitle: t('settings.contactSupportSubtitle'),
          type: 'navigation' as const,
          icon: 'mail-outline',
          onPress: () => {
            // Navigate to contact support
            console.log('Navigate to contact support');
          },
        },
        {
          id: 'feedback',
          title: t('settings.feedback'),
          subtitle: t('settings.feedbackSubtitle'),
          type: 'navigation' as const,
          icon: 'chatbubble-outline',
          onPress: () => {
            // Navigate to feedback
            console.log('Navigate to feedback');
          },
        },
      ],
    },
    {
      title: t('settings.legal'),
      items: [
        {
          id: 'privacy',
          title: t('settings.privacy'),
          subtitle: t('settings.privacySubtitle'),
          type: 'navigation' as const,
          icon: 'shield-outline',
          onPress: () => {
            // Navigate to privacy policy
            console.log('Navigate to privacy policy');
          },
        },
        {
          id: 'terms',
          title: t('settings.terms'),
          subtitle: t('settings.termsSubtitle'),
          type: 'navigation' as const,
          icon: 'document-text-outline',
          onPress: () => {
            // Navigate to terms of service
            console.log('Navigate to terms of service');
          },
        },
        {
          id: 'about',
          title: t('settings.about'),
          subtitle: 'TownTap v1.0.0',
          type: 'navigation' as const,
          icon: 'information-circle-outline',
          onPress: () => {
            // Navigate to about page
            console.log('Navigate to about page');
          },
        },
      ],
    },
    {
      title: t('settings.account'),
      items: [
        {
          id: 'signOut',
          title: t('settings.signOut'),
          subtitle: t('settings.signOutSubtitle'),
          type: 'action' as const,
          icon: 'log-out-outline',
          color: '#FF3B30',
          onPress: handleSignOut,
        },
        {
          id: 'deleteAccount',
          title: t('settings.deleteAccount'),
          subtitle: t('settings.deleteAccountSubtitle'),
          type: 'action' as const,
          icon: 'trash-outline',
          color: '#FF3B30',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.settingItem}
      onPress={item.onPress}
      activeOpacity={item.type === 'switch' ? 1 : 0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: (item.color || '#007AFF') + '20' }
        ]}>
          <Ionicons
            name={item.icon as any}
            size={20}
            color={item.color || '#007AFF'}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.settingTitle,
            item.color && { color: item.color }
          ]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={styles.settingSubtitle}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.settingItemRight}>
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E5E5EA', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        )}
        {item.type === 'navigation' && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color="#C7C7CC"
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (section: any, index: number) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <View style={styles.sectionContent}>
        {section.items.map(renderSettingItem)}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          <Text style={styles.userType}>
            {user?.user_type === 'business' ? t('common.business') : t('common.customer')}
          </Text>
        </View>
      </View>

      {/* Settings Sections */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settingSections.map(renderSection)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#007AFF20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  settingItemRight: {
    marginLeft: 12,
  },
});

export default SettingsScreen;
