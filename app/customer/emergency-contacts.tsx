import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

interface EmergencyService {
  id: string;
  name: string;
  number: string;
  icon: string;
  color: string;
  description: string;
}

const emergencyServices: EmergencyService[] = [
  {
    id: '1',
    name: 'Police',
    number: '100',
    icon: 'shield',
    color: '#3B82F6',
    description: 'Emergency police assistance',
  },
  {
    id: '2',
    name: 'Ambulance',
    number: '108',
    icon: 'medical',
    color: '#EF4444',
    description: 'Medical emergency services',
  },
  {
    id: '3',
    name: 'Fire',
    number: '101',
    icon: 'flame',
    color: '#F97316',
    description: 'Fire emergency services',
  },
  {
    id: '4',
    name: 'Women Helpline',
    number: '181',
    icon: 'female',
    color: '#EC4899',
    description: 'Women safety helpline',
  },
  {
    id: '5',
    name: 'Child Helpline',
    number: '1098',
    icon: 'happy',
    color: '#8B5CF6',
    description: 'Child protection services',
  },
  {
    id: '6',
    name: 'Disaster Management',
    number: '1078',
    icon: 'warning',
    color: '#EAB308',
    description: 'Natural disaster assistance',
  },
];

const mockContacts: EmergencyContact[] = [
  {
    id: '1',
    name: 'John Smith',
    phone: '+91 98765 43210',
    relationship: 'Spouse',
    isPrimary: true,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    phone: '+91 87654 32109',
    relationship: 'Sister',
    isPrimary: false,
  },
  {
    id: '3',
    name: 'Mike Wilson',
    phone: '+91 76543 21098',
    relationship: 'Friend',
    isPrimary: false,
  },
];

