import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface ExploreCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  serviceCount: number;
  color: string;
  description: string;
}

interface FeaturedCollection {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  itemCount: number;
  color: string;
}

interface SpotlightService {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  price: number;
  discount?: number;
  badge?: string;
}

const mockCategories: ExploreCategory[] = [
  {
    id: '1',
    name: 'Home Cleaning',
    icon: 'home-outline',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    serviceCount: 45,
    color: '#4CAF50',
    description: 'Professional cleaning services for your home',
  },
  {
    id: '2',
    name: 'Appliance Repair',
    icon: 'construct-outline',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    serviceCount: 38,
    color: '#2196F3',
    description: 'Fix all your home appliances',
  },
  {
    id: '3',
    name: 'Beauty & Wellness',
    icon: 'flower-outline',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    serviceCount: 52,
    color: '#E91E63',
    description: 'Salon & spa services at your doorstep',
  },
  {
    id: '4',
    name: 'Electrician',
    icon: 'flash-outline',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400',
    serviceCount: 28,
    color: '#FF9800',
    description: 'Electrical repairs and installations',
  },
  {
    id: '5',
    name: 'Plumbing',
    icon: 'water-outline',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    serviceCount: 25,
    color: '#00BCD4',
    description: 'All plumbing solutions',
  },
  {
    id: '6',
    name: 'Pest Control',
    icon: 'bug-outline',
    image: 'https://images.unsplash.com/photo-1632935191446-6794f4e7c5e7?w=400',
    serviceCount: 18,
    color: '#795548',
    description: 'Keep your home pest-free',
  },
  {
    id: '7',
    name: 'Painting',
    icon: 'color-palette-outline',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    serviceCount: 22,
    color: '#9C27B0',
    description: 'Interior & exterior painting',
  },
  {
    id: '8',
    name: 'Carpentry',
    icon: 'hammer-outline',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    serviceCount: 15,
    color: '#8D6E63',
    description: 'Custom woodwork & repairs',
  },
];

const mockCollections: FeaturedCollection[] = [
  {
    id: '1',
    title: 'Summer Specials',
    subtitle: 'Beat the heat with these services',
    image: 'https://images.unsplash.com/photo-1527383418406-f85a3b146499?w=600',
    itemCount: 12,
    color: '#FF6B6B',
  },
  {
    id: '2',
    title: 'New Home Essentials',
    subtitle: 'Everything for your new place',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
    itemCount: 18,
    color: '#4ECDC4',
  },
  {
    id: '3',
    title: 'Self-Care Sunday',
    subtitle: 'Pamper yourself this weekend',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
    itemCount: 15,
    color: '#A66CFF',
  },
];

const mockSpotlightServices: SpotlightService[] = [
  {
    id: '1',
    name: 'Complete Home Cleaning',
    category: 'Cleaning',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    rating: 4.9,
    price: 1999,
    discount: 20,
    badge: 'Best Seller',
  },
  {
    id: '2',
    name: 'AC Deep Service',
    category: 'Appliances',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    rating: 4.8,
    price: 699,
    badge: 'Popular',
  },
  {
    id: '3',
    name: 'Bridal Makeup',
    category: 'Beauty',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    rating: 4.9,
    price: 4999,
    discount: 15,
  },
  {
    id: '4',
    name: 'Full House Painting',
    category: 'Painting',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400',
    rating: 4.7,
    price: 8999,
  },
];

