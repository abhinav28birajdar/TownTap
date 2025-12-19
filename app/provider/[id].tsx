import { ThemedText } from '@/components/ui';
import { useColors } from '@/contexts/theme-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Provider {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  rating: number;
  reviewCount: number;
  experience: string;
  jobsCompleted: number;
  verified: boolean;
  about: string;
  skills: string[];
  serviceAreas: string[];
  priceRange: string;
  responseTime: string;
  availability: string;
  gallery: string[];
  reviews: {
    id: string;
    customerName: string;
    avatar: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

const provider: Provider = {
  id: '1',
  name: 'Rajesh Kumar',
  avatar: 'https://via.placeholder.com/150',
  specialization: 'Deep Cleaning Expert',
  rating: 4.9,
  reviewCount: 127,
  experience: '8+ years',
  jobsCompleted: 432,
  verified: true,
  about: 'Professional deep cleaning specialist with over 8 years of experience. Trained in international cleaning standards and eco-friendly practices. I believe in delivering spotless results with attention to every detail.',
  skills: ['Deep Cleaning', 'Carpet Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization', 'Move-out Cleaning'],
  serviceAreas: ['Bandra', 'Andheri', 'Juhu', 'Powai', 'Lower Parel'],
  priceRange: '₹499 - ₹2,999',
  responseTime: 'Usually responds in 30 mins',
  availability: 'Mon-Sat, 8 AM - 8 PM',
  gallery: [
    'https://via.placeholder.com/200',
    'https://via.placeholder.com/200',
    'https://via.placeholder.com/200',
    'https://via.placeholder.com/200',
  ],
  reviews: [
    {
      id: '1',
      customerName: 'Priya Sharma',
      avatar: 'https://via.placeholder.com/50',
      rating: 5,
      comment: 'Excellent service! Rajesh was very professional and thorough. My entire house looks spotless now.',
      date: '2 days ago',
    },
    {
      id: '2',
      customerName: 'Amit Patel',
      avatar: 'https://via.placeholder.com/50',
      rating: 5,
      comment: 'Very punctual and meticulous. Great attention to detail in kitchen cleaning.',
      date: '1 week ago',
    },
    {
      id: '3',
      customerName: 'Sneha Gupta',
      avatar: 'https://via.placeholder.com/50',
      rating: 4,
      comment: 'Good work overall. Was a bit delayed but communicated well about it.',
      date: '2 weeks ago',
    },
  ],
};

export default function ProviderProfileScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Ionicons
        key={index}
        name={index < Math.floor(rating) ? 'star' : index < rating ? 'star-half' : 'star-outline'}
        size={14}
        color="#FFB800"
      />
    ));
  };

  const renderReview = ({ item }: { item: Provider['reviews'][0] }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: item.avatar }} style={styles.reviewerAvatar} />
        <View style={styles.reviewerInfo}>
          <ThemedText style={styles.reviewerName}>{item.customerName}</ThemedText>
          <View style={styles.reviewRating}>
            {renderStars(item.rating)}
            <ThemedText style={[styles.reviewDate, { color: colors.textSecondary }]}>
              • {item.date}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText style={[styles.reviewComment, { color: colors.textSecondary }]}>
        {item.comment}
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Provider Profile</ThemedText>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHeader}
        >
          <Image source={{ uri: provider.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.profileName}>{provider.name}</ThemedText>
              {provider.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                </View>
              )}
            </View>
            <ThemedText style={styles.specialization}>{provider.specialization}</ThemedText>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <ThemedText style={styles.ratingText}>
                {provider.rating} ({provider.reviewCount} reviews)
              </ThemedText>
            </View>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.primary }]}>
              {provider.experience}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Experience
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.primary }]}>
              {provider.jobsCompleted}+
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Jobs Done
            </ThemedText>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.primary }]}>
              {provider.priceRange}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Price Range
            </ThemedText>
          </View>
        </View>

        {/* Quick Info */}
        <View style={[styles.quickInfo, { backgroundColor: colors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <ThemedText style={styles.infoText}>{provider.responseTime}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <ThemedText style={styles.infoText}>{provider.availability}</ThemedText>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>About</ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            <ThemedText style={[styles.aboutText, { color: colors.textSecondary }]}>
              {provider.about}
            </ThemedText>
          </View>
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Skills & Expertise</ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            <View style={styles.skillsContainer}>
              {provider.skills.map((skill, index) => (
                <View key={index} style={[styles.skillBadge, { backgroundColor: colors.primary + '15' }]}>
                  <ThemedText style={[styles.skillText, { color: colors.primary }]}>{skill}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Service Areas */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Service Areas</ThemedText>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            <View style={styles.areasContainer}>
              {provider.serviceAreas.map((area, index) => (
                <View key={index} style={styles.areaItem}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <ThemedText style={styles.areaText}>{area}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Work Gallery</ThemedText>
            <TouchableOpacity onPress={() => setShowGalleryModal(true)}>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>View All</ThemedText>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
            {provider.gallery.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedImage(image);
                  setShowGalleryModal(true);
                }}
              >
                <Image source={{ uri: image }} style={styles.galleryImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Customer Reviews</ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAll, { color: colors.primary }]}>See All</ThemedText>
            </TouchableOpacity>
          </View>
          {provider.reviews.map((review) => (
            <View key={review.id}>{renderReview({ item: review })}</View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.background }]}
          onPress={() => setShowContactModal(true)}
        >
          <Ionicons name="chatbubble-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push(`/booking/form?providerId=${provider.id}`)}
        >
          <ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Contact Modal */}
      <Modal
        visible={showContactModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Contact Provider</ThemedText>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.contactOptions}>
              <TouchableOpacity style={[styles.contactOption, { backgroundColor: colors.background }]}>
                <View style={[styles.contactIconContainer, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="call" size={24} color={colors.success} />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactOptionTitle}>Phone Call</ThemedText>
                  <ThemedText style={[styles.contactOptionSubtitle, { color: colors.textSecondary }]}>
                    Speak directly with {provider.name}
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.contactOption, { backgroundColor: colors.background }]}>
                <View style={[styles.contactIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="chatbubbles" size={24} color={colors.primary} />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactOptionTitle}>In-App Chat</ThemedText>
                  <ThemedText style={[styles.contactOptionSubtitle, { color: colors.textSecondary }]}>
                    Message through TownTap
                  </ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.contactOption, { backgroundColor: colors.background }]}>
                <View style={[styles.contactIconContainer, { backgroundColor: '#25D366' + '15' }]}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <View style={styles.contactInfo}>
                  <ThemedText style={styles.contactOptionTitle}>WhatsApp</ThemedText>
                  <ThemedText style={[styles.contactOptionSubtitle, { color: colors.textSecondary }]}>
                    Chat on WhatsApp
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.messageInputContainer}>
              <ThemedText style={[styles.messageLabel, { color: colors.textSecondary }]}>
                Or send a quick message
              </ThemedText>
              <TextInput
                style={[styles.messageInput, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Hi, I'm interested in your services..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />
              <TouchableOpacity style={[styles.sendButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={styles.sendButtonText}>Send Message</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        visible={showGalleryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowGalleryModal(false)}
      >
        <View style={[styles.galleryModalOverlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <TouchableOpacity
            style={styles.closeGallery}
            onPress={() => setShowGalleryModal(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <FlatList
            data={provider.gallery}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.fullImage} resizeMode="contain" />
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
    fontSize: 18,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
  },
  verifiedBadge: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginLeft: 8,
    padding: 2,
  },
  specialization: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  ratingText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginTop: -15,
    marginBottom: 12,
    paddingVertical: 20,
    borderRadius: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 36,
  },
  quickInfo: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 16,
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
  viewAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionContent: {
    padding: 16,
    borderRadius: 16,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  areaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areaText: {
    fontSize: 14,
  },
  galleryScroll: {
    paddingLeft: 0,
    gap: 10,
  },
  galleryImage: {
    width: 140,
    height: 100,
    borderRadius: 12,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  reviewerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    marginLeft: 6,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    gap: 12,
  },
  contactButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactOptions: {
    gap: 12,
    marginBottom: 20,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 14,
  },
  contactOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactOptionSubtitle: {
    fontSize: 13,
  },
  messageInputContainer: {
    marginTop: 10,
  },
  messageLabel: {
    fontSize: 14,
    marginBottom: 10,
  },
  messageInput: {
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  galleryModalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  closeGallery: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: width,
    height: '100%',
  },
});
