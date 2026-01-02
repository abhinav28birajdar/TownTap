import { FlashList } from '@shopify/flash-list';
import { MotiView } from 'moti';
import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    RefreshControl,
    StyleSheet,
    View,
} from 'react-native';

// Components - direct imports to avoid require cycle
import { BusinessCard } from '@/components/ui/business-card';
import LoadingScreen from '@/components/ui/loading-screen';
import { Text } from '@/components/ui/Text';

// Services and hooks
import { imageCacheService } from '@/lib/image-cache-service';
import { performanceMonitor, usePerformanceTracking } from '@/lib/performance-monitor';
import { SearchResult } from '@/lib/search-service';

// Theme and constants
import { Spacing } from '@/constants/spacing';
import { Shadows } from '@/constants/theme';
import { getThemeColors, useTheme } from '@/hooks/use-theme';

interface OptimizedBusinessListProps {
  data: SearchResult[];
  onBusinessPress: (business: SearchResult) => void;
  onEndReached?: () => void;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  loading?: boolean;
  emptyComponent?: React.ReactNode;
  showDistance?: boolean;
  showReviews?: boolean;
  showOpenStatus?: boolean;
  numColumns?: number;
  horizontal?: boolean;
  estimatedItemSize?: number;
  enableVirtualization?: boolean;
  preloadImages?: boolean;
  onViewableItemsChanged?: (items: SearchResult[]) => void;
}

interface BusinessListItemProps {
  item: SearchResult;
  index: number;
  onPress: (business: SearchResult) => void;
  showDistance?: boolean;
  showReviews?: boolean;
  showOpenStatus?: boolean;
  style?: any;
}

// Memoized business item component
const BusinessListItem = memo<BusinessListItemProps>(({
  item,
  index,
  onPress,
  showDistance = true,
  showReviews = true,
  showOpenStatus = true,
  style,
}) => {
  const { trackInteraction } = usePerformanceTracking('BusinessListItem');
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handlePress = useCallback(() => {
    const startTime = Date.now();
    
    trackInteraction('business_card_press', true);
    onPress(item);
    
    const duration = Date.now() - startTime;
    performanceMonitor.trackCustomMetric('business_card_press_duration', duration);
  }, [item, onPress, trackInteraction]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay: index * 50,
      }}
      style={[styles.itemContainer, style]}
    >
      <BusinessCard
        business={item.business}
        onPress={handlePress}
        style={styles.businessCard}
      />
      
      {/* Image loading indicator */}
      {!imageLoaded && item.business.avatar_url && (
        <View style={styles.imageLoadingOverlay}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </MotiView>
  );
});

BusinessListItem.displayName = 'BusinessListItem';

