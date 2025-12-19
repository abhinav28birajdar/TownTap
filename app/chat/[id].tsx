import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  type: 'text' | 'image' | 'location' | 'booking' | 'system';
  image?: string;
  bookingDetails?: {
    id: string;
    service: string;
    date: string;
    status: string;
  };
  read: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  type: 'provider' | 'support' | 'business';
}

const chatUser: ChatUser = {
  id: '1',
  name: 'Rajesh Kumar',
  avatar: 'https://via.placeholder.com/50',
  isOnline: true,
  lastSeen: '2 min ago',
  type: 'provider',
};

const messages: Message[] = [
  {
    id: '1',
    text: '',
    senderId: 'system',
    timestamp: '10:00 AM',
    type: 'system',
    read: true,
  },
  {
    id: '2',
    text: 'Hello! I am your assigned service provider for the Deep Home Cleaning booking.',
    senderId: '1',
    timestamp: '10:05 AM',
    type: 'text',
    read: true,
  },
  {
    id: '3',
    text: 'Hi Rajesh! Great to connect with you. When can you arrive?',
    senderId: 'me',
    timestamp: '10:07 AM',
    type: 'text',
    read: true,
  },
  {
    id: '4',
    text: '',
    senderId: '1',
    timestamp: '10:08 AM',
    type: 'booking',
    bookingDetails: {
      id: 'BK-001',
      service: 'Deep Home Cleaning',
      date: 'Today, 11:00 AM',
      status: 'Confirmed',
    },
    read: true,
  },
  {
    id: '5',
    text: 'I will be there at 11 AM sharp. Is the address correct - Tower A, Flat 302?',
    senderId: '1',
    timestamp: '10:10 AM',
    type: 'text',
    read: true,
  },
  {
    id: '6',
    text: 'Yes, that is correct. Please use the main entrance.',
    senderId: 'me',
    timestamp: '10:12 AM',
    type: 'text',
    read: true,
  },
  {
    id: '7',
    text: 'I am on my way now. Will share my live location.',
    senderId: '1',
    timestamp: '10:45 AM',
    type: 'text',
    read: true,
  },
  {
    id: '8',
    text: '',
    senderId: '1',
    timestamp: '10:46 AM',
    type: 'location',
    read: true,
  },
  {
    id: '9',
    text: 'Great! I can see you are 15 minutes away.',
    senderId: 'me',
    timestamp: '10:47 AM',
    type: 'text',
    read: true,
  },
  {
    id: '10',
    text: 'I will arrive in 15 minutes. Please keep the door open.',
    senderId: '1',
    timestamp: '10:50 AM',
    type: 'text',
    read: false,
  },
];

const quickReplies = [
  'On my way!',
  'Running late',
  'Please wait',
  'I\'m here',
  'Need directions',
  'Call me',
];

