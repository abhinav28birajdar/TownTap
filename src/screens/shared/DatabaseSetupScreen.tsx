import React, { useEffect, useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { testSupabaseConnection } from '../../lib/supabase';

interface ConnectionStatus {
  isConnected: boolean;
  error?: string;
  databaseReady?: boolean;
}

const DatabaseSetupScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<ConnectionStatus>({ isConnected: false });
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setTesting(true);
    try {
      const result = await testSupabaseConnection();
      setStatus({
        isConnected: result.success,
        error: result.error ? String(result.error) : undefined,
        databaseReady: result.success,
      });
    } catch (error: any) {
      setStatus({
        isConnected: false,
        error: error.message || 'Connection failed',
        databaseReady: false,
      });
    }
    setTesting(false);
  };

  const handleContinueAnyway = () => {
    Alert.alert(
      'Continue without Database?',
      'The app will have limited functionality without a proper database connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: onComplete },
      ]
    );
  };

  const handleSetupInstructions = () => {
    Alert.alert(
      'Database Setup Required',
      'Please follow these steps:\n\n1. Go to Supabase Dashboard\n2. Open SQL Editor\n3. Run the script from supabase/database_setup.sql\n4. Enable real-time for all tables\n\nThen retry the connection.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Database Connection
        </Text>
        
        <View style={[styles.statusCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
            Connection Status
          </Text>
          
          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
              Supabase:
            </Text>
            <Text style={[
              styles.statusValue,
              { color: status.isConnected ? '#10B981' : '#EF4444' }
            ]}>
              {testing ? 'Testing...' : status.isConnected ? 'Connected' : 'Failed'}
            </Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
              Database:
            </Text>
            <Text style={[
              styles.statusValue,
              { color: status.databaseReady ? '#10B981' : '#EF4444' }
            ]}>
              {testing ? 'Checking...' : status.databaseReady ? 'Ready' : 'Not Set Up'}
            </Text>
          </View>

          {status.error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: '#EF4444' }]}>
                {status.error}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={checkConnection}
            disabled={testing}
          >
            <Text style={styles.buttonText}>
              {testing ? 'Testing...' : 'Retry Connection'}
            </Text>
          </TouchableOpacity>

          {!status.databaseReady && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleSetupInstructions}
            >
              <Text style={[styles.buttonSecondaryText, { color: theme.colors.primary }]}>
                Setup Instructions
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={status.isConnected ? onComplete : handleContinueAnyway}
          >
            <Text style={[styles.buttonSecondaryText, { color: theme.colors.textSecondary }]}>
              {status.isConnected ? 'Continue' : 'Skip for Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
  },
  statusCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DatabaseSetupScreen;
