import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { User } from '../../types';

interface UserPreferences {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    newBusinesses: boolean;
    weeklyDigest: boolean;
  };
  delivery: {
    defaultAddress: string;
    preferredTimeSlot: string;
    contactlessDelivery: boolean;
  };
  language: 'en' | 'hi';
  theme: 'light' | 'dark' | 'auto';
}

interface OrderHistory {
  id: string;
  businessName: string;
  items: string[];
  total: number;
  date: string;
  status: 'delivered' | 'cancelled' | 'pending';
}

export default function CustomerProfileScreen() {
  const { user, updateUser, signOut } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(user);
  const [preferences, setPreferences] = useState<UserPreferences>({
    notifications: {
      orderUpdates: true,
      promotions: true,
      newBusinesses: false,
      weeklyDigest: true,
    },
    delivery: {
      defaultAddress: '123 Main St, Mumbai, Maharashtra 400001',
      preferredTimeSlot: '6PM - 8PM',
      contactlessDelivery: false,
    },
    language: 'en',
    theme: 'light',
  });
  const [recentOrders, setRecentOrders] = useState<OrderHistory[]>([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadRecentOrders();
  }, []);

  const loadUserData = async () => {
    // Simulate loading user preferences
    // In real app, this would fetch from backend
  };

  const loadRecentOrders = async () => {
    // Simulate loading recent orders
    const mockOrders: OrderHistory[] = [
      {
        id: '1',
        businessName: 'Fresh Mart Grocery',
        items: ['Vegetables', 'Fruits', 'Dairy'],
        total: 450,
        date: '2024-01-15',
        status: 'delivered',
      },
      {
        id: '2',
        businessName: 'Quick Electronics',
        items: ['Phone Charger', 'Headphones'],
        total: 1200,
        date: '2024-01-12',
        status: 'delivered',
      },
      {
        id: '3',
        businessName: 'Local Pharmacy',
        items: ['Medicines', 'Vitamins'],
        total: 320,
        date: '2024-01-10',
        status: 'delivered',
      },
    ];
    setRecentOrders(mockOrders);
  };

  const handleSaveProfile = async () => {
    if (!editedUser) return;

    try {
      await updateUser(editedUser);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const updatePreference = <K extends keyof UserPreferences>(
    category: K,
    key: keyof UserPreferences[K],
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] as any),
        [key]: value,
      },
    }));
  };

  const renderProfileSection = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>👤 Profile Information</Text>
        <TouchableOpacity
          onPress={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          {isEditing && (
            <TouchableOpacity style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.profileFields}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedUser?.full_name || ''}
                onChangeText={(text) => setEditedUser(prev => prev ? { ...prev, full_name: text } : null)}
                placeholder="Enter your name"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.full_name || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email</Text>
            <Text style={styles.fieldValue}>{user?.email || 'Not provided'}</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={editedUser?.phone_number || ''}
                onChangeText={(text) => setEditedUser(prev => prev ? { ...prev, phone_number: text } : null)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone_number || 'Not provided'}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Location</Text>
            <Text style={styles.fieldValue}>
              Mumbai, Maharashtra
            </Text>
          </View>
        </View>

        {isEditing && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Preferences</Text>

      {/* Notifications */}
      <View style={styles.preferenceCategory}>
        <Text style={styles.categoryTitle}>Notifications</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Order Updates</Text>
          <Switch
            value={preferences.notifications.orderUpdates}
            onValueChange={(value) => updatePreference('notifications', 'orderUpdates', value)}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={preferences.notifications.orderUpdates ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Promotions & Offers</Text>
          <Switch
            value={preferences.notifications.promotions}
            onValueChange={(value) => updatePreference('notifications', 'promotions', value)}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={preferences.notifications.promotions ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>New Businesses</Text>
          <Switch
            value={preferences.notifications.newBusinesses}
            onValueChange={(value) => updatePreference('notifications', 'newBusinesses', value)}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={preferences.notifications.newBusinesses ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Delivery Preferences */}
      <View style={styles.preferenceCategory}>
        <Text style={styles.categoryTitle}>Delivery</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceLabel}>Contactless Delivery</Text>
          <Switch
            value={preferences.delivery.contactlessDelivery}
            onValueChange={(value) => updatePreference('delivery', 'contactlessDelivery', value)}
            trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
            thumbColor={preferences.delivery.contactlessDelivery ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceLabel}>Default Address</Text>
          <Text style={styles.preferenceValue}>
            {preferences.delivery.defaultAddress}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceButton}>
          <Text style={styles.preferenceLabel}>Preferred Time Slot</Text>
          <Text style={styles.preferenceValue}>
            {preferences.delivery.preferredTimeSlot}
          </Text>
        </TouchableOpacity>
      </View>

      {/* App Settings */}
      <View style={styles.preferenceCategory}>
        <Text style={styles.categoryTitle}>App Settings</Text>
        
        <TouchableOpacity 
          style={styles.preferenceButton}
          onPress={() => setShowLanguageModal(true)}
        >
          <Text style={styles.preferenceLabel}>Language</Text>
          <Text style={styles.preferenceValue}>
            {preferences.language === 'en' ? 'English' : 'हिंदी'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.preferenceButton}
          onPress={() => setShowThemeModal(true)}
        >
          <Text style={styles.preferenceLabel}>Theme</Text>
          <Text style={styles.preferenceValue}>
            {preferences.theme === 'light' ? 'Light' : preferences.theme === 'dark' ? 'Dark' : 'Auto'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentOrdersSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📦 Recent Orders</Text>
      
      {recentOrders.map((order) => (
        <View key={order.id} style={styles.orderItem}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderBusinessName}>{order.businessName}</Text>
            <View style={[
              styles.orderStatus,
              order.status === 'delivered' && styles.orderStatusDelivered,
              order.status === 'pending' && styles.orderStatusPending,
              order.status === 'cancelled' && styles.orderStatusCancelled,
            ]}>
              <Text style={styles.orderStatusText}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.orderItems}>
            {order.items.join(', ')}
          </Text>
          <View style={styles.orderFooter}>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderTotal}>₹{order.total}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllButtonText}>View All Orders</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {renderProfileSection()}
      {renderPreferencesSection()}
      {renderRecentOrdersSection()}

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Language</Text>
            
            <TouchableOpacity
              style={[
                styles.modalOption,
                preferences.language === 'en' && styles.modalOptionActive
              ]}
              onPress={() => {
                updatePreference('language', 'language' as any, 'en');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                preferences.language === 'hi' && styles.modalOptionActive
              ]}
              onPress={() => {
                updatePreference('language', 'language' as any, 'hi');
                setShowLanguageModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>हिंदी</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Theme</Text>
            
            {['light', 'dark', 'auto'].map((theme) => (
              <TouchableOpacity
                key={theme}
                style={[
                  styles.modalOption,
                  preferences.theme === theme && styles.modalOptionActive
                ]}
                onPress={() => {
                  updatePreference('theme', 'theme' as any, theme);
                  setShowThemeModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Auto'}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowThemeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  signOutButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
  changePhotoText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '500',
  },
  profileFields: {
    width: '100%',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  fieldInput: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  preferenceCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderBusinessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  orderStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  orderStatusDelivered: {
    backgroundColor: '#E8F5E8',
  },
  orderStatusPending: {
    backgroundColor: '#FFF3E0',
  },
  orderStatusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  viewAllButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
  },
  modalOptionActive: {
    backgroundColor: '#2196F3',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalCloseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#f0f0f0',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
});
