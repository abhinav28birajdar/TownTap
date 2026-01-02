/**
 * TownTap - Select Service Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

const mockServices = [
  { id: '1', name: 'Basic Haircut', price: 25, duration: 30 },
  { id: '2', name: 'Hair Styling', price: 45, duration: 45 },
  { id: '3', name: 'Hair Coloring', price: 85, duration: 90 },
  { id: '4', name: 'Hair Treatment', price: 55, duration: 60 },
];

export default function SelectServiceScreen() {
  const { businessId } = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const renderService = ({ item }: { item: typeof mockServices[0] }) => (
    <TouchableOpacity
      style={[styles.serviceCard, selectedService === item.id && styles.serviceCardSelected]}
      onPress={() => setSelectedService(item.id)}
    >
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.serviceDuration}>{item.duration} min</Text>
      </View>
      <View style={styles.servicePrice}>
        <Text style={styles.priceText}>${item.price}</Text>
        {selectedService === item.id && <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={{ width: 40 }} />
      </View>
      <FlatList
        data={mockServices}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedService && styles.continueBtnDisabled]}
          disabled={!selectedService}
          onPress={() => router.push(`/booking/schedule?serviceId=${selectedService}&businessId=${businessId}`)}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  listContent: { padding: 16 },
  serviceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: Colors.grayLight, borderRadius: 12, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  serviceCardSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '600', color: Colors.grayDark },
  serviceDuration: { fontSize: 14, color: Colors.gray, marginTop: 4 },
  servicePrice: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priceText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  continueBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: Colors.gray },
  continueBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
