import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useLocationStore } from '../../src/stores/locationStore';

interface ProfileOption {
  id: string;
  title: string;
  icon: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

export default function ProfileTab() {
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => {
          // Handle logout logic here
          console.log('User logged out');
        }},
      ]
    );
  };

  const profileOptions: ProfileOption[] = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      icon: '👤',
      type: 'navigate',
      onPress: () => console.log('Navigate to personal info'),
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      icon: '📍',
      type: 'navigate',
      onPress: () => console.log('Navigate to addresses'),
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      icon: '💳',
      type: 'navigate',
      onPress: () => console.log('Navigate to payment methods'),
    },
    {
      id: 'order-history',
      title: 'Order History',
      icon: '📦',
      type: 'navigate',
      onPress: () => console.log('Navigate to order history'),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      type: 'toggle',
      value: notificationsEnabled,
      onPress: () => setNotificationsEnabled(!notificationsEnabled),
    },
    {
      id: 'dark-mode',
      title: 'Dark Mode',
      icon: '🌙',
      type: 'toggle',
      value: darkModeEnabled,
      onPress: () => setDarkModeEnabled(!darkModeEnabled),
    },
    {
      id: 'language',
      title: 'Language',
      icon: '🌐',
      type: 'navigate',
      onPress: () => console.log('Navigate to language settings'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: '❓',
      type: 'navigate',
      onPress: () => console.log('Navigate to help'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: '🔒',
      type: 'navigate',
      onPress: () => console.log('Navigate to privacy policy'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: '📋',
      type: 'navigate',
      onPress: () => console.log('Navigate to terms'),
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: '🚪',
      type: 'action',
      onPress: handleLogout,
    },
  ];

  const renderProfileOption = (option: ProfileOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        option.id === 'logout' && styles.logoutCard,
      ]}
      onPress={option.onPress}
    >
      <View style={styles.optionContent}>
        <Text style={styles.optionIcon}>{option.icon}</Text>
        <Text style={[
          styles.optionTitle,
          option.id === 'logout' && styles.logoutText,
        ]}>
          {option.title}
        </Text>
      </View>
      
      {option.type === 'toggle' ? (
        <Switch
          value={option.value}
          onValueChange={option.onPress}
          trackColor={{ false: '#E9ECEF', true: '#007AFF' }}
          thumbColor={option.value ? '#FFFFFF' : '#FFFFFF'}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Text style={styles.headerSubtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Guest User</Text>
            <Text style={styles.userEmail}>guest@towntap.com</Text>
            <Text style={styles.userLocation}>
              {latitude && longitude 
                ? `📍 ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                : '📍 Location not available'
              }
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {profileOptions.slice(0, 4).map(renderProfileOption)}
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          {profileOptions.slice(4, 7).map(renderProfileOption)}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          {profileOptions.slice(7, 10).map(renderProfileOption)}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          {profileOptions.slice(10).map(renderProfileOption)}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>TownTap v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 12,
    color: '#999999',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginHorizontal: 20,
    color: '#1A1A1A',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutCard: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  logoutText: {
    color: '#DC3545',
  },
  chevron: {
    fontSize: 20,
    color: '#CED4DA',
    fontWeight: 'bold',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999999',
  },
});
