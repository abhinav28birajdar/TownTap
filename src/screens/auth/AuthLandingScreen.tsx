import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions,
  Image
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../context/ModernThemeContext';
import Button from '../../../components/ui/Button';

const { width, height } = Dimensions.get('window');

type AuthLandingScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'AuthLanding'>;

interface Props {
  navigation: AuthLandingScreenNavigationProp;
}

const AuthLandingScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Image 
          source={require('../../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to TownTap
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Connect with local businesses and discover amazing services in your area
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <View style={styles.feature}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            🏪 Discover Local Businesses
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
            Find restaurants, services, and shops near you
          </Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            📱 Easy Ordering
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
            Order food, book services, and schedule appointments
          </Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
            💼 For Business Owners
          </Text>
          <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
            Manage your business and connect with customers
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          title="Sign In"
          onPress={() => navigation.navigate('Login')}
          variant="primary"
          size="large"
          style={styles.button}
        />
        
        <Button
          title="Create Account"
          onPress={() => navigation.navigate('SignUp')}
          variant="outline"
          size="large"
          style={styles.button}
        />
        
        <Button
          title="Demo Login"
          onPress={() => navigation.navigate('DemoLogin')}
          variant="ghost"
          size="medium"
          style={styles.demoButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    flex: 2,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  feature: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  button: {
    marginBottom: 12,
  },
  demoButton: {
    marginTop: 8,
  },
});

export default AuthLandingScreen;