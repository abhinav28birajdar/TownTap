import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernButton } from '../../components/modern/ModernButton';
import { ModernCard } from '../../components/modern/ModernCard';
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface UserProfile {
  full_name: string | null;
  phone: string | null;
  user_type: string;
  avatar_url: string | null;
}

const ModernCustomerProfileScreen: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout 
        },
      ]
    );
  };

  const menuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Manage your profile details',
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to personal info */},
    },
    {
      id: 'orders',
      title: 'Order History',
      subtitle: 'View your past orders',
      icon: 'receipt-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to order history */},
    },
    {
      id: 'addresses',
      title: 'Saved Addresses',
      subtitle: 'Manage delivery addresses',
      icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to addresses */},
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      icon: 'card-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to payment methods */},
    },
    {
      id: 'notifications',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to notifications */},
    },
    {
      id: 'support',
      title: 'Help & Support',
      subtitle: 'Get help and contact support',
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => {/* Navigate to support */},
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    headerTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    profileCard: {
      marginBottom: theme.spacing.lg,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      ...theme.typography.h2,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    profileEmail: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    profileType: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      alignSelf: 'flex-start',
      textTransform: 'uppercase',
      fontWeight: '600',
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    menuItem: {
      marginBottom: theme.spacing.sm,
    },
    menuItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    menuItemIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    menuItemInfo: {
      flex: 1,
    },
    menuItemTitle: {
      ...theme.typography.body1,
      color: theme.colors.text,
      fontWeight: '500',
      marginBottom: theme.spacing.xs,
    },
    menuItemSubtitle: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    menuItemArrow: {
      marginLeft: theme.spacing.sm,
    },
    logoutSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      paddingTop: theme.spacing.lg,
    },
  });

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={24}
                color={theme.colors.icon}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <ModernCard style={styles.profileCard} variant="elevated">
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(profile?.full_name || null)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {profile?.full_name || 'Customer'}
                </Text>
                <Text style={styles.profileEmail}>
                  {user?.email}
                </Text>
                <Text style={styles.profileType}>
                  Customer
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>

        {/* Menu Items */}
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            {menuItems.map((item) => (
              <ModernCard
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                variant="default"
                padding="none"
              >
                <View style={styles.menuItemContent}>
                  <View style={styles.menuItemIcon}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={theme.colors.icon}
                    />
                  </View>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemTitle}>{item.title}</Text>
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.iconInactive}
                    style={styles.menuItemArrow}
                  />
                </View>
              </ModernCard>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <ModernButton
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          icon="log-out-outline"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

export default ModernCustomerProfileScreen;
