import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ServiceDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  rating: number;
  reviews: number;
  category: string;
  provider: {
    id: string;
    name: string;
    image?: string;
    rating: number;
    totalServices: number;
    verified: boolean;
  };
  images: string[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  faqs: { question: string; answer: string }[];
  availability: string;
  popularTimes: string;
}

const mockService: ServiceDetails = {
  id: '1',
  name: 'Deep Home Cleaning',
  description:
    'Professional deep cleaning service for your entire home. Our expert cleaners use eco-friendly products and advanced equipment to ensure a spotless, sanitized living space.',
  price: 1299,
  originalPrice: 1599,
  duration: '3-4 hours',
  rating: 4.8,
  reviews: 2456,
  category: 'Home Cleaning',
  provider: {
    id: '101',
    name: 'CleanPro Services',
    rating: 4.9,
    totalServices: 15420,
    verified: true,
  },
  images: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
    'https://images.unsplash.com/photo-1527515545081-5db817172677',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50',
  ],
  includes: [
    'Dusting all surfaces',
    'Vacuuming & mopping',
    'Kitchen deep clean',
    'Bathroom sanitization',
    'Window cleaning (inside)',
    'Cabinet cleaning',
    'Appliance exterior cleaning',
    'Trash removal',
  ],
  excludes: [
    'Heavy furniture moving',
    'Pest control',
    'External window cleaning',
    'Wall painting/repair',
  ],
  highlights: [
    'Eco-friendly products',
    'Trained professionals',
    'Quality assured',
    'Satisfaction guarantee',
  ],
  faqs: [
    {
      question: 'How long does the service take?',
      answer:
        'Deep cleaning typically takes 3-4 hours depending on the size of your home and condition.',
    },
    {
      question: 'Do I need to provide cleaning supplies?',
      answer:
        'No, our professionals bring all necessary cleaning supplies and equipment.',
    },
    {
      question: 'Can I reschedule my booking?',
      answer:
        'Yes, you can reschedule up to 4 hours before the scheduled time without any charges.',
    },
    {
      question: 'Is the service pet-friendly?',
      answer:
        'Yes, we use pet-safe cleaning products. Please inform us about pets during booking.',
    },
  ],
  availability: 'Available today',
  popularTimes: '10 AM - 2 PM',
};

const relatedServices = [
  { id: '2', name: 'Bathroom Deep Clean', price: 499, duration: '1 hour', rating: 4.7 },
  { id: '3', name: 'Kitchen Deep Clean', price: 599, duration: '1.5 hours', rating: 4.8 },
  { id: '4', name: 'Sofa Cleaning', price: 799, duration: '2 hours', rating: 4.6 },
  { id: '5', name: 'Carpet Cleaning', price: 899, duration: '2 hours', rating: 4.7 },
];

