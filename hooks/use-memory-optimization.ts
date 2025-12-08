import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';

import { imageCacheService } from '@/lib/image-cache-service';
import { performanceMonitor } from '@/lib/performance-monitor';

interface MemoryUsage {
  used: number;
  available: number;
  percentage: number;
  warning: boolean;
}

interface MemoryOptimizationConfig {
  autoCleanup: boolean;
  cleanupThreshold: number; // MB
  cleanupOnBackground: boolean;
  preloadLimit: number;
  cacheLimit: number; // MB
}

/**
 * Hook for memory optimization and monitoring
 */
export function useMemoryOptimization(config: Partial<MemoryOptimizationConfig> = {}) {
  const defaultConfig: MemoryOptimizationConfig = {
    autoCleanup: true,
    cleanupThreshold: 150, // 150MB
    cleanupOnBackground: true,
    preloadLimit: 10,
    cacheLimit: 100,
  };

  const finalConfig = { ...defaultConfig, ...config };
  
  const [memoryUsage, setMemoryUsage] = useState<MemoryUsage | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const cleanupIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastCleanupRef = useRef(0);
  const appStateSubscription = useRef<NativeEventSubscription>();

  // Get current memory usage
  const getMemoryUsage = useCallback(async (): Promise<MemoryUsage | null> => {
    try {
      // Use performance.memory if available (Chrome DevTools)
      const memory = (performance as any).memory;
      if (typeof performance !== 'undefined' && memory) {
        const used = memory.usedJSHeapSize / (1024 * 1024);
        const total = memory.totalJSHeapSize / (1024 * 1024);
        const available = total - used;
        const percentage = (used / total) * 100;

        return {
          used,
          available,
          percentage,
          warning: used > finalConfig.cleanupThreshold,
        };
      }

      // Fallback for environments without performance.memory
      return null;
    } catch (error) {
      console.warn('Failed to get memory usage:', error);
      return null;
    }
  }, [finalConfig.cleanupThreshold]);

  // Perform memory cleanup
  const performCleanup = useCallback(async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    const startTime = Date.now();

    try {
      console.log('Starting memory cleanup...');

      // Clear old cache entries
      await imageCacheService.getCacheStats().then(async (stats) => {
        if (stats.totalSize > finalConfig.cacheLimit) {
          console.log('Cache size exceeded limit, clearing old entries...');
          // The image cache service will automatically cleanup old entries
        }
      });

      // Clear old performance metrics
      const report = await performanceMonitor.generateReport();
      if (report.navigationMetrics.length > 100) {
        // Keep only recent metrics
        console.log('Cleaning up old performance metrics...');
        // This would require extending the performance monitor to cleanup old data
      }

      // Clear old async storage items (if any)
      await cleanupAsyncStorage();

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const duration = Date.now() - startTime;
      lastCleanupRef.current = Date.now();
      
      console.log(`Memory cleanup completed in ${duration}ms`);
      
      // Track cleanup performance
      performanceMonitor.trackCustomMetric('memory_cleanup_duration', duration);
      
    } catch (error) {
      console.error('Memory cleanup failed:', error);
      performanceMonitor.trackCustomMetric('memory_cleanup_error', 1);
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing, finalConfig.cacheLimit]);

  // Cleanup old async storage items
  const cleanupAsyncStorage = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const oldKeys: string[] = [];

      // Check each key and determine if it's old
      for (const key of keys) {
        if (key.includes(':cache:') || key.includes(':temp:')) {
          try {
            const value = await AsyncStorage.getItem(key);
            if (value) {
              const data = JSON.parse(value);
              const age = Date.now() - (data.timestamp || 0);
              const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

              if (age > maxAge) {
                oldKeys.push(key);
              }
            }
          } catch {
            // Invalid JSON, likely safe to remove
            oldKeys.push(key);
          }
        }
      }

      if (oldKeys.length > 0) {
        await AsyncStorage.multiRemove(oldKeys);
        console.log(`Removed ${oldKeys.length} old storage items`);
      }
    } catch (error) {
      console.warn('Failed to cleanup AsyncStorage:', error);
    }
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && finalConfig.cleanupOnBackground) {
        // Cleanup when app goes to background
        performCleanup();
      }
    },
    [performCleanup, finalConfig.cleanupOnBackground]
  );

  // Monitor memory usage
  const startMemoryMonitoring = useCallback(() => {
    const checkMemory = async () => {
      const usage = await getMemoryUsage();
      if (usage) {
        setMemoryUsage(usage);

        // Auto cleanup if threshold exceeded
        if (
          finalConfig.autoCleanup &&
          usage.warning &&
          Date.now() - lastCleanupRef.current > 60000 // Wait at least 1 minute between cleanups
        ) {
          performCleanup();
        }
      }
    };

    // Check memory every 30 seconds
    cleanupIntervalRef.current = setInterval(checkMemory, 30000) as any;
    
    // Initial check
    checkMemory();
  }, [getMemoryUsage, finalConfig.autoCleanup, performCleanup]);

  // Optimize large lists
  const optimizeList = useCallback((items: any[], pageSize = 20) => {
    return {
      // Paginated data for initial render
      initialData: items.slice(0, pageSize),
      
      // Lazy load function
      loadMore: (currentPage: number) => {
        const start = currentPage * pageSize;
        const end = start + pageSize;
        return items.slice(start, end);
      },
      
      // Total pages
      totalPages: Math.ceil(items.length / pageSize),
    };
  }, []);

  // Preload optimization
  const optimizePreloading = useCallback(
    (images: string[]) => {
      // Limit preloading based on memory usage
      const limit = memoryUsage?.warning 
        ? Math.floor(finalConfig.preloadLimit / 2)
        : finalConfig.preloadLimit;
      
      return images.slice(0, limit);
    },
    [memoryUsage, finalConfig.preloadLimit]
  );

  // Initialize monitoring
  useEffect(() => {
    startMemoryMonitoring();
    appStateSubscription.current = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      if (appStateSubscription.current) {
        appStateSubscription.current.remove();
      }
    };
  }, [startMemoryMonitoring, handleAppStateChange]);

  return {
    memoryUsage,
    isOptimizing,
    performCleanup,
    optimizeList,
    optimizePreloading,
    
    // Helper functions
    shouldReduceQuality: memoryUsage?.warning || false,
    shouldDisableAnimations: memoryUsage?.percentage && memoryUsage.percentage > 80,
    recommendedBatchSize: memoryUsage?.warning ? 5 : 10,
    
    // Memory stats
    stats: {
      cacheSize: 0, // This would come from the cache service
      storageSize: 0, // This would come from storage monitoring
      lastCleanup: lastCleanupRef.current,
    },
  };
}

