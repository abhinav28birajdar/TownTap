import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Deal {
  id: string;
  title: string;
  description: string;
  image: string;
  discount: number;
  discountType: 'percent' | 'flat';
  code: string;
  validTill: string;
  minOrder?: number;
  maxDiscount?: number;
  category?: string;
  isNew?: boolean;
  isTrending?: boolean;
  usedCount: number;
}

const mockDeals: Deal[] = [
  {
    id: '1',
    title: 'First Time User',
    description: 'Get flat ₹200 off on your first booking',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400',
    discount: 200,
    discountType: 'flat',
    code: 'FIRST200',
    validTill: '2024-02-29',
    isNew: true,
    usedCount: 2500,
  },
  {
    id: '2',
    title: 'Weekend Special',
    description: '30% off on all cleaning services this weekend',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    discount: 30,
    discountType: 'percent',
    code: 'WEEKEND30',
    validTill: '2024-01-28',
    maxDiscount: 500,
    category: 'Cleaning',
    isTrending: true,
    usedCount: 1200,
  },
  {
    id: '3',
    title: 'Summer AC Offer',
    description: 'Flat ₹100 off on AC service & repair',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    discount: 100,
    discountType: 'flat',
    code: 'COOLSUMMER',
    validTill: '2024-03-31',
    minOrder: 499,
    category: 'Appliances',
    usedCount: 890,
  },
  {
    id: '4',
    title: 'Beauty Bundle',
    description: '25% off on salon services at home',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    discount: 25,
    discountType: 'percent',
    code: 'GLAM25',
    validTill: '2024-02-15',
    maxDiscount: 300,
    category: 'Beauty',
    usedCount: 678,
  },
  {
    id: '5',
    title: 'Pest Free Home',
    description: 'Get 20% off on pest control services',
    image: 'https://images.unsplash.com/photo-1632935191446-6794f4e7c5e7?w=400',
    discount: 20,
    discountType: 'percent',
    code: 'PESTFREE',
    validTill: '2024-02-28',
    minOrder: 999,
    category: 'Home Care',
    usedCount: 450,
  },
];

const categories = ['All', 'Cleaning', 'Appliances', 'Beauty', 'Home Care'];

export default function DealsScreen() {
  const colors = useColors();
  const [activeCategory, setActiveCategory] = useState('All');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredDeals = mockDeals.filter(
    (d) => activeCategory === 'All' || d.category === activeCategory
  );

  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getDaysLeft = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const renderDealCard = ({ item }: { item: Deal }) => {
    const daysLeft = getDaysLeft(item.validTill);

    return (
      <View style={[styles.dealCard, { backgroundColor: colors.card }]}>
        <View style={styles.dealHeader}>
          <Image source={{ uri: item.image }} style={styles.dealImage} />
          <View style={styles.dealBadges}>
            {item.isNew && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.badgeText}>NEW</ThemedText>
              </View>
            )}
            {item.isTrending && (
              <View style={[styles.badge, { backgroundColor: '#FF5722' }]}>
                <Ionicons name="trending-up" size={12} color="#fff" />
                <ThemedText style={styles.badgeText}>Trending</ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={styles.dealContent}>
          <View style={styles.discountRow}>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'DD']}
              style={styles.discountBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <ThemedText style={styles.discountValue}>
                {item.discountType === 'percent' ? `${item.discount}%` : `₹${item.discount}`}
              </ThemedText>
              <ThemedText style={styles.discountLabel}>OFF</ThemedText>
            </LinearGradient>
            {item.category && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '15' }]}>
                <ThemedText style={[styles.categoryText, { color: colors.primary }]}>
                  {item.category}
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText style={styles.dealTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.dealDesc, { color: colors.textSecondary }]}>
            {item.description}
          </ThemedText>

          {(item.minOrder || item.maxDiscount) && (
            <View style={styles.termsRow}>
              {item.minOrder && (
                <ThemedText style={[styles.termText, { color: colors.textSecondary }]}>
                  Min order: ₹{item.minOrder}
                </ThemedText>
              )}
              {item.maxDiscount && (
                <ThemedText style={[styles.termText, { color: colors.textSecondary }]}>
                  Max discount: ₹{item.maxDiscount}
                </ThemedText>
              )}
            </View>
          )}

          <View style={styles.codeSection}>
            <View style={[styles.codeBox, { backgroundColor: colors.background }]}>
              <ThemedText style={[styles.codeText, { color: colors.primary }]}>
                {item.code}
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[
                styles.copyBtn,
                {
                  backgroundColor:
                    copiedCode === item.code ? colors.success : colors.primary,
                },
              ]}
              onPress={() => handleCopyCode(item.code)}
            >
              <Ionicons
                name={copiedCode === item.code ? 'checkmark' : 'copy-outline'}
                size={16}
                color="#fff"
              />
              <ThemedText style={styles.copyText}>
                {copiedCode === item.code ? 'Copied!' : 'Copy'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.dealFooter}>
            <View style={styles.footerLeft}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <ThemedText
                style={[
                  styles.validText,
                  { color: daysLeft <= 3 ? colors.error : colors.textSecondary },
                ]}
              >
                {daysLeft <= 0
                  ? 'Expired'
                  : daysLeft === 1
                  ? 'Expires tomorrow'
                  : `${daysLeft} days left`}
              </ThemedText>
            </View>
            <ThemedText style={[styles.usedText, { color: colors.textSecondary }]}>
              {item.usedCount.toLocaleString()} used
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Deals & Offers</ThemedText>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Banner */}
      <View style={styles.bannerSection}>
        <LinearGradient
          colors={['#FF5722', '#FF9800']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerContent}>
            <Ionicons name="flash" size={36} color="#fff" />
            <View style={styles.bannerText}>
              <ThemedText style={styles.bannerTitle}>Special Offers!</ThemedText>
              <ThemedText style={styles.bannerSubtitle}>
                Save big on your favorite services
              </ThemedText>
            </View>
          </View>
          <View style={styles.bannerDeco}>
            <ThemedText style={styles.bannerDecoText}>UP TO</ThemedText>
            <ThemedText style={styles.bannerDecoValue}>30%</ThemedText>
            <ThemedText style={styles.bannerDecoText}>OFF</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryList}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryPill,
              {
                backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                borderColor: activeCategory === cat ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setActiveCategory(cat)}
          >
            <ThemedText
              style={[
                styles.categoryPillText,
                { color: activeCategory === cat ? '#fff' : colors.text },
              ]}
            >
              {cat}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsHeader}>
        <ThemedText style={[styles.resultsCount, { color: colors.textSecondary }]}>
          {filteredDeals.length} deals available
        </ThemedText>
      </View>

      {/* Deals List */}
      <FlatList
        data={filteredDeals}
        keyExtractor={(item) => item.id}
        renderItem={renderDealCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="pricetag-outline" size={60} color={colors.textSecondary} />
            <ThemedText style={styles.emptyTitle}>No deals available</ThemedText>
            <ThemedText style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Check back later for new offers
            </ThemedText>
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
  bannerSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {},
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  bannerDeco: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bannerDecoText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  bannerDecoValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 12,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resultsHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  dealCard: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  dealHeader: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  dealBadges: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dealContent: {
    padding: 16,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  discountValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  discountLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dealDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  termsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  termText: {
    fontSize: 12,
  },
  codeSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  codeBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  copyText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  validText: {
    fontSize: 12,
  },
  usedText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
  },
});
