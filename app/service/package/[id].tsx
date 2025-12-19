import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const mockPackageDetail = {
  id: '1',
  name: 'Complete Home Care',
  description: 'All-in-one package for your home maintenance needs. Get deep cleaning, AC service, pest control, and plumbing check all in one comprehensive package.',
  image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
  price: 4999,
  originalPrice: 7999,
  discount: 37,
  services: [
    { name: 'Deep Cleaning', worth: '₹2,499', includes: ['All rooms', 'Kitchen', 'Bathrooms'] },
    { name: 'AC Service', worth: '₹999', includes: ['Deep cleaning', 'Gas check', 'Filter wash'] },
    { name: 'Pest Control', worth: '₹1,299', includes: ['General pest', 'Anti-cockroach', 'Spray treatment'] },
    { name: 'Plumbing Check', worth: '₹999', includes: ['Leak inspection', 'Tap check', 'Drainage'] },
  ],
  duration: '6-8 hours',
  validity: '30 days from purchase',
  rating: 4.8,
  reviewCount: 234,
  bookedCount: 1250,
  savings: 3000,
  terms: [
    'Package must be used within validity period',
    'Services can be scheduled on different days',
    'Free rescheduling up to 24 hours before appointment',
    'Not valid with other offers or discounts',
    'Additional charges may apply for extra services',
  ],
  faqs: [
    { q: 'Can I use all services on different days?', a: 'Yes, you can schedule each service on different days within the validity period.' },
    { q: 'What if I need to reschedule?', a: 'You can reschedule for free up to 24 hours before the scheduled time.' },
    { q: 'Is there any refund policy?', a: 'Full refund if cancelled before first service. Partial refund based on services used.' },
  ],
  highlights: [
    { icon: 'shield-checkmark', text: 'Quality Guarantee' },
    { icon: 'sync', text: 'Free Rescheduling' },
    { icon: 'headset', text: 'Priority Support' },
    { icon: 'ribbon', text: 'Verified Professionals' },
  ],
};

export default function PackageDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showTerms, setShowTerms] = useState(false);

  const handleBuyNow = () => {
    router.push({
      pathname: '/booking/schedule',
      params: { packageId: id, price: mockPackageDetail.price.toString() },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.card }]}>
            <Ionicons name="share-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Package Image */}
        <Image source={{ uri: mockPackageDetail.image }} style={styles.heroImage} />

        {/* Discount Badge */}
        <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
          <ThemedText style={styles.discountText}>
            SAVE ₹{mockPackageDetail.savings}
          </ThemedText>
        </View>

        <View style={styles.content}>
          {/* Package Info */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.packageName}>{mockPackageDetail.name}</ThemedText>
              <View style={[styles.bestSellerBadge, { backgroundColor: '#FFC107' }]}>
                <Ionicons name="trophy" size={14} color="#fff" />
                <ThemedText style={styles.bestSellerText}>Best Seller</ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.packageDesc, { color: colors.textSecondary }]}>
              {mockPackageDetail.description}
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={18} color="#FFC107" />
              <ThemedText style={styles.statValue}>{mockPackageDetail.rating}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                ({mockPackageDetail.reviewCount} reviews)
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={18} color={colors.success} />
              <ThemedText style={styles.statValue}>
                {mockPackageDetail.bookedCount.toLocaleString()}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                booked
              </ThemedText>
            </View>
          </View>

          {/* Highlights */}
          <View style={styles.highlightsSection}>
            {mockPackageDetail.highlights.map((highlight, index) => (
              <View key={index} style={[styles.highlightItem, { backgroundColor: colors.card }]}>
                <Ionicons name={highlight.icon as any} size={18} color={colors.primary} />
                <ThemedText style={styles.highlightText}>{highlight.text}</ThemedText>
              </View>
            ))}
          </View>

          {/* Services Included */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>What's Included</ThemedText>
            {mockPackageDetail.services.map((service, index) => (
              <View key={index} style={[styles.serviceCard, { backgroundColor: colors.card }]}>
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <View style={[styles.serviceIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                    </View>
                    <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                  </View>
                  <View style={[styles.worthBadge, { backgroundColor: colors.success + '15' }]}>
                    <ThemedText style={[styles.worthText, { color: colors.success }]}>
                      Worth {service.worth}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.serviceIncludes}>
                  {service.includes.map((item, i) => (
                    <View key={i} style={styles.includeItem}>
                      <View style={[styles.includeDot, { backgroundColor: colors.primary }]} />
                      <ThemedText style={[styles.includeText, { color: colors.textSecondary }]}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Package Details */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Package Details</ThemedText>
            <View style={[styles.detailsCard, { backgroundColor: colors.card }]}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  <View>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Duration
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{mockPackageDetail.duration}</ThemedText>
                  </View>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  <View>
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>
                      Validity
                    </ThemedText>
                    <ThemedText style={styles.detailValue}>{mockPackageDetail.validity}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* FAQs */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
            {mockPackageDetail.faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, { backgroundColor: colors.card }]}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <ThemedText style={styles.faqQuestion}>{faq.q}</ThemedText>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === index && (
                  <ThemedText style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                    {faq.a}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Terms Link */}
          <TouchableOpacity
            style={[styles.termsButton, { borderColor: colors.border }]}
            onPress={() => setShowTerms(true)}
          >
            <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
            <ThemedText style={[styles.termsButtonText, { color: colors.textSecondary }]}>
              View Terms & Conditions
            </ThemedText>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.priceSection}>
          <View style={styles.priceRow}>
            <ThemedText style={[styles.currentPrice, { color: colors.primary }]}>
              ₹{mockPackageDetail.price}
            </ThemedText>
            <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
              ₹{mockPackageDetail.originalPrice}
            </ThemedText>
            <View style={[styles.discountPill, { backgroundColor: colors.success + '15' }]}>
              <ThemedText style={[styles.discountPillText, { color: colors.success }]}>
                {mockPackageDetail.discount}% OFF
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.savingsText, { color: colors.success }]}>
            You save ₹{mockPackageDetail.savings}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: colors.primary }]}
          onPress={handleBuyNow}
        >
          <ThemedText style={styles.buyButtonText}>Buy Package</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Terms Modal */}
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.termsModal, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Terms & Conditions</ThemedText>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.termsContent}>
              {mockPackageDetail.terms.map((term, index) => (
                <View key={index} style={styles.termItem}>
                  <ThemedText style={styles.termNumber}>{index + 1}.</ThemedText>
                  <ThemedText style={[styles.termText, { color: colors.textSecondary }]}>
                    {term}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.acceptButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowTerms(false)}
            >
              <ThemedText style={styles.acceptButtonText}>I Understand</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  heroImage: {
    width: width,
    height: 240,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 200,
    right: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  packageName: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  bestSellerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestSellerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  packageDesc: {
    fontSize: 14,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 13,
  },
  highlightsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  serviceCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  worthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  worthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceIncludes: {
    paddingLeft: 46,
    gap: 6,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  includeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  includeText: {
    fontSize: 13,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  termsButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 30,
    borderTopWidth: 1,
  },
  priceSection: {},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  buyButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  termsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  termsContent: {
    marginBottom: 16,
  },
  termItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  termNumber: {
    fontWeight: '600',
    width: 20,
  },
  termText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  acceptButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
