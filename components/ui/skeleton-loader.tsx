import { useColors, useThemeContext } from '@/contexts/theme-context';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import React, { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  variant?: 'list' | 'card' | 'profile' | 'custom';
  count?: number;
}

export const SkeletonLoader = memo(({ variant = 'list', count = 3 }: SkeletonLoaderProps) => {
  const { colorScheme } = useThemeContext();
  const colors = useColors();

  const renderSkeleton = () => {
    switch (variant) {
      case 'list':
        return <ListSkeleton count={count} colorMode={colorScheme} colors={colors} />;
      case 'card':
        return <CardSkeleton count={count} colorMode={colorScheme} colors={colors} />;
      case 'profile':
        return <ProfileSkeleton colorMode={colorScheme} colors={colors} />;
      default:
        return <ListSkeleton count={count} colorMode={colorScheme} colors={colors} />;
    }
  };

  return <View style={styles.container}>{renderSkeleton()}</View>;
});

const ListSkeleton = ({ count, colorMode, colors }: any) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <MotiView
        key={index}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 100 }}
        style={[styles.listItem, { backgroundColor: colors.card }]}
      >
        <View style={styles.listItemLeft}>
          <Skeleton colorMode={colorMode} width={48} height={48} radius={24} />
        </View>
        <View style={styles.listItemContent}>
          <Skeleton colorMode={colorMode} width="70%" height={16} />
          <View style={styles.spacer} />
          <Skeleton colorMode={colorMode} width="50%" height={14} />
        </View>
      </MotiView>
    ))}
  </>
);

const CardSkeleton = ({ count, colorMode, colors }: any) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <MotiView
        key={index}
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 100 }}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        <Skeleton colorMode={colorMode} width="100%" height={200} />
        <View style={styles.cardContent}>
          <Skeleton colorMode={colorMode} width="80%" height={20} />
          <View style={styles.spacer} />
          <Skeleton colorMode={colorMode} width="60%" height={16} />
          <View style={styles.spacer} />
          <Skeleton colorMode={colorMode} width="40%" height={14} />
        </View>
      </MotiView>
    ))}
  </>
);

const ProfileSkeleton = ({ colorMode, colors }: any) => (
  <MotiView
    from={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    style={[styles.profile, { backgroundColor: colors.card }]}
  >
    <View style={styles.profileHeader}>
      <Skeleton colorMode={colorMode} width={100} height={100} radius={50} />
      <View style={styles.spacer} />
      <Skeleton colorMode={colorMode} width={150} height={24} />
      <View style={styles.spacer} />
      <Skeleton colorMode={colorMode} width={200} height={16} />
    </View>
    
    <View style={styles.profileStats}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.statItem}>
          <Skeleton colorMode={colorMode} width={60} height={32} />
          <View style={styles.spacer} />
          <Skeleton colorMode={colorMode} width={80} height={14} />
        </View>
      ))}
    </View>
    
    <View style={styles.profileContent}>
      <Skeleton colorMode={colorMode} width="100%" height={16} />
      <View style={styles.spacer} />
      <Skeleton colorMode={colorMode} width="90%" height={16} />
      <View style={styles.spacer} />
      <Skeleton colorMode={colorMode} width="70%" height={16} />
    </View>
  </MotiView>
);

SkeletonLoader.displayName = 'SkeletonLoader';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  listItemLeft: {
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  profile: {
    padding: 24,
    borderRadius: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  profileContent: {
    marginTop: 16,
  },
  spacer: {
    height: 8,
  },
});
