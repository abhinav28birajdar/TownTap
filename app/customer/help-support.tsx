/**
 * Help & Support Page - Phase 11
 * Customer support and FAQ
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { BorderRadius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function HelpSupportPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuthStore();

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I book a service?',
      answer: 'Browse services, select one, choose date/time, and confirm booking.',
      category: 'Booking',
    },
    {
      id: '2',
      question: 'Can I cancel my booking?',
      answer: 'Yes, you can cancel bookings up to 2 hours before the scheduled time for a full refund.',
      category: 'Booking',
    },
    {
      id: '3',
      question: 'How do I contact a service provider?',
      answer: 'Use the in-app chat feature to message service providers directly.',
      category: 'Communication',
    },
    {
      id: '4',
      question: 'What payment methods are accepted?',
      answer: 'We accept cards, UPI, net banking, and wallet payments.',
      category: 'Payment',
    },
    {
      id: '5',
      question: 'How do I track my service provider?',
      answer: 'Go to your active booking and tap "Track Provider" to see real-time location.',
      category: 'Tracking',
    },
    {
      id: '6',
      question: 'What is the loyalty program?',
      answer: 'Earn points on every booking and redeem them for discounts and rewards.',
      category: 'Rewards',
    },
    {
      id: '7',
      question: 'How do referrals work?',
      answer: 'Share your referral code. When friends book services, you both get ₹100.',
      category: 'Rewards',
    },
    {
      id: '8',
      question: 'Is my payment information secure?',
      answer: 'Yes, we use bank-grade encryption and never store your CVV.',
      category: 'Security',
    },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const handleSubmitTicket = async () => {
    if (!supportMessage.trim()) {
      alert('Please enter your message');
      return;
    }

    try {
      const { error } = await (supabase.from('support_tickets') as any).insert([
        {
          user_id: user?.id || '',
          message: supportMessage,
          status: 'open',
        },
      ]);

      if (error) throw error;

      alert('Support ticket submitted! We will get back to you soon.');
      setSupportMessage('');
    } catch (error) {
      console.error('Error submitting ticket:', error);
      alert('Failed to submit ticket');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
        </View>

        {/* Search */}
        <Card style={styles.searchCard}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: colors.text,
                backgroundColor: colors.muted,
              },
            ]}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => Linking.openURL('tel:+911234567890')}
            >
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Call Support
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => Linking.openURL('mailto:support@towntap.com')}
            >
              <Text style={styles.actionIcon}>📧</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Email Us
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => router.push('/messages')}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                Live Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => Linking.openURL('https://wa.me/911234567890')}
            >
              <Text style={styles.actionIcon}>📱</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* FAQs by Category */}
        {categories.map((category) => (
          <Card key={category} style={styles.categoryCard}>
            <Text style={[styles.categoryTitle, { color: colors.primary }]}>
              {category}
            </Text>
            {filteredFaqs
              .filter((faq) => faq.category === category)
              .map((faq) => (
                <TouchableOpacity
                  key={faq.id}
                  style={styles.faqItem}
                  onPress={() =>
                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                  }
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>
                      {faq.question}
                    </Text>
                    <Text style={styles.faqIcon}>
                      {expandedFaq === faq.id ? '▼' : '▶'}
                    </Text>
                  </View>
                  {expandedFaq === faq.id && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                      {faq.answer}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
          </Card>
        ))}

        {/* Contact Form */}
        <Card style={styles.contactCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Still Need Help?
          </Text>
          <Text style={[styles.contactDesc, { color: colors.textSecondary }]}>
            Submit a support ticket and we'll get back to you within 24 hours.
          </Text>
          <TextInput
            style={[
              styles.messageInput,
              {
                color: colors.text,
                backgroundColor: colors.muted,
                borderColor: colors.border,
              },
            ]}
            placeholder="Describe your issue..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={6}
            value={supportMessage}
            onChangeText={setSupportMessage}
          />
          <Button
            title="Submit Ticket"
            onPress={handleSubmitTicket}
            style={([styles.submitButton, { backgroundColor: colors.primary }] as any)}
          />
        </Card>

        {/* Support Hours */}
        <Card style={styles.hoursCard}>
          <Text style={[styles.hoursTitle, { color: colors.text }]}>
            Support Hours
          </Text>
          <Text style={[styles.hoursText, { color: colors.textSecondary }]}>
            Monday - Friday: 9:00 AM - 8:00 PM
            {'\n'}
            Saturday - Sunday: 10:00 AM - 6:00 PM
            {'\n'}
            {'\n'}
            Emergency support available 24/7
          </Text>
        </Card>

        {/* Resources */}
        <Card style={styles.resourcesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Helpful Resources
          </Text>
          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>📖</Text>
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>
                User Guide
              </Text>
              <Text style={[styles.resourceDesc, { color: colors.textSecondary }]}>
                Complete guide to using TownTap
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🎥</Text>
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>
                Video Tutorials
              </Text>
              <Text style={[styles.resourceDesc, { color: colors.textSecondary }]}>
                Watch how-to videos
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceIcon}>🏘️</Text>
            <View style={styles.resourceContent}>
              <Text style={[styles.resourceTitle, { color: colors.text }]}>
                Community Forum
              </Text>
              <Text style={[styles.resourceDesc, { color: colors.textSecondary }]}>
                Connect with other users
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  searchInput: {
    padding: spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  actionsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionItem: {
    width: '47%',
    padding: spacing.md,
    backgroundColor: '#F5F5F5',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  faqItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  faqIcon: {
    fontSize: 12,
    color: '#999',
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  contactCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  contactDesc: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  submitButton: {},

  hoursCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
    backgroundColor: '#E3F2FD',
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  hoursText: {
    fontSize: 14,
    lineHeight: 22,
  },
  resourcesCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: spacing.md,
  },
  resourceIcon: {
    fontSize: 32,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  resourceDesc: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
});
