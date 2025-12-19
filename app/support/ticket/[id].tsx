import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TicketMessage {
  id: string;
  type: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  attachments?: { name: string; type: string }[];
}

const mockTicket = {
  id: 'TKT-2024-1234',
  subject: 'Service provider did not show up',
  description:
    'I booked a home cleaning service for yesterday at 2:00 PM but the service provider never arrived. I waited for over an hour and tried calling but got no response.',
  category: 'Booking Issues',
  status: 'in_progress',
  priority: 'high',
  createdAt: 'Dec 15, 2024 at 10:30 AM',
  updatedAt: '30 mins ago',
  assignedTo: {
    name: 'Priya Sharma',
    role: 'Customer Support',
    avatar: null,
  },
  relatedBooking: {
    id: 'BKG-2024-5678',
    service: 'Home Deep Cleaning',
    date: 'Dec 14, 2024',
    amount: '₹1,499',
  },
};

const mockMessages: TicketMessage[] = [
  {
    id: '1',
    type: 'system',
    text: 'Ticket created. Our support team will respond within 2-4 hours.',
    time: '10:30 AM',
  },
  {
    id: '2',
    type: 'user',
    text: "I booked a home cleaning service for yesterday at 2:00 PM but the service provider never arrived. I waited for over an hour and tried calling but got no response. This is very frustrating as I had taken time off work for this.",
    time: '10:30 AM',
    attachments: [{ name: 'booking_screenshot.png', type: 'image' }],
  },
  {
    id: '3',
    type: 'system',
    text: 'Ticket assigned to Priya Sharma from Customer Support.',
    time: '11:15 AM',
  },
  {
    id: '4',
    type: 'agent',
    text: "Hello! I'm Priya from TownTap Support. I'm so sorry to hear about your experience. This is not the level of service we strive to provide. I've already started investigating this issue with our operations team.",
    time: '11:20 AM',
  },
  {
    id: '5',
    type: 'user',
    text: "Thank you for looking into this. I'd like a full refund and some compensation for my wasted time if possible.",
    time: '11:45 AM',
  },
  {
    id: '6',
    type: 'agent',
    text: "Absolutely understandable. I've processed a full refund of ₹1,499 which will reflect in 3-5 business days. Additionally, I've added ₹200 TownTap credits to your account as a gesture of apology. We've also flagged this with the service provider.",
    time: '12:00 PM',
  },
];

