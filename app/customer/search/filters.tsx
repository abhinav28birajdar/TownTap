/**
 * TownTap - Search Filters Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

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
const ratings = [4, 3, 2, 1];
const distances = ['1 km', '5 km', '10 km', '25 km', '50 km'];
const priceRanges = ['$', '$$', '$$$', '$$$$'];

export default function SearchFiltersScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDistance, setSelectedDistance] = useState('10 km');
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);

  const handleApply = () => {
    // Apply filters and go back
    router.back();
  };

  const handleReset = () => {
    setSelectedCategory('All');
    setSelectedRating(null);
    setSelectedDistance('10 km');
    setSelectedPrice(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filters</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minimum Rating</Text>
          <View style={styles.chipRow}>
            {ratings.map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[styles.chip, selectedRating === rating && styles.chipActive]}
                onPress={() => setSelectedRating(rating)}
              >
                <Ionicons 
                  name="star" 
                  size={14} 
                  color={selectedRating === rating ? Colors.white : Colors.grayDark} 
                />
                <Text style={[styles.chipText, selectedRating === rating && styles.chipTextActive]}>
                  {rating}+
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distance</Text>
          <View style={styles.chipRow}>
            {distances.map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[styles.chip, selectedDistance === dist && styles.chipActive]}
                onPress={() => setSelectedDistance(dist)}
              >
                <Text style={[styles.chipText, selectedDistance === dist && styles.chipTextActive]}>
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.chipRow}>
            {priceRanges.map((price) => (
              <TouchableOpacity
                key={price}
                style={[styles.chip, selectedPrice === price && styles.chipActive]}
                onPress={() => setSelectedPrice(price)}
              >
                <Text style={[styles.chipText, selectedPrice === price && styles.chipTextActive]}>
                  {price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  resetText: { fontSize: 14, color: Colors.primary, fontWeight: '500' },
  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: Colors.grayDark, marginBottom: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.grayLight,
  },
  chipActive: { backgroundColor: Colors.primary },
  chipText: { fontSize: 14, color: Colors.grayDark },
  chipTextActive: { color: Colors.white },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.border },
  applyBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
