import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Image } from 'react-native';

interface CacheItem {
  uri: string;
  localPath: string;
  timestamp: number;
  size: number;
  lastAccessed: number;
  downloadCount: number;
}

interface CacheConfig {
  maxCacheSize: number; // in MB
  maxAge: number; // in hours
  maxItems: number;
  compressionQuality: number;
}

class ImageCacheService {
  private readonly CACHE_KEY = '@TownTap:image_cache';
  private readonly CACHE_DIR = `${FileSystem.cacheDirectory}images/`;
  
  private config: CacheConfig = {
    maxCacheSize: 100, // 100MB
    maxAge: 168, // 7 days
    maxItems: 500,
    compressionQuality: 0.8,
  };

  private cache = new Map<string, CacheItem>();
  private downloadQueue = new Set<string>();
  private initialized = false;

  /**
   * Initialize the cache service
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure cache directory exists
      await this.ensureCacheDirectory();
      
      // Load cache index from storage
      await this.loadCacheIndex();
      
      // Cleanup expired items
      await this.cleanupExpiredItems();
      
      // Cleanup if cache exceeds limits
      await this.enforceLimits();
      
      this.initialized = true;
      console.log('ImageCacheService initialized with', this.cache.size, 'items');
    } catch (error) {
      console.error('Failed to initialize ImageCacheService:', error);
    }
  }

  /**
   * Get cached image URI or download if not cached
   */
  async getCachedImage(uri: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Return original URI if it's a local file
    if (uri.startsWith('file://') || uri.startsWith('data:')) {
      return uri;
    }

    const cacheKey = this.getCacheKey(uri);
    const cachedItem = this.cache.get(cacheKey);

    // Check if we have a valid cached version
    if (cachedItem && await this.isValidCachedItem(cachedItem)) {
      // Update access time
      cachedItem.lastAccessed = Date.now();
      this.saveCacheIndex();
      return cachedItem.localPath;
    }

    // Download image if not cached or expired
    return this.downloadAndCache(uri);
  }

