import { Colors, Typography } from '@/constants/theme';
import { secureConfigManager } from '@/lib/secure-config-manager';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';

export default function ConfigSetupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const [config, setConfig] = useState({
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  });

  const [errors, setErrors] = useState({
    supabaseUrl: '',
    supabaseAnonKey: '',
  });

  // Auto-save if .env has valid credentials
  useEffect(() => {
    const autoSaveFromEnv = async () => {
      const envUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const envKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (envUrl && envKey && 
          envUrl.startsWith('https://') && 
          envUrl.includes('.supabase.co') &&
          envKey.length > 100) {
        
        console.log('✅ Valid credentials found in .env file - auto-configuring...');
        
        try {
          await secureConfigManager.saveConfig({
            supabaseUrl: envUrl,
            supabaseAnonKey: envKey,
            googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
            stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          });
          
          Toast.show({
            type: 'success',
            text1: 'Auto-configured from .env',
            text2: 'Redirecting to welcome screen...',
          });
          
          setTimeout(() => {
            router.replace('/welcome');
          }, 1500);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    };
    
    autoSaveFromEnv();
  }, []);

  const validateForm = (): boolean => {
    const newErrors = {
      supabaseUrl: '',
      supabaseAnonKey: '',
    };

    let isValid = true;

    // Validate Supabase URL
    if (!config.supabaseUrl) {
      newErrors.supabaseUrl = 'Supabase URL is required';
      isValid = false;
    } else if (!/^https:\/\/.+\.supabase\.co$/.test(config.supabaseUrl)) {
      newErrors.supabaseUrl = 'Invalid Supabase URL format';
      isValid = false;
    }

    // Validate Supabase Anon Key
    if (!config.supabaseAnonKey) {
      newErrors.supabaseAnonKey = 'Supabase Anon Key is required';
      isValid = false;
    } else if (config.supabaseAnonKey.length < 20) {
      newErrors.supabaseAnonKey = 'Invalid Supabase Anon Key';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleValidateConnection = async () => {
    if (!validateForm()) {
      return;
    }

    setValidating(true);

    try {
      const isValid = await secureConfigManager.validateSupabaseConfig(
        config.supabaseUrl,
        config.supabaseAnonKey
      );

      if (isValid) {
        Toast.show({
          type: 'success',
          text1: 'Connection Successful',
          text2: 'Supabase configuration is valid',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Failed',
          text2: 'Unable to connect with provided credentials',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Failed to validate connection',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Validate connection first
      const isValid = await secureConfigManager.validateSupabaseConfig(
        config.supabaseUrl,
        config.supabaseAnonKey
      );

      if (!isValid) {
        Alert.alert(
          'Invalid Configuration',
          'Unable to connect with provided Supabase credentials. Do you want to save anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save Anyway',
              style: 'destructive',
              onPress: async () => {
                await saveConfigToStorage();
              },
            },
          ]
        );
        return;
      }

      await saveConfigToStorage();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Save Failed',
        text2: 'Unable to save configuration',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfigToStorage = async () => {
    try {
      await secureConfigManager.saveConfig({
        supabaseUrl: config.supabaseUrl.trim(),
        supabaseAnonKey: config.supabaseAnonKey.trim(),
        googleMapsApiKey: config.googleMapsApiKey.trim() || undefined,
        stripePublishableKey: config.stripePublishableKey.trim() || undefined,
      });

      Toast.show({
        type: 'success',
        text1: 'Configuration Saved',
        text2: 'Your settings have been saved securely',
      });

      // Navigate to welcome screen for authentication
      setTimeout(() => {
        router.replace('/welcome');
      }, 1000);
    } catch (error) {
      throw error;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>App Configuration</Text>
        <Text style={styles.subtitle}>
          Enter your API keys and configuration. These will be stored securely on your device.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Supabase Configuration *</Text>
        <Text style={styles.sectionDescription}>
          Required for database, authentication, and storage
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Supabase URL *</Text>
          <TextInput
            style={[styles.input, errors.supabaseUrl && styles.inputError]}
            placeholder="https://xxxxx.supabase.co"
            value={config.supabaseUrl}
            onChangeText={(text) => {
              setConfig({ ...config, supabaseUrl: text });
              setErrors({ ...errors, supabaseUrl: '' });
            }}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {errors.supabaseUrl && <Text style={styles.errorText}>{errors.supabaseUrl}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Supabase Anon Key *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, errors.supabaseAnonKey && styles.inputError]}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={config.supabaseAnonKey}
            onChangeText={(text) => {
              setConfig({ ...config, supabaseAnonKey: text });
              setErrors({ ...errors, supabaseAnonKey: '' });
            }}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            numberOfLines={3}
          />
          {errors.supabaseAnonKey && <Text style={styles.errorText}>{errors.supabaseAnonKey}</Text>}
        </View>

        <TouchableOpacity
          style={styles.validateButton}
          onPress={handleValidateConnection}
          disabled={validating}
        >
          {validating ? (
            <ActivityIndicator color={Colors.light.primary} />
          ) : (
            <Text style={styles.validateButtonText}>Validate Connection</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Optional Services</Text>
        <Text style={styles.sectionDescription}>
          Add these keys to enable additional features
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Google Maps API Key (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={config.googleMapsApiKey}
            onChangeText={(text) => setConfig({ ...config, googleMapsApiKey: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stripe Publishable Key (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="pk_test_XXXXXXXXXXXXXXXXXXXXXXXX"
            value={config.stripePublishableKey}
            onChangeText={(text) => setConfig({ ...config, stripePublishableKey: text })}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={handleSaveConfig}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.saveButtonText}>Save Configuration</Text>
        )}
      </TouchableOpacity>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          • Supabase credentials can be found in your Supabase project settings
        </Text>
        <Text style={styles.helpText}>
          • Your configuration is stored securely on your device
        </Text>
        <Text style={styles.helpText}>
          • You can update these settings later in the app settings
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    ...Typography.styles.headline.large,
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.styles.body.large,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    ...Typography.styles.headline.small,
    color: Colors.light.text,
    marginBottom: 4,
  },
  sectionDescription: {
    ...Typography.styles.body.small,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...Typography.styles.label.large,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    ...Typography.styles.body.large,
    color: Colors.light.text,
    backgroundColor: '#FFFFFF',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  errorText: {
    ...Typography.styles.body.small,
    color: Colors.light.error,
    marginTop: 4,
  },
  validateButton: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  validateButtonText: {
    ...Typography.styles.label.large,
    color: Colors.light.primary,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...Typography.styles.label.large,
    color: '#FFFFFF',
    fontSize: 16,
  },
  helpSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: Colors.blue[50],
    borderRadius: 8,
  },
  helpTitle: {
    ...Typography.styles.headline.small,
    color: Colors.light.text,
    marginBottom: 12,
  },
  helpText: {
    ...Typography.styles.body.large,
    color: Colors.light.textSecondary,
    marginBottom: 6,
  },
});
