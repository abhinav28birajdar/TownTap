import { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { useAuthStore } from '../../stores/authStore';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
  suggestions?: string[];
}

const mockInitialMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'ai',
    message: 'Hello! I\'m your AI assistant. I can help you find local businesses, compare prices, check reviews, and much more. What are you looking for today?',
    timestamp: new Date(),
    suggestions: [
      'Find nearby restaurants',
      'Best grocery stores',
      'Emergency plumber',
      'Beauty salons with good reviews',
    ],
  },
];

export default function AIAssistantScreen() {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<ChatMessage[]>(mockInitialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const startTypingAnimation = () => {
    setIsTyping(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(typingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopTypingAnimation = () => {
    setIsTyping(false);
    typingAnimation.stopAnimation();
  };

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: message.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI typing
    startTypingAnimation();

    // Simulate AI response (replace with actual AI call)
    setTimeout(() => {
      stopTypingAnimation();
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        message: generateMockAIResponse(message),
        timestamp: new Date(),
        suggestions: generateSuggestions(message),
      };

      setMessages(prev => [...prev, aiResponse]);
    }, 2000);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const generateMockAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('food')) {
      return 'I found several great restaurants near you! Here are the top-rated ones:\n\n🍕 Pizza Corner - 4.5⭐ (2.1 km away)\n🍛 Spice Garden - 4.8⭐ (1.8 km away)\n🍔 Burger Junction - 4.3⭐ (2.5 km away)\n\nWould you like to see their menus or check availability?';
    }
    
    if (lowerMessage.includes('grocery') || lowerMessage.includes('store')) {
      return 'Here are the best grocery stores in your area:\n\n🛒 Fresh Mart - 4.5⭐ (1.2 km) - Open until 10 PM\n🥕 Organic Basket - 4.7⭐ (2.0 km) - Fresh organic produce\n🏪 Quick Mart - 4.2⭐ (0.8 km) - 24/7 convenience store\n\nAll offer home delivery. Would you like to place an order?';
    }
    
    if (lowerMessage.includes('plumber') || lowerMessage.includes('repair')) {
      return 'Found reliable plumbers available now:\n\n🔧 Quick Fix Plumbing - 4.9⭐ (Available now)\n⚡ 24/7 Repair Services - 4.6⭐ (30 min response)\n🛠️ Home Repair Pro - 4.8⭐ (Book for today)\n\nShall I help you book a service call?';
    }
    
    if (lowerMessage.includes('salon') || lowerMessage.includes('beauty')) {
      return 'Top-rated beauty salons near you:\n\n💄 Glamour Studio - 4.8⭐ (1.5 km) - Hair & Makeup\n✨ Beauty Bliss - 4.6⭐ (2.2 km) - Full service spa\n💅 Nail Art Boutique - 4.7⭐ (1.8 km) - Nail specialist\n\nWould you like to check availability or book an appointment?';
    }
    
    return 'I understand you\'re looking for local businesses. Could you be more specific about what you need? For example:\n\n• What type of service or product?\n• Any specific requirements?\n• Preferred distance or area?\n\nI\'m here to help you find exactly what you need!';
  };

  const generateSuggestions = (userMessage: string): string[] => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('restaurant')) {
      return ['Show menus', 'Check delivery time', 'Find vegetarian options', 'Book a table'];
    }
    
    if (lowerMessage.includes('grocery')) {
      return ['Start shopping', 'Compare prices', 'Check offers', 'Schedule delivery'];
    }
    
    if (lowerMessage.includes('plumber')) {
      return ['Book emergency service', 'Get price estimate', 'See reviews', 'Schedule appointment'];
    }
    
    if (lowerMessage.includes('salon')) {
      return ['Book appointment', 'See services', 'Check prices', 'View gallery'];
    }
    
    return ['Find more options', 'Compare ratings', 'Check distance', 'See contact info'];
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      item.type === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.type === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.type === 'user' ? styles.userText : styles.aiText
        ]}>
          {item.message}
        </Text>
      </View>
      
      {item.suggestions && item.suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {item.suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionChip}
              onPress={() => sendMessage(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.aiMessage]}>
        <View style={[styles.messageBubble, styles.aiBubble]}>
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>AI is typing</Text>
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]} />
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]} />
            <Animated.View style={[
              styles.typingDot,
              {
                opacity: typingAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Your smart shopping companion</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about local businesses..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: inputText.trim() ? 1 : 0.5 }
          ]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  aiText: {
    color: '#333',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  suggestionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2196F3',
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
