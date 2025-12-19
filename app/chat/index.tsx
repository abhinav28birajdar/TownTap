import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ChatConversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  type: 'provider' | 'support' | 'business';
  bookingId?: string;
}

const conversations: ChatConversation[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    avatar: 'https://via.placeholder.com/50',
    lastMessage: 'I will arrive in 15 minutes. Please keep the door open.',
    time: '2 min ago',
    unreadCount: 2,
    isOnline: true,
    type: 'provider',
    bookingId: 'BK-001',
  },
  {
    id: '2',
    name: 'TownTap Support',
    avatar: 'https://via.placeholder.com/50',
    lastMessage: 'Your refund has been processed successfully.',
    time: '1 hour ago',
    unreadCount: 0,
    isOnline: true,
    type: 'support',
  },
  {
    id: '3',
    name: 'CleanPro Services',
    avatar: 'https://via.placeholder.com/50',
    lastMessage: 'Thank you for booking with us! We look forward to serving you.',
    time: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    type: 'business',
    bookingId: 'BK-002',
  },
  {
    id: '4',
    name: 'Priya Sharma',
    avatar: 'https://via.placeholder.com/50',
    lastMessage: 'Great work! Thank you for the excellent service.',
    time: 'Yesterday',
    unreadCount: 0,
    isOnline: false,
    type: 'provider',
    bookingId: 'BK-003',
  },
  {
    id: '5',
    name: 'StyleHub Salon',
    avatar: 'https://via.placeholder.com/50',
    lastMessage: 'Your appointment is confirmed for tomorrow at 3 PM.',
    time: '2 days ago',
    unreadCount: 1,
    isOnline: true,
    type: 'business',
  },
];

const quickActions = [
  { id: '1', label: 'Support', icon: 'help-circle-outline', color: '#4CAF50' },
  { id: '2', label: 'Active Booking', icon: 'calendar-outline', color: '#2196F3' },
  { id: '3', label: 'Share Location', icon: 'location-outline', color: '#FF9800' },
];

export default function ChatListScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'provider', label: 'Providers' },
    { id: 'business', label: 'Businesses' },
    { id: 'support', label: 'Support' },
  ];

  const filteredConversations = conversations.filter((conv) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return conv.unreadCount > 0;
    return conv.type === selectedFilter;
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const renderConversation = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/messages/${item.id}` as any)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && (
          <View style={[styles.onlineIndicator, { borderColor: colors.card }]} />
        )}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.conversationName} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.type === 'support' && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              </View>
            )}
          </View>
          <ThemedText style={[styles.conversationTime, { color: colors.textSecondary }]}>
            {item.time}
          </ThemedText>
        </View>
        <View style={styles.messageRow}>
          <ThemedText
            style={[
              styles.lastMessage,
              { color: item.unreadCount > 0 ? colors.text : colors.textSecondary }
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
          {item.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <ThemedText style={styles.unreadText}>{item.unreadCount}</ThemedText>
            </View>
          )}
        </View>
        {item.bookingId && (
          <View style={styles.bookingTag}>
            <Ionicons name="receipt-outline" size={12} color={colors.textSecondary} />
            <ThemedText style={[styles.bookingId, { color: colors.textSecondary }]}>
              {item.bookingId}
            </ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Messages</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.card }]}
            onPress={() => setShowNewChatModal(true)}
          >
            <Ionicons name="create-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Bar */}
      {totalUnread > 0 && (
        <LinearGradient
          colors={[colors.primary, colors.primary + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.statsBar}
        >
          <View style={styles.statsContent}>
            <View style={styles.statsLeft}>
              <View style={styles.unreadCircle}>
                <ThemedText style={styles.unreadCount}>{totalUnread}</ThemedText>
              </View>
              <ThemedText style={styles.statsText}>unread messages</ThemedText>
            </View>
            <TouchableOpacity>
              <ThemedText style={styles.markAllRead}>Mark all read</ThemedText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search conversations..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterTab,
              selectedFilter === filter.id && { backgroundColor: colors.primary }
            ]}
            onPress={() => setSelectedFilter(filter.id)}
          >
            <ThemedText style={[
              styles.filterText,
              { color: selectedFilter === filter.id ? '#FFF' : colors.textSecondary }
            ]}>
              {filter.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.quickAction, { backgroundColor: colors.card }]}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
              <Ionicons name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={styles.quickActionLabel}>{action.label}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No Messages</ThemedText>
            <ThemedText style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Start a conversation with a provider or contact support
            </ThemedText>
          </View>
        }
      />

      {/* New Chat Modal */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>New Message</ThemedText>
              <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalSearchContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: colors.text }]}
                placeholder="Search providers or businesses..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.recentSection}>
              <ThemedText style={[styles.recentTitle, { color: colors.textSecondary }]}>
                Recent Contacts
              </ThemedText>
              {conversations.slice(0, 3).map((conv) => (
                <TouchableOpacity
                  key={conv.id}
                  style={[styles.recentContact, { backgroundColor: colors.background }]}
                  onPress={() => {
                    setShowNewChatModal(false);
                    router.push(`/messages/${conv.id}` as any);
                  }}
                >
                  <Image source={{ uri: conv.avatar }} style={styles.recentAvatar} />
                  <View style={styles.recentInfo}>
                    <ThemedText style={styles.recentName}>{conv.name}</ThemedText>
                    <ThemedText style={[styles.recentType, { color: colors.textSecondary }]}>
                      {conv.type.charAt(0).toUpperCase() + conv.type.slice(1)}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.supportSection}>
              <TouchableOpacity
                style={[styles.supportButton, { backgroundColor: colors.primary + '15' }]}
                onPress={() => {
                  setShowNewChatModal(false);
                  router.push('/customer/support-tickets');
                }}
              >
                <Ionicons name="help-circle" size={24} color={colors.primary} />
                <View style={styles.supportInfo}>
                  <ThemedText style={[styles.supportTitle, { color: colors.primary }]}>
                    Contact Support
                  </ThemedText>
                  <ThemedText style={[styles.supportSubtitle, { color: colors.textSecondary }]}>
                    Get help with your bookings
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsBar: {
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  unreadCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  statsText: {
    color: '#FFF',
    fontSize: 14,
  },
  markAllRead: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    maxWidth: '70%',
  },
  verifiedBadge: {
    padding: 3,
    borderRadius: 6,
  },
  conversationTime: {
    fontSize: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  bookingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  bookingId: {
    fontSize: 11,
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
    paddingHorizontal: 32,
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
    maxHeight: '80%',
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
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 20,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  recentSection: {
    marginBottom: 20,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  recentContact: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  recentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  recentType: {
    fontSize: 12,
  },
  supportSection: {
    marginTop: 10,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  supportSubtitle: {
    fontSize: 12,
  },
});
