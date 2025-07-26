import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { getSupabaseConfig, supabase, testSupabaseConnection } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const DebugScreen: React.FC = () => {
  const { theme } = useTheme();
  const { user, loading, error } = useAuthStore();
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    checkAll();
  }, []);

  const checkAll = async () => {
    try {
      // Test connection
      const connectionResult = await testSupabaseConnection();
      setConnectionStatus(connectionResult);
      
      // Get config
      const configResult = getSupabaseConfig();
      setConfig(configResult);
    } catch (error) {
      console.error('Debug check failed:', error);
    }
  };

  const testAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('Auth test:', { data, error });
    } catch (error) {
      console.error('Auth test failed:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>
          TownTap Debug Screen
        </Text>

        {/* Connection Status */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Connection Status
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Status: {connectionStatus?.success ? '✅ Connected' : '❌ Failed'}
          </Text>
          {connectionStatus?.error && (
            <Text style={[styles.error, { color: theme.danger }]}>
              Error: {String(connectionStatus.error)}
            </Text>
          )}
        </View>

        {/* Configuration */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Configuration
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            URL: {config?.url || 'Not set'}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Has Anon Key: {config?.hasAnonKey ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Environment: {config?.environment}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Realtime: {config?.realtimeEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        {/* Auth State */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Auth State
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            Loading: {loading ? 'Yes' : 'No'}
          </Text>
          <Text style={[styles.text, { color: theme.textSecondary }]}>
            User: {user ? `${user.email} (${user.profile?.user_type})` : 'None'}
          </Text>
          {error && (
            <Text style={[styles.error, { color: theme.danger }]}>
              Error: {error}
            </Text>
          )}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={checkAll}
        >
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.secondary }]}
          onPress={testAuth}
        >
          <Text style={styles.buttonText}>Test Auth</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
  },
  error: {
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DebugScreen;
