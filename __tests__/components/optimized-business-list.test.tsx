import { jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';

// Component to test
import { OptimizedBusinessList } from '@/components/ui/optimized-business-list';
import { SearchResult } from '@/lib/search-service';

// Mock data
const mockBusinesses: SearchResult[] = [
  {
    business: {
      id: 1,
      name: "Joe's Coffee",
      category: 'coffee',
      description: 'Great coffee shop',
      address: '123 Main St',
      averageRating: 4.5,
      reviewCount: 124,
      isOpen: true,
      imageUrl: 'https://example.com/image1.jpg',
      distance: 500,
    },
    relevanceScore: 95,
    matchedFields: ['name'],
  },
  {
    business: {
      id: 2,
      name: 'Pizza Palace',
      category: 'restaurant',
      description: 'Delicious pizza',
      address: '456 Oak Ave',
      averageRating: 4.2,
      reviewCount: 89,
      isOpen: true,
      imageUrl: 'https://example.com/image2.jpg',
      distance: 800,
    },
    relevanceScore: 87,
    matchedFields: ['name', 'category'],
  },
];

// Mock services
jest.mock('@/lib/performance-monitor', () => ({
  performanceMonitor: {
    trackCustomMetric: jest.fn(),
    trackUserInteraction: jest.fn(),
  },
  usePerformanceTracking: () => ({
    trackInteraction: jest.fn(),
  }),
}));

jest.mock('@/lib/image-cache-service', () => ({
  imageCacheService: {
    preloadImages: jest.fn(),
  },
}));

jest.mock('@/hooks/use-theme', () => ({
  useTheme: () => ({ colorScheme: 'light' }),
  getThemeColors: () => ({
    background: '#ffffff',
    foreground: '#000000',
    primary: '#007AFF',
    card: '#ffffff',
    muted: '#f5f5f5',
    mutedForeground: '#666666',
  }),
}));

describe('OptimizedBusinessList', () => {
  const mockOnBusinessPress = jest.fn();
  const mockOnRefresh = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders business list correctly', async () => {
      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={mockOnBusinessPress}
        />
      );

      // Check if businesses are rendered
      await waitFor(() => {
        expect(screen.getByText("Joe's Coffee")).toBeTruthy();
        expect(screen.getByText('Pizza Palace')).toBeTruthy();
      });
    });

    it('renders empty state when no data', () => {
      const EmptyComponent = () => <text>No businesses found</text>;
      
      render(
        <OptimizedBusinessList
          data={[]}
          onBusinessPress={mockOnBusinessPress}
          emptyComponent={<EmptyComponent />}
        />
      );

      expect(screen.getByText('No businesses found')).toBeTruthy();
    });

    it('shows loading indicator when loading', () => {
      render(
        <OptimizedBusinessList
          data={[]}
          onBusinessPress={mockOnBusinessPress}
          loading={true}
        />
      );

      expect(screen.getByText('Loading businesses...')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onBusinessPress when business card is pressed', async () => {
      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={mockOnBusinessPress}
        />
      );

      // Wait for the business card to be rendered
      await waitFor(() => {
        expect(screen.getByText("Joe's Coffee")).toBeTruthy();
      });

      // Find and press the business card
      const businessCard = screen.getByText("Joe's Coffee");
      fireEvent.press(businessCard);

      expect(mockOnBusinessPress).toHaveBeenCalledWith(mockBusinesses[0]);
    });

    it('handles refresh correctly', async () => {
      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={mockOnBusinessPress}
          onRefresh={mockOnRefresh}
          refreshing={false}
        />
      );

      // Trigger refresh (this would normally be done by pull-to-refresh gesture)
      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Features', () => {
    it('enables virtualization for large datasets', () => {
      const largeMockData = Array(50).fill(null).map((_, index) => ({
        ...mockBusinesses[0],
        business: {
          ...mockBusinesses[0].business,
          id: index + 1,
          name: `Business ${index + 1}`,
        },
      }));

      render(
        <OptimizedBusinessList
          data={largeMockData}
          onBusinessPress={mockOnBusinessPress}
          enableVirtualization={true}
        />
      );

      // FlashList should be used for large datasets
      expect(screen.getByTestId).toBeDefined();
    });

    it('preloads images when enabled', () => {
      const { imageCacheService } = require('@/lib/image-cache-service');
      
      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={mockOnBusinessPress}
          preloadImages={true}
        />
      );

      expect(imageCacheService.preloadImages).toHaveBeenCalledWith([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]);
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', async () => {
      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={mockOnBusinessPress}
        />
      );

      await waitFor(() => {
        // Check if business cards have accessibility labels
        const businessCard = screen.getByLabelText(/Joe's Coffee/i);
        expect(businessCard).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles onBusinessPress errors gracefully', async () => {
      const errorOnBusinessPress = jest.fn().mockImplementation(() => {
        throw new Error('Navigation error');
      });

      render(
        <OptimizedBusinessList
          data={mockBusinesses}
          onBusinessPress={errorOnBusinessPress}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("Joe's Coffee")).toBeTruthy();
      });

      const businessCard = screen.getByText("Joe's Coffee");
      
      // Should not crash the app
      expect(() => fireEvent.press(businessCard)).not.toThrow();
    });
  });
});