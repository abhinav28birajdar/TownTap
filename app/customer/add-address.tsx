/**
 * TownTap - Add Address Screen
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

export default function AddAddressScreen() {
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!addressLine1.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Address saved', [{ text: 'OK', onPress: () => router.back() }]);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.grayDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Address</Text>
        <View style={{ width: 40 }} />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={styles.input}
              placeholder="Street address"
              value={addressLine1}
              onChangeText={setAddressLine1}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput style={styles.input} placeholder="City" value={city} onChangeText={setCity} />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} placeholder="State" value={state} onChangeText={setState} />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>ZIP</Text>
              <TextInput style={styles.input} placeholder="ZIP" value={zipCode} onChangeText={setZipCode} keyboardType="number-pad" />
            </View>
          </View>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveBtnText}>Save Address</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.grayDark },
  content: { flex: 1, padding: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.grayDark, marginBottom: 8 },
  input: { backgroundColor: Colors.grayLight, borderRadius: 12, padding: 14, fontSize: 16, color: Colors.grayDark },
  row: { flexDirection: 'row' },
  saveBtn: { backgroundColor: Colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '600' },
});
