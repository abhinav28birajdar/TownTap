import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Title and Icon */}
        <View style={styles.topSection}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🗺️</Text>
          </View>
          <Text style={styles.title}>Book. Track. Relax.</Text>
        </View>

        {/* Main Content Area - Large Card */}
        <View style={styles.mainCard}>
          {/* This will contain booking details */}
          <View style={styles.expandIcon}>
            <Ionicons name="expand" size={24} color="#333" />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#E57373' }]}>
            <Text style={styles.actionButtonText}>Cancel{'\n'}Task</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4A5F4E' }]}>
            <Text style={styles.actionButtonText}>Online{'\n'}Pay</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4A5F4E' }]}>
            <Text style={styles.actionButtonText}>contact{'\n'}delivery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  topSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  iconText: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  mainCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: '#A8D5AB',
    borderRadius: 30,
    minHeight: 400,
    marginBottom: Spacing.xl,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: Spacing.lg,
  },
  expandIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: 100,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
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
