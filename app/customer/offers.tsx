import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Clipboard,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  discountType: 'percentage' | 'flat';
  minAmount: number;
  maxDiscount?: number;
  validUntil: string;
  code: string;
  category?: string;
  image: string;
  terms: string[];
  isNew?: boolean;
  isExpiring?: boolean;
}

const bannerOffers = [
  {
    id: 'banner1',
    title: 'New Year Special',
    subtitle: 'Flat 30% OFF on all services',
    code: 'NEWYEAR30',
    gradient: ['#FF6B6B', '#FF8E53'],
    image: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400',
  },
  {
    id: 'banner2',
    title: 'First Order Offer',
    subtitle: 'Get ₹150 OFF on your first booking',
    code: 'FIRST150',
    gradient: ['#667EEA', '#764BA2'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  },
];

const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Flat ₹200 OFF',
    description: 'On home cleaning services',
    discount: '₹200',
    discountType: 'flat',
    minAmount: 699,
    validUntil: 'Dec 31, 2024',
    code: 'CLEAN200',
    category: 'Cleaning',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    terms: ['Valid on orders above ₹699', 'Cannot be combined with other offers'],
    isNew: true,
  },
  {
    id: '2',
    title: '25% OFF',
    description: 'On AC repair & maintenance',
    discount: '25%',
    discountType: 'percentage',
    minAmount: 499,
    maxDiscount: 300,
    validUntil: 'Jan 15, 2025',
    code: 'AC25',
    category: 'AC Repair',
    image: 'https://images.unsplash.com/photo-1631545806609-1d242e217cb5?w=400',
    terms: ['Valid on orders above ₹499', 'Maximum discount ₹300'],
  },
  {
    id: '3',
    title: '₹100 Cashback',
    description: 'On all electrical services',
    discount: '₹100',
    discountType: 'flat',
    minAmount: 399,
    validUntil: 'Dec 25, 2024',
    code: 'ELEC100',
    category: 'Electrician',
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400',
    terms: ['Cashback credited within 48 hours', 'Valid once per user'],
    isExpiring: true,
  },
  {
    id: '4',
    title: '15% OFF',
    description: 'On plumbing services',
    discount: '15%',
    discountType: 'percentage',
    minAmount: 299,
    maxDiscount: 200,
    validUntil: 'Jan 31, 2025',
    code: 'PLUMB15',
    category: 'Plumber',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    terms: ['Valid on orders above ₹299', 'Maximum discount ₹200'],
  },
];

const categories = ['All', 'Cleaning', 'AC Repair', 'Electrician', 'Plumber', 'Carpentry'];

