import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../src/context/ModernThemeContext';

export default function ServiceSettingsScreen() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Service Settings</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          This screen is under development. Here you'll be able to manage your services, pricing, and availability.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
});