import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  rating: number;
  reviews: number;
  image: string;
  popular?: boolean;
}

const serviceDetails = {
  id: 'deep-cleaning',
  name: 'Deep Home Cleaning',
  category: 'Cleaning Services',
  description: 'Professional deep cleaning service for your home. Our trained experts will clean every corner of your house including hard-to-reach areas, ensuring a spotless and sanitized living space.',
  highlights: [
    'Professional & trained cleaners',
    'Eco-friendly cleaning products',
    'All equipment provided',
    'Satisfaction guaranteed',
    'Fully insured service',
  ],
  rating: 4.8,
  totalReviews: 2547,
  completedJobs: 12500,
  images: [
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
    'https://via.placeholder.com/400x300',
  ],
  packages: [
    {
      id: 'basic',
      name: 'Basic Clean',
      description: '1 BHK deep cleaning with bathroom',
      price: 999,
      originalPrice: 1499,
      duration: '2-3 hours',
      includes: ['Living room', '1 Bedroom', '1 Bathroom', 'Kitchen'],
    },
    {
      id: 'standard',
      name: 'Standard Clean',
      description: '2 BHK deep cleaning with bathrooms',
      price: 1499,
      originalPrice: 1999,
      duration: '3-4 hours',
      includes: ['Living room', '2 Bedrooms', '2 Bathrooms', 'Kitchen', 'Balcony'],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium Clean',
      description: '3 BHK+ complete deep cleaning',
      price: 2499,
      originalPrice: 2999,
      duration: '4-5 hours',
      includes: ['All rooms', 'All bathrooms', 'Kitchen', 'Balconies', 'Windows'],
    },
  ],
  addons: [
    { id: 'balcony', name: 'Balcony Cleaning', price: 299 },
    { id: 'window', name: 'Window Cleaning', price: 199 },
    { id: 'carpet', name: 'Carpet Shampooing', price: 499 },
    { id: 'sofa', name: 'Sofa Cleaning', price: 599 },
    { id: 'fridge', name: 'Fridge Cleaning', price: 299 },
  ],
  process: [
    { step: 1, title: 'Book', description: 'Choose your package and schedule' },
    { step: 2, title: 'Confirm', description: 'We assign trained professionals' },
    { step: 3, title: 'Service', description: 'Our team arrives at your doorstep' },
    { step: 4, title: 'Done', description: 'Enjoy your sparkling clean home' },
  ],
  reviews: [
    {
      id: '1',
      user: 'Priya S.',
      avatar: 'https://via.placeholder.com/50',
      rating: 5,
      comment: 'Excellent service! The team was punctual and very thorough.',
      date: 'Dec 20, 2024',
    },
    {
      id: '2',
      user: 'Rahul M.',
      avatar: 'https://via.placeholder.com/50',
      rating: 4,
      comment: 'Good cleaning, the bathroom looks brand new.',
      date: 'Dec 18, 2024',
    },
  ],
  faqs: [
    { question: 'What products do you use?', answer: 'We use eco-friendly, non-toxic cleaning products that are safe for children and pets.' },
    { question: 'Do I need to provide any equipment?', answer: 'No, our team brings all the necessary equipment and cleaning supplies.' },
    { question: 'What if I am not satisfied?', answer: 'We offer a 100% satisfaction guarantee. If you are not happy, we will re-clean free of charge.' },
  ],
};

