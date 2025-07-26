import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import type { Business, ChatMessage } from '../../types/index_location';

// Colors definition
const COLORS = {
  primary: '#2563eb',
  secondary: '#10b981',
  gray: {
    100: '#f3f4f6',
    200: '#e5e7eb',
    400: '#9ca3af',
    600: '#6b7280',
    800: '#1f2937',
  },
  white: '#ffffff',
  black: '#000000',
};

interface ChatScreenProps {
  business: Business;
  onClose: () => void;
}

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <View style={[
      styles.messageBubble,
      isOwn ? styles.ownMessage : styles.otherMessage
    ]}>
      <Text style={[
        styles.messageText,
        isOwn ? styles.ownMessageText : styles.otherMessageText
      ]}>
        {message.message_text}
      </Text>
      <Text style={[
        styles.messageTime,
        isOwn ? styles.ownMessageTime : styles.otherMessageTime
      ]}>
        {new Date(message.created_at).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ business, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      // For demo purposes, let's create some mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          conversation_id: 'conv-1',
          sender_id: business.id,
          sender_type: 'business',
          message_text: `Hello! Welcome to ${business.business_name}. How can I help you today?`,
          created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          is_read: true,
        },
        {
          id: '2',
          conversation_id: 'conv-1',
          sender_id: 'customer-1',
          sender_type: 'customer',
          message_text: 'Hi! I\'m interested in your services. Are you currently open?',
          created_at: new Date(Date.now() - 240000).toISOString(), // 4 minutes ago
          is_read: true,
        },
        {
          id: '3',
          conversation_id: 'conv-1',
          sender_id: business.id,
          sender_type: 'business',
          message_text: 'Yes, we\'re open! Our hours are 9 AM to 8 PM. What specific service were you looking for?',
          created_at: new Date(Date.now() - 180000).toISOString(), // 3 minutes ago
          is_read: true,
        },
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      conversation_id: 'conv-1',
      sender_id: 'customer-1',
      sender_type: 'customer',
      message_text: inputText.trim(),
      created_at: new Date().toISOString(),
      is_read: false,
    };

    try {
      setLoading(true);
      
      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      // Simulate sending message to backend
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate business response after a delay
      setTimeout(() => {
        const businessReply: ChatMessage = {
          id: (Date.now() + 1).toString(),
          conversation_id: 'conv-1',
          sender_id: business.id,
          sender_type: 'business',
          message_text: 'Thank you for your message! I\'ll get back to you shortly.',
          created_at: new Date().toISOString(),
          is_read: false,
        };
        setMessages(prev => [...prev, businessReply]);
      }, 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      // Remove the message from local state if sending failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwn = item.sender_type === 'customer';
    return <MessageBubble message={item} isOwn={isOwn} />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.businessName}>{business.business_name}</Text>
          <Text style={styles.businessStatus}>
            {business.category?.icon} {business.category?.name}
          </Text>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Ionicons name="call" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            placeholderTextColor={COLORS.gray[400]}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons 
              name={loading ? "hourglass" : "send"} 
              size={20} 
              color={COLORS.white} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    padding: 5,
    marginRight: 15,
  },
  headerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  businessStatus: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  callButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 15,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 18,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.gray[800],
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: COLORS.gray[400],
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[200],
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray[200],
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
    color: COLORS.gray[800],
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.gray[400],
  },
});

export default ChatScreen;
