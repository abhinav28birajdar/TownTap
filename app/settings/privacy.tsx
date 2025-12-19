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

export default function PrivacyPolicyScreen() {
  const colors = useColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Privacy Policy</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.updateInfo}>
          <ThemedText style={styles.updateText}>Last updated: January 2025</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>1. Information We Collect</ThemedText>
          <ThemedText style={styles.paragraph}>
            We collect information that you provide directly to us when you:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Create an account</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Book services</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Contact customer support</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Use our messaging features</ThemedText>
          <ThemedText style={styles.paragraph}>
            This may include your name, email address, phone number, payment information, 
            and service preferences.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>2. How We Use Your Information</ThemedText>
          <ThemedText style={styles.paragraph}>
            We use the information we collect to:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>• Provide, maintain, and improve our services</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Process your bookings and payments</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Send you technical notices and support messages</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Respond to your comments and questions</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Prevent fraud and enhance security</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>3. Location Information</ThemedText>
          <ThemedText style={styles.paragraph}>
            We collect location information to help you find nearby service providers and 
            enable providers to locate you for service delivery. You can control location 
            permissions through your device settings.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>4. Data Sharing</ThemedText>
          <ThemedText style={styles.paragraph}>
            We share your information with:
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Service providers when you book a service
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Payment processors to handle transactions
          </ThemedText>
          <ThemedText style={styles.bulletPoint}>
            • Analytics providers to improve our services
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            We never sell your personal information to third parties.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>5. Data Security</ThemedText>
          <ThemedText style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your 
            personal information against unauthorized access, alteration, disclosure, or 
            destruction. However, no method of transmission over the internet is 100% secure.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>6. Your Rights</ThemedText>
          <ThemedText style={styles.paragraph}>You have the right to:</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Access your personal data</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Correct inaccurate data</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Request deletion of your data</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Opt-out of marketing communications</ThemedText>
          <ThemedText style={styles.bulletPoint}>• Export your data</ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>7. Children's Privacy</ThemedText>
          <ThemedText style={styles.paragraph}>
            Our services are not intended for children under 18 years of age. We do not 
            knowingly collect personal information from children under 18.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>8. Changes to This Policy</ThemedText>
          <ThemedText style={styles.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any 
            changes by posting the new policy on this page and updating the "Last updated" date.
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>9. Contact Us</ThemedText>
          <ThemedText style={styles.paragraph}>
            If you have questions about this privacy policy, please contact us at:
          </ThemedText>
          <ThemedText style={[styles.contactText, { color: '#415D43' }]}>
            privacy@towntap.com
          </ThemedText>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            By using TownTap, you agree to this Privacy Policy.
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
