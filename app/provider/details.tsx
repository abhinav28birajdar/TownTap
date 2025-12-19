import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Provider {
  id: string;
  name: string;
  avatar: string;
  coverImage: string;
  category: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  experience: string;
  location: string;
  distance: string;
  bio: string;
  isVerified: boolean;
  isAvailable: boolean;
  responseTime: string;
  languages: string[];
  certifications: string[];
  workingHours: {
    days: string;
    hours: string;
  };
  services: {
    id: string;
    name: string;
    price: number;
    duration: string;
  }[];
  gallery: string[];
  reviews: {
    id: string;
    user: {
      name: string;
      avatar: string;
    };
    rating: number;
    comment: string;
    date: string;
  }[];
  badges: {
    icon: string;
    label: string;
    color: string;
  }[];
}

const mockProvider: Provider = {
  id: '1',
  name: 'Rahul Kumar',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  coverImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
  category: 'Home Cleaning',
  specialization: 'Deep Cleaning Specialist',
  rating: 4.9,
  reviewCount: 245,
  jobsCompleted: 580,
  experience: '5 years',
  location: 'Sector 15, Gurugram',
  distance: '2.5 km',
  bio: 'Professional home cleaning expert with 5+ years of experience. Specialized in deep cleaning, move-in/move-out cleaning, and office sanitization. I take pride in delivering spotless results every time.',
  isVerified: true,
  isAvailable: true,
  responseTime: '< 30 min',
  languages: ['Hindi', 'English'],
  certifications: ['COVID-19 Safety Trained', 'Eco-Friendly Certified'],
  workingHours: {
    days: 'Mon - Sat',
    hours: '8:00 AM - 8:00 PM',
  },
  services: [
    { id: '1', name: 'Regular Cleaning', price: 499, duration: '2-3 hrs' },
    { id: '2', name: 'Deep Cleaning', price: 999, duration: '4-5 hrs' },
    { id: '3', name: 'Move-in Cleaning', price: 1499, duration: '5-6 hrs' },
    { id: '4', name: 'Office Cleaning', price: 1999, duration: '3-4 hrs' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
    'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400',
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400',
    'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=400',
  ],
  reviews: [
    {
      id: '1',
      user: { name: 'Priya M.', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
      rating: 5,
      comment: 'Excellent work! My house has never been this clean. Very professional and thorough.',
      date: '2 days ago',
    },
    {
      id: '2',
      user: { name: 'Amit S.', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
      rating: 5,
      comment: 'Rahul is punctual and does a great job. Highly recommended!',
      date: '1 week ago',
    },
    {
      id: '3',
      user: { name: 'Neha K.', avatar: 'https://randomuser.me/api/portraits/women/65.jpg' },
      rating: 4,
      comment: 'Good service overall. Could improve on communication.',
      date: '2 weeks ago',
    },
  ],
  badges: [
    { icon: 'shield-checkmark', label: 'Verified Pro', color: '#4CAF50' },
    { icon: 'star', label: 'Top Rated', color: '#FFC107' },
    { icon: 'time', label: 'Fast Response', color: '#2196F3' },
  ],
};

export default function ProviderDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isSaved, setIsSaved] = useState(false);

  const provider = mockProvider;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : i - rating < 1 ? 'star-half' : 'star-outline'}
          size={16}
          color="#FFC107"
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          { backgroundColor: colors.card, opacity: headerOpacity },
        ]}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.animatedHeaderContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.animatedHeaderTitle}>{provider.name}</ThemedText>
            <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={24}
                color={isSaved ? colors.error : colors.text}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: provider.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
          <SafeAreaView style={styles.headerOverlay}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Ionicons name="share-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
                onPress={() => setIsSaved(!isSaved)}
              >
                <Ionicons
                  name={isSaved ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isSaved ? colors.error : '#fff'}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileSection, { backgroundColor: colors.card }]}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: provider.avatar }} style={styles.avatar} />
            {provider.isVerified && (
              <View style={[styles.verifiedBadge, { backgroundColor: colors.primary }]}>
                <Ionicons name="checkmark" size={14} color="#fff" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <ThemedText style={styles.providerName}>{provider.name}</ThemedText>
            <ThemedText style={[styles.specialization, { color: colors.primary }]}>
              {provider.specialization}
            </ThemedText>
            <View style={styles.ratingRow}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <ThemedText style={styles.ratingText}>{provider.rating}</ThemedText>
              </View>
              <ThemedText style={[styles.reviewCount, { color: colors.textSecondary }]}>
                ({provider.reviewCount} reviews)
              </ThemedText>
            </View>
          </View>

          {/* Badges */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScroll}>
            {provider.badges.map((badge, index) => (
              <View
                key={index}
                style={[styles.badge, { backgroundColor: badge.color + '15' }]}
              >
                <Ionicons name={badge.icon as any} size={14} color={badge.color} />
                <ThemedText style={[styles.badgeText, { color: badge.color }]}>
                  {badge.label}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{provider.jobsCompleted}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Jobs Done
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{provider.experience}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Experience
              </ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{provider.responseTime}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                Response
              </ThemedText>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <ThemedText style={[styles.bioText, { color: colors.textSecondary }]}>
            {provider.bio}
          </ThemedText>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {provider.location} ({provider.distance})
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {provider.workingHours.days}, {provider.workingHours.hours}
              </ThemedText>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="language-outline" size={18} color={colors.textSecondary} />
              <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
                {provider.languages.join(', ')}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Services</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          {provider.services.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[styles.serviceItem, { borderBottomColor: colors.border }]}
              onPress={() =>
                router.push({
                  pathname: '/booking/form',
                  params: { serviceId: service.id, providerId: provider.id },
                })
              }
            >
              <View style={styles.serviceInfo}>
                <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
                <ThemedText style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                  {service.duration}
                </ThemedText>
              </View>
              <View style={styles.serviceRight}>
                <ThemedText style={[styles.servicePrice, { color: colors.primary }]}>
                  ₹{service.price}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gallery Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Gallery</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {provider.gallery.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
            ))}
          </ScrollView>
        </View>

        {/* Reviews Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/business-reviews/[id]',
                  params: { id: provider.id },
                })
              }
            >
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>
                All Reviews
              </ThemedText>
            </TouchableOpacity>
          </View>

          {provider.reviews.slice(0, 2).map((review) => (
            <View
              key={review.id}
              style={[styles.reviewCard, { borderBottomColor: colors.border }]}
            >
              <View style={styles.reviewHeader}>
                <Image source={{ uri: review.user.avatar }} style={styles.reviewAvatar} />
                <View style={styles.reviewUserInfo}>
                  <ThemedText style={styles.reviewUserName}>{review.user.name}</ThemedText>
                  <View style={styles.reviewRating}>{renderStars(review.rating)}</View>
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

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.chatBtn, { borderColor: colors.border }]}
          onPress={() =>
            router.push({
              pathname: '/chat/[id]',
              params: { id: provider.id },
            })
          }
        >
          <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
          <ThemedText style={styles.chatBtnText}>Chat</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={() =>
            router.push({
              pathname: '/booking/form',
              params: { providerId: provider.id },
            })
          }
        >
          <ThemedText style={styles.bookBtnText}>Book Now</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
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
    zIndex: 100,
  },
  animatedHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  animatedHeaderTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  coverContainer: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  profileSection: {
    marginTop: -60,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: -50,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  providerName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
  },
  badgeScroll: {
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  serviceInfo: {},
  serviceName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  serviceDuration: {
    fontSize: 13,
  },
  serviceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  galleryImage: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
  reviewCard: {
    paddingVertical: 14,
    borderBottomWidth: 1,
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
  reviewUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },
  chatBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  chatBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
