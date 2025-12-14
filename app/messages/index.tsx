import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const conversations = [
  { 
    id: '1', 
    name: "Mike's Plumbing", 
    lastMessage: 'I can be there in 30 minutes', 
    time: '5 min ago', 
    unread: 2,
    online: true,
    type: 'business'
  },
  { 
    id: '2', 
    name: 'John Doe', 
    lastMessage: 'When will you arrive?', 
    time: '1 hour ago', 
    unread: 0,
    online: false,
    type: 'customer'
  },
  { 
    id: '3', 
    name: 'Clean Home Services', 
    lastMessage: 'Service completed. Please rate us!', 
    time: '2 hours ago', 
    unread: 1,
    online: true,
    type: 'business'
  },
  { 
    id: '4', 
    name: 'Sarah Williams', 
    lastMessage: 'Thank you for the service', 
    time: 'Yesterday', 
    unread: 0,
    online: false,
    type: 'customer'
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color="#2D3E2F" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#6B8E6F" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationCard}
            onPress={() => router.push(`/messages/chat/${item.id}`)}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons 
                  name={item.type === 'business' ? 'business' : 'person'} 
                  size={30} 
                  color="#2D3E2F" 
                />
              </View>
              {item.online && <View style={styles.onlineDot} />}
            </View>

            <View style={styles.conversationInfo}>
              <View style={styles.conversationHeader}>
                <Text style={styles.conversationName}>{item.name}</Text>
                <Text style={styles.conversationTime}>{item.time}</Text>
              </View>
              <View style={styles.conversationFooter}>
                <Text 
                  style={[
                    styles.lastMessage,
                    item.unread > 0 && styles.unreadMessage
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{item.unread}</Text>
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
    backgroundColor: '#C8E6C9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3E2F',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#2D3E2F',
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    backgroundColor: '#A8D5AB',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationInfo: {
    flex: 1,
    gap: 6,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B8E6F',
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#2D3E2F',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    backgroundColor: '#4A5F4E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
});
