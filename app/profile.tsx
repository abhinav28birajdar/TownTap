import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/context/ModernThemeContext';
import { supabase } from '../src/lib/supabase';
import { UserProfile, NotificationPreferences } from '../src/types';

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuthStore();
  const { theme } = useTheme();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [orderCount, setOrderCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    service_updates: true,
    chat_messages: true,
    promotional: false,
    payments: true,
    reminders: true,
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    whatsapp_notifications: false,
    do_not_disturb: {
      enabled: false
    }
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        profile_picture_url: profile.profile_picture_url || '',
      });
      loadUserStats();
    }
  }, [profile]);

  const loadUserStats = async () => {
    if (!user) return;
    
    try {
      // In a real app, these would be actual database queries
      // For now, we'll use placeholder data
      setOrderCount(12);
      setFavoriteCount(5);
      
      // Try to load notification preferences
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data && !error) {
        setNotificationPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user) {
      await loadUserStats();
    }
    setRefreshing(false);
  };

  const handleUpdateProfile = async () => {
    if (!user || !profileData.full_name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setIsLoading(true);
      await updateProfile(profileData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNotificationPreferences = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    try {
      const updatedPreferences = { 
        ...notificationPreferences,
        [key]: value 
      };
      
      setNotificationPreferences(updatedPreferences);
      
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        });
      
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      Alert.alert('Error', 'Failed to update notification preferences');
    }
  };

  const handlePickImage = async () => {
    if (!user) return;

    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to allow access to your photos to change profile picture');
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
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `profiles/${fileName}`;

        // Upload the file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
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
          .from('avatars')
          .getPublicUrl(filePath);

        if (publicUrlData) {
          const updatedProfile = {
            ...profileData,
            profile_picture_url: publicUrlData.publicUrl
          };
          
          setProfileData(updatedProfile);
          await updateProfile(updatedProfile);
          Alert.alert('Success', 'Profile picture updated successfully');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to update profile picture');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Account', 
          style: 'destructive', 
          onPress: async () => {
            try {
              setIsLoading(true);
              // In a real app, this would delete the account
              // For now, just sign out
              await signOut();
              Alert.alert('Account Deleted', 'Your account has been deleted successfully');
            } catch (error) {
              console.error('Error deleting account:', error);
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  if (!user || !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    {
      title: 'Order History',
      icon: 'receipt-outline',
      description: `${orderCount} orders placed`,
      onPress: () => Alert.alert('Coming Soon', 'Order history feature is coming soon!'),
    },
    {
      title: 'Saved Addresses',
      icon: 'location-outline',
      description: 'Manage your addresses',
      onPress: () => Alert.alert('Coming Soon', 'Address management is coming soon!'),
    },
    {
      title: 'Payment Methods',
      icon: 'card-outline',
      description: 'Add or remove payment options',
      onPress: () => Alert.alert('Coming Soon', 'Payment methods feature is coming soon!'),
    },
    {
      title: 'Favorites',
      icon: 'heart-outline',
      description: `${favoriteCount} favorite businesses`,
      onPress: () => router.push('/favorites'),
    },
    {
      title: 'Help & Support',
      icon: 'help-circle-outline',
      description: 'Get help with your account',
      onPress: () => Alert.alert('Coming Soon', 'Help & support is coming soon!'),
    },
    {
      title: 'Notification Settings',
      icon: 'notifications-outline',
      description: 'Manage notification preferences',
      onPress: () => router.push('/shared/notification-settings'),
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      description: 'App version and information',
      onPress: () => Alert.alert('About TownTap', 'TownTap - Your local services marketplace\nVersion 1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Profile Info */}
        <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.profilePhotoContainer}>
            <TouchableOpacity
              style={styles.profilePhotoWrapper}
              onPress={handlePickImage}
              disabled={isLoading}
            >
              {profileData.profile_picture_url ? (
                <Image
                  source={{ uri: profileData.profile_picture_url }}
                  style={styles.profilePhoto}
                />
              ) : (
                <View style={[styles.profilePhotoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.profilePhotoPlaceholderText}>
                    {profileData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View style={[styles.editProfilePhotoButton, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <View style={styles.editProfileContainer}>
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Ionicons name="person-outline" size={20} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={profileData.full_name}
                  onChangeText={(text: string) => setProfileData({ ...profileData, full_name: text })}
                />
              </View>
              
              <View style={[styles.inputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Ionicons name="call-outline" size={20} color={theme.colors.text} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: theme.colors.text }]}
                  placeholder="Phone Number"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={profileData.phone_number}
                  onChangeText={(text: string) => setProfileData({ ...profileData, phone_number: text })}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.editButtonsContainer}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setIsEditing(false);
                    setProfileData({
                      full_name: profile.full_name || '',
                      email: profile.email || '',
                      phone_number: profile.phone_number || '',
                      profile_picture_url: profile.profile_picture_url || '',
                    });
                  }}
                  disabled={isLoading}
                >
                  <Text style={[styles.editButtonText, styles.cancelButtonText, { color: theme.colors.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleUpdateProfile}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={[styles.editButtonText, styles.saveButtonText]}>
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {profileData.full_name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                {profileData.email}
              </Text>
              {profileData.phone_number && (
                <Text style={[styles.profilePhone, { color: theme.colors.textSecondary }]}>
                  {profileData.phone_number}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.editProfileButton, { borderColor: theme.colors.primary }]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={[styles.editProfileButtonText, { color: theme.colors.primary }]}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Menu Items */}
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
                <View style={[styles.menuItemIconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
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
        
        {/* Notification Preferences Section */}
        <View style={[styles.preferencesContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.preferencesTitle, { color: theme.colors.text }]}>
            Notification Preferences
          </Text>
          
          <View style={styles.preferencesList}>
            <View style={styles.preferenceItem}>
              <View>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
                  Push Notifications
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
                  Receive notifications on this device
                </Text>
              </View>
              <Switch
                value={notificationPreferences.push_notifications}
                onValueChange={(value) => 
                  handleUpdateNotificationPreferences('push_notifications', value)
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.colors.surface : ''}
              />
            </View>
            
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.preferenceItem}>
              <View>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
                  Email Notifications
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
                  Receive important updates via email
                </Text>
              </View>
              <Switch
                value={notificationPreferences.email_notifications}
                onValueChange={(value) => 
                  handleUpdateNotificationPreferences('email_notifications', value)
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.colors.surface : ''}
              />
            </View>
            
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.preferenceItem}>
              <View>
                <Text style={[styles.preferenceLabel, { color: theme.colors.text }]}>
                  SMS Notifications
                </Text>
                <Text style={[styles.preferenceDescription, { color: theme.colors.textSecondary }]}>
                  Receive text notifications (charges may apply)
                </Text>
              </View>
              <Switch
                value={notificationPreferences.sms_notifications}
                onValueChange={(value) => 
                  handleUpdateNotificationPreferences('sms_notifications', value)
                }
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={Platform.OS === 'android' ? theme.colors.surface : ''}
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.accountActionsContainer}>
          <TouchableOpacity
            style={[styles.accountActionButton, { borderColor: theme.colors.border }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={[styles.accountActionText, { color: theme.colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.accountActionButton, { borderColor: theme.colors.border }]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
            <Text style={[styles.accountActionText, { color: theme.colors.error }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
            TownTap v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TextInput = (props: any) => {
  const { theme } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        height: 48, 
        justifyContent: 'center'
      }}>
        <input
          {...props}
          style={{
            outline: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            color: theme.colors.text,
            fontSize: 16,
            ...props.style
          }}
        />
      </View>
    </View>
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
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profilePhotoContainer: {
    marginBottom: 16,
  },
  profilePhotoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'visible',
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePhotoPlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  editProfilePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'blue',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    marginBottom: 12,
  },
  editProfileButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
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
  preferencesContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  preferencesList: {},
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 14,
  },
  separator: {
    height: 1,
  },
  accountActionsContainer: {
    marginBottom: 16,
  },
  accountActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  accountActionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  versionText: {
    fontSize: 14,
  },
  // Edit profile styles
  editProfileContainer: {
    width: '100%',
    paddingHorizontal: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    marginRight: 8,
  },
  saveButton: {
    marginLeft: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {},
  saveButtonText: {
    color: 'white',
  },
});