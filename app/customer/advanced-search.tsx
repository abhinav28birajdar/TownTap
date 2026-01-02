/**
 * TownTap - Advanced Search Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

const categories = ['All', 'Beauty', 'Home Services', 'Health', 'Auto', 'Pets', 'Events'];

export default function AdvancedSearchScreen() {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, businesses..."
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <Text style={styles.sectionTitle}>Categories</Text>
        <View style={styles.categoryRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.placeholder}>
          <Ionicons name="search-outline" size={48} color={Colors.gray} />
          <Text style={styles.placeholderText}>Enter a search term to find services</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  content: { flex: 1, padding: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.grayLight, borderRadius: 12, padding: 12, marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: Colors.grayDark },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.grayDark, marginBottom: 12 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.grayLight },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { fontSize: 14, color: Colors.grayDark },
  categoryTextActive: { color: Colors.white },
  placeholder: { alignItems: 'center', paddingTop: 60 },
  placeholderText: { marginTop: 16, fontSize: 16, color: Colors.gray, textAlign: 'center' },
});
