import { ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const profileMenuItems = [
  {
    section: 'Account',
    items: [
      { id: 'edit-profile', title: 'Edit Profile', icon: 'person-outline', route: '/profile/edit-simple' },
      { id: 'addresses', title: 'Saved Addresses', icon: 'location-outline', route: '/customer/addresses' },
      { id: 'payment-methods', title: 'Payment Methods', icon: 'card-outline', route: '/customer/payment-methods' },
      { id: 'wallet', title: 'My Wallet', icon: 'wallet-outline', route: '/customer/wallet' },
    ],
  },
  {
    section: 'Preferences',
    items: [
      { id: 'notifications', title: 'Notifications', icon: 'notifications-outline', route: '/customer/notification-preferences' },
      { id: 'language', title: 'Language', icon: 'language-outline', route: '/settings/language' },
      { id: 'theme', title: 'Theme', icon: 'moon-outline', route: '/settings/theme' },
    ],
  },
  {
    section: 'Support',
    items: [
      { id: 'help', title: 'Help & Support', icon: 'help-circle-outline', route: '/customer/help-support' },
      { id: 'about', title: 'About', icon: 'information-circle-outline', route: '/settings/about' },
      { id: 'privacy', title: 'Privacy Policy', icon: 'shield-outline', route: '/settings/privacy' },
      { id: 'terms', title: 'Terms of Service', icon: 'document-text-outline', route: '/settings/terms' },
    ],
  },
];

export default function ProfileTabScreen() {
  const colors = useColors();
  const { user, profile, signOut } = useAuth();

  const handleMenuPress = (route: string) => {
    console.log('Navigating to:', route);
    try {
      router.push(route as any);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', `Could not navigate to ${route}`);
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

  const handleSwitchRole = () => {
    Alert.alert(
      'Switch to Business Owner',
      'Want to offer your services? Switch to Business Owner account',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            console.log('Switching to business owner');
            router.push('/business-owner/(tabs)/dashboard' as any);
          },
        },
      ]
    );
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => console.log('Take Photo') },
        { text: 'Choose from Gallery', onPress: () => console.log('Choose from Gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleViewBookings = () => {
    router.push('/(tabs)/orders');
  };

  const handleViewFavorites = () => {
    router.push('/customer/favorites');
  };

  const handleViewReviews = () => {
    router.push('/customer/reviews');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.profileHeader}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#FFFFFF" />
              </View>
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={handleChangeProfilePicture}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.profileName}>
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email}</ThemedText>
            
            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => {
                console.log('Edit Profile clicked');
                router.push('/profile/edit-simple');
              }}
            >
              <ThemedText style={styles.editProfileButtonText}>Edit Profile</ThemedText>
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Stats Card */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          style={[styles.statsCard, { backgroundColor: colors.card }]}
        >
          <TouchableOpacity style={styles.statItem} onPress={handleViewBookings}>
            <Ionicons name="receipt" size={24} color={colors.primary} />
            <ThemedText style={styles.statValue}>12</ThemedText>
            <ThemedText style={styles.statLabel}>Bookings</ThemedText>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={handleViewFavorites}>
            <Ionicons name="heart" size={24} color="#F44336" />
            <ThemedText style={styles.statValue}>8</ThemedText>
            <ThemedText style={styles.statLabel}>Favorites</ThemedText>
          </TouchableOpacity>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <TouchableOpacity style={styles.statItem} onPress={handleViewReviews}>
            <Ionicons name="star" size={24} color="#FFC107" />
            <ThemedText style={styles.statValue}>24</ThemedText>
            <ThemedText style={styles.statLabel}>Reviews</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        {/* Switch Role Banner */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <TouchableOpacity
            style={[styles.switchRoleBanner, { backgroundColor: colors.primary + '20' }]}
            onPress={handleSwitchRole}
          >
            <View style={styles.switchRoleContent}>
              <Ionicons name="briefcase" size={32} color={colors.primary} />
              <View style={styles.switchRoleText}>
                <ThemedText style={styles.switchRoleTitle}>
                  Become a Service Provider
                </ThemedText>
                <ThemedText style={styles.switchRoleSubtitle}>
                  Start earning by offering your services
                </ThemedText>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Menu Sections */}
        {profileMenuItems.map((section, sectionIndex) => (
          <Animated.View
            key={section.section}
            entering={FadeInDown.delay(400 + sectionIndex * 100)}
            style={styles.menuSection}
          >
            <ThemedText style={styles.sectionTitle}>{section.section}</ThemedText>
            <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
              {section.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handleMenuPress(item.route)}
                  >
                    <View style={styles.menuItemLeft}>
                      <Ionicons name={item.icon as any} size={22} color={colors.text} />
                      <ThemedText style={styles.menuItemTitle}>{item.title}</ThemedText>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                  {index < section.items.length - 1 && (
                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout Button */}
        <Animated.View entering={FadeInDown.delay(800)} style={styles.logoutContainer}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.card }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#F44336" />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editProfileButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    marginVertical: 8,
  },
  switchRoleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
  },
  switchRoleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  switchRoleText: {
    flex: 1,
  },
  switchRoleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  switchRoleSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.6,
    marginBottom: 12,
    marginHorizontal: 20,
    textTransform: 'uppercase',
  },
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemTitle: {
    fontSize: 16,
  },
  menuDivider: {
    height: 1,
    marginLeft: 50,
  },
  logoutContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
});
