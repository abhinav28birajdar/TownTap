import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'booking' | 'payment' | 'service' | 'technical' | 'other';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: string;
  attachments?: string[];
}

const tickets: Ticket[] = [
  {
    id: '1',
    ticketNumber: 'TKT-2024-001',
    subject: 'Payment not reflected in wallet',
    description: 'I made a payment of ₹500 but it is not showing in my wallet balance.',
    category: 'payment',
    status: 'in-progress',
    priority: 'high',
    createdAt: 'Dec 22, 2024',
    updatedAt: 'Dec 23, 2024',
    messages: [
      { id: '1', sender: 'user', message: 'I made a payment of ₹500 but it is not showing in my wallet balance.', timestamp: 'Dec 22, 10:30 AM' },
      { id: '2', sender: 'support', message: 'Thank you for reaching out. We are looking into this issue. Could you please share the transaction ID?', timestamp: 'Dec 22, 11:15 AM' },
      { id: '3', sender: 'user', message: 'Transaction ID: TXN1234567890', timestamp: 'Dec 22, 11:45 AM' },
      { id: '4', sender: 'support', message: 'We have identified the issue. Your wallet will be credited within 2 hours.', timestamp: 'Dec 23, 9:00 AM' },
    ],
  },
  {
    id: '2',
    ticketNumber: 'TKT-2024-002',
    subject: 'Service provider was late',
    description: 'The cleaning service was scheduled for 10 AM but the provider arrived at 11:30 AM.',
    category: 'service',
    status: 'resolved',
    priority: 'medium',
    createdAt: 'Dec 20, 2024',
    updatedAt: 'Dec 21, 2024',
    messages: [
      { id: '1', sender: 'user', message: 'The cleaning service was scheduled for 10 AM but the provider arrived at 11:30 AM.', timestamp: 'Dec 20, 12:00 PM' },
      { id: '2', sender: 'support', message: 'We apologize for the inconvenience. We have credited ₹100 to your wallet as compensation.', timestamp: 'Dec 21, 10:00 AM' },
    ],
  },
  {
    id: '3',
    ticketNumber: 'TKT-2024-003',
    subject: 'Unable to cancel booking',
    description: 'Getting an error when trying to cancel my upcoming booking.',
    category: 'technical',
    status: 'open',
    priority: 'medium',
    createdAt: 'Dec 23, 2024',
    updatedAt: 'Dec 23, 2024',
    messages: [
      { id: '1', sender: 'user', message: 'Getting an error when trying to cancel my upcoming booking.', timestamp: 'Dec 23, 2:00 PM' },
    ],
  },
];

const faqs = [
  { question: 'How do I cancel a booking?', category: 'booking' },
  { question: 'What is the refund policy?', category: 'payment' },
  { question: 'How to reschedule a service?', category: 'booking' },
  { question: 'How do I contact my service provider?', category: 'service' },
  { question: 'My payment failed, what should I do?', category: 'payment' },
];

