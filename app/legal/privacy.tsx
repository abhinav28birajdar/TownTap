import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface PolicySection {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const policySections: PolicySection[] = [
  {
    id: '1',
    title: 'Information We Collect',
    icon: 'folder-open',
    content: [
      'Personal information (name, email, phone number, address)',
      'Payment information for transactions',
      'Device information and identifiers',
      'Location data when using location-based services',
      'Usage data and app interactions',
      'Communications and feedback you provide',
    ],
  },
  {
    id: '2',
    title: 'How We Use Your Information',
    icon: 'cog',
    content: [
      'Process and fulfill your service bookings',
      'Provide customer support and respond to inquiries',
      'Send service updates and promotional communications',
      'Improve our services and user experience',
      'Ensure platform safety and prevent fraud',
      'Comply with legal obligations',
    ],
  },
  {
    id: '3',
    title: 'Information Sharing',
    icon: 'share-social',
    content: [
      'With service providers to fulfill your bookings',
      'With payment processors for transactions',
      'With analytics partners to improve services',
      'When required by law or legal process',
      'To protect rights and safety of users',
      'With your consent for other purposes',
    ],
  },
  {
    id: '4',
    title: 'Data Security',
    icon: 'shield-checkmark',
    content: [
      'Industry-standard encryption for data transmission',
      'Secure storage of personal information',
      'Regular security audits and assessments',
      'Access controls and authentication measures',
      'Employee training on data protection',
      'Incident response procedures',
    ],
  },
  {
    id: '5',
    title: 'Your Rights',
    icon: 'person',
    content: [
      'Access and review your personal information',
      'Request correction of inaccurate data',
      'Delete your account and associated data',
      'Opt-out of marketing communications',
      'Data portability upon request',
      'Withdraw consent where applicable',
    ],
  },
  {
    id: '6',
    title: 'Cookies & Tracking',
    icon: 'analytics',
    content: [
      'Essential cookies for app functionality',
      'Analytics cookies to understand usage',
      'Preference cookies to remember settings',
      'You can manage cookie preferences',
      'Third-party analytics services',
      'Do Not Track signal handling',
    ],
  },
];

const lastUpdated = 'December 1, 2024';

export default function PrivacyPolicyScreen() {
  const colors = useColors();

  const [expandedSection, setExpandedSection] = React.useState<string | null>('1');

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Privacy Policy</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="lock-closed" size={32} color={colors.primary} />
          </View>
          <ThemedText style={styles.heroTitle}>Your Privacy Matters</ThemedText>
          <ThemedText style={[styles.heroText, { color: colors.textSecondary }]}>
            We are committed to protecting your personal information and being transparent about how we use it.
          </ThemedText>
          <View style={styles.updateInfo}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.updateText, { color: colors.textSecondary }]}>
              Last updated: {lastUpdated}
            </ThemedText>
          </View>
        </View>

        {/* Quick Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Summary</ThemedText>
          <View style={[styles.summaryCard, { backgroundColor: colors.info + '10' }]}>
            <Ionicons name="information-circle" size={22} color={colors.info} />
            <View style={styles.summaryContent}>
              <ThemedText style={[styles.summaryText, { color: colors.text }]}>
                • We collect information you provide and from your use of our services{'\n'}
                • We use this to provide, improve, and personalize your experience{'\n'}
                • We share data only with trusted partners and as required by law{'\n'}
                • You can access, correct, or delete your data at any time
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Policy Sections */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Detailed Policy</ThemedText>
          {policySections.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <View key={section.id} style={[styles.policySection, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={styles.policySectionHeader}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={styles.policySectionLeft}>
                    <View style={[styles.policySectionIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name={section.icon as any} size={20} color={colors.primary} />
                    </View>
                    <ThemedText style={styles.policySectionTitle}>{section.title}</ThemedText>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={[styles.policySectionContent, { borderTopColor: colors.border }]}>
                    {section.content.map((item, index) => (
                      <View key={index} style={styles.policyItem}>
                        <View style={[styles.bulletPoint, { backgroundColor: colors.primary }]} />
                        <ThemedText style={[styles.policyItemText, { color: colors.textSecondary }]}>
                          {item}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Data Retention */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data Retention</ThemedText>
          <View style={[styles.retentionCard, { backgroundColor: colors.card }]}>
            <View style={styles.retentionRow}>
              <View style={[styles.retentionIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="time" size={20} color={colors.success} />
              </View>
              <View style={styles.retentionInfo}>
                <ThemedText style={styles.retentionLabel}>Account Data</ThemedText>
                <ThemedText style={[styles.retentionValue, { color: colors.textSecondary }]}>
                  Retained while account is active
                </ThemedText>
              </View>
            </View>
            <View style={styles.retentionRow}>
              <View style={[styles.retentionIcon, { backgroundColor: colors.warning + '15' }]}>
                <Ionicons name="document-text" size={20} color={colors.warning} />
              </View>
              <View style={styles.retentionInfo}>
                <ThemedText style={styles.retentionLabel}>Transaction Records</ThemedText>
                <ThemedText style={[styles.retentionValue, { color: colors.textSecondary }]}>
                  7 years for legal compliance
                </ThemedText>
              </View>
            </View>
            <View style={styles.retentionRow}>
              <View style={[styles.retentionIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="analytics" size={20} color={colors.info} />
              </View>
              <View style={styles.retentionInfo}>
                <ThemedText style={styles.retentionLabel}>Analytics Data</ThemedText>
                <ThemedText style={[styles.retentionValue, { color: colors.textSecondary }]}>
                  26 months for service improvement
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </ThemedText>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={18} color={colors.primary} />
                <ThemedText style={styles.contactValue}>privacy@towntap.com</ThemedText>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={18} color={colors.primary} />
                <ThemedText style={styles.contactValue}>
                  TownTap Pvt. Ltd., Mumbai, India
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Related Links */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Related</ThemedText>
          <View style={styles.relatedLinks}>
            <TouchableOpacity
              style={[styles.relatedLink, { backgroundColor: colors.card }]}
              onPress={() => router.push('/legal/terms')}
            >
              <View style={[styles.relatedIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <ThemedText style={styles.relatedText}>Terms of Service</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.relatedLink, { backgroundColor: colors.card }]}>
              <View style={[styles.relatedIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="shield" size={20} color={colors.info} />
              </View>
              <ThemedText style={styles.relatedText}>Security Center</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 14,
  },
  updateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  updateText: {
    fontSize: 13,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  summaryContent: {
    flex: 1,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 22,
  },
  policySection: {
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  policySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  policySectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  policySectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policySectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  policySectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  policyItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  retentionCard: {
    padding: 16,
    borderRadius: 14,
    gap: 14,
  },
  retentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  retentionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retentionInfo: {
    flex: 1,
  },
  retentionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  retentionValue: {
    fontSize: 13,
  },
  contactCard: {
    padding: 16,
    borderRadius: 14,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  contactInfo: {
    gap: 10,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  relatedLinks: {
    gap: 10,
  },
  relatedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  relatedIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 12,
  },
});
