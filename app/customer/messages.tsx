import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const MOCK_MESSAGES = [
  {
    id: '1',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
  {
    id: '2',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
  {
    id: '3',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
  {
    id: '4',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
  {
    id: '5',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
  {
    id: '6',
    name: 'Aarav Sharma',
    business: "Aarav Men's Salon",
    time: '11:00 PM',
    avatar: '👨',
  },
];

export default function MessagesScreen() {
  const renderMessage = ({ item }: { item: typeof MOCK_MESSAGES[0] }) => (
    <TouchableOpacity style={styles.messageCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.messageInfo}>
        <Text style={styles.messageName}>{item.name}</Text>
        <Text style={styles.messageBusiness}>{item.business}</Text>
      </View>
      <View style={styles.messageRight}>
        <Text style={styles.messageTime}>{item.time}</Text>
        <TouchableOpacity style={styles.cameraButton}>
          <Ionicons name="camera" size={20} color="#4A5F4E" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Messages List */}
      <FlatList
        data={MOCK_MESSAGES}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
      />

      {/* See All Button */}
      <TouchableOpacity style={styles.seeAllButton}>
        <Text style={styles.seeAllText}>See All</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/home')}
        >
          <Ionicons name="home" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/search')}
        >
          <Ionicons name="location" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/(tabs)/explore')}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/customer/bookings')}
        >
          <Ionicons name="receipt" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D4E7D4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  messagesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A8D5AB',
    borderRadius: 20,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A5F4E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  messageInfo: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  messageBusiness: {
    fontSize: 14,
    color: '#555',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageTime: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  cameraButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B9FD7',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 50,
    right: 50,
    flexDirection: 'row',
    backgroundColor: '#6B8E6F',
    borderRadius: 30,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
