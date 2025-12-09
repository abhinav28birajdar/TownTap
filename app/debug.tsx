import { Colors, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { isAppConfigured } from '@/lib/secure-config-manager';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DebugScreen() {
  const { session, user, profile, loading } = useAuth();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [checkTime, setCheckTime] = useState<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    isAppConfigured().then((result) => {
      setConfigured(result);
      setCheckTime(Date.now() - startTime);
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔧 Debug Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Auth State</Text>
        <Text style={styles.item}>Loading: {loading ? '✅ Yes' : '❌ No'}</Text>
        <Text style={styles.item}>Session: {session ? '✅ Active' : '❌ None'}</Text>
        <Text style={styles.item}>User: {user ? '✅ Present' : '❌ None'}</Text>
        <Text style={styles.item}>Profile: {profile ? '✅ Loaded' : '❌ None'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Configuration</Text>
        <Text style={styles.item}>
          Configured: {configured === null ? '⏳ Checking...' : configured ? '✅ Yes' : '❌ No'}
        </Text>
        <Text style={styles.item}>Check Time: {checkTime}ms</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Environment</Text>
        <Text style={styles.item}>
          Supabase URL: {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not Set'}
        </Text>
        <Text style={styles.item}>
          Supabase Key: {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not Set'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/config-setup')}
        >
          <Text style={styles.buttonText}>Go to Config Setup</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.replace('/welcome')}
        >
          <Text style={styles.buttonText}>Go to Welcome</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  item: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: Colors.gray[600],
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