export default function TicketDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<TicketMessage[]>(mockMessages);
  const [inputText, setInputText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [showResolve, setShowResolve] = useState(false);
  const flatListRef = useRef<FlatList>(null);

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

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: TicketMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: TicketMessage }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
          <Ionicons name="information-circle" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.systemText, { color: colors.textSecondary }]}>
            {item.text}
          </ThemedText>
        </View>
      );
    }

    const isUser = item.type === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={[styles.agentAvatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.agentAvatarText}>
              {mockTicket.assignedTo.name.charAt(0)}
            </ThemedText>
          </View>
        )}
        <View style={{ maxWidth: '75%' }}>
          {!isUser && (
            <ThemedText style={[styles.agentName, { color: colors.primary }]}>
              {mockTicket.assignedTo.name}
            </ThemedText>
          )}
          <View
            style={[
              styles.messageBubble,
              isUser
                ? [styles.userBubble, { backgroundColor: colors.primary }]
                : [styles.agentBubble, { backgroundColor: colors.card }],
            ]}
          >
            <ThemedText style={[styles.messageText, isUser && { color: '#fff' }]}>
              {item.text}
            </ThemedText>
            {item.attachments && item.attachments.length > 0 && (
              <View style={[styles.attachmentList, { borderTopColor: isUser ? 'rgba(255,255,255,0.2)' : colors.border }]}>
                {item.attachments.map((att, index) => (
                  <View key={index} style={[styles.attachmentItem, { backgroundColor: isUser ? 'rgba(255,255,255,0.15)' : colors.border }]}>
                    <Ionicons
                      name={att.type === 'image' ? 'image' : 'document'}
                      size={14}
                      color={isUser ? '#fff' : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.attachmentName,
                        { color: isUser ? '#fff' : colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {att.name}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
          <ThemedText
            style={[
              styles.messageTime,
              { color: colors.textSecondary, textAlign: isUser ? 'right' : 'left' },
            ]}
          >
            {item.time}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {mockTicket.id}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(mockTicket.status) + '20' },
            ]}
          >
            <ThemedText
              style={[styles.statusText, { color: getStatusColor(mockTicket.status) }]}
            >
              In Progress
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowOptions(true)} style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          ListHeaderComponent={
            <View style={styles.ticketInfo}>
              {/* Subject */}
              <View style={[styles.subjectCard, { backgroundColor: colors.card }]}>
                <View style={styles.subjectHeader}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(mockTicket.priority) + '20' },
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(mockTicket.priority) },
                      ]}
                    />
                    <ThemedText
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(mockTicket.priority) },
                      ]}
                    >
                      High Priority
                    </ThemedText>
                  </View>
                  <View style={[styles.categoryTag, { backgroundColor: colors.border }]}>
                    <ThemedText style={[styles.categoryText, { color: colors.textSecondary }]}>
                      {mockTicket.category}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.subjectTitle}>{mockTicket.subject}</ThemedText>
                <ThemedText style={[styles.subjectMeta, { color: colors.textSecondary }]}>
                  Created {mockTicket.createdAt}
                </ThemedText>
              </View>

              {/* Related Booking */}
              {mockTicket.relatedBooking && (
                <TouchableOpacity
                  style={[styles.bookingCard, { backgroundColor: colors.primary + '10' }]}
                  onPress={() => router.push(`/booking/${mockTicket.relatedBooking.id}` as any)}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <View style={styles.bookingInfo}>
                    <ThemedText style={[styles.bookingLabel, { color: colors.primary }]}>
                      Related Booking
                    </ThemedText>
                    <ThemedText style={styles.bookingTitle}>
                      {mockTicket.relatedBooking.service}
                    </ThemedText>
                    <ThemedText style={[styles.bookingMeta, { color: colors.textSecondary }]}>
                      {mockTicket.relatedBooking.id} • {mockTicket.relatedBooking.date}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}

              {/* Agent Info */}
              {mockTicket.assignedTo && (
                <View style={[styles.agentCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.agentCardAvatar, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.agentCardAvatarText}>
                      {mockTicket.assignedTo.name.charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={styles.agentCardInfo}>
                    <ThemedText style={styles.agentCardName}>
                      {mockTicket.assignedTo.name}
                    </ThemedText>
                    <ThemedText style={[styles.agentCardRole, { color: colors.textSecondary }]}>
                      {mockTicket.assignedTo.role}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={[styles.chatButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/support/live-chat')}
                  >
                    <Ionicons name="chatbubbles" size={16} color="#fff" />
                    <ThemedText style={styles.chatButtonText}>Live Chat</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              <View style={[styles.conversationDivider, { backgroundColor: colors.border }]}>
                <ThemedText style={[styles.conversationLabel, { color: colors.textSecondary }]}>
                  Conversation
                </ThemedText>
              </View>
            </View>
          }
          contentContainerStyle={styles.messagesList}
        />

        {/* Input */}
        {mockTicket.status !== 'closed' && mockTicket.status !== 'resolved' && (
          <View style={[styles.inputContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() ? colors.primary : colors.border },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim() ? '#fff' : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Resolved/Closed Banner */}
        {(mockTicket.status === 'resolved' || mockTicket.status === 'closed') && (
          <View style={[styles.resolvedBanner, { backgroundColor: colors.success + '15' }]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <ThemedText style={[styles.resolvedText, { color: colors.success }]}>
              This ticket has been {mockTicket.status}
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.reopenLink, { color: colors.primary }]}>
                Reopen
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Options Modal */}
      <Modal visible={showOptions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                setShowResolve(true);
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <ThemedText style={styles.optionText}>Mark as Resolved</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="arrow-up" size={20} color={colors.warning} />
              <ThemedText style={styles.optionText}>Escalate Ticket</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="download" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Download Transcript</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="trash" size={20} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>
                Delete Ticket
              </ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Resolve Modal */}
      <Modal visible={showResolve} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.resolveModal, { backgroundColor: colors.card }]}>
            <View style={[styles.resolveIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="checkmark-done-circle" size={40} color={colors.success} />
            </View>
            <ThemedText style={styles.resolveTitle}>Resolve Ticket?</ThemedText>
            <ThemedText style={[styles.resolveText, { color: colors.textSecondary }]}>
              Marking this ticket as resolved will close the conversation. You can reopen it later
              if needed.
            </ThemedText>
            <View style={styles.resolveButtons}>
              <TouchableOpacity
                style={[styles.resolveButton, { backgroundColor: colors.border }]}
                onPress={() => setShowResolve(false)}
              >
                <ThemedText style={styles.resolveButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resolveButton, { backgroundColor: colors.success }]}
                onPress={() => {
                  setShowResolve(false);
                  router.back();
                }}
              >
                <ThemedText style={[styles.resolveButtonText, { color: '#fff' }]}>
                  Resolve
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  optionsButton: {
    padding: 4,
  },
  keyboardAvoid: {
    flex: 1,
  },
  ticketInfo: {
    padding: 16,
    paddingBottom: 0,
  },
  subjectCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
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
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  subjectMeta: {
    fontSize: 12,
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bookingMeta: {
    fontSize: 12,
  },
  agentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  agentCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentCardAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  agentCardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  agentCardName: {
    fontSize: 15,
    fontWeight: '600',
  },
  agentCardRole: {
    fontSize: 12,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  conversationDivider: {
    height: 1,
    marginBottom: 8,
    position: 'relative',
  },
  conversationLabel: {
    position: 'absolute',
    top: -8,
    left: 0,
    fontSize: 12,
    fontWeight: '500',
    paddingRight: 10,
  },
  messagesList: {
    paddingBottom: 16,
  },
  systemMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  systemText: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  agentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 20,
  },
  agentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  agentName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  attachmentList: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  attachmentName: {
    fontSize: 12,
    flex: 1,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  attachButton: {
    padding: 6,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  resolvedText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  reopenLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsModal: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 16,
    padding: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  optionDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  resolveModal: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  resolveIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resolveTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  resolveText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resolveButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resolveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  resolveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
