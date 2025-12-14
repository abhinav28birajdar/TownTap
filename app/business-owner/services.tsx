import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const services = [
  { id: '1', name: 'Plumbing Repair', category: 'Plumber', price: 500, available: true },
  { id: '2', name: 'Electrical Wiring', category: 'Electrician', price: 800, available: true },
  { id: '3', name: 'House Painting', category: 'Painter', price: 2500, available: false },
  { id: '4', name: 'Carpentry Work', category: 'Carpenter', price: 1200, available: true },
  { id: '5', name: 'House Cleaning', category: 'House Maid', price: 400, available: true },
  { id: '6', name: 'Garden Maintenance', category: 'Gardener', price: 600, available: true },
];

export default function BusinessServicesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3E2F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Services</Text>
        <TouchableOpacity onPress={() => router.push('/business-owner/add-product')}>
          <Ionicons name="add-circle" size={28} color="#4A5F4E" />
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <View style={styles.serviceImage}>
              <Ionicons name="briefcase-outline" size={40} color="#6B8E6F" />
            </View>
            
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{item.name}</Text>
              <Text style={styles.serviceCategory}>{item.category}</Text>
              <Text style={styles.servicePrice}>₹{item.price}</Text>
              <View style={[styles.availabilityBadge, { backgroundColor: item.available ? '#10B98120' : '#EF444420' }]}>
                <View style={[styles.availabilityDot, { backgroundColor: item.available ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.availabilityText, { color: item.available ? '#10B981' : '#EF4444' }]}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>

            <View style={styles.serviceActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color="#4A5F4E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
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
  listContent: {
    padding: 20,
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  serviceImage: {
    width: 80,
    height: 80,
    backgroundColor: '#A8D5AB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3E2F',
  },
  serviceCategory: {
    fontSize: 13,
    color: '#6B8E6F',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A5F4E',
    marginTop: 4,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  serviceActions: {
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