  /**
   * Preload images in the background
   */
  async preloadImages(uris: string[]): Promise<void> {
    const uncachedUris = uris.filter(uri => !this.cache.has(this.getCacheKey(uri)));
    
    // Limit concurrent downloads
    const batchSize = 3;
    for (let i = 0; i < uncachedUris.length; i += batchSize) {
      const batch = uncachedUris.slice(i, i + batchSize);
      await Promise.allSettled(
        batch.map(uri => this.downloadAndCache(uri, true))
      );
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    oldestItem: number;
    newestItem: number;
    hitRate: number;
  }> {
    let totalSize = 0;
    let oldestItem = Date.now();
    let newestItem = 0;

    for (const item of this.cache.values()) {
      totalSize += item.size;
      oldestItem = Math.min(oldestItem, item.timestamp);
      newestItem = Math.max(newestItem, item.timestamp);
    }

    return {
      totalItems: this.cache.size,
      totalSize: totalSize / (1024 * 1024), // MB
      oldestItem,
      newestItem,
      hitRate: await this.calculateHitRate(),
    };
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      // Remove all cached files
      await FileSystem.deleteAsync(this.CACHE_DIR, { idempotent: true });
      
      // Clear cache index
      this.cache.clear();
      await AsyncStorage.removeItem(this.CACHE_KEY);
      
      // Recreate cache directory
      await this.ensureCacheDirectory();
      
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Private methods

  private async ensureCacheDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.CACHE_DIR, { intermediates: true });
    }
  }

  private getCacheKey(uri: string): string {
    // Create a simple hash of the URI
    let hash = 0;
    for (let i = 0; i < uri.length; i++) {
      const char = uri.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async downloadAndCache(uri: string, isPreload = false): Promise<string> {
    const cacheKey = this.getCacheKey(uri);
    
    // Avoid duplicate downloads
    if (this.downloadQueue.has(cacheKey)) {
      return uri; // Return original URI for now
    }

    this.downloadQueue.add(cacheKey);

    try {
      const extension = this.getFileExtension(uri);
      const filename = `${cacheKey}${extension}`;
      const localPath = `${this.CACHE_DIR}${filename}`;

      // Download the image
      const downloadResult = await FileSystem.downloadAsync(uri, localPath);
      
      if (downloadResult.status === 200) {
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        // Create cache item
        const cacheItem: CacheItem = {
          uri,
          localPath: downloadResult.uri,
          timestamp: Date.now(),
          size: fileInfo.size || 0,
          lastAccessed: Date.now(),
          downloadCount: 1,
        };

        // Add to cache
        this.cache.set(cacheKey, cacheItem);
        
        // Save cache index
        this.saveCacheIndex();
        
        // Enforce cache limits after adding new item
        if (!isPreload) {
          this.enforceLimits();
        }

        return downloadResult.uri;
      } else {
        console.warn('Failed to download image:', uri, downloadResult.status);
        return uri;
      }
    } catch (error) {
      console.error('Error downloading image:', uri, error);
      return uri;
    } finally {
      this.downloadQueue.delete(cacheKey);
    }
  }

  private async isValidCachedItem(item: CacheItem): Promise<boolean> {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(item.localPath);
    if (!fileInfo.exists) {
      return false;
    }

    // Check if item is expired
    const ageHours = (Date.now() - item.timestamp) / (1000 * 60 * 60);
    if (ageHours > this.config.maxAge) {
      return false;
    }

    return true;
  }

  private async loadCacheIndex(): Promise<void> {
    try {
      const cacheData = await AsyncStorage.getItem(this.CACHE_KEY);
      if (cacheData) {
        const parsed = JSON.parse(cacheData);
        this.cache = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load cache index:', error);
    }
  }

  private async saveCacheIndex(): Promise<void> {
    try {
      const cacheData = Object.fromEntries(this.cache);
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to save cache index:', error);
    }
  }

  private async cleanupExpiredItems(): Promise<void> {
    const now = Date.now();
    const maxAgeMs = this.config.maxAge * 60 * 60 * 1000;
    const expiredKeys: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > maxAgeMs) {
        expiredKeys.push(key);
        
        // Delete file
        try {
          await FileSystem.deleteAsync(item.localPath, { idempotent: true });
        } catch (error) {
          console.warn('Failed to delete expired cache file:', error);
        }
      }
    }

    // Remove from cache
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log('Cleaned up', expiredKeys.length, 'expired cache items');
    }
  }

  private async enforceLimits(): Promise<void> {
    let totalSize = 0;
    const items = Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      ...item,
    }));

    // Calculate total size
    totalSize = items.reduce((sum, item) => sum + item.size, 0);

    // Check size limit
    const maxSizeBytes = this.config.maxCacheSize * 1024 * 1024;
    if (totalSize > maxSizeBytes || this.cache.size > this.config.maxItems) {
      // Sort by last accessed (LRU)
      items.sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Remove items until within limits
      let itemsToRemove = 0;
      if (this.cache.size > this.config.maxItems) {
        itemsToRemove = this.cache.size - this.config.maxItems;
      }
      
      while (totalSize > maxSizeBytes && itemsToRemove < items.length) {
        itemsToRemove++;
        totalSize -= items[itemsToRemove - 1].size;
      }

      // Remove items
      for (let i = 0; i < itemsToRemove; i++) {
        const item = items[i];
        try {
          await FileSystem.deleteAsync(item.localPath, { idempotent: true });
          this.cache.delete(item.key);
        } catch (error) {
          console.warn('Failed to delete cache file during cleanup:', error);
        }
      }

      if (itemsToRemove > 0) {
        console.log('Removed', itemsToRemove, 'cache items to enforce limits');
      }
    }
  }

  private getFileExtension(uri: string): string {
    try {
      const url = new URL(uri);
      const pathname = url.pathname;
      const match = pathname.match(/\.[^.]+$/);
      return match ? match[0] : '.jpg';
    } catch {
      return '.jpg';
    }
  }

  private async calculateHitRate(): Promise<number> {
    // This is a simplified calculation
    // In a real implementation, you might track hits/misses
    const stats = await AsyncStorage.getItem('@TownTap:cache_stats');
    if (stats) {
      const { hits, misses } = JSON.parse(stats);
      return hits / (hits + misses) * 100;
    }
    return 0;
  }
}

// Create and export singleton instance
export const imageCacheService = new ImageCacheService();

/**
 * React hook for cached images
 */
export function useCachedImage(uri: string | undefined) {
  const [cachedUri, setCachedUri] = React.useState<string | undefined>(uri);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!uri) {
      setCachedUri(undefined);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    imageCacheService
      .getCachedImage(uri)
      .then(cachedPath => {
        if (isMounted) {
          setCachedUri(cachedPath);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setCachedUri(uri); // Fallback to original URI
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uri]);

  return { cachedUri, isLoading, error };
}

/**
 * Optimized Image component with caching
 */
interface CachedImageProps {
  source: { uri: string };
  style?: any;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const CachedImage: React.FC<CachedImageProps> = React.memo(({
  source,
  style,
  placeholder,
  onLoad,
  onError,
}) => {
  const { cachedUri, isLoading, error } = useCachedImage(source.uri);

  if (isLoading && placeholder) {
    return <>{placeholder}</>;
  }

  return (
    <Image
      source={{ uri: cachedUri || source.uri }}
      style={style}
      onLoad={onLoad}
      onError={onError}
    />
  );
});

export default imageCacheService;