import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fixProfileIssues, initializeUserProfile, runSupabaseTests } from '../../../scripts/test-supabase';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface ConnectionStatus {
  database: 'loading' | 'connected' | 'error';
  auth: 'loading' | 'authenticated' | 'unauthenticated' | 'error';
  profile: 'loading' | 'exists' | 'missing' | 'error';
  realtime: 'loading' | 'connected' | 'error';
}

export const SupabaseDebugScreen: React.FC = () => {
  const { user, checkAuth } = useAuthStore();
  const [status, setStatus] = useState<ConnectionStatus>({
    database: 'loading',
    auth: 'loading',
    profile: 'loading',
    realtime: 'loading'
  });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const checkAllConnections = async () => {
    addLog('Starting connection checks...');
    
    // Reset status
    setStatus({
      database: 'loading',
      auth: 'loading',
      profile: 'loading',
      realtime: 'loading'
    });

    // Check database connection
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) {
        setStatus(prev => ({ ...prev, database: 'error' }));
        addLog(`Database error: ${error.message}`);
      } else {
        setStatus(prev => ({ ...prev, database: 'connected' }));
        addLog('Database connected successfully');
      }
    } catch (error: any) {
      setStatus(prev => ({ ...prev, database: 'error' }));
      addLog(`Database connection failed: ${error.message}`);
    }

    // Check auth status
    try {
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (error) {
        setStatus(prev => ({ ...prev, auth: 'error' }));
        addLog(`Auth error: ${error.message}`);
      } else if (authUser) {
        setStatus(prev => ({ ...prev, auth: 'authenticated' }));
        addLog(`User authenticated: ${authUser.email}`);

        // Check profile
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (profileError) {
            setStatus(prev => ({ ...prev, profile: 'missing' }));
            addLog(`Profile missing: ${profileError.message}`);
          } else if (profile) {
            setStatus(prev => ({ ...prev, profile: 'exists' }));
            addLog(`Profile found: ${profile.full_name || 'No name'}`);
          }
        } catch (error: any) {
          setStatus(prev => ({ ...prev, profile: 'error' }));
          addLog(`Profile check error: ${error.message}`);
        }
      } else {
        setStatus(prev => ({ ...prev, auth: 'unauthenticated' }));
        addLog('No authenticated user');
        setStatus(prev => ({ ...prev, profile: 'missing' }));
      }
    } catch (error: any) {
      setStatus(prev => ({ ...prev, auth: 'error' }));
      addLog(`Auth check failed: ${error.message}`);
    }

    // Check realtime
    try {
      const channel = supabase
        .channel('debug-test')
        .on('presence', { event: 'sync' }, () => {
          setStatus(prev => ({ ...prev, realtime: 'connected' }));
          addLog('Realtime connected');
        })
        .subscribe();

      // Timeout check
      setTimeout(() => {
        if (status.realtime === 'loading') {
          setStatus(prev => ({ ...prev, realtime: 'error' }));
          addLog('Realtime connection timeout');
        }
        supabase.removeChannel(channel);
      }, 5000);
    } catch (error: any) {
      setStatus(prev => ({ ...prev, realtime: 'error' }));
      addLog(`Realtime error: ${error.message}`);
    }
  };

  const handleRunTests = async () => {
    addLog('Running comprehensive tests...');
    try {
      await runSupabaseTests();
      addLog('Tests completed - check console for details');
    } catch (error: any) {
      addLog(`Test error: ${error.message}`);
    }
  };

  const handleFixProfile = async () => {
    addLog('Attempting to fix profile issues...');
    try {
      const result = await fixProfileIssues();
      if (result) {
        addLog('Profile issues fixed successfully');
        await checkAuth(); // Refresh auth state
        await checkAllConnections(); // Refresh status
      } else {
        addLog('Failed to fix profile issues');
      }
    } catch (error: any) {
      addLog(`Fix profile error: ${error.message}`);
    }
  };

  const handleInitProfile = async () => {
    addLog('Initializing user profile...');
    try {
      const result = await initializeUserProfile();
      if (result.success) {
        addLog('Profile initialized successfully');
        await checkAuth(); // Refresh auth state
        await checkAllConnections(); // Refresh status
      } else {
        addLog(`Profile initialization failed: ${result.error}`);
      }
    } catch (error: any) {
      addLog(`Profile init error: ${error.message}`);
    }
  };

  useEffect(() => {
    checkAllConnections();
  }, []);

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'connected':
      case 'authenticated':
      case 'exists':
        return '#4CAF50';
      case 'error':
      case 'missing':
        return '#F44336';
      case 'unauthenticated':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (state: string) => {
    switch (state) {
      case 'loading':
        return 'Checking...';
      case 'connected':
        return 'Connected';
      case 'authenticated':
        return 'Authenticated';
      case 'unauthenticated':
        return 'Not signed in';
      case 'exists':
        return 'Profile found';
      case 'missing':
        return 'Profile missing';
      case 'error':
        return 'Error';
      default:
        return state;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Supabase Debug Panel</Text>
      
      {/* Status Grid */}
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Database</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status.database) }]} />
          <Text style={styles.statusText}>{getStatusText(status.database)}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Authentication</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status.auth) }]} />
          <Text style={styles.statusText}>{getStatusText(status.auth)}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Profile</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status.profile) }]} />
          <Text style={styles.statusText}>{getStatusText(status.profile)}</Text>
        </View>
        
        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Realtime</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(status.realtime) }]} />
          <Text style={styles.statusText}>{getStatusText(status.realtime)}</Text>
        </View>
      </View>

      {/* User Info */}
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <Text>Email: {user.email}</Text>
          <Text>ID: {user.id}</Text>
          <Text>Name: {user.profile?.full_name || 'Not set'}</Text>
          <Text>Type: {user.profile?.user_type || 'Not set'}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={checkAllConnections}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={handleRunTests}>
          <Text style={styles.buttonText}>Run Tests</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.fixButton]} 
          onPress={handleFixProfile}
        >
          <Text style={styles.buttonText}>Fix Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.initButton]} 
          onPress={handleInitProfile}
        >
          <Text style={styles.buttonText}>Init Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Logs */}
      <View style={styles.logsContainer}>
        <Text style={styles.sectionTitle}>Logs</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    width: '48%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 6,
    width: '48%',
    marginBottom: 10,
  },
  fixButton: {
    backgroundColor: '#FF9800',
  },
  initButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
  logsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
    color: '#333',
  },
});
