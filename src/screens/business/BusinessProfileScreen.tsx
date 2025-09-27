import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
  Image,
  Platform,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../context/ModernThemeContext';
import { supabase } from '../../lib/supabase';
import { BusinessProfile, BusinessStats } from '../../types';

const BusinessProfileScreen = () => {
  const { user, profile } = useAuthStore();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [businessStats, setBusinessStats] = useState<BusinessStats>({
    total_orders: 0,
    monthlyOrders: 0,
    totalOrders: 0,
    pending_orders: 0,
    total_revenue: 0,
    avg_rating: 0,
    total_reviews: 0,
    active_products: 0,
    totalViews: 0,
    monthlyViews: 0,
    rating: 0,
    reviewCount: 0,
    favoriteCount: 0,
    shareCount: 0,
  });
  const [storeOpen, setStoreOpen] = useState(true);

  useEffect(() => {
    loadBusinessProfile();
  }, [user]);

  const loadBusinessProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load business profile
      const { data: businessData, error: businessError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        throw businessError;
      }

      if (businessData) {
        setBusinessProfile(businessData);
        loadBusinessStats(businessData.id);
        setStoreOpen(businessData.is_active || false);
      }
    } catch (error) {
      console.error('Error loading business profile:', error);
      Alert.alert('Error', 'Failed to load business profile');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBusinessStats = async (businessId: string) => {
    try {
      // In a real app, these would be actual database queries
      // For now, we'll use placeholder data
      setBusinessStats({
        total_orders: 65,
        monthlyOrders: 12,
        totalOrders: 65,
        pending_orders: 3,
        total_revenue: 12500,
        avg_rating: 4.5,
        total_reviews: 34,
        active_products: 18,
        totalViews: 450,
        monthlyViews: 120,
        rating: 4.5,
        reviewCount: 34,
        favoriteCount: 25,
        shareCount: 12,
      });
    } catch (error) {
      console.error('Error loading business stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBusinessProfile();
    setRefreshing(false);
  };

  const handleEditProfile = () => {
    if (businessProfile) {
      router.push('/business/edit');
    }
  };

  const handleUploadLogo = async () => {
    if (!user || !businessProfile) return;

    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change business logo');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        setIsLoading(true);
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `business-${businessProfile.id}-logo-${Date.now()}.${fileExt}`;
        const filePath = `business/${fileName}`;

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business')
          .upload(filePath, {
            uri: file.uri,
            name: fileName,
            type: `image/${fileExt}`
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('business')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          // Update business profile with new logo URL
          const { data, error } = await supabase
            .from('business_profiles')
            .update({ logo_url: publicUrlData.publicUrl })
            .eq('id', businessProfile.id)
            .select()
            .single();
          
          if (error) throw error;
          
          setBusinessProfile(data);
          Alert.alert('Success', 'Business logo updated successfully');
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        Alert.alert('Error', 'Failed to update business logo');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleUploadBanner = async () => {
    if (!user || !businessProfile) return;

    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change business banner');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      try {
        setIsLoading(true);
        const file = result.assets[0];
        const fileExt = file.uri.split('.').pop();
        const fileName = `business-${businessProfile.id}-banner-${Date.now()}.${fileExt}`;
        const filePath = `business/${fileName}`;

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('business')
          .upload(filePath, {
            uri: file.uri,
            name: fileName,
            type: `image/${fileExt}`
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('business')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          // Update business profile with new banner URL
          const { data, error } = await supabase
            .from('business_profiles')
            .update({ banner_url: publicUrlData.publicUrl })
            .eq('id', businessProfile.id)
            .select()
            .single();
          
          if (error) throw error;
          
          setBusinessProfile(data);
          Alert.alert('Success', 'Business banner updated successfully');
        }
      } catch (error) {
        console.error('Error uploading banner:', error);
        Alert.alert('Error', 'Failed to update business banner');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleStoreStatus = async () => {
    if (!businessProfile) return;
    
    try {
      setIsLoading(true);
      
      // Toggle store status
      const newStatus = !storeOpen;
      setStoreOpen(newStatus);
      
      // Update in database
      const { error } = await supabase
        .from('business_profiles')
        .update({ is_active: newStatus })
        .eq('id', businessProfile.id);
        
      if (error) throw error;
      
      Alert.alert(
        'Status Updated',
        newStatus ? 'Your business is now open to customers' : 'Your business is now closed to customers'
      );
    } catch (error) {
      console.error('Error updating store status:', error);
      Alert.alert('Error', 'Failed to update business status');
      // Revert UI change on error
      setStoreOpen(!storeOpen);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterBusiness = () => {
    router.push('/business/registration');
  };

  if (isLoading && !businessProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading business profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no business profile exists, show register business screen
  if (!businessProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={styles.emptyStateContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={[styles.emptyStateIcon, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.emptyStateIconText}>🏪</Text>
          </View>
          
          <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
            Create Your Business Profile
          </Text>
          
          <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
            Set up your business profile to start connecting with customers and growing your business.
          </Text>
          
          <TouchableOpacity
            style={[styles.createBusinessButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleRegisterBusiness}
          >
            <Text style={styles.createBusinessButtonText}>
              Register Your Business
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      title: 'Business Dashboard',
      icon: 'pie-chart-outline',
      description: 'View business analytics and stats',
      onPress: () => router.push('/business/dashboard'),
    },
    {
      title: 'Manage Orders',
      icon: 'list-outline',
      description: `${businessStats.pending_orders} pending orders`,
      onPress: () => router.push('/business/orders'),
    },
    {
      title: 'Reviews & Ratings',
      icon: 'star-outline',
      description: `${businessStats.total_reviews} customer reviews`,
      onPress: () => router.push('/business/reviews'),
    },
    {
      title: 'Analytics',
      icon: 'bar-chart-outline',
      description: 'View detailed performance metrics',
      onPress: () => router.push('/business/analytics'),
    },
    {
      title: 'Service Settings',
      icon: 'settings-outline',
      description: 'Update services, pricing and availability',
      onPress: () => router.push('/business/service-settings'),
    },
    {
      title: 'Business Hours',
      icon: 'time-outline',
      description: 'Manage your operating hours',
      onPress: () => router.push('/business/hours'),
    },
    {
      title: 'Payment Settings',
      icon: 'card-outline',
      description: 'Manage payment methods and account',
      onPress: () => router.push('/business/payment-settings'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Business Banner */}
        <View style={styles.bannerContainer}>
          {businessProfile.banner_url ? (
            <Image 
              source={{ uri: businessProfile.banner_url }} 
              style={styles.bannerImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.bannerPlaceholder, { backgroundColor: theme.colors.primary }]}>
              <Ionicons name="image-outline" size={32} color="white" />
              <Text style={styles.bannerPlaceholderText}>Upload Banner Image</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.bannerEditButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleUploadBanner}
          >
            <Ionicons name="camera-outline" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Business Info Section */}
        <View style={[styles.businessInfoContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.logoContainer}>
            {businessProfile.logo_url ? (
              <Image 
                source={{ uri: businessProfile.logo_url }} 
                style={styles.logoImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primaryLight }]}>
                <Text style={[styles.logoPlaceholderText, { color: theme.colors.primary }]}>
                  {businessProfile.name?.charAt(0) || businessProfile.business_name?.charAt(0) || 'B'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[styles.logoEditButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleUploadLogo}
            >
              <Ionicons name="camera" size={14} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.businessTextInfo}>
            <Text style={[styles.businessName, { color: theme.colors.text }]}>
              {businessProfile.business_name || businessProfile.name}
            </Text>
            
            <Text style={[styles.businessCategory, { color: theme.colors.textSecondary }]}>
              {businessProfile.category}
            </Text>
            
            <View style={styles.businessRatingContainer}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(businessStats.avg_rating) ? "star" : "star-outline"}
                    size={16}
                    color={star <= Math.round(businessStats.avg_rating) ? "#FFD700" : theme.colors.textSecondary}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={[styles.businessRatingText, { color: theme.colors.textSecondary }]}>
                {businessStats.avg_rating.toFixed(1)} ({businessStats.total_reviews} reviews)
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.editBusinessButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEditProfile}
          >
            <Text style={styles.editBusinessButtonText}>Edit Business</Text>
          </TouchableOpacity>
        </View>

        {/* Business Status Toggle */}
        <View style={[styles.statusContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              Business Status
            </Text>
            <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
              {storeOpen ? 'Your business is visible to customers' : 'Your business is hidden from customers'}
            </Text>
          </View>
          
          <Switch
            value={storeOpen}
            onValueChange={toggleStoreStatus}
            disabled={isLoading}
            trackColor={{ false: theme.colors.border, true: theme.colors.success }}
            thumbColor={Platform.OS === 'android' ? theme.colors.surface : ''}
          />
        </View>

        {/* Business Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {businessStats.total_orders}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Orders
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              ₹{businessStats.total_revenue.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Revenue
            </Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {businessStats.totalViews}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Profile Views
            </Text>
          </View>
        </View>

        {/* Business Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                { backgroundColor: theme.colors.surface },
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuItemIconContainer, { backgroundColor: theme.colors.primaryLight }]}>
                  <Ionicons name={item.icon as any} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemTitle, { color: theme.colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuItemDescription, { color: theme.colors.textSecondary }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateIconText: {
    fontSize: 32,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  createBusinessButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  createBusinessButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bannerContainer: {
    position: 'relative',
    height: 180,
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  bannerEditButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  businessInfoContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  logoPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  logoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  businessTextInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  businessCategory: {
    fontSize: 16,
    marginBottom: 6,
  },
  businessRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  businessRatingText: {
    fontSize: 14,
  },
  editBusinessButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  editBusinessButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  statusContainer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 1,
  },
  menuItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
  },
});

export default BusinessProfileScreen;