/**
 * Service Provider Profile - Phase 4
 * View service provider details and ratings
 */

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  years_experience: number;
  verified: boolean;
  profile_image?: string;
  services: string[];
  hourly_rate?: number;
  availability_status: 'available' | 'busy' | 'offline';
  response_time: string;
  completion_rate: number;
}

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ServiceProviderProfilePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const providerId = params.id as string;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderData();
  }, [providerId]);

  const loadProviderData = async () => {
    try {
      setLoading(true);

      // Load provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;
      if (providerData) setProvider(providerData);

      // Load reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          customers (
            full_name
          )
        `)
        .eq('business_id', providerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;
      if (reviewsData) {
        setReviews(
          reviewsData.map((r: any) => ({
            id: r.id,
            customer_name: r.customers?.full_name || 'Anonymous',
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    router.push(`/messages/chat/${providerId}`);
  };

  const handleCall = () => {
    alert('Calling service provider...');
  };

  if (loading || !provider) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'busy':
        return '#F59E0B';
      case 'offline':
        return '#999';
      default:
        return '#999';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Provider Info Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {provider.profile_image ? (
                <Image
                  source={{ uri: provider.profile_image }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>
                    {provider.business_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              {provider.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedIcon}>✓</Text>
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.businessName, { color: colors.text }]}>
                {provider.business_name}
              </Text>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(provider.availability_status) },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                  {provider.availability_status.charAt(0).toUpperCase() +
                    provider.availability_status.slice(1)}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingValue}>⭐ {provider.rating.toFixed(1)}</Text>
                <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>
                  ({provider.total_reviews} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Message"
              onPress={handleMessage}
              style={([styles.messageButton, { backgroundColor: colors.primary }] as any)}
            />
            <Button
              title="Call"
              onPress={handleCall}
              style={([styles.callButton, { backgroundColor: '#10B981' }] as any)}
            />
          </View>
        </Card>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {provider.total_bookings}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completed
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {provider.years_experience}yr
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Experience
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {provider.completion_rate}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Success Rate
              </Text>
            </View>
          </View>
        </Card>

        {/* About */}
        <Card style={styles.aboutCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {provider.description}
          </Text>
        </Card>

        {/* Services */}
        <Card style={styles.servicesCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          <View style={styles.servicesTags}>
            {provider.services.map((service, index) => (
              <Badge key={index} text={service} variant="info" />
            ))}
          </View>
          {provider.hourly_rate && (
            <View style={styles.rateInfo}>
              <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>
                Hourly Rate:
              </Text>
              <Text style={[styles.rateValue, { color: colors.primary }]}>
                ₹{provider.hourly_rate}/hr
              </Text>
            </View>
          )}
        </Card>

        {/* Response Time */}
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⚡</Text>
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>
                Response Time
              </Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                Usually responds within {provider.response_time}
              </Text>
            </View>
          </View>
        </Card>

        {/* Reviews */}
        <Card style={styles.reviewsCard}>
          <View style={styles.reviewsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
            <TouchableOpacity
              onPress={() => router.push(`/business-reviews/${providerId}` as any)}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewerName, { color: colors.text }]}>
                  {review.customer_name}
                </Text>
                <Text style={styles.reviewRating}>⭐ {review.rating}</Text>
              </View>
              <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                {review.comment}
              </Text>
              <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
                {new Date(review.created_at).toLocaleDateString('en-IN')}
              </Text>
            </View>
          ))}

          {reviews.length === 0 && (
            <Text style={[styles.noReviews, { color: colors.textSecondary }]}>
              No reviews yet
            </Text>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  profileCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  verifiedIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewCount: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageButton: {
    flex: 1,
  },
  callButton: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  aboutCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  servicesCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  rateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rateLabel: {
    fontSize: 14,
  },
  rateValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoIcon: {
    fontSize: 32,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: 14,
  },
  reviewsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewRating: {
    fontSize: 14,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontSize: 12,
  },
  noReviews: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
