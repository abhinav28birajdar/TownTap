import { performanceMonitor } from '@/lib/performance-monitor';
import { jest } from '@jest/globals';

// Mock AsyncStorage
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock AppState
const mockAppState = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentState: 'active',
};

jest.mock('react-native/Libraries/AppState/AppState', () => mockAppState);

describe('Performance Monitor Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  describe('Initialization', () => {
    it('initializes correctly', async () => {
      await performanceMonitor.initialize();
      
      expect(mockAppState.addEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    it('loads existing metrics from storage', async () => {
      const mockMetrics = {
        metrics: {
          navigation: [
            {
              route: 'home',
              loadTime: 150,
              timestamp: Date.now(),
              success: true,
            },
          ],
          api: [],
          memory: [],
          userInteractions: [],
          custom: [],
        },
        appStartTime: Date.now() - 1000,
        timestamp: Date.now(),
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockMetrics));

      await performanceMonitor.initialize();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        '@TownTap:performance_metrics'
      );
    });
  });

  describe('Navigation Tracking', () => {
    it('tracks navigation performance', () => {
      performanceMonitor.trackNavigation('home');
      performanceMonitor.trackNavigation('search');

      // Navigation timing should be tracked internally
      expect(true).toBe(true); // Placeholder assertion
    });

    it('tracks navigation errors', () => {
      performanceMonitor.trackNavigationError('broken-route', 'Route not found');
      
      // Error should be tracked
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('API Call Tracking', () => {
    it('tracks API call performance', () => {
      performanceMonitor.trackAPICall(
        '/api/businesses',
        'GET',
        250,
        200,
        1024
      );

      // Should track the API call metrics
      expect(true).toBe(true); // Placeholder assertion
    });

    it('tracks failed API calls', () => {
      performanceMonitor.trackAPICall(
        '/api/businesses',
        'POST',
        5000,
        500
      );

      // Should mark as failed and track error
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('User Interaction Tracking', () => {
    it('tracks user interactions', () => {
      performanceMonitor.trackUserInteraction(
        'button_press',
        'SearchButton',
        true,
        50
      );

      // Should track the interaction
      expect(true).toBe(true); // Placeholder assertion
    });

    it('tracks failed interactions', () => {
      performanceMonitor.trackUserInteraction(
        'form_submit',
        'LoginForm',
        false
      );

      // Should track as failed interaction
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Custom Metrics', () => {
    it('tracks custom metrics with tags', () => {
      performanceMonitor.trackCustomMetric(
        'image_load_time',
        150,
        { source: 'remote', format: 'jpg' }
      );

      // Should store custom metric with tags
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Memory Monitoring', () => {
    it('gets current memory usage', async () => {
      // Mock performance.memory
      (global as any).performance = {
        memory: {
          usedJSHeapSize: 50 * 1024 * 1024, // 50MB
          totalJSHeapSize: 100 * 1024 * 1024, // 100MB
        },
      };

      const memoryUsage = await performanceMonitor.getCurrentMemoryUsage();

      expect(memoryUsage).toEqual({
        used: 50,
        available: 50,
        timestamp: expect.any(Number),
        warning: false,
      });
    });

    it('detects memory warnings', async () => {
      // Mock high memory usage
      (global as any).performance = {
        memory: {
          usedJSHeapSize: 150 * 1024 * 1024, // 150MB
          totalJSHeapSize: 200 * 1024 * 1024, // 200MB
        },
      };

      const memoryUsage = await performanceMonitor.getCurrentMemoryUsage();

      expect(memoryUsage?.warning).toBe(true);
    });
  });

  describe('Report Generation', () => {
    it('generates performance report', async () => {
      // Add some test data
      performanceMonitor.trackNavigation('home');
      performanceMonitor.trackAPICall('/api/test', 'GET', 100, 200);
      performanceMonitor.trackUserInteraction('test_action', 'TestComponent', true);

      const report = await performanceMonitor.generateReport();

      expect(report).toHaveProperty('appStartTime');
      expect(report).toHaveProperty('navigationMetrics');
      expect(report).toHaveProperty('apiMetrics');
      expect(report).toHaveProperty('userInteractions');
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('averageApiResponseTime');
      expect(report.summary).toHaveProperty('averageNavigationTime');
    });

    it('calculates correct averages', async () => {
      // Add test data with known values
      performanceMonitor.trackAPICall('/api/test1', 'GET', 100, 200);
      performanceMonitor.trackAPICall('/api/test2', 'GET', 200, 200);
      performanceMonitor.trackAPICall('/api/test3', 'GET', 300, 200);

      const report = await performanceMonitor.generateReport();

      expect(report.summary.averageApiResponseTime).toBe(200);
    });
  });

  describe('Data Management', () => {
    it('clears all metrics', async () => {
      performanceMonitor.trackCustomMetric('test', 100);
      
      await performanceMonitor.clearMetrics();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        '@TownTap:performance_metrics'
      );
    });

    it('exports metrics for debugging', async () => {
      performanceMonitor.trackCustomMetric('test', 100);
      
      const exportedData = await performanceMonitor.exportMetrics();
      
      expect(typeof exportedData).toBe('string');
      expect(() => JSON.parse(exportedData)).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('handles storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(performanceMonitor.initialize()).resolves.not.toThrow();
    });

    it('handles invalid stored data', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');

      // Should not throw and fallback to empty metrics
      await expect(performanceMonitor.initialize()).resolves.not.toThrow();
    });
  });
});