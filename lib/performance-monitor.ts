import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import { AppState, AppStateStatus, NativeEventSubscription } from 'react-native';

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface NavigationMetric {
  route: string;
  loadTime: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface MemoryMetric {
  used: number;
  available: number;
  timestamp: number;
  warning?: boolean;
}

export interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
  size?: number;
}

export interface UserInteractionMetric {
  action: string;
  component: string;
  timestamp: number;
  duration?: number;
  success: boolean;
}

export interface PerformanceReport {
  appStartTime: number;
  timestamp?: number;
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
      await this.loadMetrics();
      this.startMemoryMonitoring();
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
      this.isMonitoring = true;
      console.log('[Performance Monitor] Initialized successfully');
    } catch (error) {
      console.error('[Performance Monitor] Initialization error:', error);
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
    
    this.saveMetrics();
  }

  /**
   * Track screen load time
   */
  trackScreenLoad(screenName: string, loadTime: number, success: boolean = true, error?: string): void {
    const metric: NavigationMetric = {
      route: screenName,
      loadTime,
      timestamp: Date.now(),
      success,
      error,
    };

    this.metrics.navigation.push(metric);
    this.trimMetrics('navigation');
    this.saveMetrics();

    console.log(`[Performance] Screen ${screenName} loaded in ${loadTime}ms`);
    
    if (loadTime > 3000) {
      console.warn(`[Performance] Slow screen load: ${screenName} took ${loadTime}ms`);
    }
  }

  /**
   * Track navigation performance
   */
  trackNavigation(route: string): void {
    if (!this.isMonitoring) return;

    if (this.currentRoute && this.routeStartTime) {
      const loadTime = Date.now() - this.routeStartTime;
      this.addNavigationMetric(this.currentRoute, loadTime, true);
    }

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
    successOrSize?: boolean | number,
    size?: number
  ): void {
    let isSuccess: boolean;
    let responseSize: number | undefined;
    
    if (typeof successOrSize === 'boolean') {
      isSuccess = successOrSize;
      responseSize = size;
    } else {
      isSuccess = status >= 200 && status < 400;
      responseSize = successOrSize;
    }

    const metric: APIMetric = {
      endpoint,
      method: method.toUpperCase(),
      duration,
      status,
      timestamp: Date.now(),
      success: isSuccess,
      size: responseSize,
    };

    this.metrics.api.push(metric);
    this.trimMetrics('api');
    this.saveMetrics();

    console.log(`[Performance] API ${method} ${endpoint}: ${duration}ms (${status})`);
    
    if (duration > 5000) {
      console.warn(`[Performance] Slow API call: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  /**
   * Track crash or error
   */
  trackCrash(error: Error, context?: string): void {
    const crashMetric: PerformanceMetric = {
      name: 'app_crash',
      value: 1,
      timestamp: Date.now(),
      tags: {
        error: error.message,
        stack: error.stack || '',
        context: context || 'unknown',
      },
    };

    this.metrics.custom.push(crashMetric);
    this.saveMetrics();

    console.error('[Performance] Crash tracked:', {
      error: error.message,
      context,
      stack: error.stack,
    });
  }

  /**
   * Track user interaction
   */
  trackInteraction(
    action: string,
    component: string,
    duration?: number,
    success: boolean = true
  ): void {
    this.trackUserInteraction(action, component, success, duration);
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
    const metric: UserInteractionMetric = {
      action,
      component,
      timestamp: Date.now(),
      duration,
      success,
    };

    this.metrics.userInteractions.push(metric);
    this.trimMetrics('userInteractions');
    this.saveMetrics();
  }

  /**
   * Track custom performance metric
   */
  trackCustomMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    };

    this.metrics.custom.push(metric);
    this.trimMetrics('custom');
    this.saveMetrics();
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    return this.generateReportSync();
  }

  /**
   * Get current memory usage
   */
  async getCurrentMemoryUsage(): Promise<MemoryMetric | null> {
    try {
      const memory = (performance as any).memory;
      const used = memory?.usedJSHeapSize || 0;
      const total = memory?.totalJSHeapSize || 0;
      
      return {
        used: used / (1024 * 1024),
        available: (total - used) / (1024 * 1024),
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
    return this.generateReportSync();
  }

  /**
   * Get realtime metrics
   */
  getRealtimeMetrics(): {
    navigation: NavigationMetric[];
    api: APIMetric[];
    memory: MemoryMetric[];
    userInteractions: UserInteractionMetric[];
    custom: PerformanceMetric[];
  } {
    return {
      navigation: [...this.metrics.navigation],
      api: [...this.metrics.api],
      memory: [...this.metrics.memory],
      userInteractions: [...this.metrics.userInteractions],
      custom: [...this.metrics.custom],
    };
  }

  /**
   * Generate performance report
   */
  async generateReport(): Promise<PerformanceReport> {
    return this.generateReportSync();
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
    console.log('[Performance Monitor] Metrics cleared');
  }

  /**
   * Export metrics for debugging
   */
  async exportMetrics(): Promise<string> {
    const report = this.generateReportSync();
    return JSON.stringify(report, null, 2);
  }

  // Private methods

  private generateReportSync(): PerformanceReport {
    const navigationMetrics = this.metrics.navigation;
    const apiMetrics = this.metrics.api;
    const memoryMetrics = this.metrics.memory;

    const avgApiTime = apiMetrics.length > 0
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
      : 0;

    const avgNavTime = navigationMetrics.length > 0
      ? navigationMetrics.reduce((sum, m) => sum + m.loadTime, 0) / navigationMetrics.length
      : 0;

    const memoryWarnings = memoryMetrics.filter(m => m.warning).length;
    const totalApiCalls = apiMetrics.length;
    const failedApiCalls = apiMetrics.filter(m => !m.success).length;
    const errorRate = totalApiCalls > 0 ? (failedApiCalls / totalApiCalls) * 100 : 0;

    return {
      appStartTime: this.appStartTime,
      timestamp: Date.now(),
      navigationMetrics,
      apiMetrics,
      memoryMetrics,
      userInteractions: this.metrics.userInteractions,
      customMetrics: this.metrics.custom,
      summary: {
        averageApiResponseTime: Math.round(avgApiTime),
        averageNavigationTime: Math.round(avgNavTime),
        totalUserInteractions: this.metrics.userInteractions.length,
        memoryWarnings,
        errorRate: Math.round(errorRate * 10) / 10,
      },
    };
  }

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
    this.memoryCheckInterval = setInterval(async () => {
      const memoryMetric = await this.getCurrentMemoryUsage();
      if (memoryMetric) {
        this.metrics.memory.push(memoryMetric);
        this.trimMetrics('memory');

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
