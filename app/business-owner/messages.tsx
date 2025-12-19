import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Conversation {
  id: string;
  customer: {
    id: string;
    name: string;
    avatar: string | null;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
  booking?: {
    id: string;
    service: string;
  };
}

const mockConversations: Conversation[] = [
  {
    id: '1',
    customer: { id: 'c1', name: 'Rahul Sharma', avatar: null },
    lastMessage: 'Thank you for confirming the reschedule!',
    lastMessageTime: new Date(Date.now() - 1800000),
    unreadCount: 2,
    isOnline: true,
    booking: { id: 'BK-2024-0042', service: 'Deep Home Cleaning' },
  },
  {
    id: '2',
    customer: { id: 'c2', name: 'Priya Patel', avatar: null },
    lastMessage: 'Can you please send the invoice?',
    lastMessageTime: new Date(Date.now() - 3600000 * 2),
    unreadCount: 0,
    isOnline: false,
    booking: { id: 'BK-2024-0039', service: 'AC Repair' },
  },
  {
    id: '3',
    customer: { id: 'c3', name: 'Amit Kumar', avatar: null },
    lastMessage: 'I have a question about the service',
    lastMessageTime: new Date(Date.now() - 3600000 * 5),
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: '4',
    customer: { id: 'c4', name: 'Sneha Reddy', avatar: null },
    lastMessage: 'The service was excellent!',
    lastMessageTime: new Date(Date.now() - 86400000),
    unreadCount: 0,
    isOnline: false,
    booking: { id: 'BK-2024-0035', service: 'Plumbing Repair' },
  },
  {
    id: '5',
    customer: { id: 'c5', name: 'Vikram Singh', avatar: null },
    lastMessage: 'When will the technician arrive?',
    lastMessageTime: new Date(Date.now() - 86400000 * 2),
    unreadCount: 0,
    isOnline: false,
    booking: { id: 'BK-2024-0030', service: 'Electrical Work' },
  },
];

export default function BusinessMessagesScreen() {
  const colors = useColors();
  const [conversations] = useState(mockConversations);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'booking', label: 'With Booking' },
  ];

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.customer.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'unread'
        ? conv.unreadCount > 0
        : activeFilter === 'booking'
        ? conv.booking !== undefined
        : true;
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);
    const days = diff / (1000 * 60 * 60 * 24);

    if (hours < 1) {
      return Math.floor(diff / (1000 * 60)) + 'm ago';
    } else if (hours < 24) {
      return Math.floor(hours) + 'h ago';
    } else if (days < 7) {
      return Math.floor(days) + 'd ago';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleArea}>
          <ThemedText style={styles.headerTitle}>Messages</ThemedText>
          {totalUnread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
              <ThemedText style={styles.unreadBadgeText}>{totalUnread}</ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search conversations..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterPill,
                {
                  backgroundColor:
                    activeFilter === filter.id ? colors.primary : colors.card,
                  borderColor:
                    activeFilter === filter.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: activeFilter === filter.id ? '#fff' : colors.text },
                ]}
              >
                {filter.label}
              </ThemedText>
              {filter.id === 'unread' && totalUnread > 0 && (
                <View
                  style={[
                    styles.filterBadge,
                    {
                      backgroundColor:
                        activeFilter === filter.id ? '#fff' : colors.error,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.filterBadgeText,
                      {
                        color:
                          activeFilter === filter.id ? colors.primary : '#fff',
                      },
                    ]}
                  >
                    {totalUnread}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No conversations
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Messages from customers will appear here
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.conversationCard,
              {
                backgroundColor: item.unreadCount > 0 ? colors.primary + '08' : colors.card,
              },
            ]}
            onPress={() => router.push(`/business-owner/chat/${item.id}` as any)}
          >
            <View style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: colors.primary + '20' }]}>
                <ThemedText style={[styles.avatarText, { color: colors.primary }]}>
                  {item.customer.name.charAt(0)}
                </ThemedText>
              </View>
              {item.isOnline && (
                <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              )}
            </View>

            <View style={styles.conversationContent}>
              <View style={styles.conversationHeader}>
                <ThemedText
                  style={[
                    styles.customerName,
                    item.unreadCount > 0 && { fontWeight: '700' },
                  ]}
                >
                  {item.customer.name}
                </ThemedText>
                <ThemedText
                  style={[
                    styles.timeText,
                    { color: item.unreadCount > 0 ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {formatTime(item.lastMessageTime)}
                </ThemedText>
              </View>

              {item.booking && (
                <View style={styles.bookingTag}>
                  <Ionicons name="calendar" size={12} color={colors.textSecondary} />
                  <ThemedText style={[styles.bookingText, { color: colors.textSecondary }]}>
                    {item.booking.service}
                  </ThemedText>
                </View>
              )}

              <View style={styles.messageRow}>
                <ThemedText
                  style={[
                    styles.lastMessage,
                    {
                      color: item.unreadCount > 0 ? colors.text : colors.textSecondary,
                      fontWeight: item.unreadCount > 0 ? '500' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </ThemedText>
                {item.unreadCount > 0 && (
                  <View style={[styles.unreadCount, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.unreadCountText}>
                      {item.unreadCount}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
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
  },
  backButton: {
    padding: 4,
  },
  headerTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  headerAction: {
    padding: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    marginLeft: 12,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
  },
  bookingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  bookingText: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  unreadCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