export default function HelpSupportScreen() {
  const colors = useColors();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    category: 'other' as Ticket['category'],
  });
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === 'all') return true;
    return ticket.status === filterStatus;
  });

  const getStatusColor = (status: Ticket['status']) => {
    switch (status) {
      case 'open': return colors.info;
      case 'in-progress': return colors.warning;
      case 'resolved': return colors.success;
      case 'closed': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Ticket['priority']) => {
    switch (priority) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      case 'low': return colors.info;
      default: return colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: Ticket['category']) => {
    switch (category) {
      case 'booking': return 'calendar';
      case 'payment': return 'card';
      case 'service': return 'construct';
      case 'technical': return 'bug';
      case 'other': return 'help-circle';
      default: return 'help-circle';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedTicket) {
      // Add message logic here
      setNewMessage('');
    }
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={[styles.ticketCard, { backgroundColor: colors.card }]}
      onPress={() => {
        setSelectedTicket(item);
        setShowTicketModal(true);
      }}
    >
      <View style={styles.ticketHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.ticketInfo}>
          <ThemedText style={[styles.ticketNumber, { color: colors.textSecondary }]}>
            {item.ticketNumber}
          </ThemedText>
          <ThemedText style={styles.ticketSubject} numberOfLines={1}>
            {item.subject}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.replace('-', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.ticketDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </ThemedText>
      <View style={styles.ticketFooter}>
        <View style={styles.ticketMeta}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
          <ThemedText style={[styles.priorityText, { color: colors.textSecondary }]}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
          </ThemedText>
        </View>
        <ThemedText style={[styles.ticketDate, { color: colors.textSecondary }]}>
          {item.updatedAt}
        </ThemedText>
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
        <ThemedText style={styles.headerTitle}>Help & Support</ThemedText>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary }]}>
            <Ionicons name="call" size={24} color="#FFF" />
            <ThemedText style={styles.quickActionText}>Call Us</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.info }]}>
            <Ionicons name="chatbubbles" size={24} color="#FFF" />
            <ThemedText style={styles.quickActionText}>Live Chat</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.success }]}>
            <Ionicons name="mail" size={24} color="#FFF" />
            <ThemedText style={styles.quickActionText}>Email</ThemedText>
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
          <View style={[styles.faqCard, { backgroundColor: colors.card }]}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.faqItem,
                  index !== faqs.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                ]}
              >
                <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTab,
                  filterStatus === status && { backgroundColor: colors.primary }
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <ThemedText style={[
                  styles.filterText,
                  { color: filterStatus === status ? '#FFF' : colors.textSecondary }
                ]}>
                  {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Support Tickets */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Support Tickets ({filteredTickets.length})
          </ThemedText>
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <View key={ticket.id}>
                {renderTicket({ item: ticket })}
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="ticket-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Tickets</ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Create a new ticket for support
              </ThemedText>
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Ticket Detail Modal */}
      <Modal
        visible={showTicketModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTicketModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Ticket Details</ThemedText>
              <TouchableOpacity onPress={() => setShowTicketModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {selectedTicket && (
              <>
                {/* Ticket Info */}
                <View style={[styles.ticketInfoCard, { backgroundColor: colors.background }]}>
                  <View style={styles.ticketInfoHeader}>
                    <ThemedText style={[styles.ticketInfoNumber, { color: colors.primary }]}>
                      {selectedTicket.ticketNumber}
                    </ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTicket.status) + '15' }]}>
                      <ThemedText style={[styles.statusText, { color: getStatusColor(selectedTicket.status) }]}>
                        {selectedTicket.status.replace('-', ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.ticketInfoSubject}>{selectedTicket.subject}</ThemedText>
                  <View style={styles.ticketInfoMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                      <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                        {selectedTicket.createdAt}
                      </ThemedText>
                    </View>
                    <View style={styles.metaItem}>
                      <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(selectedTicket.priority) }]} />
                      <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                        {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Messages */}
                <ScrollView style={styles.messagesContainer} showsVerticalScrollIndicator={false}>
                  {selectedTicket.messages.map((msg) => (
                    <View
                      key={msg.id}
                      style={[
                        styles.messageBubble,
                        msg.sender === 'user'
                          ? { alignSelf: 'flex-end', backgroundColor: colors.primary }
                          : { alignSelf: 'flex-start', backgroundColor: colors.background }
                      ]}
                    >
                      <ThemedText style={[
                        styles.messageText,
                        { color: msg.sender === 'user' ? '#FFF' : colors.text }
                      ]}>
                        {msg.message}
                      </ThemedText>
                      <ThemedText style={[
                        styles.messageTime,
                        { color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : colors.textSecondary }
                      ]}>
                        {msg.timestamp}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>

                {/* Reply Input */}
                {selectedTicket.status !== 'closed' && (
                  <View style={[styles.replyContainer, { backgroundColor: colors.background }]}>
                    <TextInput
                      style={[styles.replyInput, { color: colors.text }]}
                      placeholder="Type your message..."
                      placeholderTextColor={colors.textSecondary}
                      value={newMessage}
                      onChangeText={setNewMessage}
                      multiline
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, { backgroundColor: colors.primary }]}
                      onPress={handleSendMessage}
                    >
                      <Ionicons name="send" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Create Ticket Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Create Ticket</ThemedText>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Category
                </ThemedText>
                <View style={styles.categorySelector}>
                  {[
                    { key: 'booking', icon: 'calendar', label: 'Booking' },
                    { key: 'payment', icon: 'card', label: 'Payment' },
                    { key: 'service', icon: 'construct', label: 'Service' },
                    { key: 'technical', icon: 'bug', label: 'Technical' },
                    { key: 'other', icon: 'help-circle', label: 'Other' },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryOption,
                        newTicket.category === cat.key && {
                          backgroundColor: colors.primary + '20',
                          borderColor: colors.primary,
                        },
                      ]}
                      onPress={() => setNewTicket({ ...newTicket, category: cat.key as any })}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={20}
                        color={newTicket.category === cat.key ? colors.primary : colors.textSecondary}
                      />
                      <ThemedText style={[
                        styles.categoryOptionText,
                        { color: newTicket.category === cat.key ? colors.primary : colors.textSecondary }
                      ]}>
                        {cat.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Subject */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Subject
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Brief description of your issue"
                  placeholderTextColor={colors.textSecondary}
                  value={newTicket.subject}
                  onChangeText={(text) => setNewTicket({ ...newTicket, subject: text })}
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
                  Description
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text }]}
                  placeholder="Please describe your issue in detail"
                  placeholderTextColor={colors.textSecondary}
                  value={newTicket.description}
                  onChangeText={(text) => setNewTicket({ ...newTicket, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Attach Files */}
              <TouchableOpacity style={[styles.attachButton, { borderColor: colors.border }]}>
                <Ionicons name="attach" size={20} color={colors.textSecondary} />
                <ThemedText style={[styles.attachText, { color: colors.textSecondary }]}>
                  Attach Files (Optional)
                </ThemedText>
              </TouchableOpacity>

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
              >
                <ThemedText style={styles.submitButtonText}>Submit Ticket</ThemedText>
              </TouchableOpacity>
            </ScrollView>
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
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
  },
  quickActionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  faqCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ticketCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ticketNumber: {
    fontSize: 12,
    marginBottom: 2,
  },
  ticketSubject: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
    gap: 6,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
  },
  ticketDate: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ticketInfoCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  ticketInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketInfoNumber: {
    fontSize: 13,
    fontWeight: '600',
  },
  ticketInfoSubject: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ticketInfoMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  messagesContainer: {
    maxHeight: 300,
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    textAlign: 'right',
  },
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  replyInput: {
    flex: 1,
    maxHeight: 80,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 8,
    marginBottom: 18,
  },
  attachText: {
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