export default function ExploreScreen() {
  const colors = useColors();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<'categories' | 'collections'>('categories');

  const renderCategoryCard = ({ item }: { item: ExploreCategory }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/category/[name]',
          params: { name: item.name },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.categoryOverlay}
      />
      <View style={[styles.categoryIconWrapper, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={20} color="#fff" />
      </View>
      <View style={styles.categoryInfo}>
        <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
        <ThemedText style={styles.categoryCount}>{item.serviceCount} services</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderCollectionCard = ({ item }: { item: FeaturedCollection }) => (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() =>
        router.push({
          pathname: '/category/[name]',
          params: { name: item.title },
        })
      }
    >
      <Image source={{ uri: item.image }} style={styles.collectionImage} />
      <LinearGradient
        colors={['transparent', item.color + 'DD']}
        style={styles.collectionOverlay}
      />
      <View style={styles.collectionInfo}>
        <ThemedText style={styles.collectionTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.collectionSubtitle}>{item.subtitle}</ThemedText>
        <View style={styles.collectionBadge}>
          <ThemedText style={styles.collectionCount}>{item.itemCount} services</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSpotlightCard = ({ item }: { item: SpotlightService }) => (
    <TouchableOpacity
      style={[styles.spotlightCard, { backgroundColor: colors.card }]}
      onPress={() =>
        router.push({
          pathname: '/service/[id]',
          params: { id: item.id },
        })
      }
    >
      <View style={styles.spotlightImageContainer}>
        <Image source={{ uri: item.image }} style={styles.spotlightImage} />
        {item.badge && (
          <View style={[styles.spotlightBadge, { backgroundColor: colors.primary }]}>
            <ThemedText style={styles.spotlightBadgeText}>{item.badge}</ThemedText>
          </View>
        )}
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.error }]}>
            <ThemedText style={styles.discountText}>{item.discount}% OFF</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.spotlightInfo}>
        <ThemedText style={[styles.spotlightCategory, { color: colors.textSecondary }]}>
          {item.category}
        </ThemedText>
        <ThemedText style={styles.spotlightName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <View style={styles.spotlightMeta}>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFC107" />
            <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          </View>
          <ThemedText style={[styles.spotlightPrice, { color: colors.primary }]}>
            ₹{item.price}
          </ThemedText>
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
        <ThemedText style={styles.headerTitle}>Explore</ThemedText>
        <TouchableOpacity onPress={() => router.push('/search/index' as any)}>
          <Ionicons name="search-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={[colors.primary, colors.primary + 'AA']}
            style={styles.heroGradient}
          >
            <ThemedText style={styles.heroTitle}>Discover Services</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Find the perfect service for every need
            </ThemedText>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: '#fff' }]}
              onPress={() => router.push('/search/index' as any)}
            >
              <Ionicons name="compass-outline" size={18} color={colors.primary} />
              <ThemedText style={[styles.exploreBtnText, { color: colors.primary }]}>
                Start Exploring
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
            onPress={() => router.push('/discover/nearby' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="location" size={20} color="#4CAF50" />
            </View>
            <ThemedText style={styles.quickActionText}>Nearby</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
            onPress={() => router.push('/discover/popular' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flame" size={20} color="#FF9800" />
            </View>
            <ThemedText style={styles.quickActionText}>Popular</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
            onPress={() => router.push('/discover/deals' as any)}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFEBEE' }]}>
              <Ionicons name="pricetag" size={20} color="#F44336" />
            </View>
            <ThemedText style={styles.quickActionText}>Deals</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: colors.card }]}
            onPress={() => router.push('/service/recommendations')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="sparkles" size={20} color="#2196F3" />
            </View>
            <ThemedText style={styles.quickActionText}>For You</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tab Toggle */}
        <View style={styles.tabSection}>
          <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'categories' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('categories')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'categories' ? '#fff' : colors.text },
                ]}
              >
                Categories
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'collections' && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab('collections')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'collections' ? '#fff' : colors.text },
                ]}
              >
                Collections
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Grid */}
        {activeTab === 'categories' && (
          <View style={styles.categoryGrid}>
            {mockCategories.map((item) => (
              <View key={item.id} style={styles.categoryGridItem}>
                {renderCategoryCard({ item })}
              </View>
            ))}
          </View>
        )}

        {/* Collections */}
        {activeTab === 'collections' && (
          <View style={styles.collectionsSection}>
            {mockCollections.map((item) => (
              <View key={item.id}>{renderCollectionCard({ item })}</View>
            ))}
          </View>
        )}

        {/* Spotlight Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>In the Spotlight</ThemedText>
            <TouchableOpacity onPress={() => router.push('/discover/popular' as any)}>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>
                View All
              </ThemedText>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mockSpotlightServices}
            keyExtractor={(item) => item.id}
            renderItem={renderSpotlightCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.spotlightList}
          />
        </View>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner}>
          <LinearGradient
            colors={['#6C63FF', '#9D4EDD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoContent}>
              <ThemedText style={styles.promoTitle}>Refer & Earn</ThemedText>
              <ThemedText style={styles.promoSubtitle}>
                Get ₹100 off for every friend you refer
              </ThemedText>
              <View style={styles.promoBtn}>
                <ThemedText style={styles.promoBtnText}>Invite Now</ThemedText>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </View>
            <Ionicons name="gift" size={60} color="rgba(255,255,255,0.3)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </Animated.ScrollView>
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
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 24,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  categoryGridItem: {
    width: '50%',
    padding: 4,
  },
  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 140,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  categoryIconWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  categoryName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  collectionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  collectionCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  collectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  collectionSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 8,
  },
  collectionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  collectionCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  spotlightList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  spotlightCard: {
    width: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  spotlightImageContainer: {
    position: 'relative',
  },
  spotlightImage: {
    width: 160,
    height: 110,
    resizeMode: 'cover',
  },
  spotlightBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  spotlightBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  spotlightInfo: {
    padding: 10,
  },
  spotlightCategory: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
  },
  spotlightName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  spotlightMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  spotlightPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  promoSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginBottom: 12,
  },
  promoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  promoBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
