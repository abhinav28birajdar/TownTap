import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../context/ModernThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../../components/ui/Button';

type DemoLoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'DemoLogin'>;

interface Props {
  navigation: DemoLoginScreenNavigationProp;
}

interface DemoAccount {
  type: 'customer' | 'business_owner';
  title: string;
  description: string;
  email: string;
  password: string;
  features: string[];
}

const demoAccounts: DemoAccount[] = [
  {
    type: 'customer',
    title: 'Customer Demo',
    description: 'Experience the app as a customer',
    email: 'demo.customer@towntap.com',
    password: 'demo123',
    features: [
      'Browse local businesses',
      'Place orders and book services',
      'Track order status',
      'AI assistant for recommendations',
    ],
  },
  {
    type: 'business_owner',
    title: 'Business Owner Demo',
    description: 'See how businesses manage their operations',
    email: 'demo.business@towntap.com',
    password: 'demo123',
    features: [
      'Business dashboard and analytics',
      'Manage products and services',
      'Process orders and requests',
      'AI content generation tools',
    ],
  },
];

const DemoLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { signIn, loading } = useAuth();
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  const handleDemoLogin = async (account: DemoAccount) => {
    setSelectedDemo(account.type);
    
    try {
      const result = await signIn(account.email, account.password);
      
      if (result.error) {
        Alert.alert('Demo Login Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Demo login failed. Please try again.');
    } finally {
      setSelectedDemo(null);
    }
  };

  const renderDemoCard = (account: DemoAccount) => (
    <View 
      key={account.type}
      style={[styles.demoCard, { 
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }]}
    >
      <View style={styles.demoHeader}>
        <Text style={[styles.demoTitle, { color: theme.colors.text }]}>
          {account.title}
        </Text>
        <Text style={[styles.demoDescription, { color: theme.colors.textSecondary }]}>
          {account.description}
        </Text>
      </View>

      <View style={styles.featuresList}>
        <Text style={[styles.featuresTitle, { color: theme.colors.text }]}>
          Features you can explore:
        </Text>
        {account.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={[styles.featureBullet, { color: theme.colors.primary }]}>
              •
            </Text>
            <Text style={[styles.featureText, { color: theme.colors.textSecondary }]}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <Button
        title={`Try ${account.title}`}
        onPress={() => handleDemoLogin(account)}
        variant="primary"
        size="large"
        loading={loading && selectedDemo === account.type}
        disabled={loading}
        style={styles.demoButton}
      />

      <View style={styles.credentialsContainer}>
        <Text style={[styles.credentialsTitle, { color: theme.colors.textSecondary }]}>
          Demo Credentials:
        </Text>
        <Text style={[styles.credentialsText, { color: theme.colors.textSecondary }]}>
          Email: {account.email}
        </Text>
        <Text style={[styles.credentialsText, { color: theme.colors.textSecondary }]}>
          Password: {account.password}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Try Demo Accounts
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Explore TownTap with pre-configured demo accounts
          </Text>
        </View>

        {/* Demo Cards */}
        <View style={styles.demoCards}>
          {demoAccounts.map(renderDemoCard)}
        </View>

        {/* Note */}
        <View style={[styles.noteContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.noteTitle, { color: theme.colors.text }]}>
            📝 Note
          </Text>
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
            Demo accounts are pre-populated with sample data to showcase the app's features. 
            Any changes you make will be reset periodically.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Want to create your own account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={[styles.signUpLink, { color: theme.colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('Login')}
          style={styles.backContainer}
        >
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            ← Back to Sign In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  demoCards: {
    marginBottom: 30,
  },
  demoCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  demoHeader: {
    marginBottom: 16,
  },
  demoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  demoDescription: {
    fontSize: 14,
  },
  featuresList: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  featureBullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 1,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  demoButton: {
    marginBottom: 16,
  },
  credentialsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  credentialsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  credentialsText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  noteContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  backContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DemoLoginScreen;