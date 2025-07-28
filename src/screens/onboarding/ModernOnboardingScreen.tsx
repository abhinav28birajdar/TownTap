import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernButton } from '../../components/modern/ModernButton';
import { ModernCard } from '../../components/modern/ModernCard';
import { useTheme } from '../../context/ModernThemeContext';
import AuthScreen from '../auth/AuthScreen';

const { width } = Dimensions.get('window');

interface ModernOnboardingScreenProps {
  onComplete?: (userType: 'customer' | 'business_owner') => void;
}

const ModernOnboardingScreen: React.FC<ModernOnboardingScreenProps> = ({ onComplete }) => {
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
  };

  const userTypes = [
    {
      type: 'customer' as const,
      title: 'I\'m a Customer',
      subtitle: 'Discover & Order from Local Businesses',
      description: 'Find nearby businesses, order products, book services, and connect with your local community.',
      icon: 'person' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.primary,
      gradient: [theme.colors.primary, theme.colors.primaryLight],
      features: [
        'Browse local businesses',
        'Order products & services',
        'Real-time order tracking',
        'Community reviews',
        'Direct messaging with businesses',
      ],
    },
    {
      type: 'business_owner' as const,
      title: 'I\'m a Business Owner',
      subtitle: 'Grow Your Local Business',
      description: 'Manage your business, connect with customers, and boost your local presence.',
      icon: 'storefront' as keyof typeof Ionicons.glyphMap,
      iconColor: theme.colors.secondary,
      gradient: [theme.colors.secondary, theme.colors.accent],
      features: [
        'Manage products & services',
        'Customer order management',
        'Business analytics dashboard',
        'Customer communication',
        'Marketing tools',
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 20,
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      fontSize: 32,
      color: theme.colors.buttonText,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: theme.spacing.md,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
    },
    userTypeCard: {
      marginBottom: theme.spacing.lg,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    cardTitleContainer: {
      flex: 1,
    },
    cardTitle: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    cardSubtitle: {
      ...theme.typography.body2,
      color: theme.colors.textSecondary,
    },
    cardDescription: {
      ...theme.typography.body1,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
      lineHeight: 22,
    },
    featuresContainer: {
      marginBottom: theme.spacing.lg,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    featureIcon: {
      marginRight: theme.spacing.sm,
    },
    featureText: {
      ...theme.typography.body2,
      color: theme.colors.text,
      flex: 1,
    },
    selectButton: {
      marginTop: theme.spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>🏪</Text>
          </View>
          <Text style={styles.title}>Welcome to TownTap</Text>
          <Text style={styles.subtitle}>
            Your local business community platform.{'\n'}
            Choose how you want to get started:
          </Text>
        </View>

        {/* User Type Selection */}
        <View style={styles.content}>
          {userTypes.map((userType) => (
            <ModernCard
              key={userType.type}
              style={styles.userTypeCard}
              variant="elevated"
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: userType.iconColor + '20' }]}>
                  <Ionicons
                    name={userType.icon}
                    size={28}
                    color={userType.iconColor}
                  />
                </View>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{userType.title}</Text>
                  <Text style={styles.cardSubtitle}>{userType.subtitle}</Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                {userType.description}
              </Text>

              <View style={styles.featuresContainer}>
                {userType.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={userType.iconColor}
                      style={styles.featureIcon}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <ModernButton
                title={`Continue as ${userType.type === 'customer' ? 'Customer' : 'Business Owner'}`}
                onPress={() => handleUserTypeSelect(userType.type)}
                variant="primary"
                fullWidth
                icon="arrow-forward"
                iconPosition="right"
              />
            </ModernCard>
          ))}
        </View>
      </ScrollView>

      {/* Auth Modal */}
      <Modal
        visible={showAuth}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedUserType && (
          <AuthScreen
            onClose={() => setShowAuth(false)}
            userType={selectedUserType}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
};

export default ModernOnboardingScreen;
