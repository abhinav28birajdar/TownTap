import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { AnimatePresence, MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

// UI Components
import { Button, Card, Text } from '@/components/ui';
import { LoadingScreen } from '@/components/ui/loading-screen';

// Services and hooks
import { getThemeColors, useTheme } from '@/hooks/use-theme';
import { securityService } from '@/lib/security-service';

// Constants
import { Colors, Spacing } from '@/constants/theme';

interface SecurityIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  resolved: boolean;
}

interface SecurityAuditResult {
  score: number;
  issues: SecurityIssue[];
  lastAuditDate: string;
  recommendations: string[];
}

export default function SecurityAuditScreen() {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(null);
  const [runningAudit, setRunningAudit] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    try {
      // Simulate loading previous audit results
      const mockAuditResult: SecurityAuditResult = {
        score: 85,
        lastAuditDate: new Date().toISOString(),
        issues: [
          {
            id: '1',
            severity: 'medium',
            category: 'Authentication',
            title: 'Weak Password Policy',
            description: 'Password requirements could be strengthened',
            recommendation: 'Implement stronger password validation rules including special characters and minimum length of 12.',
            resolved: false,
          },
          {
            id: '2',
            severity: 'low',
            category: 'Data Storage',
            title: 'Unencrypted Local Storage',
            description: 'Some non-sensitive data is stored without encryption',
            recommendation: 'Consider encrypting all stored data, even non-sensitive information.',
            resolved: false,
          },
          {
            id: '3',
            severity: 'high',
            category: 'Network',
            title: 'Certificate Pinning Not Implemented',
            description: 'API communications lack certificate pinning',
            recommendation: 'Implement certificate pinning to prevent man-in-the-middle attacks.',
            resolved: false,
          },
        ],
        recommendations: [
          'Enable biometric authentication for all users',
          'Implement certificate pinning for API communications',
          'Regular security audits and penetration testing',
          'Enhanced logging and monitoring',
        ],
      };

      setAuditResult(mockAuditResult);
    } catch (error) {
      console.error('Failed to load audit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSecurityAudit = async () => {
    setRunningAudit(true);
    
    try {
      // Simulate running a comprehensive security audit
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const validation = await securityService.validateAppSecurity();
      
      // Convert validation to audit result format
      const newAuditResult: SecurityAuditResult = {
        score: validation.score,
        lastAuditDate: new Date().toISOString(),
        issues: validation.issues.map((issue, index) => ({
          id: (index + 1).toString(),
          severity: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
          category: 'Security',
          title: issue,
          description: `Security issue detected: ${issue}`,
          recommendation: `Address the ${issue} to improve app security`,
          resolved: false,
        })),
        recommendations: [
          'Enable biometric authentication for all users',
          'Implement certificate pinning for API communications',
          'Regular security audits and penetration testing',
          'Enhanced logging and monitoring',
        ],
      };

      setAuditResult(newAuditResult);
      
      Alert.alert(
        'Security Audit Complete',
        `Security Score: ${validation.score}/100\n\n${validation.issues.length} issues found.`
      );
    } catch (error) {
      console.error('Security audit failed:', error);
      Alert.alert('Error', 'Failed to run security audit');
    } finally {
      setRunningAudit(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAuditData();
    setRefreshing(false);
  };

  const markIssueResolved = (issueId: string) => {
    if (!auditResult) return;
    
    const updatedIssues = auditResult.issues.map(issue => 
      issue.id === issueId ? { ...issue, resolved: true } : issue
    );
    
    setAuditResult({
      ...auditResult,
      issues: updatedIssues,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return Colors.red[600];
      case 'high': return Colors.red[500];
      case 'medium': return Colors.warning;
      case 'low': return Colors.yellow[600];
      default: return Colors.gray[500];
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return Colors.green[600];
    if (score >= 70) return Colors.yellow[600];
    if (score >= 50) return Colors.warning;
    return Colors.red[500];
  };

  if (loading) {
    return <LoadingScreen message="Loading security audit data..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Security Audit',
          headerTintColor: colors.foreground,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Security Score */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
        >
          <Card style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="shield-checkmark" size={32} color={getScoreColor(auditResult?.score || 0)} />
              <View style={styles.scoreInfo}>
                <Text variant="title-large" style={[styles.scoreValue, { color: getScoreColor(auditResult?.score || 0) }]}>
                  {auditResult?.score || 0}/100
                </Text>
                <Text variant="body-small" style={styles.scoreLabel}>
                  Security Score
                </Text>
              </View>
            </View>
            
            <View style={styles.scoreBar}>
              <MotiView
                from={{ width: 0 }}
                animate={{ width: `${auditResult?.score || 0}%` }}
                transition={{ duration: 1000, delay: 500 }}
                style={[
                  styles.scoreProgress,
                  { backgroundColor: getScoreColor(auditResult?.score || 0) }
                ]}
              />
            </View>
            
            <Text variant="body-small" style={styles.lastAudit}>
              Last audit: {auditResult ? new Date(auditResult.lastAuditDate).toLocaleDateString() : 'Never'}
            </Text>
          </Card>
        </MotiView>

        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
        >
          <View style={styles.actionsRow}>
            <Button
              variant="default"
              onPress={runSecurityAudit}
              disabled={runningAudit}
              style={styles.actionButton}
              leftIcon="scan"
            >
              {runningAudit ? 'Running Audit...' : 'Run New Audit'}
            </Button>
            
            <Button
              variant="outline"
              onPress={() => router.push('/settings/advanced' as any)}
              style={styles.actionButton}
              leftIcon="settings"
            >
              Settings
            </Button>
          </View>
        </MotiView>

        {/* Security Issues */}
        {auditResult?.issues && auditResult.issues.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
          >
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="warning" size={24} color={colors.primary} />
                <Text variant="title-medium" style={styles.sectionTitle}>
                  Security Issues ({auditResult.issues.filter(i => !i.resolved).length})
                </Text>
              </View>

              <AnimatePresence>
                {auditResult.issues.map((issue, index) => (
                  <MotiView
                    key={issue.id}
                    from={{ opacity: 0, translateX: -20 }}
                    animate={{ 
                      opacity: issue.resolved ? 0.5 : 1, 
                      translateX: 0,
                    }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 100 }}
                  >
                    <View style={[
                      styles.issueCard,
                      { borderLeftColor: getSeverityColor(issue.severity) }
                    ]}>
                      <View style={styles.issueHeader}>
                        <View style={styles.issueInfo}>
                          <View style={styles.issueTitleRow}>
                            <Ionicons 
                              name={getSeverityIcon(issue.severity)} 
                              size={16} 
                              color={getSeverityColor(issue.severity)} 
                            />
                            <Text variant="body-medium" style={styles.issueTitle}>
                              {issue.title}
                            </Text>
                            <View style={[
                              styles.severityBadge,
                              { backgroundColor: getSeverityColor(issue.severity) }
                            ]}>
                              <Text variant="caption" style={styles.severityText}>
                                {issue.severity.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <Text variant="body-small" style={styles.issueCategory}>
                            {issue.category}
                          </Text>
                        </View>
                        
                        {!issue.resolved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() => markIssueResolved(issue.id)}
                            leftIcon="checkmark"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </View>

                      <Text variant="body-small" style={styles.issueDescription}>
                        {issue.description}
                      </Text>

                      <View style={styles.recommendationBox}>
                        <Text variant="caption" style={styles.recommendationLabel}>
                          Recommendation:
                        </Text>
                        <Text variant="body-small" style={styles.recommendationText}>
                          {issue.recommendation}
                        </Text>
                      </View>

                      {issue.resolved && (
                        <View style={styles.resolvedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.green[600]} />
                          <Text variant="caption" style={[styles.resolvedText, { color: Colors.green[600] }]}>
                            Marked as resolved
                          </Text>
                        </View>
                      )}
                    </View>
                  </MotiView>
                ))}
              </AnimatePresence>
            </Card>
          </MotiView>
        )}

        {/* Recommendations */}
        {auditResult?.recommendations && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
          >
            <Card style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="bulb" size={24} color={colors.primary} />
                <Text variant="title-medium" style={styles.sectionTitle}>
                  Security Recommendations
                </Text>
              </View>

              {auditResult.recommendations.map((recommendation, index) => (
                <MotiView
                  key={index}
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ delay: 400 + (index * 100) }}
                >
                  <View style={styles.recommendationItem}>
                    <Ionicons name="arrow-forward" size={16} color={colors.primary} />
                    <Text variant="body-small" style={styles.recommendationItemText}>
                      {recommendation}
                    </Text>
                  </View>
                </MotiView>
              ))}
            </Card>
          </MotiView>
        )}

        {/* Loading indicator for audit */}
        <AnimatePresence>
          {runningAudit && (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.auditProgress}
            >
              <Card style={styles.progressCard}>
                <View style={styles.progressContent}>
                  <MotiView
                    from={{ rotate: '0deg' }}
                    animate={{ rotate: '360deg' }}
                    transition={{ loop: true, duration: 1000 }}
                  >
                    <Ionicons name="sync" size={24} color={colors.primary} />
                  </MotiView>
                  <Text variant="body-medium" style={styles.progressText}>
                    Running comprehensive security audit...
                  </Text>
                </View>
              </Card>
            </MotiView>
          )}
        </AnimatePresence>
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
  scoreCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  scoreInfo: {
    marginLeft: Spacing.md,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreLabel: {
    color: Colors.gray[600],
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: Spacing.sm,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  lastAudit: {
    color: Colors.gray[600],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
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
  issueCard: {
    borderLeftWidth: 4,
    backgroundColor: Colors.gray[50],
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 8,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  issueInfo: {
    flex: 1,
  },
  issueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  issueTitle: {
    fontWeight: '500',
    marginLeft: Spacing.xs,
    marginRight: Spacing.sm,
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  issueCategory: {
    color: Colors.gray[600],
    fontSize: 12,
  },
  issueDescription: {
    color: Colors.gray[700],
    marginBottom: Spacing.sm,
  },
  recommendationBox: {
    backgroundColor: Colors.blue[50],
    padding: Spacing.sm,
    borderRadius: 6,
    marginBottom: Spacing.sm,
  },
  recommendationLabel: {
    color: Colors.blue[700],
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  recommendationText: {
    color: Colors.blue[800],
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  resolvedText: {
    marginLeft: Spacing.xs,
    fontWeight: '500',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  recommendationItemText: {
    marginLeft: Spacing.sm,
    flex: 1,
    color: Colors.gray[700],
  },
  auditProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    margin: Spacing.lg,
    borderRadius: 12,
  },
  progressCard: {
    padding: Spacing.xl,
    minWidth: 250,
  },
  progressContent: {
    alignItems: 'center',
  },
  progressText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
});