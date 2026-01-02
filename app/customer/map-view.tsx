/**
 * TownTap - Map View Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

export default function MapViewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Map View</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Ionicons name="map-outline" size={64} color={Colors.gray} />
          <Text style={styles.placeholderTitle}>Map Coming Soon</Text>
          <Text style={styles.placeholderText}>
            Interactive map with nearby businesses will be available in the next update.
          </Text>
          <TouchableOpacity style={styles.listBtn} onPress={() => router.back()}>
            <Text style={styles.listBtnText}>View List Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  placeholder: { alignItems: 'center' },
  placeholderTitle: { fontSize: 20, fontWeight: '600', color: Colors.grayDark, marginTop: 16 },
  placeholderText: { fontSize: 16, color: Colors.gray, textAlign: 'center', marginTop: 8, lineHeight: 24 },
  listBtn: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  listBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
