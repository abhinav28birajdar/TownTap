import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import AuthScreen from '../auth/AuthScreen';

interface CategorySelectionScreenProps {
  onComplete?: (userType: 'customer' | 'business_owner') => void;
}

const CategorySelectionScreen: React.FC<CategorySelectionScreenProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const [selectedUserType, setSelectedUserType] = useState<'customer' | 'business_owner' | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const handleUserTypeSelect = (userType: 'customer' | 'business_owner') => {
    setSelectedUserType(userType);
    setShowAuth(true);
  };

  const handleAuthComplete = () => {
    setShowAuth(false);
    if (selectedUserType && onComplete) {
      onComplete(selectedUserType);
    }
    // If no onComplete callback, the auth store should handle navigation automatically
  };

  const userTypes = [
    {
      type: 'customer' as const,
      title: 'I am a Customer',
      subtitle: 'Browse and order from local businesses',
      description: 'Find nearby businesses, order products, book services, and get consultations',
      icon: '👤',
      features: [
        'Order products from local stores',
        'Book services like salon, repairs',
        'Get professional consultations',
        'Real-time order tracking',
        'Chat with business owners',
      ],
      color: '#3B82F6',
    },
    {
      type: 'business_owner' as const,
      title: 'I am a Business Owner',
      subtitle: 'Manage your business and connect with customers',
      description: 'List your products/services, handle orders, and grow your business',
      icon: '🏢',
      features: [
        'Manage products and services',
        'Handle customer orders',
        'Real-time business analytics',
        'Customer communication tools',
        'Business profile management',
      ],
      color: '#10B981',
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      padding: 20,
      paddingBottom: 40,
    },
    logo: {
      fontSize: 48,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    userTypeCard: {
      backgroundColor: theme.colors.card,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
    },
    userTypeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    userTypeIcon: {
      fontSize: 40,
      marginRight: 16,
    },
    userTypeInfo: {
      flex: 1,
    },
    userTypeTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userTypeSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    userTypeDescription: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: 16,
    },
    featuresList: {
      marginBottom: 20,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    selectButton: {
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    selectButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      marginRight: 8,
    },
    footer: {
      padding: 20,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.logo}>🏪</Text>
          <Text style={styles.title}>Welcome to TownTap</Text>
          <Text style={styles.subtitle}>
            Connect with your local community.{'\n'}
            Choose how you want to get started:
          </Text>
        </View>

        <View style={styles.content}>
          {userTypes.map((userType) => (
            <View key={userType.type} style={styles.userTypeCard}>
              <View style={styles.userTypeHeader}>
                <Text style={styles.userTypeIcon}>{userType.icon}</Text>
                <View style={styles.userTypeInfo}>
                  <Text style={styles.userTypeTitle}>{userType.title}</Text>
                  <Text style={styles.userTypeSubtitle}>{userType.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.userTypeDescription}>
                {userType.description}
              </Text>

              <View style={styles.featuresList}>
                {userType.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={userType.color}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.selectButton, { backgroundColor: userType.color }]}
                onPress={() => handleUserTypeSelect(userType.type)}
              >
                <Text style={styles.selectButtonText}>
                  Get Started as {userType.type === 'customer' ? 'Customer' : 'Business'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            TownTap connects customers with local businesses for{'\n'}
            seamless ordering, booking, and consulting experiences.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showAuth}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedUserType && (
          <AuthScreen
            userType={selectedUserType}
            onClose={handleAuthComplete}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default CategorySelectionScreen;