export default function PromotionalOffersScreen() {
  const colors = useColors();
  const [promoCode, setPromoCode] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredOffers = activeCategory === 'All'
    ? mockOffers
    : mockOffers.filter(offer => offer.category === activeCategory);

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      // Validate promo code
      console.log('Applying promo:', promoCode);
    }
  };

  const renderBanner = ({ item }: { item: typeof bannerOffers[0] }) => (
    <TouchableOpacity
      style={styles.bannerCard}
      activeOpacity={0.9}
      onPress={() => handleCopyCode(item.code)}
    >
      <LinearGradient
        colors={item.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bannerGradient}
      >
        <View style={styles.bannerContent}>
          <ThemedText style={styles.bannerTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.bannerSubtitle}>{item.subtitle}</ThemedText>
          <View style={styles.bannerCode}>
            <ThemedText style={styles.bannerCodeText}>Code: {item.code}</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderOffer = ({ item }: { item: Offer }) => (
    <TouchableOpacity
      style={[styles.offerCard, { backgroundColor: colors.card }]}
      activeOpacity={0.8}
    >
      {/* Badges */}
      {item.isNew && (
        <View style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.badgeText}>NEW</ThemedText>
        </View>
      )}
      {item.isExpiring && (
        <View style={[styles.badge, styles.expiringBadge]}>
          <ThemedText style={styles.badgeText}>EXPIRING SOON</ThemedText>
        </View>
      )}

      <Image source={{ uri: item.image }} style={styles.offerImage} />
      
      <View style={styles.offerContent}>
        <View style={styles.offerHeader}>
          <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.discountText}>{item.discount}</ThemedText>
          </View>
          {item.category && (
            <ThemedText style={[styles.categoryTag, { color: colors.textSecondary }]}>
              {item.category}
            </ThemedText>
          )}
        </View>
        
        <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        <ThemedText style={[styles.offerDescription, { color: colors.textSecondary }]}>
          {item.description}
        </ThemedText>
        
        <View style={styles.offerMeta}>
          <ThemedText style={[styles.minAmount, { color: colors.textSecondary }]}>
            Min. order: ₹{item.minAmount}
          </ThemedText>
          <ThemedText style={[styles.validity, { color: colors.textSecondary }]}>
            Valid till {item.validUntil}
          </ThemedText>
        </View>
        
        <View style={styles.offerFooter}>
          <View style={[styles.codeBox, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.codeText, { color: colors.primary }]}>
              {item.code}
            </ThemedText>
          </View>
          
          <TouchableOpacity
            style={[
              styles.copyButton,
              {
                backgroundColor: copiedCode === item.code ? colors.success : colors.primary,
              },
            ]}
            onPress={() => handleCopyCode(item.code)}
          >
            <Ionicons
              name={copiedCode === item.code ? 'checkmark' : 'copy-outline'}
              size={16}
              color="#FFF"
            />
            <ThemedText style={styles.copyButtonText}>
              {copiedCode === item.code ? 'Copied!' : 'Copy'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Offers & Promotions</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Promo Code Input */}
        <View style={styles.promoSection}>
          <View style={[styles.promoInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="pricetag-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.promoTextInput, { color: colors.text }]}
              placeholder="Enter promo code"
              placeholderTextColor={colors.textSecondary}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: promoCode.trim() ? colors.primary : colors.border },
              ]}
              onPress={handleApplyPromo}
              disabled={!promoCode.trim()}
            >
              <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Carousel */}
        <FlatList
          horizontal
          data={bannerOffers}
          renderItem={renderBanner}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
          snapToInterval={SCREEN_WIDTH - 48}
          decelerationRate="fast"
        />

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: activeCategory === category ? colors.primary : colors.card,
                  borderColor: activeCategory === category ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  activeCategory === category && { color: '#FFF' },
                ]}
              >
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Offers List */}
        <View style={styles.offersSection}>
          <ThemedText style={styles.sectionTitle}>
            {filteredOffers.length} Offers Available
          </ThemedText>
          
          {filteredOffers.map((offer) => (
            <View key={offer.id}>
              {renderOffer({ item: offer })}
            </View>
          ))}
          
          {filteredOffers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="pricetags-outline" size={64} color={colors.textSecondary} />
              <ThemedText style={styles.emptyTitle}>No Offers Available</ThemedText>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Check back later for exciting offers in this category
              </ThemedText>
            </View>
          )}
        </View>

        {/* Terms Section */}
        <View style={[styles.termsSection, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.termsTitle}>Terms & Conditions</ThemedText>
          <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
            • Offers are subject to availability and can be withdrawn without prior notice.
          </ThemedText>
          <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
            • Each offer can be used only once per user unless specified otherwise.
          </ThemedText>
          <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
            • Offers cannot be combined with other promotions or discounts.
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
  promoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  promoInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 12,
    overflow: 'hidden',
  },
  promoTextInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  applyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  bannerList: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  bannerCard: {
    width: SCREEN_WIDTH - 48,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  bannerContent: {},
  bannerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 12,
  },
  bannerCode: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bannerCodeText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  offersSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  offerCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  expiringBadge: {
    backgroundColor: '#F59E0B',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  offerImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0E0',
  },
  offerContent: {
    padding: 16,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  categoryTag: {
    fontSize: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  offerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  minAmount: {
    fontSize: 12,
  },
  validity: {
    fontSize: 12,
  },
  offerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  copyButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  termsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  termsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 20,
  },
});
