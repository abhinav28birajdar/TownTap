import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface UserProfile {
  full_name: string;
  phone: string;
  user_type: string;
  created_at: string;
}

interface OrderStats {
  total_orders: number;
  total_spent: number;
  favorite_category: string;
}

const CustomerProfileScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuthStore();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats>({
    total_orders: 0,
    total_spent: 0,
    favorite_category: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;

    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile({
          full_name: profile.full_name || '',
          phone: profile.phone || '',
          user_type: profile.user_type || '',
          created_at: profile.created_at || '',
        });
      }

      // Load order statistics
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', user.id);

      if (orders) {
        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setOrderStats(prev => ({
          ...prev,
          total_orders: orders.length,
          total_spent: totalSpent,
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
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
          onPress: () => logout(),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateToScreen = (screenName: string) => {
    // Navigation will be implemented when screens are available
    Alert.alert('Coming Soon', `${screenName} feature will be available soon!`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      backgroundColor: theme.colors.primary,
      padding: 20,
      paddingTop: 10,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerButton: {
      padding: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userDetails: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    userEmail: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    userType: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'capitalize',
      marginTop: 2,
    },
    memberSince: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.6)',
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    actionButtons: {
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionButtonIcon: {
      marginRight: 12,
    },
    actionButtonText: {
      fontSize: 16,
      color: theme.colors.text,
      flex: 1,
    },
    actionButtonChevron: {
      opacity: 0.5,
    },
    logoutButton: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FCA5A5',
    },
    logoutButtonText: {
      color: '#DC2626',
    },
    profileInfo: {
      gap: 12,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginTop: 12,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.full_name || 'Customer'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userType}>
              {userProfile?.user_type?.replace('_', ' ') || 'Customer'}
            </Text>
            <Text style={styles.memberSince}>
              Member since {formatDate(userProfile?.created_at || '')}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orderStats.total_orders}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹{orderStats.total_spent}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orderStats.favorite_category}</Text>
              <Text style={styles.statLabel}>Favorite Category</Text>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.profileInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>
                {userProfile?.full_name || 'Not provided'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {userProfile?.phone || 'Not provided'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>
                {userProfile?.user_type?.replace('_', ' ') || 'Customer'}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Personal Information')}
            >
              <Ionicons name="person-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Personal Information</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Saved Addresses')}
            >
              <Ionicons name="location-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Saved Addresses</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Payment Methods')}
            >
              <Ionicons name="card-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Payment Methods</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Notifications')}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Privacy & Security')}
            >
              <Ionicons name="shield-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToScreen('Help & Support')}
            >
              <Ionicons name="help-circle-outline" size={20} color={theme.colors.text} style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} style={styles.actionButtonChevron} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" style={styles.actionButtonIcon} />
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerProfileScreen;
