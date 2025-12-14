import { ThemedText } from '@/components/ui';
import { useAuth } from '@/contexts/auth-context';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockMessages = [
  {
    id: '1',
    businessName: 'QuickFix Plumbers',
    lastMessage: 'I will arrive in 15 minutes',
    timestamp: '2 min ago',
    unreadCount: 2,
    avatar: null,
    online: true,
  },
  {
    id: '2',
    businessName: 'Sparkle Clean Services',
    lastMessage: 'Thank you for your booking!',
    timestamp: '1 hour ago',
    unreadCount: 0,
    avatar: null,
    online: false,
  },
  {
    id: '3',
    businessName: 'Bright Electricians',
    lastMessage: 'The job is completed. Please rate us.',
    timestamp: '1 day ago',
    unreadCount: 1,
    avatar: null,
    online: false,
  },
];

export default function MessagesTabScreen() {
  const colors = useColors();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [messages, setMessages] = useState(mockMessages);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleMessagePress = (messageId: string) => {
    router.push(`/messages/chat/${messageId}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <ThemedText style={styles.searchPlaceholder}>Search messages...</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {messages.length === 0 ? (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={styles.emptyState}
          >
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Messages Yet</ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start a conversation with a service provider
            </ThemedText>
            <TouchableOpacity
              style={[styles.exploreButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <ThemedText style={styles.exploreButtonText}>Find Services</ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <Animated.View
                key={message.id}
                entering={FadeInDown.delay(100 + index * 50)}
              >
                <TouchableOpacity
                  style={[styles.messageCard, { backgroundColor: colors.card }]}
                  onPress={() => handleMessagePress(message.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                      <Ionicons name="business" size={24} color="#FFFFFF" />
                    </View>
                    {message.online && <View style={styles.onlineIndicator} />}
                  </View>

                  <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                      <ThemedText style={styles.businessName} numberOfLines={1}>
                        {message.businessName}
                      </ThemedText>
                      <ThemedText style={styles.timestamp}>{message.timestamp}</ThemedText>
                    </View>
                    <View style={styles.messageFooter}>
                      <ThemedText style={styles.lastMessage} numberOfLines={1}>
                        {message.lastMessage}
                      </ThemedText>
                      {message.unreadCount > 0 && (
                        <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                          <ThemedText style={styles.unreadText}>
                            {message.unreadCount}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 14,
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  messageCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  messageContent: {
    flex: 1,
    justifyContent: 'center',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  businessName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
