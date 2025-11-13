import { Colors } from '@/constants/colors';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/spacing';
import { Database } from '@/lib/database.types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories?: { name: string; icon: string | null } | null;
};

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
  distance?: number;
  style?: ViewStyle;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onPress,
  distance,
  style,
}) => {
  const getCategoryIcon = (categoryName?: string) => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      carpenter: 'hammer',
      plumber: 'water',
      electrician: 'flash',
      gardener: 'leaf',
      furniture: 'bed',
      cleaning: 'sparkles',
      stationery: 'book',
      catering: 'restaurant',
      barber: 'cut',
      'machine shop': 'construct',
    };

    const key = categoryName?.toLowerCase() || '';
    return icons[key] || 'briefcase';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {business.avatar_url ? (
          <Image source={{ uri: business.avatar_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons
              name={getCategoryIcon(business.categories?.name)}
              size={40}
              color={Colors.primary}
            />
          </View>
        )}
        {business.is_verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {business.name}
          </Text>
          {business.categories && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {business.categories.name}
              </Text>
            </View>
          )}
        </View>

        {business.description && (
          <Text style={styles.description} numberOfLines={2}>
            {business.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.rating}>
            <Ionicons name="star" size={16} color={Colors.star} />
            <Text style={styles.ratingText}>
              {business.avg_rating.toFixed(1)}
            </Text>
            <Text style={styles.reviewCount}>
              ({business.total_reviews})
            </Text>
          </View>

          {distance !== undefined && (
            <View style={styles.distance}>
              <Ionicons name="location" size={14} color={Colors.textSecondary} />
              <Text style={styles.distanceText}>
                {distance < 1
                  ? `${(distance * 1000).toFixed(0)}m`
                  : `${distance.toFixed(1)}km`}
              </Text>
            </View>
          )}
        </View>

        {business.address && (
          <View style={styles.addressContainer}>
            <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.address} numberOfLines={1}>
              {business.address}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  placeholderImage: {
    backgroundColor: Colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.backgroundGray,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs - 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
  },
  categoryText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs - 2,
  },
  ratingText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  reviewCount: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  distance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs - 2,
  },
  distanceText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  address: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    flex: 1,
  },
});
