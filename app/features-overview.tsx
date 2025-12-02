import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { useTheme, getThemeColors } from '@/hooks/use-theme';
import { useBiometricAuth } from '@/lib/security-service';
import { performanceMonitor } from '@/lib/performance-monitor';
import { Gradients } from '@/constants/colors';
import { BorderRadius, Shadows } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';

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
  ];\n\n  const getStatusColor = (status: FeatureCard['status']) => {\n    switch (status) {\n      case 'available':\n        return colors.info;\n      case 'configured':\n        return colors.success;\n      case 'needs_setup':\n        return colors.warning;\n      default:\n        return colors.textSecondary;\n    }\n  };\n\n  const getStatusText = (status: FeatureCard['status']) => {\n    switch (status) {\n      case 'available':\n        return 'Ready to use';\n      case 'configured':\n        return 'Active';\n      case 'needs_setup':\n        return 'Needs setup';\n      default:\n        return 'Unknown';\n    }\n  };\n\n  const getStatusIcon = (status: FeatureCard['status']) => {\n    switch (status) {\n      case 'available':\n        return 'checkmark-circle';\n      case 'configured':\n        return 'checkmark-circle';\n      case 'needs_setup':\n        return 'alert-circle';\n      default:\n        return 'help-circle';\n    }\n  };\n\n  const handleFeaturePress = (feature: FeatureCard) => {\n    if (feature.route) {\n      router.push(feature.route as any);\n    } else if (feature.action) {\n      feature.action();\n    } else {\n      Alert.alert(\n        feature.title,\n        `${feature.description}\\n\\nStatus: ${getStatusText(feature.status)}`\n      );\n    }\n  };\n\n  const renderFeatureCard = (feature: FeatureCard, index: number) => (\n    <MotiView\n      key={feature.id}\n      from={{ opacity: 0, translateY: 50 }}\n      animate={{ opacity: 1, translateY: 0 }}\n      transition={{\n        type: 'timing',\n        duration: 600,\n        delay: index * 100,\n      }}\n    >\n      <TouchableOpacity\n        onPress={() => handleFeaturePress(feature)}\n        style={[styles.featureCard, { backgroundColor: colors.card }]}\n      >\n        <View style={styles.featureHeader}>\n          <View style={[\n            styles.featureIcon,\n            { backgroundColor: getStatusColor(feature.status) + '20' }\n          ]}>\n            <Ionicons\n              name={feature.icon}\n              size={24}\n              color={getStatusColor(feature.status)}\n            />\n          </View>\n          \n          <View style={styles.featureInfo}>\n            <Text style={[styles.featureTitle, { color: colors.text }]}>\n              {feature.title}\n            </Text>\n            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>\n              {feature.description}\n            </Text>\n          </View>\n          \n          {feature.route && (\n            <Ionicons\n              name=\"chevron-forward\"\n              size={20}\n              color={colors.textSecondary}\n            />\n          )}\n        </View>\n        \n        <View style={styles.featureFooter}>\n          <View style={[\n            styles.statusBadge,\n            { backgroundColor: getStatusColor(feature.status) + '20' }\n          ]}>\n            <Ionicons\n              name={getStatusIcon(feature.status)}\n              size={14}\n              color={getStatusColor(feature.status)}\n            />\n            <Text style={[\n              styles.statusText,\n              { color: getStatusColor(feature.status) }\n            ]}>\n              {getStatusText(feature.status)}\n            </Text>\n          </View>\n        </View>\n      </TouchableOpacity>\n    </MotiView>\n  );\n\n  const renderStatsHeader = () => (\n    <Card style={styles.statsCard}>\n      <Text style={[styles.statsTitle, { color: colors.text }]}>\n        App Enhancement Summary\n      </Text>\n      \n      <View style={styles.statsGrid}>\n        <View style={styles.statItem}>\n          <Text style={[styles.statNumber, { color: colors.success }]}>\n            {features.filter(f => f.status === 'configured').length}\n          </Text>\n          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>\n            Active Features\n          </Text>\n        </View>\n        \n        <View style={styles.statItem}>\n          <Text style={[styles.statNumber, { color: colors.info }]}>\n            {features.filter(f => f.status === 'available').length}\n          </Text>\n          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>\n            Ready to Use\n          </Text>\n        </View>\n        \n        <View style={styles.statItem}>\n          <Text style={[styles.statNumber, { color: colors.warning }]}>\n            {features.filter(f => f.status === 'needs_setup').length}\n          </Text>\n          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>\n            Need Setup\n          </Text>\n        </View>\n      </View>\n      \n      <Text style={[styles.statsSubtitle, { color: colors.textSecondary }]}>\n        Your TownTap app has been enhanced with enterprise-level features for security,\n        performance, and user experience.\n      </Text>\n    </Card>\n  );\n\n  const renderQuickActions = () => (\n    <Card style={styles.actionsCard}>\n      <Text style={[styles.sectionTitle, { color: colors.text }]}>\n        Quick Actions\n      </Text>\n      \n      <View style={styles.actionsGrid}>\n        <TouchableOpacity\n          style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}\n          onPress={() => router.push('/dev/performance-monitor')}\n        >\n          <Ionicons name=\"analytics\" size={20} color={colors.primary} />\n          <Text style={[styles.actionText, { color: colors.primary }]}>\n            Performance\n          </Text>\n        </TouchableOpacity>\n        \n        <TouchableOpacity\n          style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}\n          onPress={() => router.push('/dev/security-audit')}\n        >\n          <Ionicons name=\"shield-checkmark\" size={20} color={colors.warning} />\n          <Text style={[styles.actionText, { color: colors.warning }]}>\n            Security\n          </Text>\n        </TouchableOpacity>\n        \n        <TouchableOpacity\n          style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}\n          onPress={() => router.push('/settings/advanced')}\n        >\n          <Ionicons name=\"settings\" size={20} color={colors.success} />\n          <Text style={[styles.actionText, { color: colors.success }]}>\n            Settings\n          </Text>\n        </TouchableOpacity>\n        \n        <TouchableOpacity\n          style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}\n          onPress={() => router.push('/profile/edit')}\n        >\n          <Ionicons name=\"person\" size={20} color={colors.info} />\n          <Text style={[styles.actionText, { color: colors.info }]}>\n            Profile\n          </Text>\n        </TouchableOpacity>\n      </View>\n    </Card>\n  );\n\n  return (\n    <LinearGradient\n      colors={[colors.background, colors.backgroundSecondary]}\n      style={styles.container}\n    >\n      <Stack.Screen\n        options={{\n          title: 'Enhanced Features',\n          headerBackTitle: 'Back',\n        }}\n      />\n\n      <ScrollView\n        style={styles.scrollContainer}\n        contentContainerStyle={styles.scrollContent}\n        showsVerticalScrollIndicator={false}\n      >\n        {/* Stats Header */}\n        {renderStatsHeader()}\n        \n        {/* Quick Actions */}\n        {renderQuickActions()}\n        \n        {/* Features List */}\n        <View style={styles.featuresSection}>\n          <Text style={[styles.sectionTitle, { color: colors.text }]}>\n            Available Features\n          </Text>\n          \n          {features.map(renderFeatureCard)}\n        </View>\n        \n        {/* Additional Info */}\n        <Card style={styles.infoCard}>\n          <View style={styles.infoHeader}>\n            <Ionicons name=\"information-circle\" size={24} color={colors.info} />\n            <Text style={[styles.infoTitle, { color: colors.text }]}>\n              What's New?\n            </Text>\n          </View>\n          \n          <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>\n            Your TownTap app now includes enterprise-grade features:\n            {\"\\n\"}• Biometric authentication for secure access\n            {\"\\n\"}• Real-time performance monitoring\n            {\"\\n\"}• Security audit and issue tracking\n            {\"\\n\"}• Smart image caching and optimization\n            {\"\\n\"}• Enhanced user onboarding experience\n            {\"\\n\"}• Comprehensive profile management\n          </Text>\n        </Card>\n      </ScrollView>\n    </LinearGradient>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n  },\n  scrollContainer: {\n    flex: 1,\n  },\n  scrollContent: {\n    padding: Spacing.md,\n  },\n  // Stats\n  statsCard: {\n    marginBottom: Spacing.md,\n    padding: Spacing.lg,\n  },\n  statsTitle: {\n    fontSize: 20,\n    fontWeight: '700',\n    marginBottom: Spacing.sm,\n    textAlign: 'center',\n  },\n  statsGrid: {\n    flexDirection: 'row',\n    justifyContent: 'space-around',\n    marginVertical: Spacing.md,\n  },\n  statItem: {\n    alignItems: 'center',\n  },\n  statNumber: {\n    fontSize: 28,\n    fontWeight: '800',\n    marginBottom: 4,\n  },\n  statLabel: {\n    fontSize: 12,\n    fontWeight: '500',\n    textAlign: 'center',\n  },\n  statsSubtitle: {\n    fontSize: 14,\n    lineHeight: 20,\n    textAlign: 'center',\n    marginTop: Spacing.sm,\n  },\n  // Quick Actions\n  actionsCard: {\n    marginBottom: Spacing.md,\n    padding: Spacing.md,\n  },\n  actionsGrid: {\n    flexDirection: 'row',\n    flexWrap: 'wrap',\n    justifyContent: 'space-between',\n    gap: Spacing.sm,\n  },\n  actionButton: {\n    width: '48%',\n    alignItems: 'center',\n    padding: Spacing.md,\n    borderRadius: BorderRadius.md,\n  },\n  actionText: {\n    fontSize: 12,\n    fontWeight: '600',\n    marginTop: Spacing.xs,\n  },\n  // Features\n  featuresSection: {\n    marginBottom: Spacing.md,\n  },\n  sectionTitle: {\n    fontSize: 18,\n    fontWeight: '600',\n    marginBottom: Spacing.md,\n  },\n  featureCard: {\n    marginBottom: Spacing.sm,\n    padding: Spacing.md,\n    borderRadius: BorderRadius.lg,\n    ...Shadows.small,\n  },\n  featureHeader: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    marginBottom: Spacing.sm,\n  },\n  featureIcon: {\n    width: 48,\n    height: 48,\n    borderRadius: BorderRadius.md,\n    justifyContent: 'center',\n    alignItems: 'center',\n    marginRight: Spacing.sm,\n  },\n  featureInfo: {\n    flex: 1,\n  },\n  featureTitle: {\n    fontSize: 16,\n    fontWeight: '600',\n    marginBottom: 4,\n  },\n  featureDescription: {\n    fontSize: 14,\n    lineHeight: 18,\n  },\n  featureFooter: {\n    alignItems: 'flex-start',\n  },\n  statusBadge: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    paddingHorizontal: Spacing.sm,\n    paddingVertical: Spacing.xs,\n    borderRadius: BorderRadius.sm,\n  },\n  statusText: {\n    fontSize: 12,\n    fontWeight: '600',\n    marginLeft: 4,\n  },\n  // Info Card\n  infoCard: {\n    padding: Spacing.md,\n    marginBottom: Spacing.xl,\n  },\n  infoHeader: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    marginBottom: Spacing.sm,\n  },\n  infoTitle: {\n    fontSize: 16,\n    fontWeight: '600',\n    marginLeft: Spacing.sm,\n  },\n  infoDescription: {\n    fontSize: 14,\n    lineHeight: 20,\n  },\n});\n