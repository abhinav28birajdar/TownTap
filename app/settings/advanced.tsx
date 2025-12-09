import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

// UI Components
import { Button, Card, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Services and hooks
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { imageCacheService } from '@/lib/image-cache-service';
import { performanceMonitor } from '@/lib/performance-monitor';
import { securityService, useBiometricAuth } from '@/lib/security-service';

// Constants
import { Colors, Spacing } from '@/constants/theme';

interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  secureStorageEnabled: boolean;
  performanceMonitoring: boolean;
}

interface PerformanceStats {
  cacheSize: number;
  memoryUsage: number;
  apiResponseTime: number;
  errorRate: number;
}

export default function AdvancedSettingsScreen() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const [loading, setLoading] = useState(true);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: false,
    autoLockEnabled: true,
    secureStorageEnabled: true,
    performanceMonitoring: true,
  });
  
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    cacheSize: 0,
    memoryUsage: 0,
    apiResponseTime: 0,
    errorRate: 0,
  });

  const [securityValidation, setSecurityValidation] = useState<any>(null);
  const { isAvailable: biometricAvailable, authTypes } = useBiometricAuth();

  useEffect(() => {
    loadSettings();
    loadPerformanceStats();
    performSecurityValidation();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, you'd load these from secure storage
      setSecuritySettings({
        biometricEnabled: biometricAvailable,
        autoLockEnabled: true,
        secureStorageEnabled: true,
        performanceMonitoring: true,
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPerformanceStats = async () => {
    try {
      const [cacheStats, performanceReport] = await Promise.all([
        imageCacheService.getCacheStats(),
        performanceMonitor.generateReport(),
      ]);

      setPerformanceStats({
        cacheSize: cacheStats.totalSize,
        memoryUsage: 0, // Would come from memory service
        apiResponseTime: performanceReport.summary.averageApiResponseTime,
        errorRate: performanceReport.summary.errorRate,
      });
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    }
  };

  const performSecurityValidation = async () => {
    try {
      const validation = await securityService.validateAppSecurity();
      setSecurityValidation(validation);
    } catch (error) {
      console.error('Security validation failed:', error);
    }
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled && !biometricAvailable) {
      Alert.alert(
        'Biometric Not Available',
        'Biometric authentication is not available on this device or not set up.'
      );
      return;
    }

    if (enabled) {
      // Test biometric authentication before enabling
      try {
        const result = await securityService.authenticateWithBiometrics({
          reason: 'Please authenticate to enable biometric sign-in',
        });
        
        if (result.success) {
          setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
          Alert.alert('Success', 'Biometric authentication enabled successfully!');
        } else {
          Alert.alert('Failed', result.error || 'Biometric authentication failed');
        }
      } catch (error) {
        console.error('Biometric test failed:', error);
        Alert.alert('Error', 'Failed to test biometric authentication');
      }
    } else {
      setSecuritySettings(prev => ({ ...prev, biometricEnabled: false }));
    }
  };

  const clearImageCache = async () => {
    Alert.alert(
      'Clear Image Cache',
      'This will clear all cached images. They will be re-downloaded as needed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await imageCacheService.clearCache();
              await loadPerformanceStats();
              Alert.alert('Success', 'Image cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const clearPerformanceData = async () => {
    Alert.alert(
      'Clear Performance Data',
      'This will clear all performance monitoring data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await performanceMonitor.clearMetrics();
              await loadPerformanceStats();
              Alert.alert('Success', 'Performance data cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear performance data');
            }
          },
        },
      ]
    );
  };

  const runSecurityAudit = async () => {
    setLoading(true);
    try {
      const validation = await securityService.validateAppSecurity();
      setSecurityValidation(validation);
      
      Alert.alert(
        'Security Audit Complete',
        `Security Score: ${validation.score}/100\n\n${
          validation.issues.length > 0
            ? `Issues found:\n• ${validation.issues.join('\n• ')}`
            : 'No security issues found!'
        }`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to run security audit');
    } finally {
      setLoading(false);
    }
  };

  const exportPerformanceReport = async () => {
    try {
      const report = await performanceMonitor.exportMetrics();
      // In a real app, you'd share this via email or save to device
      console.log('Performance Report:', report);
      Alert.alert(
        'Report Generated',
        'Performance report has been generated and logged to console. In a production app, this would be shared or saved.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate performance report');
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading settings..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Advanced Settings',
          headerTintColor: colors.foreground,
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Security Settings */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
        >
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              <Text variant="title-medium" style={styles.sectionTitle}>
                Security Settings
              </Text>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="body-medium" style={styles.settingLabel}>
                  Biometric Authentication
                </Text>
                <Text variant="body-small" style={styles.settingDescription}>
                  {biometricAvailable 
                    ? `Use ${authTypes.includes(2) ? 'Face ID' : 'Touch ID'} for quick sign-in`
                    : 'Not available on this device'
                  }
                </Text>
              </View>
              <Switch
                value={securitySettings.biometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={!biometricAvailable}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="body-medium" style={styles.settingLabel}>
                  Secure Storage
                </Text>
                <Text variant="body-small" style={styles.settingDescription}>
                  Encrypt sensitive data using device keychain
                </Text>
              </View>
              <Switch
                value={securitySettings.secureStorageEnabled}
                onValueChange={(enabled) =>
                  setSecuritySettings(prev => ({ ...prev, secureStorageEnabled: enabled }))
                }
              />
            </View>

            {securityValidation && (
              <View style={styles.securityScore}>
                <Text variant="body-small" style={styles.securityScoreLabel}>
                  Security Score:
                </Text>
                <Text variant="title-small" style={[
                  styles.securityScoreValue,
                  { color: securityValidation.score > 70 ? colors.success : colors.warning }
                ]}>
                  {securityValidation.score}/100
                </Text>
              </View>
            )}

            <Button
              variant="outline"
              size="sm"
              onPress={runSecurityAudit}
              style={styles.auditButton}
              leftIcon="scan"
            >
              Run Security Audit
            </Button>
          </Card>
        </MotiView>

        {/* Performance Settings */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="speedometer" size={24} color={colors.primary} />
              <Text variant="title-medium" style={styles.sectionTitle}>
                Performance
              </Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text variant="title-small" style={styles.statValue}>
                  {performanceStats.cacheSize.toFixed(1)} MB
                </Text>
                <Text variant="body-small" style={styles.statLabel}>
                  Cache Size
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="title-small" style={styles.statValue}>
                  {performanceStats.apiResponseTime}ms
                </Text>
                <Text variant="body-small" style={styles.statLabel}>
                  Avg Response
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text variant="title-small" style={styles.statValue}>
                  {performanceStats.errorRate.toFixed(1)}%
                </Text>
                <Text variant="body-small" style={styles.statLabel}>
                  Error Rate
                </Text>
              </View>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text variant="body-medium" style={styles.settingLabel}>
                  Performance Monitoring
                </Text>
                <Text variant="body-small" style={styles.settingDescription}>
                  Track app performance and usage metrics
                </Text>
              </View>
              <Switch
                value={securitySettings.performanceMonitoring}
                onValueChange={(enabled) =>
                  setSecuritySettings(prev => ({ ...prev, performanceMonitoring: enabled }))
                }
              />
            </View>

            <View style={styles.buttonRow}>
              <Button
                variant="outline"
                size="sm"
                onPress={clearImageCache}
                style={styles.actionButton}
                leftIcon="images"
              >
                Clear Cache
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onPress={exportPerformanceReport}
                style={styles.actionButton}
                leftIcon="document-text"
              >
                Export Report
              </Button>
            </View>
          </Card>
        </MotiView>

        {/* Developer Options */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
        >
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="code" size={24} color={colors.primary} />
              <Text variant="title-medium" style={styles.sectionTitle}>
                Developer Options
              </Text>
            </View>

            <TouchableOpacity
              style={styles.developerOption}
              onPress={() => router.push('/dev/performance-monitor' as any)}
            >
              <View style={styles.developerOptionContent}>
                <Ionicons name="analytics" size={20} color={colors.foreground} />
                <Text variant="body-medium" style={styles.developerOptionText}>
                  Performance Monitor
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.developerOption}
              onPress={() => router.push('/dev/security-audit' as any)}
            >
              <View style={styles.developerOptionContent}>
                <Ionicons name="shield-half" size={20} color={colors.foreground} />
                <Text variant="body-medium" style={styles.developerOptionText}>
                  Security Audit
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>

            <Button
              variant="destructive"
              size="sm"
              onPress={clearPerformanceData}
              style={styles.destructiveButton}
              leftIcon="trash"
            >
              Clear All Performance Data
            </Button>
          </Card>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginLeft: Spacing.sm,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    color: Colors.gray[600],
  },
  securityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  securityScoreLabel: {
    color: Colors.gray[600],
  },
  securityScoreValue: {
    fontWeight: '700',
  },
  auditButton: {
    marginTop: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '700',
    color: Colors.blue[600],
  },
  statLabel: {
    color: Colors.gray[600],
    marginTop: Spacing.xs,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  developerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  developerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  developerOptionText: {
    marginLeft: Spacing.sm,
  },
  destructiveButton: {
    marginTop: Spacing.md,
  },
});