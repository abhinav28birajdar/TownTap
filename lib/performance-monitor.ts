import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface NavigationMetric {
  route: string;
  loadTime: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface MemoryMetric {
  used: number;
  available: number;
  timestamp: number;
  warning?: boolean;
}

interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
  size?: number;
}

interface UserInteractionMetric {
  action: string;
  component: string;
  timestamp: number;
  duration?: number;
  success: boolean;
}

interface PerformanceReport {
  appStartTime: number;
  navigationMetrics: NavigationMetric[];
  apiMetrics: APIMetric[];
  memoryMetrics: MemoryMetric[];
  userInteractions: UserInteractionMetric[];
  customMetrics: PerformanceMetric[];
  summary: {
    averageApiResponseTime: number;
    averageNavigationTime: number;
    totalUserInteractions: number;
    memoryWarnings: number;
    errorRate: number;
  };
}

class PerformanceMonitorService {
  private readonly STORAGE_KEY = '@TownTap:performance_metrics';
  private readonly MAX_METRICS = 1000;
  
  private metrics: {
    navigation: NavigationMetric[];
    api: APIMetric[];
    memory: MemoryMetric[];
    userInteractions: UserInteractionMetric[];
    custom: PerformanceMetric[];
  } = {
    navigation: [],
    api: [],
    memory: [],
    userInteractions: [],
    custom: [],
  };

  private appStartTime = Date.now();
  private currentRoute = '';
  private routeStartTime = 0;
  private memoryWarningThreshold = 100; // MB
  private isMonitoring = false;
  private memoryCheckInterval?: ReturnType<typeof setInterval>;
  private appStateSubscription?: NativeEventSubscription;

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    if (this.isMonitoring) return;

