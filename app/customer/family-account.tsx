import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  phone?: string;
  email?: string;
  avatar?: string;
  initials: string;
  permissions: string[];
  isAdmin: boolean;
  addedOn: string;
  lastActive?: string;
  totalBookings: number;
  totalSpent: number;
}

const mockMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'You (Account Owner)',
    relationship: 'Self',
    phone: '+91 98765 43210',
    email: 'owner@example.com',
    initials: 'YO',
    permissions: ['book', 'pay', 'manage', 'invite'],
    isAdmin: true,
    addedOn: 'Account Created',
    totalBookings: 24,
    totalSpent: 15600,
  },
  {
    id: '2',
    name: 'Priya Sharma',
    relationship: 'Spouse',
    phone: '+91 98765 43211',
    email: 'priya@example.com',
    initials: 'PS',
    permissions: ['book', 'pay'],
    isAdmin: false,
    addedOn: 'Nov 15, 2024',
    lastActive: 'Dec 26, 2024',
    totalBookings: 8,
    totalSpent: 4200,
  },
  {
    id: '3',
    name: 'Rahul Sharma',
    relationship: 'Son',
    phone: '+91 98765 43212',
    initials: 'RS',
    permissions: ['book'],
    isAdmin: false,
    addedOn: 'Nov 20, 2024',
    lastActive: 'Dec 22, 2024',
    totalBookings: 3,
    totalSpent: 1500,
  },
  {
    id: '4',
    name: 'Anita Sharma',
    relationship: 'Daughter',
    initials: 'AS',
    permissions: ['book'],
    isAdmin: false,
    addedOn: 'Dec 1, 2024',
    totalBookings: 2,
    totalSpent: 800,
  },
];

const relationships = ['Spouse', 'Parent', 'Child', 'Son', 'Daughter', 'Sibling', 'Other'];
const permissionsList = [
  { id: 'book', label: 'Book Services', icon: 'calendar' },
  { id: 'pay', label: 'Make Payments', icon: 'card' },
  { id: 'manage', label: 'Manage Bookings', icon: 'settings' },
  { id: 'invite', label: 'Invite Members', icon: 'person-add' },
];

