import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import { COLORS } from '../config/constants';
import { useAuthStore } from '../stores/authStore';

const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useAuthStore();
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'business_owner' | null>(null);

  const handleUserTypeSelect = (userType: 'customer' | 'business_owner') => {
    setSelectedUserType(userType);
  };

  const handleGetStarted = () => {
    if (!selectedUserType) {
      Alert.alert('Please select', 'Please choose if you are a customer or business owner');
      return;
    }
    // Store user type and complete onboarding
    completeOnboarding();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={require('../../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Welcome to TownTap</Text>
          <Text style={styles.subtitle}>
            Your smart business companion for local commerce
          </Text>
        </View>
        
        <View style={styles.userTypeContainer}>
          <Text style={styles.chooseText}>Choose your role:</Text>
          
          <TouchableOpacity
            style={[
              styles.userTypeCard,
              selectedUserType === 'customer' && styles.selectedCard
            ]}
            onPress={() => handleUserTypeSelect('customer')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>🛒</Text>
              <Text style={styles.cardTitle}>I'm a Customer</Text>
              <Text style={styles.cardDescription}>
                Discover local businesses, place orders, and enjoy convenient shopping
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeCard,
              selectedUserType === 'business_owner' && styles.selectedCard
            ]}
            onPress={() => handleUserTypeSelect('business_owner')}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardIcon}>🏪</Text>
              <Text style={styles.cardTitle}>I'm a Business Owner</Text>
              <Text style={styles.cardDescription}>
                Manage your business, reach customers, and grow your sales
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="primary"
        />
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray[600],
    textAlign: 'center',
    marginBottom: 20,
  },
  userTypeContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  chooseText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.gray[800],
    textAlign: 'center',
    marginBottom: 30,
  },
  userTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.blue[50],
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OnboardingScreen;
