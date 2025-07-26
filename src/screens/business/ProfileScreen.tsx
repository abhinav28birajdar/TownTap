import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  is_open: boolean;
  delivery_radius: number;
  min_order_amount: number;
  delivery_fee: number;
  estimated_delivery_time: number;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
}

interface UserProfile {
  full_name: string;
  phone: string;
  user_type: string;
  created_at: string;
}

const BusinessProfileScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
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

      // Load business profile
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (business) {
        setBusinessProfile(business);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessProfile = async () => {
    if (!user?.id || !businessProfile) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('businesses')
        .upsert({
          ...businessProfile,
          owner_id: user.id,
        });

      if (error) throw error;

      Alert.alert('Success', 'Business profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating business profile:', error);
      Alert.alert('Error', 'Failed to update business profile');
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
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
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
    },
    editButton: {
      padding: 8,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    fieldValue: {
      fontSize: 16,
      color: theme.text,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textInput: {
      fontSize: 16,
      color: theme.text,
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.text,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    statusText: {
      fontSize: 16,
      fontWeight: '600',
    },
    verifiedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    verifiedText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffffff',
      marginLeft: 4,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.background,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    ratingText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.text,
      marginLeft: 8,
    },
    reviewCount: {
      fontSize: 14,
      color: theme.textSecondary,
      marginLeft: 8,
    },
    actionButtons: {
      gap: 12,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    actionButtonText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 12,
      flex: 1,
    },
    logoutButton: {
      backgroundColor: '#FEF2F2',
      borderColor: '#FCA5A5',
    },
    logoutButtonText: {
      color: '#DC2626',
    },
    saveButton: {
      backgroundColor: theme.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
    cancelButton: {
      backgroundColor: theme.textSecondary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Business Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={toggleTheme}>
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'B'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              {userProfile?.full_name || 'Business Owner'}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <Text style={styles.userType}>
              {userProfile?.user_type?.replace('_', ' ') || 'Business Owner'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Business Information */}
        {businessProfile ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Business Information</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => isEditing ? saveBusinessProfile() : setIsEditing(true)}
              >
                <Ionicons 
                  name={isEditing ? "checkmark" : "pencil"} 
                  size={24} 
                  color={theme.primary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Business Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={businessProfile.name}
                  onChangeText={(text) => setBusinessProfile(prev => prev ? { ...prev, name: text } : null)}
                  placeholder="Enter business name"
                />
              ) : (
                <Text style={styles.fieldValue}>{businessProfile.name}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={businessProfile.description}
                  onChangeText={(text) => setBusinessProfile(prev => prev ? { ...prev, description: text } : null)}
                  placeholder="Describe your business"
                  multiline
                />
              ) : (
                <Text style={styles.fieldValue}>{businessProfile.description}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Category</Text>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={businessProfile.category}
                  onChangeText={(text) => setBusinessProfile(prev => prev ? { ...prev, category: text } : null)}
                  placeholder="Business category"
                />
              ) : (
                <Text style={styles.fieldValue}>{businessProfile.category}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Address</Text>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={businessProfile.address}
                  onChangeText={(text) => setBusinessProfile(prev => prev ? { ...prev, address: text } : null)}
                  placeholder="Business address"
                />
              ) : (
                <Text style={styles.fieldValue}>{businessProfile.address}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={businessProfile.phone}
                  onChangeText={(text) => setBusinessProfile(prev => prev ? { ...prev, phone: text } : null)}
                  placeholder="Business phone"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.fieldValue}>{businessProfile.phone}</Text>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Status</Text>
              {isEditing ? (
                <View style={styles.switchContainer}>
                  <Text style={styles.switchLabel}>Currently Open</Text>
                  <Switch
                    value={businessProfile.is_open}
                    onValueChange={(value) => setBusinessProfile(prev => prev ? { ...prev, is_open: value } : null)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor={businessProfile.is_open ? '#ffffff' : '#f4f3f4'}
                  />
                </View>
              ) : (
                <View style={styles.statusIndicator}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: businessProfile.is_open ? '#10B981' : '#EF4444' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: businessProfile.is_open ? '#10B981' : '#EF4444' }
                  ]}>
                    {businessProfile.is_open ? 'Open' : 'Closed'}
                  </Text>
                </View>
              )}
            </View>

            {businessProfile.is_verified && (
              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Verification Status</Text>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                  <Text style={styles.verifiedText}>VERIFIED BUSINESS</Text>
                </View>
              </View>
            )}

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Customer Rating</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={styles.ratingText}>
                  {businessProfile.rating?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.reviewCount}>
                  ({businessProfile.total_reviews || 0} reviews)
                </Text>
              </View>
            </View>

            {isEditing && (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={saveBusinessProfile}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Not Registered</Text>
            <Text style={{ color: theme.textSecondary, marginBottom: 16 }}>
              Complete your business registration to start serving customers.
            </Text>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setBusinessProfile({
                id: '',
                name: '',
                description: '',
                category: '',
                address: '',
                phone: '',
                email: user?.email || '',
                is_open: true,
                delivery_radius: 5,
                min_order_amount: 0,
                delivery_fee: 0,
                estimated_delivery_time: 30,
                is_verified: false,
                rating: 0,
                total_reviews: 0,
              })}
            >
              <Text style={styles.saveButtonText}>Register Business</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="person-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Personal Information</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="notifications-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="shield-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle-outline" size={20} color={theme.text} />
              <Text style={styles.actionButtonText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
              <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BusinessProfileScreen;
