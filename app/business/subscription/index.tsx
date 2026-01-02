/**
 * Subscription & Billing
 * 
 * Current plan, features, usage stats, upgrade/downgrade, billing cycle
 * 
 * User Type: business
 * Requires Auth: Yes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

// Color Constants
const Colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  accent: '#F59E0B',
  error: '#EF4444',
  warning: '#FCD34D',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

export default function IndexScreen() {
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch data from Supabase
      // const { data, error } = await supabase
      //   .from('table_name')
      //   .select('*');
      
      // Simulated data load
      await new Promise(resolve => setTimeout(resolve, 500));
      setData({});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Subscription & Billing' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'Subscription & Billing',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.grayDark,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Subscription & Billing</Text>
          <Text style={styles.subtitle}>
            Current plan, features, usage stats, upgrade/downgrade, billing cycle
          </Text>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          {/* TODO: Implement Subscription & Billing UI components */}
          <View style={styles.placeholder}>
            <Ionicons name="construct-outline" size={48} color={Colors.gray} />
            <Text style={styles.placeholderText}>
              Content coming soon
            </Text>
            <Text style={styles.placeholderSubtext}>
              This page is being developed
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // TODO: Primary action
            }}
          >
            <Text style={styles.primaryButtonText}>Primary Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    minHeight: 300,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 32,
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.grayDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