export default function ChatDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const flatListRef = useRef<FlatList>(null);
  const [messageText, setMessageText] = useState('');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const sendMessage = () => {
    if (messageText.trim()) {
      // Add message logic here
      setMessageText('');
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === 'me';
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <ThemedText style={[styles.systemText, { color: colors.textSecondary }]}>
            Chat started for Booking #BK-001
          </ThemedText>
        </View>
      );
    }

    if (item.type === 'booking') {
      return (
        <View style={[styles.bookingMessage, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
          <View style={[styles.bookingCard, { backgroundColor: colors.primary + '15' }]}>
            <View style={styles.bookingHeader}>
              <Ionicons name="calendar" size={16} color={colors.primary} />
              <ThemedText style={[styles.bookingTitle, { color: colors.primary }]}>
                Booking Details
              </ThemedText>
            </View>
            <View style={styles.bookingInfo}>
              <ThemedText style={styles.bookingService}>
                {item.bookingDetails?.service}
              </ThemedText>
              <ThemedText style={[styles.bookingDate, { color: colors.textSecondary }]}>
                {item.bookingDetails?.date}
              </ThemedText>
              <View style={[styles.bookingStatus, { backgroundColor: colors.success + '20' }]}>
                <ThemedText style={[styles.bookingStatusText, { color: colors.success }]}>
                  {item.bookingDetails?.status}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.viewBookingButton, { borderColor: colors.primary }]}
              onPress={() => router.push(`/booking/confirmation-detail?id=${item.bookingDetails?.id}`)}
            >
              <ThemedText style={[styles.viewBookingText, { color: colors.primary }]}>
                View Booking
              </ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={[styles.messageTime, { color: colors.textSecondary }]}>
            {item.timestamp}
          </ThemedText>
        </View>
      );
    }

    if (item.type === 'location') {
      return (
        <View style={[styles.messageContainer, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
          <TouchableOpacity
            style={[styles.locationMessage, { backgroundColor: colors.card }]}
          >
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="location" size={32} color={colors.primary} />
              <ThemedText style={[styles.mapText, { color: colors.primary }]}>
                Live Location Shared
              </ThemedText>
            </View>
            <View style={styles.locationFooter}>
              <Ionicons name="navigate" size={16} color={colors.primary} />
              <ThemedText style={[styles.locationAction, { color: colors.primary }]}>
                Open in Maps
              </ThemedText>
            </View>
          </TouchableOpacity>
          <ThemedText style={[styles.messageTime, { color: colors.textSecondary }]}>
            {item.timestamp}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={[styles.messageContainer, { alignSelf: isMe ? 'flex-end' : 'flex-start' }]}>
        {!isMe && (
          <Image source={{ uri: chatUser.avatar }} style={styles.messageAvatar} />
        )}
        <View style={[
          styles.messageBubble,
          isMe ? { backgroundColor: colors.primary } : { backgroundColor: colors.card }
        ]}>
          <ThemedText style={[styles.messageText, { color: isMe ? '#FFF' : colors.text }]}>
            {item.text}
          </ThemedText>
        </View>
        <View style={styles.messageFooter}>
          <ThemedText style={[styles.messageTime, { color: colors.textSecondary }]}>
            {item.timestamp}
          </ThemedText>
          {isMe && (
            <Ionicons
              name={item.read ? 'checkmark-done' : 'checkmark'}
              size={14}
              color={item.read ? colors.primary : colors.textSecondary}
            />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => setShowProfileModal(true)}
        >
          <View style={styles.avatarContainer}>
            <Image source={{ uri: chatUser.avatar }} style={styles.headerAvatar} />
            {chatUser.isOnline && (
              <View style={[styles.onlineIndicator, { borderColor: colors.background }]} />
            )}
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerName}>{chatUser.name}</ThemedText>
            <ThemedText style={[styles.headerStatus, { color: chatUser.isOnline ? colors.success : colors.textSecondary }]}>
              {chatUser.isOnline ? 'Online' : `Last seen ${chatUser.lastSeen}`}
            </ThemedText>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerAction, { backgroundColor: colors.card }]}>
            <Ionicons name="call-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerAction, { backgroundColor: colors.card }]}
            onPress={() => setShowActionsModal(true)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        inverted={false}
      />

      {/* Quick Replies */}
      <View style={[styles.quickRepliesContainer, { backgroundColor: colors.background }]}>
        <FlatList
          data={quickReplies}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.quickReply, { backgroundColor: colors.card }]}
              onPress={() => setMessageText(item)}
            >
              <ThemedText style={[styles.quickReplyText, { color: colors.textSecondary }]}>
                {item}
              </ThemedText>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.quickRepliesList}
        />
      </View>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
          </TouchableOpacity>
          <View style={[styles.textInputContainer, { backgroundColor: colors.background }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity>
              <Ionicons name="happy-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {messageText.trim() ? (
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={sendMessage}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="mic" size={20} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Actions Modal */}
      <Modal
        visible={showActionsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={[styles.actionsModalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            
            {[
              { icon: 'search-outline', label: 'Search in chat', action: () => {} },
              { icon: 'image-outline', label: 'Media & files', action: () => {} },
              { icon: 'location-outline', label: 'Share location', action: () => {} },
              { icon: 'notifications-off-outline', label: 'Mute notifications', action: () => {} },
              { icon: 'flag-outline', label: 'Report issue', action: () => {} },
              { icon: 'trash-outline', label: 'Clear chat', action: () => {}, danger: true },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={() => {
                  setShowActionsModal(false);
                  action.action();
                }}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.danger ? colors.error + '15' : colors.background }]}>
                  <Ionicons
                    name={action.icon as any}
                    size={20}
                    color={action.danger ? colors.error : colors.text}
                  />
                </View>
                <ThemedText style={[styles.actionLabel, action.danger && { color: colors.error }]}>
                  {action.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.profileModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.closeProfile}
              onPress={() => setShowProfileModal(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.profileHeader}>
              <Image source={{ uri: chatUser.avatar }} style={styles.profileAvatar} />
              <ThemedText style={styles.profileName}>{chatUser.name}</ThemedText>
              <ThemedText style={[styles.profileType, { color: colors.textSecondary }]}>
                Service Provider
              </ThemedText>
              {chatUser.isOnline && (
                <View style={styles.onlineStatus}>
                  <View style={styles.onlineDot} />
                  <ThemedText style={[styles.onlineText, { color: colors.success }]}>
                    Online Now
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.profileActions}>
              <TouchableOpacity style={[styles.profileAction, { backgroundColor: colors.background }]}>
                <Ionicons name="call" size={22} color={colors.primary} />
                <ThemedText style={styles.profileActionText}>Call</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileAction, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowProfileModal(false);
                  router.push(`/provider/${chatUser.id}` as any);
                }}
              >
                <Ionicons name="person" size={22} color={colors.primary} />
                <ThemedText style={styles.profileActionText}>Profile</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.profileAction, { backgroundColor: colors.background }]}>
                <Ionicons name="location" size={22} color={colors.primary} />
                <ThemedText style={styles.profileActionText}>Location</ThemedText>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  backButton: {
    padding: 6,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: 16,
  },
  systemText: {
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 8,
    gap: 4,
  },
  messageTime: {
    fontSize: 11,
  },
  bookingMessage: {
    marginBottom: 12,
    maxWidth: '85%',
  },
  bookingCard: {
    padding: 14,
    borderRadius: 16,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  bookingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookingInfo: {},
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  bookingStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewBookingButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewBookingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  locationMessage: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    width: 200,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
  },
  locationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 6,
  },
  locationAction: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickRepliesContainer: {
    paddingVertical: 10,
  },
  quickRepliesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickReply: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  quickReplyText: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    borderTopWidth: 0.5,
    gap: 8,
  },
  attachButton: {
    padding: 6,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    maxHeight: 100,
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    maxHeight: 80,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  profileModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  closeProfile: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileType: {
    fontSize: 14,
    marginBottom: 10,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '500',
  },
  profileActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 16,
    marginBottom: 16,
  },
  profileAction: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    minWidth: 90,
  },
  profileActionText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 8,
  },
});
