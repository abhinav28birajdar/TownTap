import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Message {
  id: string;
  type: 'user' | 'agent' | 'system';
  text: string;
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

interface QuickReply {
  id: string;
  text: string;
}

const mockTicket = {
  id: 'TKT-2024-1234',
  subject: 'Booking Issue',
  status: 'in_progress',
  priority: 'high',
  createdAt: '2 hours ago',
  agent: {
    name: 'Priya Sharma',
    avatar: null,
    status: 'online',
  },
};

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'system',
    text: 'Chat started. You are now connected with Priya Sharma.',
    time: '10:30 AM',
  },
  {
    id: '2',
    type: 'agent',
    text: "Hello! I'm Priya from TownTap Support. I can see you're having an issue with your recent booking. How can I help you today?",
    time: '10:31 AM',
  },
  {
    id: '3',
    type: 'user',
    text: 'Hi! Yes, the service provider never showed up for my appointment yesterday.',
    time: '10:32 AM',
    status: 'read',
  },
  {
    id: '4',
    type: 'agent',
    text: "I'm so sorry to hear that! Let me look into your booking details. Could you confirm the booking ID?",
    time: '10:33 AM',
  },
  {
    id: '5',
    type: 'user',
    text: "It's BKG-2024-5678 for the home cleaning service.",
    time: '10:34 AM',
    status: 'read',
  },
  {
    id: '6',
    type: 'agent',
    text: "Thank you! I found your booking. I can see the service was scheduled for yesterday at 2:00 PM. I'll immediately process a full refund for you, and we'll take appropriate action with the service provider.",
    time: '10:35 AM',
  },
];

const quickReplies: QuickReply[] = [
  { id: '1', text: 'Thank you!' },
  { id: '2', text: 'That would be great' },
  { id: '3', text: "I'd like a refund" },
  { id: '4', text: 'Can I reschedule?' },
  { id: '5', text: 'Speak to manager' },
];

export default function LiveChatScreen() {
  const colors = useColors();
  const { ticketId } = useLocalSearchParams<{ ticketId?: string }>();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showEndChat, setShowEndChat] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingDots = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simulate agent typing occasionally
    const typingInterval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }, 15000);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingDots, { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.timing(typingDots, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      typingDots.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      status: 'sent',
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Simulate delivered status
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg))
      );
    }, 1000);

    // Simulate read status and agent response
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === newMessage.id ? { ...msg, status: 'read' } : msg))
      );
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'agent',
          text: "I understand. Let me check that for you right away. Is there anything else you'd like me to help with regarding this issue?",
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        };
        setMessages((prev) => [...prev, agentResponse]);
      }, 3000);
    }, 2000);
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return colors.success;
      case 'away':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemMessage}>
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
              {mockTicket.agent.name.charAt(0)}
            </ThemedText>
          </View>
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
          <View style={styles.messageFooter}>
            <ThemedText
              style={[
                styles.messageTime,
                { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
              ]}
            >
              {item.time}
            </ThemedText>
            {isUser && item.status && (
              <Ionicons
                name={
                  item.status === 'read'
                    ? 'checkmark-done'
                    : item.status === 'delivered'
                    ? 'checkmark-done'
                    : 'checkmark'
                }
                size={14}
                color={item.status === 'read' ? '#fff' : 'rgba(255,255,255,0.5)'}
                style={{ marginLeft: 4 }}
              />
            )}
          </View>
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
          <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.headerAvatarText}>
              {mockTicket.agent.name.charAt(0)}
            </ThemedText>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(mockTicket.agent.status) }]} />
          </View>
          <View>
            <ThemedText style={styles.headerName}>{mockTicket.agent.name}</ThemedText>
            <ThemedText style={[styles.headerStatus, { color: colors.success }]}>
              Online
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowOptions(true)} style={styles.optionsButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Ticket Info Banner */}
      <View style={[styles.ticketBanner, { backgroundColor: colors.info + '15' }]}>
        <Ionicons name="ticket" size={16} color={colors.info} />
        <ThemedText style={[styles.ticketBannerText, { color: colors.info }]}>
          Ticket: {mockTicket.id} • {mockTicket.subject}
        </ThemedText>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicator}>
              <View style={[styles.agentAvatar, { backgroundColor: colors.primary, width: 28, height: 28 }]}>
                <ThemedText style={[styles.agentAvatarText, { fontSize: 12 }]}>
                  {mockTicket.agent.name.charAt(0)}
                </ThemedText>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: colors.card }]}>
                <View style={styles.typingDots}>
                  <Animated.View
                    style={[
                      styles.dot,
                      { backgroundColor: colors.textSecondary, opacity: typingDots },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.dot,
                      { backgroundColor: colors.textSecondary, opacity: typingDots },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.dot,
                      { backgroundColor: colors.textSecondary, opacity: typingDots },
                    ]}
                  />
                </View>
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick Replies */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickReplies}
      >
        {quickReplies.map((reply) => (
          <TouchableOpacity
            key={reply.id}
            style={[styles.quickReplyChip, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => handleQuickReply(reply)}
          >
            <ThemedText style={[styles.quickReplyText, { color: colors.primary }]}>
              {reply.text}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
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
            maxLength={500}
          />
        </View>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.border }]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color={inputText.trim() ? '#fff' : colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      <Modal visible={showOptions} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsModal, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="call" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Call Support</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="mail" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Email Transcript</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="person-add" size={20} color={colors.text} />
              <ThemedText style={styles.optionText}>Request Escalation</ThemedText>
            </TouchableOpacity>
            <View style={[styles.optionDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                setShowOptions(false);
                setShowEndChat(true);
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.error} />
              <ThemedText style={[styles.optionText, { color: colors.error }]}>End Chat</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* End Chat Modal */}
      <Modal visible={showEndChat} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.endChatModal, { backgroundColor: colors.card }]}>
            <View style={[styles.endChatIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="chatbubble-ellipses" size={32} color={colors.warning} />
            </View>
            <ThemedText style={styles.endChatTitle}>End Chat?</ThemedText>
            <ThemedText style={[styles.endChatText, { color: colors.textSecondary }]}>
              Are you sure you want to end this chat? You can still view the transcript in your support tickets.
            </ThemedText>
            <View style={styles.endChatButtons}>
              <TouchableOpacity
                style={[styles.endChatButton, { backgroundColor: colors.border }]}
                onPress={() => setShowEndChat(false)}
              >
                <ThemedText style={styles.endChatButtonText}>Continue Chat</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.endChatButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  setShowEndChat(false);
                  router.back();
                }}
              >
                <ThemedText style={[styles.endChatButtonText, { color: '#fff' }]}>End Chat</ThemedText>
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
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    position: 'relative',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  optionsButton: {
    padding: 4,
  },
  ticketBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  ticketBannerText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messagesList: {
    padding: 16,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemText: {
    fontSize: 12,
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
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
  },
  agentAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '75%',
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
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  quickReplies: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickReplyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
    fontWeight: '500',
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
  endChatModal: {
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  endChatIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  endChatTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  endChatText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  endChatButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  endChatButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  endChatButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