/**
 * HOC for automatic memory optimization
 */
export function withMemoryOptimization<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  config?: Partial<MemoryOptimizationConfig>
) {
  const MemoryOptimizedComponent: React.FC<T> = (props) => {
    const memoryOpt = useMemoryOptimization(config);
    
    // Pass memory optimization utilities as props
    const enhancedProps = {
      ...props,
      memoryOptimization: memoryOpt,
    } as T & { memoryOptimization: ReturnType<typeof useMemoryOptimization> };
    
    return React.createElement(WrappedComponent, enhancedProps);
  };

  MemoryOptimizedComponent.displayName = `withMemoryOptimization(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return MemoryOptimizedComponent;
}

/**
 * Hook for optimizing component renders based on memory usage
 */
export function useRenderOptimization() {
  const { memoryUsage, shouldReduceQuality, shouldDisableAnimations } = useMemoryOptimization();
  
  const optimizeImageProps = useCallback((props: any) => {
    if (shouldReduceQuality) {
      return {
        ...props,
        resizeMode: 'cover',
        quality: 0.7,
      };
    }
    return props;
  }, [shouldReduceQuality]);

  const optimizeAnimationProps = useCallback((props: any) => {
    if (shouldDisableAnimations) {
      return {
        ...props,
        duration: 0,
        useNativeDriver: true,
      };
    }
    return props;
  }, [shouldDisableAnimations]);

  const shouldSkipExpensiveRender = memoryUsage?.percentage && memoryUsage.percentage > 85;

  return {
    optimizeImageProps,
    optimizeAnimationProps,
    shouldSkipExpensiveRender,
    memoryUsage,
  };
}

export default useMemoryOptimization;