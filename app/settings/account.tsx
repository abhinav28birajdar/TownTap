import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AccountSection {
  title: string;
  items: AccountItem[];
}

interface AccountItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  action?: 'navigate' | 'edit' | 'toggle' | 'verify';
  route?: string;
  verified?: boolean;
  dangerous?: boolean;
}

export default function AccountSettingsScreen() {
  const colors = useColors();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // User profile data (would come from auth context in real app)
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 98765 43210',
    emailVerified: true,
    phoneVerified: true,
    avatar: null,
  });

  const sections: AccountSection[] = [
    {
      title: 'Profile Information',
      items: [
        { 
          id: 'name', 
          icon: 'person-outline', 
          title: 'Full Name', 
          value: profile.name, 
          action: 'edit' 
        },
        { 
          id: 'email', 
          icon: 'mail-outline', 
          title: 'Email Address', 
          value: profile.email, 
          action: 'edit',
          verified: profile.emailVerified,
        },
        { 
          id: 'phone', 
          icon: 'call-outline', 
          title: 'Phone Number', 
          value: profile.phone, 
          action: 'edit',
          verified: profile.phoneVerified,
        },
      ],
    },
    {
      title: 'Security',
      items: [
        { 
          id: 'password', 
          icon: 'lock-closed-outline', 
          title: 'Change Password', 
          subtitle: 'Last changed 3 months ago',
          action: 'navigate',
          route: '/settings/change-password',
        },
        { 
          id: 'twoFactor', 
          icon: 'shield-checkmark-outline', 
          title: 'Two-Factor Authentication', 
          subtitle: 'Enabled',
          action: 'navigate',
          route: '/settings/two-factor',
        },
        { 
          id: 'biometric', 
          icon: 'finger-print-outline', 
          title: 'Biometric Login', 
          subtitle: 'Use Face ID / Fingerprint',
          action: 'toggle',
        },
        { 
          id: 'sessions', 
          icon: 'phone-portrait-outline', 
          title: 'Active Sessions', 
          subtitle: '2 devices',
          action: 'navigate',
          route: '/settings/active-sessions',
        },
      ],
    },
    {
      title: 'Linked Accounts',
      items: [
        { 
          id: 'google', 
          icon: 'logo-google', 
          title: 'Google', 
          subtitle: 'Connected',
          action: 'navigate',
        },
        { 
          id: 'facebook', 
          icon: 'logo-facebook', 
          title: 'Facebook', 
          subtitle: 'Not connected',
          action: 'navigate',
        },
        { 
          id: 'apple', 
          icon: 'logo-apple', 
          title: 'Apple', 
          subtitle: 'Not connected',
          action: 'navigate',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          id: 'language', 
          icon: 'language-outline', 
          title: 'Language', 
          value: 'English',
          action: 'navigate',
          route: '/settings/language',
        },
        { 
          id: 'currency', 
          icon: 'cash-outline', 
          title: 'Currency', 
          value: 'INR (₹)',
          action: 'navigate',
        },
        { 
          id: 'timezone', 
          icon: 'time-outline', 
          title: 'Timezone', 
          value: 'IST (UTC+5:30)',
          action: 'navigate',
        },
      ],
    },
    {
      title: 'Danger Zone',
      items: [
        { 
          id: 'deactivate', 
          icon: 'pause-circle-outline', 
          title: 'Deactivate Account', 
          subtitle: 'Temporarily disable your account',
          action: 'navigate',
          dangerous: true,
        },
        { 
          id: 'delete', 
          icon: 'trash-outline', 
          title: 'Delete Account', 
          subtitle: 'Permanently delete your account and data',
          action: 'navigate',
          dangerous: true,
        },
      ],
    },
  ];

  const handleEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editField) return;
    
    setProfile({ ...profile, [editField]: editValue });
    setShowEditModal(false);
    setEditField(null);
    setEditValue('');
    
    Alert.alert('Success', 'Profile updated successfully');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // Handle account deletion
            router.replace('/auth/sign-in');
          }
        },
      ]
    );
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'name': return 'Full Name';
      case 'email': return 'Email Address';
      case 'phone': return 'Phone Number';
      default: return field;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Account Settings</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.avatarText}>
                  {profile.name.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.avatarHint}>Tap to change photo</ThemedText>
        </View>

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </ThemedText>
            
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && { 
                      borderBottomWidth: 1, 
                      borderBottomColor: colors.border 
                    },
                  ]}
                  onPress={() => {
                    if (item.action === 'edit') {
                      handleEdit(item.id, item.value || '');
                    } else if (item.action === 'navigate' && item.route) {
                      router.push(item.route as any);
                    } else if (item.id === 'delete') {
                      handleDeleteAccount();
                    }
                  }}
                >
                  <View style={styles.settingLeft}>
                    <View style={[
                      styles.settingIcon,
                      { backgroundColor: item.dangerous ? colors.error + '15' : colors.primary + '15' }
                    ]}>
                      <Ionicons
                        name={item.icon as any}
                        size={20}
                        color={item.dangerous ? colors.error : colors.primary}
                      />
                    </View>
                    <View style={styles.settingInfo}>
                      <ThemedText style={[
                        styles.settingTitle,
                        item.dangerous && { color: colors.error }
                      ]}>
                        {item.title}
                      </ThemedText>
                      {item.subtitle && (
                        <ThemedText style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                          {item.subtitle}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.settingRight}>
                    {item.value && (
                      <ThemedText style={[styles.settingValue, { color: colors.textSecondary }]} numberOfLines={1}>
                        {item.value}
                      </ThemedText>
                    )}
                    {item.verified !== undefined && (
                      <View style={[
                        styles.verifiedBadge,
                        { backgroundColor: item.verified ? colors.success + '15' : colors.warning + '15' }
                      ]}>
                        <Ionicons
                          name={item.verified ? 'checkmark-circle' : 'alert-circle'}
                          size={14}
                          color={item.verified ? colors.success : colors.warning}
                        />
                        <ThemedText style={[
                          styles.verifiedText,
                          { color: item.verified ? colors.success : colors.warning }
                        ]}>
                          {item.verified ? 'Verified' : 'Verify'}
                        </ThemedText>
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionSection}>
          <ThemedText style={[styles.versionText, { color: colors.textSecondary }]}>
            TownTap v1.0.0
          </ThemedText>
          <ThemedText style={[styles.versionSubtext, { color: colors.textSecondary }]}>
            Member since January 2024
          </ThemedText>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                Edit {getFieldLabel(editField || '')}
              </ThemedText>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={[styles.editInput, { 
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Enter ${getFieldLabel(editField || '').toLowerCase()}`}
              placeholderTextColor={colors.textSecondary}
              autoFocus
              keyboardType={editField === 'email' ? 'email-address' : editField === 'phone' ? 'phone-pad' : 'default'}
            />
            
            {editField === 'email' && (
              <ThemedText style={[styles.editHint, { color: colors.textSecondary }]}>
                A verification email will be sent to your new email address
              </ThemedText>
            )}
            
            {editField === 'phone' && (
              <ThemedText style={[styles.editHint, { color: colors.textSecondary }]}>
                An OTP will be sent to verify your new phone number
              </ThemedText>
            )}
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowEditModal(false)}
              >
                <ThemedText style={[styles.cancelButtonText, { color: colors.text }]}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveEdit}
              >
                <ThemedText style={styles.saveButtonText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: '700',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: 12,
    marginTop: 8,
    opacity: 0.6,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    maxWidth: 120,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  versionSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  editHint: {
    fontSize: 12,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
