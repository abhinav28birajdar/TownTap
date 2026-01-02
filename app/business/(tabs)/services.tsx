/**
 * TownTap - Business Services Tab
 * Manage all services for the business
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  secondaryLight: '#D1FAE5',
  accent: '#F59E0B',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

export default function BusinessServices() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<any[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Load services from Supabase
    setRefreshing(false);
  };

  const renderService = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => router.push(`/business/services/${item.id}`)}
    >
      <View style={styles.serviceImage}>
        <Ionicons name="image-outline" size={32} color={Colors.gray} />
      </View>
      
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceCategory}>{item.category}</Text>
        <View style={styles.serviceStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={Colors.gray} />
            <Text style={styles.statText}>{item.duration} min</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={14} color={Colors.accent} />
            <Text style={styles.statText}>{item.rating || '0.0'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.serviceActions}>
        <Text style={styles.servicePrice}>${item.price}</Text>
        <View style={[
          styles.statusDot,
          { backgroundColor: item.is_active ? Colors.secondary : Colors.gray }
        ]} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Services</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/business/services/add')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        renderItem={renderService}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyStateTitle}>No Services Yet</Text>
            <Text style={styles.emptyStateText}>
              Add your first service to start receiving bookings
            </Text>
            <TouchableOpacity
              style={styles.addServiceBtn}
              onPress={() => router.push('/business/services/add')}
            >
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.addServiceBtnText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.grayDark,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  serviceImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.grayDark,
  },
  serviceCategory: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  serviceStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.gray,
  },
  serviceActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  addServiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
  },
  addServiceBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
