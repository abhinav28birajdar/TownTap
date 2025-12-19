import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsOfServiceScreen() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Terms of Service</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.updateInfo}>
          <ThemedText style={styles.updateText}>Last updated: January 2025</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            By accessing and using TownTap, you accept and agree to be bound by these Terms 
            of Service. If you do not agree to these terms, please do not use our services.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>2. Service Description</ThemedText>
          <ThemedText style={styles.paragraph}>
            TownTap is a platform that connects customers with local service providers. 
            We facilitate bookings and payments but do not directly provide the services 
            listed on our platform.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>3. User Accounts</ThemedText>
          <ThemedText style={styles.paragraph}>
            To use our services, you must:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Be at least 18 years old</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Provide accurate information</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Maintain account security</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Not share your account credentials</ThemedText>
          <ThemedText style={styles.paragraph}>
            You are responsible for all activities that occur under your account.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>4. Booking and Payments</ThemedText>
          <ThemedText style={styles.paragraph}>
            When you book a service:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • You agree to pay the stated price
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Prices may vary based on location and service complexity
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Cancellation policies apply as stated
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Refunds are processed according to our refund policy
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>5. Service Provider Responsibilities</ThemedText>
          <ThemedText style={styles.paragraph}>
            Service providers must:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Complete verification process</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Provide quality services</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Maintain professional conduct</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Honor booking commitments</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Comply with local regulations</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>6. Customer Responsibilities</ThemedText>
          <ThemedText style={styles.paragraph}>
            As a customer, you must:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Provide accurate booking information</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Be available at scheduled times</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Treat service providers respectfully</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Pay for services as agreed</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Provide honest reviews</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>7. Cancellation Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Cancellations made:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • 24+ hours before: Full refund
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • 12-24 hours before: 50% refund
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Less than 12 hours: No refund
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Service providers may have their own cancellation policies which will be clearly stated.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>8. Prohibited Activities</ThemedText>
          <ThemedText style={styles.paragraph}>You may not:</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Violate any laws or regulations</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Harass or abuse other users</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Post false or misleading information</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Attempt to circumvent our payment system</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Use bots or automated tools</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>9. Limitation of Liability</ThemedText>
          <ThemedText style={styles.paragraph}>
            TownTap is not liable for:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Quality of services provided by third parties
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Damages or injuries during service delivery
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Disputes between customers and providers
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Service interruptions or technical issues
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>10. Dispute Resolution</ThemedText>
          <ThemedText style={styles.paragraph}>
            In case of disputes, we encourage direct communication between parties. 
            If unresolved, disputes will be handled through our support team and, 
            if necessary, binding arbitration.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>11. Intellectual Property</ThemedText>
          <ThemedText style={styles.paragraph}>
            All content, trademarks, and intellectual property on TownTap are owned by 
            TownTap or our licensors. You may not use our content without permission.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>12. Changes to Terms</ThemedText>
          <ThemedText style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Continued use of 
            our services after changes constitutes acceptance of the new terms.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>13. Contact Information</ThemedText>
          <ThemedText style={styles.paragraph}>
            For questions about these terms, contact us at:
          </ThemedText>
          <ThemedText style={[styles.contactText, { color: '#415D43' }]}>
            legal@towntap.com
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            By using TownTap, you agree to these Terms of Service.
          </ThemedText>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  updateInfo: {
    paddingVertical: 16,
  },
  updateText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
    marginLeft: 8,
  },
  contactText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    opacity: 0.6,
    textAlign: 'center',
  },
});
