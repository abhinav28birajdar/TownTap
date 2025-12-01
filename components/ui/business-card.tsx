import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { SemanticColors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BorderRadius, Shadows } from '../../constants/theme';
import { getThemeColors, useTheme } from '../../hooks/use-theme';
import { Database } from '../../lib/database.types';
import { useBusinessStore } from '../../stores/business-store';
import { Card } from './Card';
import { Text } from './Text';
import { Button } from './button';

type Business = Database['public']['Tables']['businesses']['Row'] & {
  categories?: { name: string; icon: string | null } | null;
  services?: Array<{ name: string; price: number }>;
};

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
  distance?: number;
  style?: ViewStyle;
  variant?: 'default' | 'compact' | 'featured';
  showBookButton?: boolean;
  onBook?: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  onPress,
  distance,
  style,
  variant = 'default',
  showBookButton = false,
  onBook,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const { isFavorite, toggleFavorite } = useBusinessStore();
  const [imageError, setImageError] = useState(false);
  
  const isBusinessFavorited = isFavorite(business.id);
  
  const getCategoryIcon = (categoryName?: string): keyof typeof Ionicons.glyphMap => {
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
      'home services': 'home',
      'beauty & spa': 'flower',
      'automotive': 'car',
      'health': 'medical',
      'education': 'school',
      'technology': 'laptop',
    };

    const key = categoryName?.toLowerCase() || '';
    return icons[key] || 'briefcase';
  };
  
  const getStatusColor = (isOpen?: boolean) => {
    return isOpen ? colors.success : colors.error;
  };
  
  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < Math.floor(rating);
      const halfFilled = index === Math.floor(rating) && rating % 1 !== 0;
      
      return (
        <Ionicons
          key={index}
          name={filled ? 'star' : halfFilled ? 'star-half' : 'star-outline'}
          size={12}
          color={SemanticColors[`rating${Math.ceil(rating)}` as keyof typeof SemanticColors] || colors.warning}
          style={{ marginHorizontal: 1 }}
        />
      );
    });
  };
  
  const handleFavoriteToggle = () => {
    toggleFavorite(business.id);
  };
  
  if (variant === 'compact') {
    return (
      <Card
        variant="elevated"
        size="sm"
        pressable
        onPress={onPress}
        style={[styles.compactCard, style]}
      >
        <View style={styles.compactContainer}>
          <View style={styles.compactImageContainer}>
            {business.avatar_url && !imageError ? (
              <Image
                source={{ uri: business.avatar_url }}
                style={styles.compactImage}
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={[styles.compactImage, styles.placeholderImage]}>
                <Ionicons
                  name={getCategoryIcon(business.categories?.name)}
                  size={24}
                  color={colors.primary}
                />
              </View>
            )}
          </View>
          
          <View style={styles.compactContent}>
            <Text variant="title-small" numberOfLines={1}>
              {business.name}
            </Text>
            <View style={styles.compactRating}>
              {getRatingStars(business.avg_rating)}
              <Text variant="body-small" color="textSecondary">
                ({business.total_reviews})
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isBusinessFavorited ? 'heart' : 'heart-outline'}
              size={20}
              color={isBusinessFavorited ? colors.error : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </Card>
    );
  }
  
  if (variant === 'featured') {
    return (
      <Card
        variant="elevated"
        size="lg"
        pressable
        onPress={onPress}
        style={[styles.featuredCard, style]}
      >
        <View style={styles.featuredImageContainer}>
          {business.avatar_url && !imageError ? (
            <Image
              source={{ uri: business.avatar_url }}
              style={styles.featuredImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.featuredImage, styles.placeholderImage]}>
              <Ionicons
                name={getCategoryIcon(business.categories?.name)}
                size={48}
                color={colors.primary}
              />
            </View>
          )}
          
          {business.is_verified && (
            <MotiView
              from={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 200 }}
              style={styles.verifiedBadge}
            >
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
            </MotiView>
          )}
          
          <TouchableOpacity
            onPress={handleFavoriteToggle}
            style={[styles.favoriteButton, styles.featuredFavoriteButton]}
          >
            <Ionicons
              name={isBusinessFavorited ? 'heart' : 'heart-outline'}
              size={24}
              color={isBusinessFavorited ? colors.error : colors.background}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.featuredContent}>
          <View style={styles.featuredHeader}>
            <Text variant="headline-small" numberOfLines={1}>
              {business.name}
            </Text>
            {business.categories && (
              <View style={styles.categoryBadge}>
                <Text variant="label-small" style={{ color: colors.primaryForeground }}>
                  {business.categories.name}
                </Text>
              </View>
            )}
          </View>
          
          {business.description && (
            <Text
              variant="body-medium"
              color="textSecondary"
              numberOfLines={2}
              style={styles.description}
            >
              {business.description}
            </Text>
          )}
          
          <View style={styles.featuredMetrics}>
            <View style={styles.ratingContainer}>
              {getRatingStars(business.avg_rating)}
              <Text variant="body-small" weight="semibold">
                {business.avg_rating.toFixed(1)}
              </Text>
              <Text variant="body-small" color="textSecondary">
                ({business.total_reviews} reviews)
              </Text>
            </View>
            
            {distance !== undefined && (
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={16} color={colors.textSecondary} />
                <Text variant="body-small" color="textSecondary">
                  {distance < 1
                    ? `${(distance * 1000).toFixed(0)}m away`
                    : `${distance.toFixed(1)}km away`}
                </Text>
              </View>
            )}
          </View>
          
          {showBookButton && (
            <Button
              variant="primary"
              size="sm"
              onPress={onBook}
              style={styles.bookButton}
            >
              Book Now
            </Button>
          )}
        </View>
      </Card>
    );
  }
  
  // Default variant
  return (
    <Card
      variant="default"
      pressable
      onPress={onPress}
      style={[styles.defaultCard, style]}
    >
      <View style={styles.defaultContainer}>
        <View style={styles.imageContainer}>
          {business.avatar_url && !imageError ? (
            <Image
              source={{ uri: business.avatar_url }}
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons
                name={getCategoryIcon(business.categories?.name)}
                size={32}
                color={colors.primary}
              />
            </View>
          )}
          
          {business.is_verified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="title-medium" numberOfLines={1} style={{ flex: 1 }}>
              {business.name}
            </Text>
            
            <TouchableOpacity
              onPress={handleFavoriteToggle}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isBusinessFavorited ? 'heart' : 'heart-outline'}
                size={20}
                color={isBusinessFavorited ? colors.error : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          {business.categories && (
            <View style={styles.categoryContainer}>
              <Text variant="label-medium" color="textSecondary">
                {business.categories.name}
              </Text>
            </View>
          )}

          {business.description && (
            <Text
              variant="body-small"
              color="textSecondary"
              numberOfLines={2}
              style={styles.description}
            >
              {business.description}
            </Text>
          )}

          <View style={styles.footer}>
            <View style={styles.ratingContainer}>
              {getRatingStars(business.avg_rating)}
              <Text variant="body-small" weight="semibold">
                {business.avg_rating.toFixed(1)}
              </Text>
              <Text variant="body-small" color="textSecondary">
                ({business.total_reviews})
              </Text>
            </View>

            {distance !== undefined && (
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={14} color={colors.textSecondary} />
                <Text variant="body-small" color="textSecondary">
                  {distance < 1
                    ? `${(distance * 1000).toFixed(0)}m`
                    : `${distance.toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>

          {business.address && (
            <View style={styles.addressContainer}>
              <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
              <Text variant="body-small" color="textTertiary" numberOfLines={1}>
                {business.address}
              </Text>
            </View>
          )}
          
          {showBookButton && (
            <Button
              variant="outline"
              size="sm"
              onPress={onBook}
              style={styles.bookButton}
            >
              Book Now
            </Button>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  // Default variant styles
  defaultCard: {
    marginBottom: Spacing.md,
  },
  defaultContainer: {
    flexDirection: 'row',
  },
  
  // Compact variant styles
  compactCard: {
    marginRight: Spacing.md,
    width: 200,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactImageContainer: {
    marginRight: Spacing.sm,
  },
  compactImage: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
  },
  compactContent: {
    flex: 1,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  
  // Featured variant styles
  featuredCard: {
    marginBottom: Spacing.lg,
  },
  featuredImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  featuredImage: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
  },
  featuredContent: {},
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  featuredMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  featuredFavoriteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: BorderRadius.full,
    padding: Spacing.xs,
  },
  
  // Common styles
  imageContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  placeholderImage: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryContainer: {
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: 'rgba(37, 99, 235, 1)', // Primary color
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  description: {
    marginBottom: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  favoriteButton: {
    padding: Spacing.xs,
  },
  bookButton: {
    marginTop: Spacing.sm,
  },
});

export default BusinessCard;