export default function ServiceDetailScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const selectedPkg = serviceDetails.packages.find(p => p.id === selectedPackage);
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = serviceDetails.addons.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = (selectedPkg?.price || 0) + addonsTotal;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="heart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageGallery}
        >
          {serviceDetails.images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
          ))}
        </ScrollView>

        {/* Service Info */}
        <View style={styles.content}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
            <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
              {serviceDetails.category}
            </ThemedText>
          </View>
          <ThemedText style={styles.serviceName}>{serviceDetails.name}</ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <ThemedText style={styles.statText}>
                {serviceDetails.rating} ({serviceDetails.totalReviews.toLocaleString()})
              </ThemedText>
            </View>
            <View style={styles.statDot} />
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <ThemedText style={styles.statText}>
                {serviceDetails.completedJobs.toLocaleString()} Bookings
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            {serviceDetails.description}
          </ThemedText>

          {/* Highlights */}
          <View style={styles.highlightsSection}>
            <ThemedText style={styles.sectionTitle}>Service Highlights</ThemedText>
            <View style={styles.highlightsGrid}>
              {serviceDetails.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                  <ThemedText style={styles.highlightText}>{highlight}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Packages */}
          <View style={styles.packagesSection}>
            <ThemedText style={styles.sectionTitle}>Choose Package</ThemedText>
            {serviceDetails.packages.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  { backgroundColor: colors.card },
                  selectedPackage === pkg.id && { borderColor: colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setSelectedPackage(pkg.id)}
              >
                <View style={styles.packageHeader}>
                  <View style={styles.packageInfo}>
                    {pkg.popular && (
                      <View style={[styles.popularBadge, { backgroundColor: colors.warning }]}>
                        <ThemedText style={styles.popularText}>Popular</ThemedText>
                      </View>
                    )}
                    <ThemedText style={styles.packageName}>{pkg.name}</ThemedText>
                    <ThemedText style={[styles.packageDescription, { color: colors.textSecondary }]}>
                      {pkg.description}
                    </ThemedText>
                  </View>
                  <View style={styles.packagePrice}>
                    <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
                      ₹{pkg.originalPrice}
                    </ThemedText>
                    <ThemedText style={[styles.currentPrice, { color: colors.primary }]}>
                      ₹{pkg.price}
                    </ThemedText>
                    <ThemedText style={[styles.duration, { color: colors.textSecondary }]}>
                      {pkg.duration}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.packageIncludes}>
                  {pkg.includes.map((item, index) => (
                    <View key={index} style={[styles.includeTag, { backgroundColor: colors.background }]}>
                      <ThemedText style={[styles.includeText, { color: colors.textSecondary }]}>
                        {item}
                      </ThemedText>
                    </View>
                  ))}
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPackage === pkg.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}>
                  {selectedPackage === pkg.id && (
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add-ons */}
          <View style={styles.addonsSection}>
            <ThemedText style={styles.sectionTitle}>Add-on Services</ThemedText>
            <View style={styles.addonsGrid}>
              {serviceDetails.addons.map((addon) => (
                <TouchableOpacity
                  key={addon.id}
                  style={[
                    styles.addonCard,
                    { backgroundColor: colors.card },
                    selectedAddons.includes(addon.id) && { borderColor: colors.primary, borderWidth: 1 }
                  ]}
                  onPress={() => toggleAddon(addon.id)}
                >
                  <View style={[
                    styles.addonCheckbox,
                    selectedAddons.includes(addon.id) && { backgroundColor: colors.primary, borderColor: colors.primary }
                  ]}>
                    {selectedAddons.includes(addon.id) && (
                      <Ionicons name="checkmark" size={12} color="#FFF" />
                    )}
                  </View>
                  <ThemedText style={styles.addonName}>{addon.name}</ThemedText>
                  <ThemedText style={[styles.addonPrice, { color: colors.primary }]}>
                    +₹{addon.price}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* How It Works */}
          <View style={styles.processSection}>
            <ThemedText style={styles.sectionTitle}>How It Works</ThemedText>
            <View style={styles.processSteps}>
              {serviceDetails.process.map((step, index) => (
                <View key={step.step} style={styles.processStep}>
                  <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.stepNumberText}>{step.step}</ThemedText>
                  </View>
                  {index < serviceDetails.process.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: colors.primary }]} />
                  )}
                  <ThemedText style={styles.stepTitle}>{step.title}</ThemedText>
                  <ThemedText style={[styles.stepDescription, { color: colors.textSecondary }]}>
                    {step.description}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews */}
          <View style={styles.reviewsSection}>
            <View style={styles.reviewsHeader}>
              <ThemedText style={styles.sectionTitle}>Customer Reviews</ThemedText>
              <TouchableOpacity onPress={() => setShowAllReviews(true)}>
                <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
              </TouchableOpacity>
            </View>
            {serviceDetails.reviews.slice(0, 2).map((review) => (
              <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.card }]}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
                  <View style={styles.reviewInfo}>
                    <ThemedText style={styles.reviewUser}>{review.user}</ThemedText>
                    <View style={styles.reviewRating}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color="#FFB800"
                        />
                      ))}
                    </View>
                  </View>
                  <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
                    {review.date}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.reviewComment, { color: colors.textSecondary }]}>
                  {review.comment}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* FAQs */}
          <View style={styles.faqSection}>
            <ThemedText style={styles.sectionTitle}>FAQs</ThemedText>
            {serviceDetails.faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqCard, { backgroundColor: colors.card }]}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqHeader}>
                  <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === index && (
                  <ThemedText style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                    {faq.answer}
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
        <View style={styles.priceInfo}>
          <ThemedText style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          <ThemedText style={[styles.totalPrice, { color: colors.primary }]}>
            ₹{totalPrice.toLocaleString()}
          </ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/booking/form')}
        >
          <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
        </TouchableOpacity>
      </View>
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
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    maxWidth: 40,
  },
  imageGallery: {
    height: 300,
  },
  galleryImage: {
    width: width,
    height: 300,
  },
  content: {
    padding: 16,
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
    marginHorizontal: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  highlightsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 14,
  },
  highlightsGrid: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightText: {
    fontSize: 14,
  },
  packagesSection: {
    marginBottom: 24,
  },
  packageCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  packageInfo: {
    flex: 1,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  popularText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  packageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  packageDescription: {
    fontSize: 13,
  },
  packagePrice: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
  },
  duration: {
    fontSize: 12,
    marginTop: 2,
  },
  packageIncludes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  includeTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  includeText: {
    fontSize: 12,
  },
  radioButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addonsSection: {
    marginBottom: 24,
  },
  addonsGrid: {
    gap: 10,
  },
  addonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  addonCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addonName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  processSection: {
    marginBottom: 24,
  },
  processSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  processStep: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    zIndex: 1,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    position: 'absolute',
    top: 18,
    left: '50%',
    width: '100%',
    height: 2,
    zIndex: 0,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCard: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 18,
  },
  faqSection: {
    marginBottom: 24,
  },
  faqCard: {
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
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  priceInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  bookButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
