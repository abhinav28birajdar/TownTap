import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const themeOptions = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Classic light theme',
    icon: 'sunny',
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Easy on your eyes',
    icon: 'moon',
  },
  {
    id: 'auto',
    name: 'Auto',
    description: 'Matches system settings',
    icon: 'phone-portrait',
  },
];

export default function ThemeSettingsScreen() {
  const colors = useColors();
  const [selectedTheme, setSelectedTheme] = useState('auto');

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    Alert.alert(
      'Theme Changed',
      `Theme has been set to ${themeOptions.find(t => t.id === themeId)?.name}`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Theme</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.description}>
          <ThemedText style={styles.descriptionText}>
            Choose your preferred app appearance
          </ThemedText>
        </View>

        <View style={styles.themeList}>
          {themeOptions.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeItem,
                { backgroundColor: colors.card },
                selectedTheme === theme.id && {
                  borderColor: '#415D43',
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleThemeSelect(theme.id)}
            >
              <View style={[styles.themeIcon, { backgroundColor: '#415D43' + '20' }]}>
                <Ionicons name={theme.icon as any} size={28} color="#415D43" />
              </View>
              <View style={styles.themeInfo}>
                <ThemedText style={styles.themeName}>{theme.name}</ThemedText>
                <ThemedText style={styles.themeDescription}>
                  {theme.description}
                </ThemedText>
              </View>
              {selectedTheme === theme.id && (
                <Ionicons name="checkmark-circle" size={24} color="#415D43" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewSection}>
          <ThemedText style={styles.previewTitle}>Preview</ThemedText>
          <View style={[styles.previewCard, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.previewText}>
              This is how text will appear in the app
            </ThemedText>
            <View style={styles.previewButtons}>
              <View style={[styles.previewButton, { backgroundColor: '#415D43' }]}>
                <ThemedText style={styles.previewButtonText}>Primary</ThemedText>
              </View>
              <View style={[styles.previewButton, { backgroundColor: '#29422B' }]}>
                <ThemedText style={styles.previewButtonText}>Secondary</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  description: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  descriptionText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  themeList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  themeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  themeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    opacity: 0.6,
  },
  previewSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    padding: 20,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 14,
    marginBottom: 16,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  previewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