    try {
      // Load existing metrics
      await this.loadMetrics();
      
      // Start memory monitoring
      this.startMemoryMonitoring();
      
      // Listen for app state changes
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
      
      this.isMonitoring = true;
      console.log('Performance monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  /**
   * Stop monitoring and cleanup
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval);
    }
    
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }
    
    // Save metrics before stopping
    this.saveMetrics();
  }

  /**
   * Track navigation performance
   */
  trackNavigation(route: string): void {
    if (!this.isMonitoring) return;

    // End previous route timing
    if (this.currentRoute && this.routeStartTime) {
      const loadTime = Date.now() - this.routeStartTime;
      this.addNavigationMetric(this.currentRoute, loadTime, true);
    }

    // Start timing new route
    this.currentRoute = route;
    this.routeStartTime = Date.now();
  }

  /**
   * Track navigation error
   */
  trackNavigationError(route: string, error: string): void {
    if (!this.isMonitoring) return;

    const loadTime = this.routeStartTime ? Date.now() - this.routeStartTime : 0;
    this.addNavigationMetric(route, loadTime, false, error);
  }

  /**
   * Track API call performance
   */
  trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    size?: number
  ): void {
    if (!this.isMonitoring) return;

    const metric: APIMetric = {
      endpoint,
      method: method.toUpperCase(),
      duration,
      status,
      timestamp: Date.now(),
      success: status >= 200 && status < 400,
      size,
    };

    this.metrics.api.push(metric);
    this.trimMetrics('api');
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(
    action: string,
    component: string,
    success = true,
    duration?: number
  ): void {
    if (!this.isMonitoring) return;

    const metric: UserInteractionMetric = {
      action,
      component,
      timestamp: Date.now(),
      duration,
      success,
    };

    this.metrics.userInteractions.push(metric);
    this.trimMetrics('userInteractions');
  }

  /**
   * Track custom performance metric
   */
  trackCustomMetric(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.isMonitoring) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.custom.push(metric);
    this.trimMetrics('custom');
  }

  /**
   * Get current memory usage
   */
  async getCurrentMemoryUsage(): Promise<MemoryMetric | null> {
    try {
      // This is a simplified version - in a real app you'd use
      // native modules to get actual memory usage
      const memory = (performance as any).memory;
      const used = memory?.usedJSHeapSize || 0;
      const total = memory?.totalJSHeapSize || 0;
      
      return {
        used: used / (1024 * 1024), // MB
        available: (total - used) / (1024 * 1024), // MB
        timestamp: Date.now(),
        warning: (used / (1024 * 1024)) > this.memoryWarningThreshold,
      };
    } catch {
      return null;
    }
  }

  /**
   * Get current metrics
   */
  async getMetrics(): Promise<PerformanceReport> {
    return this.generateReport();
  }

  /**
   * Generate performance report
   */
  async generateReport(): Promise<PerformanceReport> {
    const now = Date.now();
    
    // Calculate averages and summaries
    const avgApiTime = this.metrics.api.length > 0
      ? this.metrics.api.reduce((sum, m) => sum + m.duration, 0) / this.metrics.api.length
      : 0;

    const avgNavTime = this.metrics.navigation.length > 0
      ? this.metrics.navigation.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.navigation.length
      : 0;

    const totalErrors = this.metrics.api.filter(m => !m.success).length +
                       this.metrics.navigation.filter(m => !m.success).length +
                       this.metrics.userInteractions.filter(m => !m.success).length;

    const totalCalls = this.metrics.api.length + 
                      this.metrics.navigation.length + 
                      this.metrics.userInteractions.length;

    const memoryWarnings = this.metrics.memory.filter(m => m.warning).length;

    return {
      appStartTime: this.appStartTime,
      navigationMetrics: [...this.metrics.navigation],
      apiMetrics: [...this.metrics.api],
      memoryMetrics: [...this.metrics.memory],
      userInteractions: [...this.metrics.userInteractions],
      customMetrics: [...this.metrics.custom],
      summary: {
        averageApiResponseTime: Math.round(avgApiTime),
        averageNavigationTime: Math.round(avgNavTime),
        totalUserInteractions: this.metrics.userInteractions.length,
        memoryWarnings,
        errorRate: totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0,
      },
    };
  }

  /**
   * Clear all metrics
   */
  async clearMetrics(): Promise<void> {
    this.metrics = {
      navigation: [],
      api: [],
      memory: [],
      userInteractions: [],
      custom: [],
    };
    
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Export metrics for debugging
   */
  async exportMetrics(): Promise<string> {
    const report = await this.generateReport();
    return JSON.stringify(report, null, 2);
  }

  // Private methods

  private addNavigationMetric(
    route: string,
    loadTime: number,
    success: boolean,
    error?: string
  ): void {
    const metric: NavigationMetric = {
      route,
      loadTime,
      timestamp: Date.now(),
      success,
      error,
    };

    this.metrics.navigation.push(metric);
    this.trimMetrics('navigation');
  }

  private startMemoryMonitoring(): void {
    // Check memory every 30 seconds
    this.memoryCheckInterval = setInterval(async () => {
      const memoryMetric = await this.getCurrentMemoryUsage();
      if (memoryMetric) {
        this.metrics.memory.push(memoryMetric);
        this.trimMetrics('memory');

        // Log warning if memory usage is high
        if (memoryMetric.warning) {
          console.warn('High memory usage detected:', memoryMetric.used.toFixed(2), 'MB');
        }
      }
    }, 30000);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    if (nextAppState === 'background') {
      this.saveMetrics();
    }
  };

  private trimMetrics(type: keyof typeof this.metrics): void {
    const metrics = this.metrics[type];
    if (metrics.length > this.MAX_METRICS) {
      // Remove oldest metrics
      const toRemove = metrics.length - this.MAX_METRICS;
      metrics.splice(0, toRemove);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      const data = {
        metrics: this.metrics,
        appStartTime: this.appStartTime,
        timestamp: Date.now(),
      };
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  private async loadMetrics(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        
        // Only load recent metrics (last 24 hours)
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        
        this.metrics = {
          navigation: (parsed.metrics.navigation || []).filter((m: NavigationMetric) => m.timestamp > cutoff),
          api: (parsed.metrics.api || []).filter((m: APIMetric) => m.timestamp > cutoff),
          memory: (parsed.metrics.memory || []).filter((m: MemoryMetric) => m.timestamp > cutoff),
          userInteractions: (parsed.metrics.userInteractions || []).filter((m: UserInteractionMetric) => m.timestamp > cutoff),
          custom: (parsed.metrics.custom || []).filter((m: PerformanceMetric) => m.timestamp > cutoff),
        };
      }
    } catch (error) {
      console.error('Failed to load performance metrics:', error);
    }
  }
}

// Create and export singleton instance
export const performanceMonitor = new PerformanceMonitorService();

/**
 * React hook for tracking component performance
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = React.useRef(Date.now());
  
  React.useEffect(() => {
    const mountTime = Date.now() - startTime.current;
    performanceMonitor.trackCustomMetric('component_mount_time', mountTime, {
      component: componentName,
    });
    
    return () => {
      const unmountTime = Date.now();
      const totalTime = unmountTime - startTime.current;
      performanceMonitor.trackCustomMetric('component_total_time', totalTime, {
        component: componentName,
      });
    };
  }, [componentName]);

  const trackInteraction = React.useCallback(
    (action: string, success = true, duration?: number) => {
      performanceMonitor.trackUserInteraction(action, componentName, success, duration);
    },
    [componentName]
  );

  return { trackInteraction };
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  componentName?: string
): React.ComponentType<T> {
  const PerformanceTrackedComponent: React.FC<T> = (props) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
    usePerformanceTracking(name);
    
    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return PerformanceTrackedComponent;
}

export default performanceMonitor;