export default function ReviewServiceScreen() {
  const colors = useColors();
  const params = useLocalSearchParams();
  const [service] = useState<ServiceDetails>(mockService);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const discount = service.originalPrice
    ? Math.round(((service.originalPrice - service.price) / service.originalPrice) * 100)
    : 0;

  const handleBookNow = () => {
    router.push({
      pathname: '/booking/form',
      params: { serviceId: service.id, quantity: quantity.toString() },
    });
  };

  const renderImageDot = (index: number) => (
    <View
      key={index}
      style={[
        styles.imageDot,
        {
          backgroundColor:
            selectedImageIndex === index ? colors.primary : 'rgba(255,255,255,0.5)',
        },
      ]}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            backgroundColor: colors.card,
            opacity: headerOpacity,
          },
        ]}
      >
        <ThemedText style={styles.animatedHeaderTitle} numberOfLines={1}>
          {service.name}
        </ThemedText>
      </Animated.View>

      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#FF4444' : '#fff'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Ionicons name="share-social" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Image Gallery */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setShowGalleryModal(true)}
        >
          <FlatList
            data={service.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
            renderItem={({ item }) => (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item + '?w=800' }}
                  style={styles.serviceImage}
                  defaultSource={require('@/assets/images/icon.png')}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.5)']}
                  style={styles.imageGradient}
                />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
          <View style={styles.imageDots}>
            {service.images.map((_, index) => renderImageDot(index))}
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Title Section */}
          <View style={[styles.titleSection, { backgroundColor: colors.card }]}>
            <View style={styles.categoryBadge}>
              <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                {service.category}
              </ThemedText>
            </View>
            <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
            <View style={styles.ratingRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={16} color="#FFB800" />
                <ThemedText style={styles.ratingText}>{service.rating}</ThemedText>
                <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
                  ({service.reviews.toLocaleString()} reviews)
                </ThemedText>
              </View>
              <View style={styles.duration}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <ThemedText style={[styles.durationText, { color: colors.textSecondary }]}>
                  {service.duration}
                </ThemedText>
              </View>
            </View>
            <View style={styles.priceRow}>
              <View style={styles.priceLeft}>
                <ThemedText style={[styles.price, { color: colors.primary }]}>
                  ₹{service.price.toLocaleString()}
                </ThemedText>
                {service.originalPrice && (
                  <>
                    <ThemedText style={[styles.originalPrice, { color: colors.textSecondary }]}>
                      ₹{service.originalPrice.toLocaleString()}
                    </ThemedText>
                    <View style={[styles.discountBadge, { backgroundColor: colors.success + '15' }]}>
                      <ThemedText style={[styles.discountText, { color: colors.success }]}>
                        {discount}% OFF
                      </ThemedText>
                    </View>
                  </>
                )}
              </View>
              <View style={[styles.availabilityBadge, { backgroundColor: colors.success + '15' }]}>
                <View style={[styles.availabilityDot, { backgroundColor: colors.success }]} />
                <ThemedText style={[styles.availabilityText, { color: colors.success }]}>
                  {service.availability}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Provider Card */}
          <TouchableOpacity
            style={[styles.providerCard, { backgroundColor: colors.card }]}
            onPress={() => router.push({ pathname: '/provider/details' as any, params: { id: service.provider.id } })}
          >
            <View style={[styles.providerAvatar, { backgroundColor: colors.primary + '15' }]}>
              <ThemedText style={[styles.providerInitials, { color: colors.primary }]}>
                {service.provider.name.charAt(0)}
              </ThemedText>
            </View>
            <View style={styles.providerInfo}>
              <View style={styles.providerNameRow}>
                <ThemedText style={styles.providerName}>{service.provider.name}</ThemedText>
                {service.provider.verified && (
                  <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                )}
              </View>
              <View style={styles.providerStats}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <ThemedText style={[styles.providerRating, { color: colors.textSecondary }]}>
                  {service.provider.rating} • {service.provider.totalServices.toLocaleString()} services
                </ThemedText>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Highlights */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Highlights</ThemedText>
            <View style={styles.highlightsGrid}>
              {service.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <View style={[styles.highlightIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons
                      name={
                        index === 0
                          ? 'leaf'
                          : index === 1
                          ? 'person'
                          : index === 2
                          ? 'shield-checkmark'
                          : 'thumbs-up'
                      }
                      size={18}
                      color={colors.primary}
                    />
                  </View>
                  <ThemedText style={styles.highlightText}>{highlight}</ThemedText>
                </View>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>About This Service</ThemedText>
            <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
              {service.description}
            </ThemedText>
          </View>

          {/* What's Included */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>What's Included</ThemedText>
            {service.includes.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <ThemedText style={styles.includeText}>{item}</ThemedText>
              </View>
            ))}
          </View>

          {/* What's Not Included */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Not Included</ThemedText>
            {service.excludes.map((item, index) => (
              <View key={index} style={styles.includeItem}>
                <Ionicons name="close-circle" size={18} color={colors.error} />
                <ThemedText style={styles.includeText}>{item}</ThemedText>
              </View>
            ))}
          </View>

          {/* FAQs */}
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <ThemedText style={styles.sectionTitle}>Frequently Asked Questions</ThemedText>
            {service.faqs.map((faq, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, { borderBottomColor: colors.border }]}
                onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <View style={styles.faqQuestion}>
                  <ThemedText style={styles.faqQuestionText}>{faq.question}</ThemedText>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={18}
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

          {/* Related Services */}
          <View style={styles.relatedSection}>
            <ThemedText style={styles.sectionTitle}>Related Services</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedServices.map((related) => (
                <TouchableOpacity
                  key={related.id}
                  style={[styles.relatedCard, { backgroundColor: colors.card }]}
                  onPress={() =>
                    router.push({
                      pathname: '/customer/review-service' as any,
                      params: { serviceId: related.id },
                    })
                  }
                >
                  <View style={[styles.relatedIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="sparkles" size={24} color={colors.primary} />
                  </View>
                  <ThemedText style={styles.relatedName} numberOfLines={2}>
                    {related.name}
                  </ThemedText>
                  <ThemedText style={[styles.relatedDuration, { color: colors.textSecondary }]}>
                    {related.duration}
                  </ThemedText>
                  <View style={styles.relatedFooter}>
                    <ThemedText style={[styles.relatedPrice, { color: colors.primary }]}>
                      ₹{related.price}
                    </ThemedText>
                    <View style={styles.relatedRating}>
                      <Ionicons name="star" size={12} color="#FFB800" />
                      <ThemedText style={[styles.relatedRatingText, { color: colors.textSecondary }]}>
                        {related.rating}
                      </ThemedText>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Spacer */}
          <View style={{ height: 100 }} />
        </View>
      </Animated.ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            style={[styles.quantityBtn, { backgroundColor: colors.background }]}
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Ionicons name="remove" size={18} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.quantityValue}>{quantity}</ThemedText>
          <TouchableOpacity
            style={[styles.quantityBtn, { backgroundColor: colors.background }]}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Ionicons name="add" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={handleBookNow}
        >
          <ThemedText style={styles.bookBtnPrice}>
            ₹{(service.price * quantity).toLocaleString()}
          </ThemedText>
          <ThemedText style={styles.bookBtnText}>Book Now</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Gallery Modal */}
      <Modal visible={showGalleryModal} transparent animationType="fade">
        <View style={styles.galleryModal}>
          <TouchableOpacity
            style={styles.galleryClose}
            onPress={() => setShowGalleryModal(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={service.images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selectedImageIndex}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.galleryImageContainer}>
                <Image source={{ uri: item + '?w=1200' }} style={styles.galleryImage} />
              </View>
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 60,
    zIndex: 10,
  },
  animatedHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  imageContainer: {
    width,
    height: 280,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  imageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  titleSection: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  serviceName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 13,
    marginLeft: 2,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitials: {
    fontSize: 18,
    fontWeight: '700',
  },
  providerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  providerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  providerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  providerRating: {
    fontSize: 12,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 14,
  },
  highlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  highlightItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  includeText: {
    fontSize: 14,
    flex: 1,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
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
  relatedSection: {
    marginTop: 16,
    paddingLeft: 16,
  },
  relatedCard: {
    width: 140,
    padding: 14,
    borderRadius: 14,
    marginRight: 12,
  },
  relatedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  relatedName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    height: 36,
  },
  relatedDuration: {
    fontSize: 11,
    marginBottom: 8,
  },
  relatedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  relatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  relatedRatingText: {
    fontSize: 11,
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
    paddingBottom: 30,
    gap: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  bookBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  bookBtnText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  galleryModal: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  galleryClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImageContainer: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: width - 32,
    height: 400,
    resizeMode: 'contain',
  },
});
