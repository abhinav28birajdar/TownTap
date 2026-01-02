/**
 * TownTap - Search Map View Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Colors = {
  primary: '#2563EB',
  grayDark: '#111827',
  gray: '#6B7280',
  white: '#FFFFFF',
  border: '#E5E7EB',
};

export default function SearchMapViewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Map Search</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.content}>
        <Ionicons name="map-outline" size={64} color={Colors.gray} />
        <Text style={styles.title}>Map Search Coming Soon</Text>
        <Text style={styles.subtitle}>Search businesses on an interactive map</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()}>
          <Text style={styles.btnText}>Use List View</Text>
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
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '600', color: Colors.grayDark, marginTop: 16 },
  subtitle: { fontSize: 16, color: Colors.gray, marginTop: 8, textAlign: 'center' },
  btn: { marginTop: 24, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  btnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
