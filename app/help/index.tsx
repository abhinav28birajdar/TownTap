import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: number;
}

interface FAQItem {
  id: string;
  question: string;
  category: string;
}

const helpCategories: HelpCategory[] = [
  { id: '1', title: 'Booking Issues', icon: 'calendar', color: '#4CAF50', count: 15 },
  { id: '2', title: 'Payment & Refunds', icon: 'card', color: '#2196F3', count: 12 },
  { id: '3', title: 'Account Settings', icon: 'person-circle', color: '#9C27B0', count: 8 },
  { id: '4', title: 'Service Quality', icon: 'star', color: '#FF9800', count: 10 },
  { id: '5', title: 'App & Technical', icon: 'phone-portrait', color: '#E91E63', count: 6 },
  { id: '6', title: 'Safety & Trust', icon: 'shield-checkmark', color: '#00BCD4', count: 7 },
];

const popularFAQs: FAQItem[] = [
  { id: '1', question: 'How do I cancel a booking?', category: 'Booking Issues' },
  { id: '2', question: 'When will I get my refund?', category: 'Payment & Refunds' },
  { id: '3', question: 'How to reschedule my appointment?', category: 'Booking Issues' },
  { id: '4', question: 'Provider did not show up', category: 'Service Quality' },
  { id: '5', question: 'How to change my phone number?', category: 'Account Settings' },
];

const contactOptions = [
  { id: '1', title: 'Live Chat', subtitle: 'Chat with our support team', icon: 'chatbubbles', available: true },
  { id: '2', title: 'Call Us', subtitle: '+91 1800-XXX-XXXX', icon: 'call', available: true },
  { id: '3', title: 'Email Support', subtitle: 'support@towntap.com', icon: 'mail', available: true },
];

export default function HelpCenterScreen() {
  const colors = useColors();

  const handleCategoryPress = (category: HelpCategory) => {
    // Navigate to category detail
    router.push(`/customer/help-support?category=${category.id}`);
  };

  const handleFAQPress = (faq: FAQItem) => {
    // Navigate to FAQ detail
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Help Center</ThemedText>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          style={styles.heroSection}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=300' }}
            style={styles.heroImage}
          />
          <View style={styles.heroContent}>
            <ThemedText style={styles.heroTitle}>How can we help?</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Search or browse our help topics below
            </ThemedText>
            <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <ThemedText style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                Search for help...
              </ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/customer/support-tickets')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="document-text" size={22} color={colors.primary} />
            </View>
            <ThemedText style={styles.quickActionText}>My Tickets</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/orders')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: colors.info + '15' }]}>
              <Ionicons name="receipt" size={22} color={colors.info} />
            </View>
            <ThemedText style={styles.quickActionText}>Order Issues</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.card }]}>
            <View style={[styles.quickActionIcon, { backgroundColor: colors.warning + '15' }]}>
              <Ionicons name="alert-circle" size={22} color={colors.warning} />
            </View>
            <ThemedText style={styles.quickActionText}>Report Issue</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Help Categories */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Browse Topics</ThemedText>
          <View style={styles.categoriesGrid}>
            {helpCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: colors.card }]}
                onPress={() => handleCategoryPress(category)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: category.color + '15' }]}>
                  <Ionicons name={category.icon as any} size={24} color={category.color} />
                </View>
                <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
                <ThemedText style={[styles.categoryCount, { color: colors.textSecondary }]}>
                  {category.count} articles
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Popular FAQs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Popular Questions</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAllText, { color: colors.primary }]}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={[styles.faqList, { backgroundColor: colors.card }]}>
            {popularFAQs.map((faq, index) => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqItem,
                  index < popularFAQs.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }
                ]}
                onPress={() => handleFAQPress(faq)}
              >
                <View style={styles.faqContent}>
                  <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
                  <ThemedText style={[styles.faqCategory, { color: colors.textSecondary }]}>
                    {faq.category}
                  </ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
          <View style={styles.contactList}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[styles.contactCard, { backgroundColor: colors.card }]}
              >
                <View style={[styles.contactIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name={option.icon as any} size={22} color={colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactTitle}>{option.title}</ThemedText>
                  <ThemedText style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                    {option.subtitle}
                  </ThemedText>
                </View>
                {option.available && (
                  <View style={[styles.availableBadge, { backgroundColor: colors.success + '15' }]}>
                    <View style={[styles.availableDot, { backgroundColor: colors.success }]} />
                    <ThemedText style={[styles.availableText, { color: colors.success }]}>
                      Online
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.emergencyCard, { backgroundColor: colors.error + '10' }]}
            onPress={() => router.push('/customer/emergency')}
          >
            <View style={[styles.emergencyIcon, { backgroundColor: colors.error + '20' }]}>
              <Ionicons name="warning" size={28} color={colors.error} />
            </View>
            <View style={styles.emergencyContent}>
              <ThemedText style={[styles.emergencyTitle, { color: colors.error }]}>
                Emergency? Need Immediate Help?
              </ThemedText>
              <ThemedText style={[styles.emergencyText, { color: colors.textSecondary }]}>
                Access our 24/7 emergency support line
              </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <ThemedText style={[styles.appVersion, { color: colors.textSecondary }]}>
            TownTap Version 1.0.0
          </ThemedText>
          <View style={styles.appLinks}>
            <TouchableOpacity>
              <ThemedText style={[styles.appLink, { color: colors.primary }]}>Terms</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.appLinkDot, { color: colors.textSecondary }]}>•</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.appLink, { color: colors.primary }]}>Privacy</ThemedText>
            </TouchableOpacity>
            <ThemedText style={[styles.appLinkDot, { color: colors.textSecondary }]}>•</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.appLink, { color: colors.primary }]}>Guidelines</ThemedText>
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
  heroSection: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: 120,
    opacity: 0.15,
  },
  heroContent: {
    zIndex: 1,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  quickAction: {
    width: (width - 48) / 3,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 14,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  faqList: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  faqCategory: {
    fontSize: 12,
  },
  contactList: {
    gap: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
  },
  contactIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availableText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
  },
  emergencyIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 14,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 16,
  },
  appVersion: {
    fontSize: 13,
    marginBottom: 8,
  },
  appLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appLink: {
    fontSize: 13,
    fontWeight: '500',
  },
  appLinkDot: {
    fontSize: 13,
  },
});
