import { Button } from '@/components/ui/button';
import { BorderRadius, FontSize, Spacing } from '@/constants/spacing';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface Business {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  address: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  avg_rating: number;
  total_reviews: number;
  is_verified: boolean;
  opening_hours: any;
}

interface Service {
  id: string;
  title: string | null;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  customer_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function BusinessDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    loadBusinessDetails();
  }, [id]);

  const loadBusinessDetails = async () => {
    try {
      // Load business details
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (businessError) throw businessError;
      setBusiness(businessData);

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', id);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:customer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('business_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (reviewsError) throw reviewsError;
      setReviews(reviewsData || []);
    } catch (error: any) {
      console.error('Error loading business:', error);
      Alert.alert('Error', 'Failed to load business details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!selectedService) {
      Alert.alert('Select Service', 'Please select a service to continue');
      return;
    }

    console.log('Book service:', selectedService.id);
    Alert.alert('Coming Soon', 'Booking functionality will be available soon!');
  };

  const handleCall = () => {
    if (business?.phone) {
      Linking.openURL(`tel:${business.phone}`);
    }
  };

  const handleNavigate = () => {
    if (business?.latitude && business?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`;
      Linking.openURL(url);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={Colors.warning}
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Business not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: business.name,
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: Colors.card,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {business.avatar_url ? (
            <Image source={{ uri: business.avatar_url }} style={styles.image} />
          ) : (
            <LinearGradient
              colors={[Colors.primary, Colors.secondary]}
              style={styles.imagePlaceholder}
            >
              <Ionicons name="business" size={80} color={Colors.card} />
            </LinearGradient>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Business Info */}
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.businessName}>{business.name}</Text>
              {business.is_verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                </View>
              )}
            </View>

            <View style={styles.ratingRow}>
              {renderStars(Math.round(business.avg_rating))}
              <Text style={styles.ratingText}>
                {business.avg_rating.toFixed(1)} ({business.total_reviews} reviews)
              </Text>
            </View>

            {business.description && (
              <Text style={styles.description}>{business.description}</Text>
            )}

            {business.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{business.address}</Text>
              </View>
            )}

            {business.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color={Colors.primary} />
                <Text style={styles.infoText}>{business.phone}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="call" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleNavigate}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="navigate" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Navigate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="share-social" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.actionButtonText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            {services.length > 0 ? (
              services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedService?.id === service.id && styles.serviceCardSelected,
                  ]}
                  onPress={() => setSelectedService(service)}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    {service.description && (
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {service.description}
                      </Text>
                    )}
                    <View style={styles.serviceFooter}>
                      {service.price && (
                        <Text style={styles.servicePrice}>₹{service.price}</Text>
                      )}
                      {service.duration_minutes && (
                        <Text style={styles.serviceDuration}>
                          <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                          {' '}{service.duration_minutes} min
                        </Text>
                      )}
                    </View>
                  </View>
                  {selectedService?.id === service.id && (
                    <View style={styles.selectedIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>No services available</Text>
            )}
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      {review.profiles?.avatar_url ? (
                        <Image
                          source={{ uri: review.profiles.avatar_url }}
                          style={styles.reviewerAvatar}
                        />
                      ) : (
                        <View style={styles.reviewerAvatarPlaceholder}>
                          <Ionicons name="person" size={20} color={Colors.textSecondary} />
                        </View>
                      )}
                      <View>
                        <Text style={styles.reviewerName}>
                          {review.profiles?.full_name || 'Anonymous'}
                        </Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    {renderStars(review.rating)}
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No reviews yet</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          {selectedService ? (
            <>
              <Text style={styles.priceLabel}>Selected Service</Text>
              <Text style={styles.priceValue}>₹{selectedService.price}</Text>
            </>
          ) : (
            <Text style={styles.priceLabel}>Select a service</Text>
          )}
        </View>
        <Button
          title="Book Now"
          onPress={handleBookNow}
          variant="primary"
          style={styles.bookButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.card,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width,
    height: 300,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  businessName: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  verifiedBadge: {
    marginLeft: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: Spacing.xs,
  },
  ratingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionButtonText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  section: {
    backgroundColor: Colors.card,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  serviceCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  serviceCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  serviceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.primary,
    marginRight: Spacing.md,
  },
  serviceDuration: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  selectedIcon: {
    marginLeft: Spacing.sm,
  },
  noDataText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  reviewCard: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  reviewerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  reviewerName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  reviewDate: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  reviewComment: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  priceLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  priceValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  bookButton: {
    flex: 1,
  },
});