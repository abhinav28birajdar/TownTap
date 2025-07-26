import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { COLORS } from '../../config/constants';
import { useAuthStore } from '../../stores/authStore';

const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuthStore();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await register(email, password, { full_name: fullName });
    setLoading(false);

    if (result.success) {
      Alert.alert('Success', 'Account created successfully! Please check your email to verify your account.');
    } else {
      Alert.alert('Sign Up Failed', result.error || 'An error occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join TownTap today</Text>

        <View style={styles.form}>
          <Input
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
          />

          <Input
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <Button
            title={loading ? "Creating Account..." : "Sign Up"}
            onPress={handleSignUp}
            disabled={loading}
            variant="primary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
});

export default SignUpScreen;