export const OptimizedBusinessList = memo<OptimizedBusinessListProps>(({
  data,
  onBusinessPress,
  onEndReached,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyComponent,
  showDistance = true,
  showReviews = true,
  showOpenStatus = true,
  numColumns = 1,
  horizontal = false,
  estimatedItemSize = 200,
  enableVirtualization = true,
  preloadImages = true,
  onViewableItemsChanged,
}) => {
  const { colorScheme } = useTheme();
  const colors = getThemeColors(colorScheme);
  const { trackInteraction } = usePerformanceTracking('OptimizedBusinessList');
  
  const flatListRef = useRef<FlatList>(null);
  const flashListRef = useRef<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewableItems, setViewableItems] = useState<SearchResult[]>([]);

  // Memoized data with preloading
  const optimizedData = useMemo(() => {
    if (preloadImages && data.length > 0) {
      // Preload first few images
      const imagesToPreload = data
        .slice(0, 10)
        .map(item => item.business.avatar_url)
        .filter(Boolean) as string[];
      
      if (imagesToPreload.length > 0) {
        imageCacheService.preloadImages(imagesToPreload);
      }
    }
    
    return data;
  }, [data, preloadImages]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      trackInteraction('list_refresh', true);
      
      try {
        await onRefresh();
        trackInteraction('list_refresh_success', true);
      } catch (error) {
        trackInteraction('list_refresh_error', false);
        console.error('Refresh error:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh, trackInteraction]);

  // Handle end reached (pagination)
  const handleEndReached = useCallback(() => {
    if (onEndReached && !loading && !isRefreshing) {
      trackInteraction('list_pagination', true);
      onEndReached();
    }
  }, [onEndReached, loading, isRefreshing, trackInteraction]);

  // Handle viewable items changed
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems: newViewableItems }: { viewableItems: any[] }) => {
      const items = newViewableItems.map(({ item }) => item);
      setViewableItems(items);
      
      if (onViewableItemsChanged) {
        onViewableItemsChanged(items);
      }
      
      // Track viewability metrics
      performanceMonitor.trackCustomMetric('visible_items_count', items.length);
    },
    [onViewableItemsChanged]
  );

  // Render business item
  const renderBusinessItem = useCallback(
    ({ item, index }: { item: SearchResult; index: number }) => (
      <BusinessListItem
        item={item}
        index={index}
        onPress={onBusinessPress}
        showDistance={showDistance}
        showReviews={showReviews}
        showOpenStatus={showOpenStatus}
      />
    ),
    [onBusinessPress, showDistance, showReviews, showOpenStatus]
  );

  // Key extractor
  const keyExtractor = useCallback(
    (item: SearchResult) => `business-${item.business.id}`,
    []
  );

  // Get item layout for optimization
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: estimatedItemSize,
      offset: estimatedItemSize * index,
      index,
    }),
    [estimatedItemSize]
  );

  // Footer component for loading more
  const renderFooter = useCallback(() => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text variant="body-small" style={styles.footerText}>
          Loading more...
        </Text>
      </View>
    );
  }, [loading, colors.primary]);

  // Empty list component
  const renderEmpty = useCallback(() => {
    if (loading && data.length === 0) {
      return <LoadingScreen message="Loading businesses..." />;
    }
    
    return (
      emptyComponent || (
        <View style={styles.emptyContainer}>
          <Text variant="title-medium" style={styles.emptyTitle}>
            No businesses found
          </Text>
          <Text variant="body-medium" style={styles.emptyMessage}>
            Try adjusting your search or filters
          </Text>
        </View>
      )
    );
  }, [loading, data.length, emptyComponent]);

  // Refresh control
  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing || isRefreshing}
        onRefresh={handleRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressViewOffset={Spacing.lg}
      />
    ),
    [refreshing, isRefreshing, handleRefresh, colors.primary]
  );

  // Use FlashList for better performance when virtualization is enabled
  if (enableVirtualization && !horizontal) {
    return (
      <FlashList
        ref={flashListRef}
        data={optimizedData}
        renderItem={renderBusinessItem}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
          minimumViewTime: 500,
        }}
        refreshControl={refreshControl}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />
    );
  }

  // Fallback to regular FlatList
  return (
    <FlatList
      ref={flatListRef}
      data={optimizedData}
      renderItem={renderBusinessItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      horizontal={horizontal}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
        minimumViewTime: 500,
      }}
      getItemLayout={data.length > 100 ? getItemLayout : undefined}
      removeClippedSubviews={data.length > 20}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      refreshControl={refreshControl}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.listContainer,
        horizontal && styles.horizontalContainer,
      ]}
      ItemSeparatorComponent={() => (
        <View style={horizontal ? { width: Spacing.md } : { height: Spacing.md }} />
      )}
    />
  );
});

OptimizedBusinessList.displayName = 'OptimizedBusinessList';

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  listContainer: {
    padding: Spacing.lg,
    minHeight: 200,
  },
  horizontalContainer: {
    paddingVertical: Spacing.md,
  },
  itemContainer: {
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  businessCard: {
    marginBottom: 0,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: Spacing.xs,
    ...Shadows.small,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  footerText: {
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontWeight: '600',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default OptimizedBusinessList;