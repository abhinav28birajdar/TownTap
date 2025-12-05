import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Spacing } from '@/constants/spacing';
import { BorderRadius, Shadows } from '@/constants/theme';
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { performanceMonitor } from '@/lib/performance-monitor';
import { useBiometricAuth } from '@/lib/security-service';

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'available' | 'configured' | 'needs_setup';
  route?: string;
  action?: () => void;
}

export default function FeaturesOverviewScreen() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const { isAvailable: biometricAvailable } = useBiometricAuth();
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    performanceMonitor.trackNavigation('features/overview');
    loadFeatureStatus();
  }, []);

  const loadFeatureStatus = async () => {
    try {
      // Load current performance data
      const data = await performanceMonitor.getMetrics();
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to load feature status:', error);
    }
  };

  const features: FeatureCard[] = [
    {
      id: 'biometric-auth',
      title: 'Biometric Authentication',
      description: 'Secure login with Face ID, Touch ID, or fingerprint',
      icon: 'finger-print',
      status: biometricAvailable ? 'configured' : 'needs_setup',
      route: '/settings/advanced',
    },
    {
      id: 'performance-monitor',
      title: 'Performance Monitoring',
      description: 'Real-time app performance tracking and analytics',
      icon: 'analytics',
      status: 'available',
      route: '/dev/performance-monitor',
    },
    {
      id: 'security-audit',
      title: 'Security Audit',
      description: 'Comprehensive security issue tracking and recommendations',
      icon: 'shield-checkmark',
      status: 'available',
      route: '/dev/security-audit',
    },
    {
      id: 'image-caching',
      title: 'Smart Image Caching',
      description: 'Intelligent image caching with LRU algorithm for optimal performance',
      icon: 'image',
      status: 'configured',
    },
    {
      id: 'secure-storage',
      title: 'Encrypted Storage',
      description: 'Secure storage for sensitive data with encryption',
      icon: 'lock-closed',
      status: 'configured',
    },
    {
      id: 'advanced-settings',
      title: 'Advanced Settings',
      description: 'Comprehensive app configuration and preferences',
      icon: 'settings',
      status: 'available',
      route: '/settings/advanced',
    },
    {
      id: 'onboarding',
      title: 'Enhanced Onboarding',
      description: 'Smart onboarding with permission setup and security configuration',
      icon: 'walk',
      status: 'available',
      route: '/onboarding-enhanced',
    },
    {
      id: 'profile-management',
      title: 'Profile Management',
      description: 'Complete profile editing with security and notification settings',
      icon: 'person',
      status: 'available',
      route: '/profile/edit',
    },
  ];

  const getStatusColor = (status: FeatureCard['status']) => {
    switch (status) {
      case 'available':
        return colors.info;
      case 'configured':
        return colors.success;
      case 'needs_setup':
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: FeatureCard['status']) => {
    switch (status) {
      case 'available':
        return 'Ready to use';
      case 'configured':
        return 'Active';
      case 'needs_setup':
        return 'Needs setup';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: FeatureCard['status']) => {
    switch (status) {
      case 'available':
        return 'checkmark-circle';
      case 'configured':
        return 'checkmark-circle';
      case 'needs_setup':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  const handleFeaturePress = (feature: FeatureCard) => {
    if (feature.route) {
      router.push(feature.route as any);
    } else if (feature.action) {
      feature.action();
    } else {
      Alert.alert(
        feature.title,
        `${feature.description}\n\nStatus: ${getStatusText(feature.status)}`
      );
    }
  };

  const renderFeatureCard = (feature: FeatureCard, index: number) => (
    <MotiView
      key={feature.id}
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 600,
        delay: index * 100,
      }}
    >
      <TouchableOpacity
        onPress={() => handleFeaturePress(feature)}
        style={[styles.featureCard, { backgroundColor: colors.card }]}
      >
        <View style={styles.featureHeader}>
          <View style={[
            styles.featureIcon,
            { backgroundColor: getStatusColor(feature.status) + '20' }
          ]}>
            <Ionicons
              name={feature.icon}
              size={24}
              color={getStatusColor(feature.status)}
            />
          </View>
          
          <View style={styles.featureInfo}>
            <Text 
              style={{
                ...styles.featureTitle,
                color: colors.text,
              }}
            >
              {feature.title}
            </Text>
            <Text 
              style={{
                ...styles.featureDescription,
                color: colors.textSecondary,
              }}
            >
              {feature.description}
            </Text>
          </View>
          
          {feature.route && (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          )}
        </View>
        
        <View style={styles.featureFooter}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(feature.status) + '20' }
          ]}>
            <Ionicons
              name={getStatusIcon(feature.status)}
              size={14}
              color={getStatusColor(feature.status)}
            />
            <Text 
              style={{
                ...styles.statusText,
                color: getStatusColor(feature.status),
              }}
            >
              {getStatusText(feature.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );

  const renderStatsHeader = () => (
    <Card style={styles.statsCard}>
      <Text 
        style={{
          ...styles.statsTitle,
          color: colors.text,
        }}
      >
        App Enhancement Summary
      </Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text 
            style={{
              ...styles.statNumber,
              color: colors.success,
            }}
          >
            {features.filter(f => f.status === 'configured').length}
          </Text>
          <Text style={{
            ...styles.statLabel,
            color: colors.textSecondary
          }}>
            Active Features
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text 
            style={{
              ...styles.statNumber,
              color: colors.info,
            }}
          >
            {features.filter(f => f.status === 'available').length}
          </Text>
          <Text style={{
            ...styles.statLabel,
            color: colors.textSecondary
          }}>
            Ready to Use
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text 
            style={{
              ...styles.statNumber,
              color: colors.warning,
            }}
          >
            {features.filter(f => f.status === 'needs_setup').length}
          </Text>
          <Text style={{
            ...styles.statLabel,
            color: colors.textSecondary
          }}>
            Need Setup
          </Text>
        </View>
      </View>
      
      <Text style={{
        ...styles.statsSubtitle,
        color: colors.textSecondary
      }}>
        Your TownTap app has been enhanced with enterprise-level features for security,
        performance, and user experience.
      </Text>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Quick Actions
      </Text>
      
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
          onPress={() => router.push('/dev/performance-monitor')}
        >
          <Ionicons name="analytics" size={20} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Performance
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
          onPress={() => router.push('/dev/security-audit')}
        >
          <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
          <Text style={[styles.actionText, { color: colors.warning }]}>
            Security
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
          onPress={() => router.push('/settings/advanced')}
        >
          <Ionicons name="settings" size={20} color={colors.success} />
          <Text style={[styles.actionText, { color: colors.success }]}>
            Settings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
          onPress={() => router.push('/profile/edit')}
        >
          <Ionicons name="person" size={20} color={colors.info} />
          <Text style={[styles.actionText, { color: colors.info }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  return (
    <LinearGradient
      colors={[colors.background, colors.backgroundSecondary]}
      style={styles.container}
    >
      <Stack.Screen
        options={{
          title: 'Enhanced Features',
          headerBackTitle: 'Back',
        }}
      />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Header */}
        {renderStatsHeader()}
        
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Features
          </Text>
          
          {features.map(renderFeatureCard)}
        </View>
        
        {/* Additional Info */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color={colors.info} />
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              What's New?
            </Text>
          </View>
          
          <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
            Your TownTap app now includes enterprise-grade features:
            {"\n"}• Biometric authentication for secure access
            {"\n"}• Real-time performance monitoring
            {"\n"}• Security audit and issue tracking
            {"\n"}• Smart image caching and optimization
            {"\n"}• Enhanced user onboarding experience
            {"\n"}• Comprehensive profile management
          </Text>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  // Stats
  statsCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  // Quick Actions
  actionsCard: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  actionButton: {
    width: '48%',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  // Features
  featuresSection: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  featureCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  featureFooter: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Info Card
  infoCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});