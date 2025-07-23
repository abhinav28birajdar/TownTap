import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
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

import { useAuthStore } from '../../stores/authStore';
import { ChatMessage } from '../../types';

const ChatScreen: React.FC<any> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { conversationId, businessId, customerId } = route.params || {};
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Mock messages - replace with actual API call
      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          conversation_id: conversationId || 'conv1',
          sender_id: user?.user_type === 'customer' ? (businessId || 'business1') : (customerId || 'customer1'),
          sender_type: user?.user_type === 'customer' ? 'business' : 'customer',
          message: user?.user_type === 'customer' 
            ? 'Hello! Thank you for your interest in our products. How can I help you today?'
            : 'Hi! I would like to know more about your services.',
          message_type: 'text',
          timestamp: '2024-01-15T10:00:00Z',
          is_read: true,
        },
        {
          id: '2',
          conversation_id: conversationId || 'conv1',
          sender_id: user?.id || '',
          sender_type: (user?.user_type === 'customer' || user?.user_type === 'business') ? user.user_type : 'customer',
          message: user?.user_type === 'customer'
            ? 'I\'m looking for fresh vegetables. Do you have organic options?'
            : 'Certainly! We offer a wide range of organic vegetables. What specific items are you looking for?',
          message_type: 'text',
          timestamp: '2024-01-15T10:05:00Z',
          is_read: true,
        },
        {
          id: '3',
          conversation_id: conversationId || 'conv1',
          sender_id: user?.user_type === 'customer' ? (businessId || 'business1') : (customerId || 'customer1'),
          sender_type: user?.user_type === 'customer' ? 'business' : 'customer',
          message: user?.user_type === 'customer'
            ? 'We have fresh organic tomatoes, carrots, spinach, and bell peppers available today. All are locally sourced!'
            : 'That sounds great! What are the prices for tomatoes and carrots?',
          message_type: 'text',
          timestamp: '2024-01-15T10:10:00Z',
          is_read: false,
        },
      ];
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      conversation_id: conversationId || 'conv1',
      sender_id: user?.id || '',
      sender_type: (user?.user_type === 'customer' || user?.user_type === 'business') ? user.user_type : 'customer',
      message: inputText.trim(),
      message_type: 'text',
      timestamp: new Date().toISOString(),
      is_read: false,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    // Here you would send the message to your backend
    console.log('Sending message:', newMessage);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {user?.user_type === 'customer' ? t('chat.business') : t('chat.customer')}
            </Text>
            <Text style={styles.headerSubtitle}>{t('chat.online')}</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={t('chat.typeMessage')}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach-outline" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? "#fff" : "#999"} 
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#34C759',
  },
  moreButton: {
    padding: 4,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
    maxHeight: 80,
  },
  attachButton: {
    padding: 4,
    marginLeft: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButtonInactive: {
    backgroundColor: '#e0e0e0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ChatScreen;