export default function FamilyAccountScreen() {
  const colors = useColors();
  const [members, setMembers] = useState<FamilyMember[]>(mockMembers);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Add member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState('');
  const [newMemberPermissions, setNewMemberPermissions] = useState<string[]>(['book']);

  const totalSpent = members.reduce((sum, m) => sum + m.totalSpent, 0);
  const totalBookings = members.reduce((sum, m) => sum + m.totalBookings, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const togglePermission = (permission: string) => {
    if (permission === 'book') return; // Book is always required
    setNewMemberPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleAddMember = () => {
    if (!newMemberName || !newMemberRelationship) return;

    const newMember: FamilyMember = {
      id: Date.now().toString(),
      name: newMemberName,
      relationship: newMemberRelationship,
      phone: newMemberPhone || undefined,
      email: newMemberEmail || undefined,
      initials: newMemberName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      permissions: newMemberPermissions,
      isAdmin: false,
      addedOn: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      totalBookings: 0,
      totalSpent: 0,
    };

    setMembers([...members, newMember]);
    setShowAddModal(false);
    resetForm();
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter((m) => m.id !== memberId));
    setShowMemberModal(false);
  };

  const resetForm = () => {
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setNewMemberRelationship('');
    setNewMemberPermissions(['book']);
  };

  const getRelationshipColor = (relationship: string) => {
    const colors_map: Record<string, string> = {
      Spouse: '#E91E63',
      Parent: '#9C27B0',
      Child: '#2196F3',
      Son: '#2196F3',
      Daughter: '#FF9800',
      Sibling: '#4CAF50',
      Other: '#607D8B',
    };
    return colors_map[relationship] || colors.primary;
  };

  const renderMember = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={[styles.memberCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedMember(item);
        setShowMemberModal(true);
      }}
    >
      <View
        style={[
          styles.avatar,
          { backgroundColor: item.isAdmin ? colors.primary : getRelationshipColor(item.relationship) },
        ]}
      >
        <ThemedText style={styles.avatarText}>{item.initials}</ThemedText>
      </View>

      <View style={styles.memberInfo}>
        <View style={styles.memberNameRow}>
          <ThemedText style={styles.memberName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          {item.isAdmin && (
            <View style={[styles.adminBadge, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="shield-checkmark" size={10} color={colors.primary} />
              <ThemedText style={[styles.adminText, { color: colors.primary }]}>Admin</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.relationship, { color: colors.textSecondary }]}>
          {item.relationship}
        </ThemedText>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="calendar" size={12} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              {item.totalBookings} bookings
            </ThemedText>
          </View>
          <View style={styles.stat}>
            <Ionicons name="wallet" size={12} color={colors.textSecondary} />
            <ThemedText style={[styles.statText, { color: colors.textSecondary }]}>
              ₹{item.totalSpent.toLocaleString()}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.permissionIcons}>
        {item.permissions.slice(0, 3).map((p) => (
          <Ionicons
            key={p}
            name={permissionsList.find((pl) => pl.id === p)?.icon as any}
            size={14}
            color={colors.textSecondary}
          />
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Family Account</ThemedText>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="person-add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Summary Card */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.summaryCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.familyIcon}>
              <Ionicons name="people" size={28} color="#fff" />
            </View>
            <View>
              <ThemedText style={styles.familyTitle}>Sharma Family</ThemedText>
              <ThemedText style={styles.familySubtitle}>
                {members.length} members • Since Nov 2024
              </ThemedText>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>{totalBookings}</ThemedText>
              <ThemedText style={styles.summaryLabel}>Total Bookings</ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <ThemedText style={styles.summaryValue}>
                ₹{totalSpent.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Total Spent</ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <ThemedText style={styles.sectionTitle}>Family Benefits</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.benefitsScroll}
          >
            {[
              { icon: 'wallet', title: 'Shared Wallet', desc: 'Single payment source' },
              { icon: 'gift', title: 'Family Rewards', desc: 'Earn together, save more' },
              { icon: 'calendar', title: 'Easy Scheduling', desc: 'Book for anyone' },
              { icon: 'shield', title: 'Safe Access', desc: 'Control permissions' },
            ].map((benefit, index) => (
              <View
                key={index}
                style={[styles.benefitCard, { backgroundColor: colors.card }]}
              >
                <View style={[styles.benefitIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={benefit.icon as any} size={20} color={colors.primary} />
                </View>
                <ThemedText style={styles.benefitTitle}>{benefit.title}</ThemedText>
                <ThemedText style={[styles.benefitDesc, { color: colors.textSecondary }]}>
                  {benefit.desc}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Family Members</ThemedText>
            <TouchableOpacity onPress={() => setShowAddModal(true)}>
              <ThemedText style={[styles.addText, { color: colors.primary }]}>
                + Add Member
              </ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={renderMember}
            scrollEnabled={false}
            contentContainerStyle={styles.membersList}
          />
        </View>

        {/* Tips Section */}
        <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
          <View style={[styles.tipsIcon, { backgroundColor: colors.info + '15' }]}>
            <Ionicons name="bulb" size={24} color={colors.info} />
          </View>
          <View style={styles.tipsContent}>
            <ThemedText style={styles.tipsTitle}>Pro Tip</ThemedText>
            <ThemedText style={[styles.tipsText, { color: colors.textSecondary }]}>
              Add family members to share rewards and make bookings easier. Each member can
              have customized permissions based on their needs.
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Member Details Modal */}
      <Modal visible={showMemberModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMemberModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            {selectedMember && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <View
                    style={[
                      styles.modalAvatar,
                      {
                        backgroundColor: selectedMember.isAdmin
                          ? colors.primary
                          : getRelationshipColor(selectedMember.relationship),
                      },
                    ]}
                  >
                    <ThemedText style={styles.modalAvatarText}>
                      {selectedMember.initials}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.modalName}>{selectedMember.name}</ThemedText>
                  <ThemedText style={[styles.modalRelation, { color: colors.textSecondary }]}>
                    {selectedMember.relationship}
                  </ThemedText>
                </View>

                {/* Contact Info */}
                {(selectedMember.phone || selectedMember.email) && (
                  <View style={[styles.contactSection, { backgroundColor: colors.background }]}>
                    {selectedMember.phone && (
                      <View style={styles.contactRow}>
                        <Ionicons name="call" size={18} color={colors.textSecondary} />
                        <ThemedText style={styles.contactText}>{selectedMember.phone}</ThemedText>
                      </View>
                    )}
                    {selectedMember.email && (
                      <View style={styles.contactRow}>
                        <Ionicons name="mail" size={18} color={colors.textSecondary} />
                        <ThemedText style={styles.contactText}>{selectedMember.email}</ThemedText>
                      </View>
                    )}
                  </View>
                )}

                {/* Stats */}
                <View style={styles.modalStats}>
                  <View style={[styles.modalStat, { backgroundColor: colors.background }]}>
                    <ThemedText style={styles.modalStatValue}>
                      {selectedMember.totalBookings}
                    </ThemedText>
                    <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                      Bookings
                    </ThemedText>
                  </View>
                  <View style={[styles.modalStat, { backgroundColor: colors.background }]}>
                    <ThemedText style={styles.modalStatValue}>
                      ₹{selectedMember.totalSpent.toLocaleString()}
                    </ThemedText>
                    <ThemedText style={[styles.modalStatLabel, { color: colors.textSecondary }]}>
                      Spent
                    </ThemedText>
                  </View>
                </View>

                {/* Permissions */}
                <View style={styles.permissionsSection}>
                  <ThemedText style={styles.permissionsTitle}>Permissions</ThemedText>
                  {permissionsList.map((perm) => (
                    <View key={perm.id} style={styles.permissionRow}>
                      <View style={styles.permissionLeft}>
                        <View
                          style={[
                            styles.permissionIcon,
                            {
                              backgroundColor: selectedMember.permissions.includes(perm.id)
                                ? colors.success + '15'
                                : colors.textSecondary + '15',
                            },
                          ]}
                        >
                          <Ionicons
                            name={perm.icon as any}
                            size={16}
                            color={
                              selectedMember.permissions.includes(perm.id)
                                ? colors.success
                                : colors.textSecondary
                            }
                          />
                        </View>
                        <ThemedText style={styles.permissionLabel}>{perm.label}</ThemedText>
                      </View>
                      <Ionicons
                        name={
                          selectedMember.permissions.includes(perm.id)
                            ? 'checkmark-circle'
                            : 'close-circle'
                        }
                        size={20}
                        color={
                          selectedMember.permissions.includes(perm.id)
                            ? colors.success
                            : colors.textSecondary
                        }
                      />
                    </View>
                  ))}
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                  <View style={styles.infoRow}>
                    <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                      Added On
                    </ThemedText>
                    <ThemedText style={styles.infoValue}>{selectedMember.addedOn}</ThemedText>
                  </View>
                  {selectedMember.lastActive && (
                    <View style={styles.infoRow}>
                      <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>
                        Last Active
                      </ThemedText>
                      <ThemedText style={styles.infoValue}>{selectedMember.lastActive}</ThemedText>
                    </View>
                  )}
                </View>

                {/* Actions */}
                {!selectedMember.isAdmin && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[styles.editPermBtn, { borderColor: colors.primary }]}
                      onPress={() => {
                        setShowMemberModal(false);
                        setShowPermissionsModal(true);
                      }}
                    >
                      <Ionicons name="settings" size={18} color={colors.primary} />
                      <ThemedText style={[styles.editPermBtnText, { color: colors.primary }]}>
                        Edit Permissions
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.removeBtn, { backgroundColor: colors.error }]}
                      onPress={() => handleRemoveMember(selectedMember.id)}
                    >
                      <Ionicons name="person-remove" size={18} color="#fff" />
                      <ThemedText style={styles.removeBtnText}>Remove</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Member Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={[styles.addModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.addModalTitle}>Add Family Member</ThemedText>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Name *</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter name"
                  placeholderTextColor={colors.textSecondary}
                  value={newMemberName}
                  onChangeText={setNewMemberName}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Relationship *</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.relationshipOptions}>
                    {relationships.map((rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={[
                          styles.relationshipOption,
                          {
                            backgroundColor:
                              newMemberRelationship === rel
                                ? colors.primary
                                : colors.background,
                          },
                        ]}
                        onPress={() => setNewMemberRelationship(rel)}
                      >
                        <ThemedText
                          style={{
                            color: newMemberRelationship === rel ? '#fff' : colors.text,
                            fontWeight: '500',
                          }}
                        >
                          {rel}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Phone (Optional)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  value={newMemberPhone}
                  onChangeText={setNewMemberPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Email (Optional)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Enter email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  value={newMemberEmail}
                  onChangeText={setNewMemberEmail}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.formLabel}>Permissions</ThemedText>
                {permissionsList.map((perm) => (
                  <TouchableOpacity
                    key={perm.id}
                    style={[styles.permissionToggle, { backgroundColor: colors.background }]}
                    onPress={() => togglePermission(perm.id)}
                    disabled={perm.id === 'book'}
                  >
                    <View style={styles.permissionToggleLeft}>
                      <View
                        style={[
                          styles.permToggleIcon,
                          { backgroundColor: colors.primary + '15' },
                        ]}
                      >
                        <Ionicons name={perm.icon as any} size={16} color={colors.primary} />
                      </View>
                      <ThemedText style={styles.permToggleLabel}>{perm.label}</ThemedText>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: newMemberPermissions.includes(perm.id)
                            ? colors.primary
                            : 'transparent',
                          borderColor: newMemberPermissions.includes(perm.id)
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {newMemberPermissions.includes(perm.id) && (
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.addMemberBtn,
                  {
                    backgroundColor:
                      newMemberName && newMemberRelationship
                        ? colors.primary
                        : colors.textSecondary,
                  },
                ]}
                onPress={handleAddMember}
                disabled={!newMemberName || !newMemberRelationship}
              >
                <Ionicons name="person-add" size={18} color="#fff" />
                <ThemedText style={styles.addMemberBtnText}>Add Member</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
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
  summaryCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  familyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  familySubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  benefitsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  benefitCard: {
    width: 130,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitDesc: {
    fontSize: 11,
    textAlign: 'center',
  },
  membersSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addText: {
    fontSize: 14,
    fontWeight: '600',
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminText: {
    fontSize: 10,
    fontWeight: '600',
  },
  relationship: {
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 11,
  },
  permissionIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  tipsCard: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    gap: 14,
  },
  tipsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalRelation: {
    fontSize: 14,
  },
  contactSection: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  contactText: {
    fontSize: 14,
  },
  modalStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalStat: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  modalStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  permissionsSection: {
    marginBottom: 16,
  },
  permissionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  permissionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permissionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionLabel: {
    fontSize: 14,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  editPermBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  editPermBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  relationshipOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  relationshipOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  permissionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  permissionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  permToggleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permToggleLabel: {
    fontSize: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addMemberBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
