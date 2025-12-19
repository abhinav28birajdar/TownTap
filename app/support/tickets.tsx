import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  messageCount: number;
}

const mockTickets: Ticket[] = [
  {
    id: 'TKT-2024-1234',
    subject: 'Service provider did not show up',
    description: 'I booked a home cleaning service but the provider never arrived...',
    category: 'Booking Issues',
    status: 'in_progress',
    priority: 'high',
    createdAt: '2 hours ago',
    updatedAt: '30 mins ago',
    assignedTo: 'Priya Sharma',
    messageCount: 5,
  },
  {
    id: 'TKT-2024-1233',
    subject: 'Refund not received',
    description: 'I cancelled my booking 3 days ago but refund is pending...',
    category: 'Payment',
    status: 'open',
    priority: 'medium',
    createdAt: '1 day ago',
    updatedAt: '1 day ago',
    messageCount: 2,
  },
  {
    id: 'TKT-2024-1232',
    subject: 'Unable to apply promo code',
    description: 'The promo code SAVE20 is not working on my order...',
    category: 'Promotions',
    status: 'resolved',
    priority: 'low',
    createdAt: '3 days ago',
    updatedAt: '2 days ago',
    assignedTo: 'Rahul Kumar',
    messageCount: 4,
  },
  {
    id: 'TKT-2024-1231',
    subject: 'App crashing on checkout',
    description: 'Every time I try to proceed to payment, the app crashes...',
    category: 'Technical',
    status: 'closed',
    priority: 'high',
    createdAt: '1 week ago',
    updatedAt: '5 days ago',
    assignedTo: 'Tech Support',
    messageCount: 8,
  },
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

const issueCategories = [
  { id: 'booking', label: 'Booking Issues', icon: 'calendar' },
  { id: 'payment', label: 'Payment', icon: 'card' },
  { id: 'service', label: 'Service Quality', icon: 'star' },
  { id: 'technical', label: 'Technical', icon: 'bug' },
  { id: 'account', label: 'Account', icon: 'person' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
];

export default function SupportTicketsScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketCategory, setNewTicketCategory] = useState('');
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');

  const filteredTickets = mockTickets.filter((ticket) => {
    if (selectedFilter !== 'all' && ticket.status !== selectedFilter) return false;
    if (searchQuery && !ticket.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.info;
      case 'in_progress':
        return colors.warning;
      case 'resolved':
        return colors.success;
      case 'closed':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={[styles.ticketCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/support/ticket/${item.id}` as any)}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIdRow}>
          <ThemedText style={[styles.ticketId, { color: colors.textSecondary }]}>
            {item.id}
          </ThemedText>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusLabel(item.status)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.ticketSubject} numberOfLines={2}>
        {item.subject}
      </ThemedText>
      <ThemedText style={[styles.ticketDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </ThemedText>
      <View style={styles.ticketFooter}>
        <View style={styles.ticketMeta}>
          <View style={[styles.categoryTag, { backgroundColor: colors.border }]}>
            <ThemedText style={[styles.categoryText, { color: colors.textSecondary }]}>
              {item.category}
            </ThemedText>
          </View>
          <View style={styles.messageCount}>
            <Ionicons name="chatbubble" size={14} color={colors.textSecondary} />
            <ThemedText style={[styles.messageCountText, { color: colors.textSecondary }]}>
              {item.messageCount}
            </ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.ticketTime, { color: colors.textSecondary }]}>
          Updated {item.updatedAt}
        </ThemedText>
      </View>
      {item.assignedTo && (
        <View style={[styles.assignedRow, { borderTopColor: colors.border }]}>
          <Ionicons name="person-circle" size={16} color={colors.primary} />
          <ThemedText style={[styles.assignedText, { color: colors.textSecondary }]}>
            Assigned to {item.assignedTo}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleCreateTicket = () => {
    // In real app, create ticket via API
    setShowNewTicket(false);
    setNewTicketCategory('');
    setNewTicketSubject('');
    setNewTicketDescription('');
    // Show success message
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Tickets</ThemedText>
        <TouchableOpacity onPress={() => setShowNewTicket(true)}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.info + '15' }]}>
          <ThemedText style={[styles.statValue, { color: colors.info }]}>
            {mockTickets.filter((t) => t.status === 'open').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.info }]}>Open</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.warning + '15' }]}>
          <ThemedText style={[styles.statValue, { color: colors.warning }]}>
            {mockTickets.filter((t) => t.status === 'in_progress').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.warning }]}>In Progress</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.success + '15' }]}>
          <ThemedText style={[styles.statValue, { color: colors.success }]}>
            {mockTickets.filter((t) => t.status === 'resolved' || t.status === 'closed').length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.success }]}>Resolved</ThemedText>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search tickets..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  selectedFilter === category.id ? colors.primary : colors.card,
              },
            ]}
            onPress={() => setSelectedFilter(category.id)}
          >
            <ThemedText
              style={[
                styles.filterText,
                { color: selectedFilter === category.id ? '#fff' : colors.text },
              ]}
            >
              {category.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tickets List */}
      <FlatList
        data={filteredTickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ticketsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="ticket-outline" size={40} color={colors.primary} />
            </View>
            <ThemedText style={styles.emptyTitle}>No Tickets Found</ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              {searchQuery
                ? 'Try adjusting your search or filters'
                : "You don't have any support tickets yet"}
            </ThemedText>
            {!searchQuery && (
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => setShowNewTicket(true)}
              >
                <ThemedText style={styles.createButtonText}>Create New Ticket</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* New Ticket Modal */}
      <Modal visible={showNewTicket} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <ThemedText style={styles.modalTitle}>Create New Ticket</ThemedText>
              <TouchableOpacity onPress={() => setShowNewTicket(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              {/* Category Selection */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Category</ThemedText>
                <View style={styles.categoryGrid}>
                  {issueCategories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor:
                            newTicketCategory === cat.id ? colors.primary + '15' : colors.card,
                          borderColor:
                            newTicketCategory === cat.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewTicketCategory(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={22}
                        color={newTicketCategory === cat.id ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText
                        style={[
                          styles.categoryOptionText,
                          { color: newTicketCategory === cat.id ? colors.primary : colors.text },
                        ]}
                      >
                        {cat.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Subject */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Subject</ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.card, color: colors.text }]}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.textSecondary}
                  value={newTicketSubject}
                  onChangeText={setNewTicketSubject}
                />
              </View>

              {/* Description */}
              <View style={styles.formSection}>
                <ThemedText style={styles.formLabel}>Description</ThemedText>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                  placeholder="Provide details about your issue..."
                  placeholderTextColor={colors.textSecondary}
                  value={newTicketDescription}
                  onChangeText={setNewTicketDescription}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>

              {/* Attachment */}
              <TouchableOpacity
                style={[styles.attachmentButton, { borderColor: colors.border }]}
              >
                <Ionicons name="attach" size={22} color={colors.primary} />
                <ThemedText style={[styles.attachmentText, { color: colors.primary }]}>
                  Add Attachments
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => setShowNewTicket(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {
                    backgroundColor:
                      newTicketCategory && newTicketSubject && newTicketDescription
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={handleCreateTicket}
                disabled={!newTicketCategory || !newTicketSubject || !newTicketDescription}
              >
                <ThemedText
                  style={[
                    styles.submitButtonText,
                    {
                      color:
                        newTicketCategory && newTicketSubject && newTicketDescription
                          ? '#fff'
                          : colors.textSecondary,
                    },
                  ]}
                >
                  Submit Ticket
                </ThemedText>
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
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filters: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ticketsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  ticketCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  ticketDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  },
  messageCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketTime: {
    fontSize: 11,
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  assignedText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    width: (width - 52) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  categoryOptionText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  textInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    height: 120,
    paddingTop: 14,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
