import { Spacing } from '@/constants/spacing';
import { BorderRadius, Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface ConfigItem {
  key: string;
  label: string;
  description: string;
  placeholder: string;
  secure?: boolean;
}

const CONFIG_ITEMS: ConfigItem[] = [
  {
    key: 'SUPABASE_URL',
    label: 'Supabase URL',
    description: 'Your Supabase project URL',
    placeholder: 'https://xxx.supabase.co',
  },
  {
    key: 'SUPABASE_ANON_KEY',
    label: 'Supabase Anon Key',
    description: 'Your Supabase anonymous/public key',
    placeholder: 'eyJhbG...',
    secure: true,
  },
  {
    key: 'STRIPE_PUBLISHABLE_KEY',
    label: 'Stripe Publishable Key',
    description: 'Stripe public key for payments',
    placeholder: 'pk_test_...',
  },
  {
    key: 'GOOGLE_MAPS_API_KEY',
    label: 'Google Maps API Key',
    description: 'For location services',
    placeholder: 'AIza...',
    secure: true,
  },
];

export default function SecureConfigScreen() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [showSecure, setShowSecure] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const loadedConfig: Record<string, string> = {};
      
      for (const item of CONFIG_ITEMS) {
        const value = await SecureStore.getItemAsync(item.key);
        if (value) {
          loadedConfig[item.key] = value;
        }
      }
      
      setConfig(loadedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
      Alert.alert('Error', 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      for (const item of CONFIG_ITEMS) {
        const value = config[item.key];
        if (value) {
          await SecureStore.setItemAsync(item.key, value);
        }
      }
      
      Alert.alert(
        'Success',
        'Configuration saved securely. Please restart the app for changes to take effect.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving config:', error);
      Alert.alert('Error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear All Configuration',
      'This will remove all saved API keys and configuration. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const item of CONFIG_ITEMS) {
                await SecureStore.deleteItemAsync(item.key);
              }
              setConfig({});
              Alert.alert('Success', 'All configuration cleared');
            } catch (error) {
              console.error('Error clearing config:', error);
              Alert.alert('Error', 'Failed to clear configuration');
            }
          },
        },
      ]
    );
  };

  const toggleSecureVisibility = (key: string) => {
    setShowSecure((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading configuration...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Secure Configuration</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={32} color={Colors.light.primary} />
          <Text style={styles.infoTitle}>Secure Storage</Text>
          <Text style={styles.infoText}>
            All API keys and secrets are encrypted and stored securely on your device using
            Expo SecureStore. They are never transmitted or logged.
          </Text>
        </View>

        {/* Configuration Items */}
        {CONFIG_ITEMS.map((item) => (
          <View key={item.key} style={styles.configItem}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={styles.description}>{item.description}</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, item.secure && !showSecure[item.key] && styles.secureInput]}
                placeholder={item.placeholder}
                value={config[item.key] || ''}
                onChangeText={(value) => setConfig({ ...config, [item.key]: value })}
                secureTextEntry={item.secure && !showSecure[item.key]}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#999"
              />
              {item.secure && (
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => toggleSecureVisibility(item.key)}
                >
                  <Ionicons
                    name={showSecure[item.key] ? 'eye-off' : 'eye'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>

            {config[item.key] && (
              <View style={styles.savedIndicator}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.savedText}>Saved</Text>
              </View>
            )}
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClear}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.buttonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.warningText}>
            Never share your API keys. The app will need to be restarted after saving changes.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    lineHeight: 20,
  },
  configItem: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: Spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  secureInput: {
    letterSpacing: 2,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  savedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
  actions: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
});
