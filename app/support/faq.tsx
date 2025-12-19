import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FAQCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
}

interface FAQItem {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
}

const categories: FAQCategory[] = [
  { id: 'general', title: 'General', icon: 'help-circle', color: '#415D43' },
  { id: 'booking', title: 'Bookings', icon: 'calendar', color: '#2196F3' },
  { id: 'payment', title: 'Payments', icon: 'card', color: '#4CAF50' },
  { id: 'services', title: 'Services', icon: 'construct', color: '#FF9800' },
  { id: 'account', title: 'Account', icon: 'person', color: '#9C27B0' },
  { id: 'safety', title: 'Safety', icon: 'shield-checkmark', color: '#E53935' },
];

const faqItems: FAQItem[] = [
  {
    id: '1',
    categoryId: 'general',
    question: 'What is TownTap?',
    answer: 'TownTap is a local services marketplace that connects you with trusted service providers in your area. From home repairs to beauty services, we make booking local services easy and reliable.',
  },
  {
    id: '2',
    categoryId: 'general',
    question: 'How does TownTap work?',
    answer: 'Simply browse services or search for what you need, select a provider based on ratings and reviews, choose your preferred date and time, and confirm your booking. The service provider will arrive at your location at the scheduled time.',
  },
  {
    id: '3',
    categoryId: 'general',
    question: 'Is TownTap available in my city?',
    answer: 'TownTap is currently available in major cities across India. We\'re expanding rapidly! Check the app to see if services are available in your area.',
  },
  {
    id: '4',
    categoryId: 'booking',
    question: 'How do I book a service?',
    answer: 'Select the service you need, choose a provider, pick your preferred date and time slot, add your address, and confirm payment. You\'ll receive a confirmation with all the details.',
  },
  {
    id: '5',
    categoryId: 'booking',
    question: 'Can I reschedule a booking?',
    answer: 'Yes! You can reschedule your booking up to 2 hours before the scheduled time. Go to My Bookings, select the booking, and tap "Reschedule" to choose a new time.',
  },
  {
    id: '6',
    categoryId: 'booking',
    question: 'How do I cancel a booking?',
    answer: 'You can cancel your booking from the My Bookings section. Please note that cancellation charges may apply depending on how close to the scheduled time you cancel.',
  },
  {
    id: '7',
    categoryId: 'payment',
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, UPI, net banking, and cash on delivery. You can also pay using your TownTap Wallet balance.',
  },
  {
    id: '8',
    categoryId: 'payment',
    question: 'Is my payment information secure?',
    answer: 'Yes! We use industry-standard encryption and security measures. Your card details are never stored on our servers and all transactions are processed through secure payment gateways.',
  },
  {
    id: '9',
    categoryId: 'payment',
    question: 'How do refunds work?',
    answer: 'If eligible for a refund, the amount will be credited to your original payment method within 5-7 business days. Wallet refunds are instant.',
  },
  {
    id: '10',
    categoryId: 'services',
    question: 'How are service providers verified?',
    answer: 'All our service providers go through a rigorous verification process including ID verification, background checks, skill assessment, and training. Only approved providers can offer services on TownTap.',
  },
  {
    id: '11',
    categoryId: 'services',
    question: 'What if I\'m not satisfied with the service?',
    answer: 'Your satisfaction is our priority. If you\'re not happy with the service, please report the issue within 24 hours. We\'ll arrange a re-service or process a refund as appropriate.',
  },
  {
    id: '12',
    categoryId: 'account',
    question: 'How do I update my profile?',
    answer: 'Go to Profile > Edit Profile to update your name, phone number, email, and profile picture. You can also manage your addresses from the Addresses section.',
  },
  {
    id: '13',
    categoryId: 'account',
    question: 'How do I delete my account?',
    answer: 'To delete your account, go to Settings > Account > Delete Account. Please note that this action is irreversible and all your data will be permanently deleted.',
  },
  {
    id: '14',
    categoryId: 'safety',
    question: 'What safety measures are in place?',
    answer: 'All providers are verified, you can track your service provider\'s arrival, we have an SOS button for emergencies, and all bookings are logged for your safety.',
  },
  {
    id: '15',
    categoryId: 'safety',
    question: 'How do I report a safety concern?',
    answer: 'You can use the SOS feature for immediate assistance or report an issue through the app. Our safety team is available 24/7 to address any concerns.',
  },
];

export default function FAQScreen() {
  const colors = useColors();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqItems.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? item.categoryId === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getCategoryInfo = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>FAQs</ThemedText>
        <TouchableOpacity onPress={() => router.push('/support/live-chat')}>
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search questions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categorySection}>
        <FlatList
          horizontal
          data={[{ id: null, title: 'All', icon: 'apps', color: colors.primary }, ...categories]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          keyExtractor={(item) => item.id || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                {
                  backgroundColor:
                    selectedCategory === item.id
                      ? item.color + '20'
                      : colors.card,
                  borderColor:
                    selectedCategory === item.id ? item.color : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons
                name={item.icon as any}
                size={16}
                color={selectedCategory === item.id ? item.color : colors.textSecondary}
              />
              <ThemedText
                style={[
                  styles.categoryPillText,
                  {
                    color:
                      selectedCategory === item.id ? item.color : colors.text,
                  },
                ]}
              >
                {item.title}
              </ThemedText>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* FAQs List */}
      <FlatList
        data={filteredFAQs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.faqList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={colors.border} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No results found
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              Try a different search term or category
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const isExpanded = expandedItems.includes(item.id);
          const category = getCategoryInfo(item.categoryId);
          return (
            <TouchableOpacity
              style={[styles.faqCard, { backgroundColor: colors.card }]}
              onPress={() => toggleExpand(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <View
                    style={[
                      styles.categoryDot,
                      { backgroundColor: category?.color },
                    ]}
                  />
                  <ThemedText style={styles.questionText} numberOfLines={isExpanded ? undefined : 2}>
                    {item.question}
                  </ThemedText>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              {isExpanded && (
                <View style={[styles.answerContainer, { borderTopColor: colors.border }]}>
                  <ThemedText style={[styles.answerText, { color: colors.textSecondary }]}>
                    {item.answer}
                  </ThemedText>
                  <View style={styles.helpfulSection}>
                    <ThemedText style={[styles.helpfulText, { color: colors.textSecondary }]}>
                      Was this helpful?
                    </ThemedText>
                    <View style={styles.helpfulButtons}>
                      <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: colors.success + '15' }]}>
                        <Ionicons name="thumbs-up" size={16} color={colors.success} />
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.helpfulButton, { backgroundColor: colors.error + '15' }]}>
                        <Ionicons name="thumbs-down" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View style={styles.footerSection}>
            <View style={[styles.contactCard, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name="chatbubbles" size={32} color={colors.primary} />
              <ThemedText style={styles.contactTitle}>Still have questions?</ThemedText>
              <ThemedText style={[styles.contactText, { color: colors.textSecondary }]}>
                Our support team is here to help
              </ThemedText>
              <TouchableOpacity
                style={[styles.contactButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/support/live-chat')}
              >
                <ThemedText style={styles.contactButtonText}>Chat with us</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  categorySection: {
    marginBottom: 8,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  faqList: {
    padding: 16,
    paddingTop: 8,
  },
  faqCard: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    marginTop: 0,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    paddingTop: 12,
  },
  helpfulSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  helpfulText: {
    fontSize: 13,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  helpfulButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
  },
  footerSection: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  contactCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 16,
  },
  contactButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
