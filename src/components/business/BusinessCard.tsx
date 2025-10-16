/**
 * FILE: src/components/business/BusinessCard.tsx
 * PURPOSE: Reusable business card component to reduce duplication
 * RESPONSIBILITIES: Display business information consistently across screens
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, shadows } from '../../styles/shared';

interface BusinessCardProps {
  business: {
    id: string;
    business_name: string;
    logo_url?: string;
    category?: string;
    avg_rating?: number;
    total_reviews?: number;
    distance?: number;
    is_featured?: boolean;
    address?: {
      street?: string;
      city?: string;
    };
  };
  onPress: () => void;
  variant?: 'default' | 'horizontal' | 'compact';
  style?: ViewStyle;
  showDistance?: boolean;
  showRating?: boolean;
}

export const BusinessCard: React.FC<BusinessCardProps> = memo(({
  business,
  onPress,
  variant = 'default',
  style,
  showDistance = true,
  showRating = true,
}) => {
  const renderLogo = () => {
    if (business.logo_url) {
      return (
        <Image 
          source={{ uri: business.logo_url }} 
          style={styles.logo} 
          resizeMode="cover"
        />
      );
    }
    
    return (
      <View style={styles.logoPlaceholder}>
        <Text style={styles.logoText}>
          {business.business_name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderRating = () => {
    if (!showRating || !business.avg_rating) return null;

    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.rating}>
          {business.avg_rating.toFixed(1)}
        </Text>
        {business.total_reviews && (
          <Text style={styles.reviewCount}>
            ({business.total_reviews})
          </Text>
        )}
      </View>
    );
  };

  const renderDistance = () => {
    if (!showDistance || !business.distance) return null;

    return (
      <View style={styles.distanceContainer}>
        <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
        <Text style={styles.distance}>
          {business.distance < 1 
            ? `${Math.round(business.distance * 1000)}m`
            : `${business.distance.toFixed(1)}km`
          }
        </Text>
      </View>
    );
  };

  const getCardStyle = () => {
    switch (variant) {
      case 'horizontal':
        return [styles.card, styles.horizontalCard, style];
      case 'compact':
        return [styles.card, styles.compactCard, style];
      default:
        return [styles.card, style];
    }
  };

  const getContentStyle = () => {
    switch (variant) {
      case 'horizontal':
        return styles.horizontalContent;
      case 'compact':
        return styles.compactContent;
      default:
        return styles.content;
    }
  };

  return (
    <TouchableOpacity 
      style={getCardStyle()} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {business.is_featured && (
        <View style={styles.featuredBadge}>
          <Ionicons name="star" size={12} color="#fff" />
          <Text style={styles.featuredText}>Featured</Text>
        </View>
      )}
      
      {variant === 'horizontal' ? (
        <>
          {renderLogo()}
          <View style={getContentStyle()}>
            <Text style={styles.businessName} numberOfLines={1}>
              {business.business_name}
            </Text>
            {business.category && (
              <Text style={styles.category} numberOfLines={1}>
                {business.category}
              </Text>
            )}
            {business.address && (
              <Text style={styles.address} numberOfLines={1}>
                {business.address.street}, {business.address.city}
              </Text>
            )}
            <View style={styles.footer}>
              {renderRating()}
              {renderDistance()}
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.header}>
            {renderLogo()}
            {variant !== 'compact' && renderDistance()}
          </View>
          <View style={getContentStyle()}>
            <Text style={styles.businessName} numberOfLines={1}>
              {business.business_name}
            </Text>
            {business.category && (
              <Text style={styles.category} numberOfLines={1}>
                {business.category}
              </Text>
            )}
            {variant !== 'compact' && business.address && (
              <Text style={styles.address} numberOfLines={2}>
                {business.address.street}, {business.address.city}
              </Text>
            )}
            {renderRating()}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCard: {
    padding: spacing.sm,
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.white,
    marginLeft: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  horizontalContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  compactContent: {
    marginTop: spacing.xs,
  },
  businessName: {
    ...typography.h6,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  category: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs / 2,
  },
  address: {
    ...typography.caption,
    color: colors.text.light,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.xs / 2,
    fontWeight: '600',
  },
  reviewCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs / 2,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    ...typography.caption,
    color: colors.text.secondary,
    marginLeft: spacing.xs / 2,
  },
});

BusinessCard.displayName = 'BusinessCard';

export default BusinessCard;