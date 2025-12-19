import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'business';
  timestamp: Date;
  isRead: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string;
    avatar: string | null;
    phone: string;
  };
  booking?: {
    id: string;
    service: string;
    date: string;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

const mockConversation: Conversation = {
  id: '1',
  customer: {
    id: 'c1',
    name: 'Rahul Sharma',
    avatar: null,
    phone: '+91 98765 43210',
  },
  booking: {
    id: 'BK-2024-0042',
    service: 'Deep Home Cleaning',
    date: '2024-02-15',
  },
  lastMessage: 'Thank you for confirming!',
  lastMessageTime: new Date(),
  unreadCount: 0,
  isOnline: true,
};

const mockMessages: Message[] = [
  {
    id: '1',
    text: 'Hi, I have a question about my upcoming booking.',
    sender: 'customer',
    timestamp: new Date(Date.now() - 3600000 * 2),
    isRead: true,
  },
  {
    id: '2',
    text: 'Hello Rahul! Sure, how can I help you?',
    sender: 'business',
    timestamp: new Date(Date.now() - 3600000 * 1.8),
    isRead: true,
  },
  {
    id: '3',
    text: 'Can I reschedule my booking from 10 AM to 2 PM?',
    sender: 'customer',
    timestamp: new Date(Date.now() - 3600000 * 1.5),
    isRead: true,
  },
  {
    id: '4',
    text: 'Let me check the availability for 2 PM...',
    sender: 'business',
    timestamp: new Date(Date.now() - 3600000 * 1.2),
    isRead: true,
  },
  {
    id: '5',
    text: 'Yes, 2 PM slot is available. I\'ve updated your booking. You should receive a confirmation shortly.',
    sender: 'business',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: '6',
    text: 'Thank you for confirming!',
    sender: 'customer',
    timestamp: new Date(Date.now() - 1800000),
    isRead: true,
  },
];

const quickReplies = [
  'Thank you for reaching out!',
  'I\'ll get back to you shortly.',
  'Your booking has been confirmed.',
  'Can you share more details?',
  'Please call us at +91 98765 43210',
];

export default function BusinessChatScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [conversation] = useState(mockConversation);
  const [messages, setMessages] = useState(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'business',
      timestamp: new Date(),
      isRead: false,
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');
    setShowQuickReplies(false);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCustomer = item.sender === 'customer';
    const showDateSeparator =
      index === 0 ||
      formatDate(messages[index - 1].timestamp) !== formatDate(item.timestamp);

    return (
      <>
        {showDateSeparator && (
          <View style={styles.dateSeparator}>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
            <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
              {formatDate(item.timestamp)}
            </ThemedText>
            <View style={[styles.dateLine, { backgroundColor: colors.border }]} />
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isCustomer ? styles.customerMessage : styles.businessMessage,
          ]}
        >
          {isCustomer && (
            <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
              <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                {conversation.customer.name.charAt(0)}
              </ThemedText>
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              {
                backgroundColor: isCustomer ? colors.card : colors.primary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.messageText,
                { color: isCustomer ? colors.text : '#fff' },
              ]}
            >
              {item.text}
            </ThemedText>
            <ThemedText
              style={[
                styles.messageTime,
                { color: isCustomer ? colors.textSecondary : 'rgba(255,255,255,0.7)' },
              ]}
            >
              {formatTime(item.timestamp)}
              {!isCustomer && (
                <Ionicons
                  name={item.isRead ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color="rgba(255,255,255,0.7)"
                  style={{ marginLeft: 4 }}
                />
              )}
            </ThemedText>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerInfo}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.primary + '20' }]}>
            <ThemedText style={[styles.headerAvatarText, { color: colors.primary }]}>
              {conversation.customer.name.charAt(0)}
            </ThemedText>
          </View>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerName}>{conversation.customer.name}</ThemedText>
            <View style={styles.onlineStatus}>
              {conversation.isOnline && (
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              )}
              <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
                {conversation.isOnline ? 'Online' : 'Offline'}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="call-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => setShowOptionsModal(true)}
        >
          <Ionicons name="ellipsis-vertical" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Booking Info Banner */}
      {conversation.booking && (
        <TouchableOpacity
          style={[styles.bookingBanner, { backgroundColor: colors.primary + '10' }]}
          onPress={() => router.push(`/business-owner/order-detail?id=${conversation.booking?.id}`)}
        >
          <View style={styles.bookingInfo}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <View>
              <ThemedText style={[styles.bookingService, { color: colors.primary }]}>
                {conversation.booking.service}
              </ThemedText>
              <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
                {conversation.booking.id} • {conversation.booking.date}
              </ThemedText>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}

      {/* Messages List */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      {/* Quick Replies */}
      {showQuickReplies && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.quickRepliesContainer, { backgroundColor: colors.card }]}
          contentContainerStyle={styles.quickRepliesList}
        >
          {quickReplies.map((reply, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickReplyChip, { borderColor: colors.border }]}
              onPress={() => sendMessage(reply)}
            >
              <ThemedText style={[styles.quickReplyText, { color: colors.primary }]}>
                {reply}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input Area */}
      <View style={[styles.inputArea, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.inputIcon}
          onPress={() => setShowQuickReplies(!showQuickReplies)}
        >
          <Ionicons
            name={showQuickReplies ? 'close-circle' : 'flash'}
            size={24}
            color={showQuickReplies ? colors.textSecondary : colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.inputIcon}>
          <Ionicons name="attach" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline
            maxLength={1000}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: inputMessage.trim() ? colors.primary : colors.border },
          ]}
          onPress={() => sendMessage(inputMessage)}
          disabled={!inputMessage.trim()}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal visible={showOptionsModal} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={[styles.optionsMenu, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
                router.push(`/business-owner/customer-details?id=${conversation.customer.id}`);
              }}
            >
              <Ionicons name="person-outline" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>View Customer Profile</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
              }}
            >
              <Ionicons name="search-outline" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Search in Chat</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
              }}
            >
              <Ionicons name="notifications-off-outline" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Mute Notifications</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptionsModal(false);
              }}
            >
              <Ionicons name="flag-outline" size={20} color="#FF9800" />
              <ThemedText style={[styles.optionText, { color: '#FF9800' }]}>
                Report Customer
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionItem, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowOptionsModal(false);
              }}
            >
              <Ionicons name="ban-outline" size={20} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>
                Block Customer
              </ThemedText>
            </TouchableOpacity>
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
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerContent: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
  },
  headerAction: {
    padding: 8,
  },
  bookingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookingService: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookingId: {
    fontSize: 12,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
  },
  dateText: {
    fontSize: 12,
    marginHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  customerMessage: {
    justifyContent: 'flex-start',
    paddingRight: 60,
  },
  businessMessage: {
    justifyContent: 'flex-end',
    paddingLeft: 60,
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '100%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickRepliesContainer: {
    maxHeight: 50,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  quickRepliesList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  inputIcon: {
    padding: 6,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  optionsMenu: {
    borderRadius: 14,
    overflow: 'hidden',
    width: 220,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  optionText: {
    fontSize: 15,
  },
});