export default function EmergencyContactsScreen() {
  const colors = useColors();
  const [contacts, setContacts] = useState<EmergencyContact[]>(mockContacts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const handleSendSOS = () => {
    // In production, this would send SMS to all emergency contacts with location
    const primaryContact = contacts.find((c) => c.isPrimary);
    if (primaryContact) {
      const message = encodeURIComponent(
        'SOS! I need help. This is an emergency alert sent from TownTap app.'
      );
      Linking.openURL(`sms:${primaryContact.phone}?body=${message}`);
    }
  };

  const handleSetPrimary = (id: string) => {
    setContacts((prev) =>
      prev.map((contact) => ({
        ...contact,
        isPrimary: contact.id === id,
      }))
    );
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleAddContact = () => {
    if (newContact.name && newContact.phone) {
      const contact: EmergencyContact = {
        id: Date.now().toString(),
        name: newContact.name,
        phone: newContact.phone,
        relationship: newContact.relationship || 'Other',
        isPrimary: contacts.length === 0,
      };
      setContacts((prev) => [...prev, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddModal(false);
    }
  };

  const handleSaveEdit = () => {
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) => (c.id === editingContact.id ? editingContact : c))
      );
      setEditingContact(null);
      setShowEditModal(false);
    }
  };

  const renderEmergencyService = ({ item }: { item: EmergencyService }) => (
    <TouchableOpacity
      style={[styles.serviceCard, { backgroundColor: colors.card }]}
      onPress={() => handleCall(item.number)}
    >
      <View style={[styles.serviceIcon, { backgroundColor: item.color + '20' }]}>
        <Ionicons name={item.icon as any} size={24} color={item.color} />
      </View>
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
        <ThemedText style={[styles.serviceDesc, { color: colors.textSecondary }]}>
          {item.description}
        </ThemedText>
      </View>
      <View style={[styles.callBadge, { backgroundColor: item.color }]}>
        <ThemedText style={styles.serviceNumber}>{item.number}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.contactMain}
        onPress={() => {
          setEditingContact(item);
          setShowEditModal(true);
        }}
      >
        <View style={styles.contactAvatar}>
          <ThemedText style={styles.avatarText}>
            {item.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </ThemedText>
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactNameRow}>
            <ThemedText style={styles.contactName}>{item.name}</ThemedText>
            {item.isPrimary && (
              <View style={[styles.primaryBadge, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText style={[styles.primaryText, { color: colors.primary }]}>
                  Primary
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.contactPhone, { color: colors.textSecondary }]}>
            {item.phone}
          </ThemedText>
          <ThemedText style={[styles.contactRelation, { color: colors.textSecondary }]}>
            {item.relationship}
          </ThemedText>
        </View>
      </TouchableOpacity>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success + '15' }]}
          onPress={() => handleCall(item.phone.replace(/\s/g, ''))}
        >
          <Ionicons name="call" size={18} color={colors.success} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.info + '15' }]}
          onPress={() => {
            const message = encodeURIComponent('SOS! I need help.');
            Linking.openURL(`sms:${item.phone}?body=${message}`);
          }}
        >
          <Ionicons name="chatbubble" size={18} color={colors.info} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Emergency Contacts</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SOS Button */}
        <View style={styles.sosSection}>
          <TouchableOpacity onPress={handleSendSOS}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.sosButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="warning" size={40} color="#fff" />
              <ThemedText style={styles.sosText}>SOS</ThemedText>
              <ThemedText style={styles.sosSubtext}>Tap to send emergency alert</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
          <ThemedText style={[styles.sosInfo, { color: colors.textSecondary }]}>
            Sends your location to primary contact
          </ThemedText>
        </View>

        {/* Emergency Services */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Emergency Services</ThemedText>
          <FlatList
            data={emergencyServices}
            keyExtractor={(item) => item.id}
            renderItem={renderEmergencyService}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </View>

        {/* My Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>My Emergency Contacts</ThemedText>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary + '15' }]}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <ThemedText style={[styles.addBtnText, { color: colors.primary }]}>Add</ThemedText>
            </TouchableOpacity>
          </View>

          {contacts.length > 0 ? (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={renderContact}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Contacts Added</ThemedText>
              <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                Add emergency contacts who can be notified in case of emergency
              </ThemedText>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <ThemedText style={styles.emptyBtnText}>Add Contact</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Safety Tips */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Safety Tips</ThemedText>
          <View style={[styles.tipsCard, { backgroundColor: colors.card }]}>
            {[
              'Keep at least 2-3 emergency contacts',
              'Set a primary contact for SOS alerts',
              'Share your live location during appointments',
              'Save local emergency numbers',
            ].map((tip, index) => (
              <View key={index} style={styles.tipRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <ThemedText style={[styles.tipText, { color: colors.text }]}>{tip}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Add Emergency Contact</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Name</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Enter name"
                placeholderTextColor={colors.textSecondary}
                value={newContact.name}
                onChangeText={(text) => setNewContact((prev) => ({ ...prev, name: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                value={newContact.phone}
                onChangeText={(text) => setNewContact((prev) => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>Relationship</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="e.g., Spouse, Parent, Friend"
                placeholderTextColor={colors.textSecondary}
                value={newContact.relationship}
                onChangeText={(text) => setNewContact((prev) => ({ ...prev, relationship: text }))}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddContact}
            >
              <ThemedText style={styles.saveBtnText}>Add Contact</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEditModal(false)}
        >
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle} />
            <ThemedText style={styles.modalTitle}>Edit Contact</ThemedText>

            {editingContact && (
              <>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Name</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={editingContact.name}
                    onChangeText={(text) =>
                      setEditingContact((prev) => prev && { ...prev, name: text })
                    }
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Phone Number</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={editingContact.phone}
                    onChangeText={(text) =>
                      setEditingContact((prev) => prev && { ...prev, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.inputLabel}>Relationship</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={editingContact.relationship}
                    onChangeText={(text) =>
                      setEditingContact((prev) => prev && { ...prev, relationship: text })
                    }
                  />
                </View>

                <View style={styles.modalActions}>
                  {!editingContact.isPrimary && (
                    <TouchableOpacity
                      style={[styles.primaryBtn, { borderColor: colors.primary }]}
                      onPress={() => {
                        handleSetPrimary(editingContact.id);
                        setEditingContact((prev) => prev && { ...prev, isPrimary: true });
                      }}
                    >
                      <Ionicons name="star" size={16} color={colors.primary} />
                      <ThemedText style={[styles.primaryBtnText, { color: colors.primary }]}>
                        Set as Primary
                      </ThemedText>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.deleteBtn, { borderColor: colors.error }]}
                    onPress={() => {
                      handleDeleteContact(editingContact.id);
                      setShowEditModal(false);
                    }}
                  >
                    <Ionicons name="trash" size={16} color={colors.error} />
                    <ThemedText style={[styles.deleteBtnText, { color: colors.error }]}>
                      Delete
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveEdit}
                >
                  <ThemedText style={styles.saveBtnText}>Save Changes</ThemedText>
                </TouchableOpacity>
              </>
            )}
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
  sosSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  sosText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 8,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 4,
  },
  sosInfo: {
    fontSize: 12,
    marginTop: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 14,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceDesc: {
    fontSize: 12,
  },
  callBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  contactCard: {
    padding: 14,
    borderRadius: 12,
  },
  contactMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#415D43',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  primaryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  contactRelation: {
    fontSize: 12,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginLeft: 64,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
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
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
