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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface TermSection {
  id: string;
  title: string;
  icon: string;
  content: string[];
}

const termsSections: TermSection[] = [
  {
    id: '1',
    title: 'Acceptance of Terms',
    icon: 'checkmark-circle',
    content: [
      'By accessing or using TownTap, you agree to be bound by these Terms of Service.',
      'If you do not agree to these terms, please do not use our services.',
      'We may update these terms from time to time, and continued use constitutes acceptance.',
      'You must be at least 18 years old to use our services.',
    ],
  },
  {
    id: '2',
    title: 'Account Registration',
    icon: 'person-add',
    content: [
      'You must provide accurate and complete information when creating an account.',
      'You are responsible for maintaining the confidentiality of your credentials.',
      'You must notify us immediately of any unauthorized access to your account.',
      'One person may not maintain multiple accounts.',
      'We reserve the right to suspend or terminate accounts that violate our policies.',
    ],
  },
  {
    id: '3',
    title: 'Service Bookings',
    icon: 'calendar',
    content: [
      'All service bookings are subject to availability and provider acceptance.',
      'Prices displayed are estimates and final pricing may vary based on actual service.',
      'Cancellation policies vary by service type and provider.',
      'We are not responsible for the quality of services provided by third-party providers.',
      'Service providers are independent contractors, not employees of TownTap.',
    ],
  },
  {
    id: '4',
    title: 'Payments & Refunds',
    icon: 'card',
    content: [
      'All payments are processed securely through our payment partners.',
      'You agree to pay all charges at the prices in effect when incurred.',
      'Refunds are subject to our refund policy and the specific service terms.',
      'Promotional credits and discounts may have specific terms and expiration dates.',
      'We reserve the right to modify pricing at any time.',
    ],
  },
  {
    id: '5',
    title: 'User Conduct',
    icon: 'shield',
    content: [
      'You agree not to misuse our services or help anyone else do so.',
      'Harassment, abuse, or threatening behavior towards service providers is prohibited.',
      'You may not use our services for any illegal or unauthorized purpose.',
      'Attempting to circumvent our systems or policies is strictly prohibited.',
      'Providing false information or fraudulent bookings is grounds for termination.',
    ],
  },
  {
    id: '6',
    title: 'Intellectual Property',
    icon: 'bulb',
    content: [
      'All content, branding, and technology on TownTap is our property.',
      'You may not copy, modify, or distribute our content without permission.',
      'User-generated content remains your property but you grant us a license to use it.',
      'Trademarks and service marks may not be used without authorization.',
    ],
  },
  {
    id: '7',
    title: 'Limitation of Liability',
    icon: 'alert-circle',
    content: [
      'TownTap acts as a platform connecting users with service providers.',
      'We are not liable for actions or omissions of service providers.',
      'Our liability is limited to the amount you paid for the specific service.',
      'We are not responsible for indirect, incidental, or consequential damages.',
      'Force majeure events may affect service availability without liability.',
    ],
  },
  {
    id: '8',
    title: 'Dispute Resolution',
    icon: 'chatbubbles',
    content: [
      'Any disputes will first be attempted to resolve through informal negotiation.',
      'If unresolved, disputes will be submitted to binding arbitration.',
      'Class action lawsuits and class arbitrations are waived.',
      'Governing law is the laws of India.',
      'Venue for any disputes is Mumbai, Maharashtra.',
    ],
  },
];

const lastUpdated = 'December 1, 2024';

