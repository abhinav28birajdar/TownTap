import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useModernTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface UserProfile {
  full_name: string;
  phone: string;
  user_type: string;
  created_at: string;
  avatar_url?: string;
}

interface OrderStats {
  total_orders: number;
  total_spent: number;
  favorite_category: string;
}

const ProfileScreen: React.FC = () => {
  const { colors, isDark, toggleTheme } = useModernTheme();
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
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profile load error:', profileError);
      } else if (profile) {
        setUserProfile({
          full_name: profile.full_name || 'User',
          phone: profile.phone || '',
          user_type: profile.user_type || 'customer',
          created_at: profile.created_at || '',
          avatar_url: profile.avatar_url,
        });
      }

      // Load order statistics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', user.id);

      if (ordersError) {
        console.error('Orders load error:', ordersError);
      } else if (orders) {
        const totalSpent = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setOrderStats({
          total_orders: orders.length,
          total_spent: totalSpent,
          favorite_category: 'Food & Beverages', // Default for now
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.colors?.primary || '#3B82F6'} />
          <Text style={[styles.loadingText, { color: colors.colors?.text || '#1E293B' }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.colors?.primary || '#3B82F6' }]}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {userProfile?.avatar_url ? (
                <Image 
                  source={{ uri: userProfile.avatar_url }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.colors?.background || '#FFFFFF' }]}>
                  <Ionicons 
                    name="person" 
                    size={40} 
                    color={colors.colors?.primary || '#3B82F6'} 
                  />
                </View>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {userProfile?.full_name || user?.email || 'User'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email || 'No email'}
              </Text>
              <Text style={styles.userType}>
                {userProfile?.user_type?.charAt(0).toUpperCase() + (userProfile?.user_type?.slice(1) || 'customer')}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
            <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
              {orderStats.total_orders}
            </Text>
            <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Total Orders
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
            <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
              ₹{orderStats.total_spent.toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Total Spent
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}>
            <Text style={[styles.statNumber, { color: colors.colors?.primary || '#3B82F6' }]}>
              4.8⭐
            </Text>
            <Text style={[styles.statLabel, { color: colors.colors?.textSecondary || '#64748B' }]}>
              Avg Rating
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
            onPress={() => {/* Navigate to edit profile */}}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="person-outline" 
                size={24} 
                color={colors.colors?.text || '#1E293B'} 
              />
              <Text style={[styles.menuItemText, { color: colors.colors?.text || '#1E293B' }]}>
                Edit Profile
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
            onPress={() => {/* Navigate to addresses */}}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="location-outline" 
                size={24} 
                color={colors.colors?.text || '#1E293B'} 
              />
              <Text style={[styles.menuItemText, { color: colors.colors?.text || '#1E293B' }]}>
                My Addresses
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
            onPress={() => {/* Navigate to payment methods */}}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="card-outline" 
                size={24} 
                color={colors.colors?.text || '#1E293B'} 
              />
              <Text style={[styles.menuItemText, { color: colors.colors?.text || '#1E293B' }]}>
                Payment Methods
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
            onPress={toggleTheme}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name={isDark ? "sunny-outline" : "moon-outline"} 
                size={24} 
                color={colors.colors?.text || '#1E293B'} 
              />
              <Text style={[styles.menuItemText, { color: colors.colors?.text || '#1E293B' }]}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { backgroundColor: colors.colors?.surface || '#FFFFFF' }]}
            onPress={() => {/* Navigate to help */}}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color={colors.colors?.text || '#1E293B'} 
              />
              <Text style={[styles.menuItemText, { color: colors.colors?.text || '#1E293B' }]}>
                Help & Support
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={colors.colors?.textSecondary || '#64748B'} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]}
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons 
                name="log-out-outline" 
                size={24} 
                color="#EF4444" 
              />
              <Text style={[styles.menuItemText, { color: '#EF4444' }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    paddingTop: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  userType: {
    fontSize: 12,
    color: '#CBD5E1',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutItem: {
    marginTop: 16,
  },
});

export default ProfileScreen;
