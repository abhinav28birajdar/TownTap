import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SupabaseDebugScreen } from '../components/debug/SupabaseDebugScreen';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuthStore } from '../stores/authStore';

export const TestAuthScreen: React.FC = () => {
  const { login, register, logout, user, loading, error } = useAuthStore();
  const [email, setEmail] = useState('test@towntap.com');
  const [password, setPassword] = useState('password123');
  const [showDebug, setShowDebug] = useState(false);

  const handleLogin = async () => {
    const result = await login(email, password);
    if (result.success) {
      Alert.alert('Success', 'Logged in successfully!');
    } else {
      Alert.alert('Error', result.error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    const result = await register(email, password, {
      full_name: 'Test User',
      user_type: 'customer'
    });
    if (result.success) {
      Alert.alert('Success', 'Account created! Please check your email to verify.');
    } else {
      Alert.alert('Error', result.error || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    Alert.alert('Success', 'Logged out successfully!');
  };

  if (showDebug) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back to Auth"
            onPress={() => setShowDebug(false)}
            variant="secondary"
            size="sm"
          />
        </View>
        <SupabaseDebugScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>TownTap Auth Test</Text>
        
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userProfile}>
              Profile: {user.profile?.full_name || 'No name'} ({user.profile?.user_type})
            </Text>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="secondary"
              loading={loading}
            />
          </View>
        ) : (
          <View style={styles.authForm}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            
            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <View style={styles.buttonContainer}>
              <Button
                title="Login"
                onPress={handleLogin}
                variant="primary"
                loading={loading}
              />
              
              <Button
                title="Register"
                onPress={handleRegister}
                variant="secondary"
                loading={loading}
              />
            </View>
          </View>
        )}
        
        <View style={styles.debugSection}>
          <Button
            title="🔧 Debug Panel"
            onPress={() => setShowDebug(true)}
            variant="outline"
            size="sm"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    padding: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  authForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  userInfo: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userProfile: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  debugSection: {
    marginTop: 20,
    alignItems: 'center',
  },
});