export default function TermsOfServiceScreen() {
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
        <ThemedText style={styles.headerTitle}>Terms of Service</ThemedText>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="document-text" size={32} color={colors.primary} />
          </View>
          <ThemedText style={styles.heroTitle}>Terms of Service</ThemedText>
          <ThemedText style={[styles.heroText, { color: colors.textSecondary }]}>
            Please read these terms carefully before using TownTap. By using our services, you agree to these terms.
          </ThemedText>
          <View style={styles.updateInfo}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.updateText, { color: colors.textSecondary }]}>
              Last updated: {lastUpdated}
            </ThemedText>
          </View>
        </View>

        {/* Important Notice */}
        <View style={styles.section}>
          <View style={[styles.noticeCard, { backgroundColor: colors.warning + '15' }]}>
            <Ionicons name="alert-circle" size={22} color={colors.warning} />
            <View style={styles.noticeContent}>
              <ThemedText style={[styles.noticeTitle, { color: colors.warning }]}>
                Important Notice
              </ThemedText>
              <ThemedText style={[styles.noticeText, { color: colors.text }]}>
                These Terms constitute a legally binding agreement between you and TownTap. Please read them carefully.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Terms Sections */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Terms & Conditions</ThemedText>
          {termsSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <View key={section.id} style={[styles.termSection, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  style={styles.termSectionHeader}
                  onPress={() => toggleSection(section.id)}
                >
                  <View style={styles.termSectionLeft}>
                    <View style={[styles.sectionNumber, { backgroundColor: colors.primary }]}>
                      <ThemedText style={styles.sectionNumberText}>{section.id}</ThemedText>
                    </View>
                    <ThemedText style={styles.termSectionTitle}>{section.title}</ThemedText>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={[styles.termSectionContent, { borderTopColor: colors.border }]}>
                    {section.content.map((item, index) => (
                      <View key={index} style={styles.termItem}>
                        <ThemedText style={[styles.termItemNumber, { color: colors.primary }]}>
                          {section.id}.{index + 1}
                        </ThemedText>
                        <ThemedText style={[styles.termItemText, { color: colors.textSecondary }]}>
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

        {/* Additional Terms */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Additional Terms</ThemedText>
          <View style={[styles.additionalCard, { backgroundColor: colors.card }]}>
            <View style={styles.additionalRow}>
              <Ionicons name="business" size={20} color={colors.primary} />
              <View style={styles.additionalInfo}>
                <ThemedText style={styles.additionalLabel}>Business Owner Terms</ThemedText>
                <ThemedText style={[styles.additionalValue, { color: colors.textSecondary }]}>
                  Additional terms apply to service providers
                </ThemedText>
              </View>
              <TouchableOpacity>
                <ThemedText style={[styles.viewLink, { color: colors.primary }]}>View</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.additionalRow}>
              <Ionicons name="gift" size={20} color={colors.success} />
              <View style={styles.additionalInfo}>
                <ThemedText style={styles.additionalLabel}>Promotional Terms</ThemedText>
                <ThemedText style={[styles.additionalValue, { color: colors.textSecondary }]}>
                  Terms for offers, credits and promotions
                </ThemedText>
              </View>
              <TouchableOpacity>
                <ThemedText style={[styles.viewLink, { color: colors.primary }]}>View</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.additionalRow}>
              <Ionicons name="heart" size={20} color={colors.error} />
              <View style={styles.additionalInfo}>
                <ThemedText style={styles.additionalLabel}>Community Guidelines</ThemedText>
                <ThemedText style={[styles.additionalValue, { color: colors.textSecondary }]}>
                  Standards for our community
                </ThemedText>
              </View>
              <TouchableOpacity>
                <ThemedText style={[styles.viewLink, { color: colors.primary }]}>View</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Acceptance */}
        <View style={styles.section}>
          <View style={[styles.acceptanceCard, { backgroundColor: colors.success + '10' }]}>
            <View style={[styles.acceptanceIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="checkmark-done-circle" size={28} color={colors.success} />
            </View>
            <ThemedText style={styles.acceptanceTitle}>By Using TownTap</ThemedText>
            <ThemedText style={[styles.acceptanceText, { color: colors.textSecondary }]}>
              You acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </ThemedText>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Questions?</ThemedText>
          <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
              If you have any questions about these Terms, please contact us:
            </ThemedText>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={18} color={colors.primary} />
                <ThemedText style={styles.contactValue}>legal@towntap.com</ThemedText>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={18} color={colors.primary} />
                <ThemedText style={styles.contactValue}>+91 1800-XXX-XXXX</ThemedText>
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
              onPress={() => router.push('/legal/privacy')}
            >
              <View style={[styles.relatedIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="lock-closed" size={20} color={colors.primary} />
              </View>
              <ThemedText style={styles.relatedText}>Privacy Policy</ThemedText>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.relatedLink, { backgroundColor: colors.card }]}
              onPress={() => router.push('/help' as any)}
            >
              <View style={[styles.relatedIcon, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="help-circle" size={20} color={colors.info} />
              </View>
              <ThemedText style={styles.relatedText}>Help Center</ThemedText>
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
  noticeCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  termSection: {
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  termSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  termSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  termSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  termSectionContent: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  termItemNumber: {
    fontSize: 13,
    fontWeight: '600',
    width: 30,
  },
  termItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  additionalCard: {
    padding: 16,
    borderRadius: 14,
  },
  additionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  additionalInfo: {
    flex: 1,
  },
  additionalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  additionalValue: {
    fontSize: 12,
  },
  viewLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  acceptanceCard: {
    padding: 20,
    borderRadius: 14,
    alignItems: 'center',
  },
  acceptanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  acceptanceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  acceptanceText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
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
