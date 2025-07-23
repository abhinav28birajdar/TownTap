import {
    Business,
    BusinessAnalytics,
    Location,
    Product,
    Review,
    SearchFilters,
    SearchResult,
    Service
} from '../types';

// Mock data for development
const mockBusinesses: Business[] = [
  {
    id: 'business-1',
    business_name: 'Fresh Grocery Store',
    description: 'Your neighborhood grocery store with fresh produce and daily essentials',
    logo_url: 'https://via.placeholder.com/100x100/4CAF50/FFFFFF?text=FG',
    banner_url: 'https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Fresh+Grocery',
    address_line1: '123 Main Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip_code: '400001',
    latitude: 19.0760,
    longitude: 72.8777,
    contact_phone: '+91 98765 43210',
    contact_email: 'contact@freshgrocery.com',
    business_type: 'grocery',
    specialized_categories: ['Fresh Produce', 'Dairy', 'Beverages'],
    operating_hours: {
      monday: { open: '08:00', close: '22:00', is_closed: false },
      tuesday: { open: '08:00', close: '22:00', is_closed: false },
      wednesday: { open: '08:00', close: '22:00', is_closed: false },
      thursday: { open: '08:00', close: '22:00', is_closed: false },
      friday: { open: '08:00', close: '22:00', is_closed: false },
      saturday: { open: '08:00', close: '23:00', is_closed: false },
      sunday: { open: '09:00', close: '21:00', is_closed: false },
    },
    delivery_available: true,
    delivery_radius_km: 5,
    min_order_value: 150,
    delivery_charge: 30,
    avg_rating: 4.5,
    total_reviews: 234,
    is_approved: true,
    status: 'active',
    owner_id: 'owner-1',
    social_media_links: {
      instagram: '@freshgrocery',
      whatsapp: '+919876543210'
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'business-2',
    business_name: 'TechFix Solutions',
    description: 'Professional electronics repair and IT services',
    logo_url: 'https://via.placeholder.com/100x100/2196F3/FFFFFF?text=TF',
    banner_url: 'https://via.placeholder.com/400x200/2196F3/FFFFFF?text=TechFix',
    address_line1: '456 Tech Park',
    city: 'Bangalore',
    state: 'Karnataka',
    zip_code: '560001',
    latitude: 12.9716,
    longitude: 77.5946,
    contact_phone: '+91 87654 32109',
    contact_email: 'hello@techfix.com',
    business_type: 'services',
    specialized_categories: ['Computer Repair', 'Mobile Repair', 'Data Recovery'],
    operating_hours: {
      monday: { open: '09:00', close: '18:00', is_closed: false },
      tuesday: { open: '09:00', close: '18:00', is_closed: false },
      wednesday: { open: '09:00', close: '18:00', is_closed: false },
      thursday: { open: '09:00', close: '18:00', is_closed: false },
      friday: { open: '09:00', close: '18:00', is_closed: false },
      saturday: { open: '10:00', close: '16:00', is_closed: false },
      sunday: { open: '10:00', close: '16:00', is_closed: true },
    },
    delivery_available: false,
    delivery_radius_km: 10,
    min_order_value: 500,
    delivery_charge: 0,
    avg_rating: 4.8,
    total_reviews: 89,
    is_approved: true,
    status: 'active',
    owner_id: 'owner-2',
    social_media_links: {
      facebook: 'TechFixSolutions',
      instagram: '@techfixsolutions'
    },
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-20T00:00:00Z'
  }
];

const mockProducts: Product[] = [
  {
    id: 'product-1',
    business_id: 'business-1',
    name: 'Fresh Bananas',
    description: 'Premium quality bananas, rich in potassium and natural sugars',
    price: 40,
    discount_price: 35,
    image_urls: ['https://via.placeholder.com/200x200/FFC107/FFFFFF?text=Bananas'],
    category: 'Fresh Produce',
    subcategory: 'Fruits',
    unit: 'per dozen',
    stock_quantity: 50,
    is_available: true,
    tags: ['fresh', 'organic', 'healthy'],
    sku: 'FP-BAN-001',
    weight: 2,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: 'product-2',
    business_id: 'business-1',
    name: 'Organic Milk',
    description: 'Fresh organic milk from local farms, rich in calcium and proteins',
    price: 60,
    image_urls: ['https://via.placeholder.com/200x200/FFFFFF/000000?text=Milk'],
    category: 'Dairy',
    subcategory: 'Milk & Cream',
    unit: 'per liter',
    stock_quantity: 30,
    is_available: true,
    tags: ['organic', 'fresh', 'dairy'],
    sku: 'DA-MLK-001',
    weight: 1,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z'
  }
];

export const businessService = {
  // Get all businesses with optional filters
  getBusinesses: async (filters?: SearchFilters): Promise<SearchResult> => {
    try {
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      let filteredBusinesses = [...mockBusinesses];
      
      if (filters?.query) {
        const query = filters.query.toLowerCase();
        filteredBusinesses = filteredBusinesses.filter(business => 
          business.business_name.toLowerCase().includes(query) ||
          business.description?.toLowerCase().includes(query) ||
          business.specialized_categories.some(cat => cat.toLowerCase().includes(query))
        );
      }
      
      if (filters?.business_type && filters.business_type.length > 0) {
        filteredBusinesses = filteredBusinesses.filter(business => 
          filters.business_type!.includes(business.business_type)
        );
      }
      
      if (filters?.rating_above) {
        filteredBusinesses = filteredBusinesses.filter(business => 
          business.avg_rating >= filters.rating_above!
        );
      }
      
      return {
        businesses: filteredBusinesses,
        products: mockProducts,
        services: [],
        total_results: filteredBusinesses.length,
        search_time_ms: 500,
        suggestions: ['Fresh produce', 'Electronics repair', 'Home services']
      };
    } catch (error) {
      console.error('Error fetching businesses:', error);
      throw new Error('Failed to fetch businesses');
    }
  },

  // Get business by ID
  getBusinessById: async (businessId: string): Promise<Business | null> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockBusinesses.find(business => business.id === businessId) || null;
    } catch (error) {
      console.error('Error fetching business by ID:', error);
      throw new Error('Failed to fetch business details');
    }
  },

  // Get businesses near a location
  getNearbyBusinesses: async (location: Location, radiusKm: number = 5): Promise<Business[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // For mock data, return all businesses with calculated distances
      return mockBusinesses.map(business => ({
        ...business,
        // Mock distance calculation (simplified)
        distance: Math.random() * radiusKm
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      throw new Error('Failed to fetch nearby businesses');
    }
  },

  // Get products for a business
  getBusinessProducts: async (businessId: string): Promise<Product[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockProducts.filter(product => product.business_id === businessId);
    } catch (error) {
      console.error('Error fetching business products:', error);
      throw new Error('Failed to fetch business products');
    }
  },

  // Get business services
  getBusinessServices: async (businessId: string): Promise<Service[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Return mock services based on business type
      const business = mockBusinesses.find(b => b.id === businessId);
      if (!business) return [];
      
      if (business.business_type === 'services') {
        return [
          {
            id: 'service-1',
            business_id: businessId,
            name: 'Computer Diagnosis & Repair',
            description: 'Complete computer diagnosis and repair service',
            base_price: 500,
            price_type: 'fixed',
            category: 'Computer Repair',
            duration_minutes: 120,
            is_available: true,
            service_area_km: 10,
            requirements: ['Bring your device', 'Valid ID'],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-15T00:00:00Z'
          }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching business services:', error);
      throw new Error('Failed to fetch business services');
    }
  },

  // Get business reviews
  getBusinessReviews: async (businessId: string, page: number = 1, limit: number = 10): Promise<Review[]> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Return mock reviews
      return [
        {
          id: 'review-1',
          business_id: businessId,
          customer_id: 'customer-1',
          rating: 5,
          title: 'Excellent service!',
          comment: 'Very professional and quick service. Highly recommended!',
          helpful_count: 12,
          is_verified_purchase: true,
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z'
        },
        {
          id: 'review-2',
          business_id: businessId,
          customer_id: 'customer-2',
          rating: 4,
          title: 'Good quality products',
          comment: 'Fresh products and timely delivery. Will order again.',
          helpful_count: 8,
          response_from_business: 'Thank you for your feedback! We appreciate your business.',
          response_timestamp: '2024-01-11T00:00:00Z',
          is_verified_purchase: true,
          created_at: '2024-01-09T00:00:00Z',
          updated_at: '2024-01-11T00:00:00Z'
        }
      ];
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      throw new Error('Failed to fetch business reviews');
    }
  },

  // Update business profile (for business owners)
  updateBusiness: async (businessId: string, updates: Partial<Business>): Promise<Business> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real implementation, this would update the database
      const business = mockBusinesses.find(b => b.id === businessId);
      if (!business) {
        throw new Error('Business not found');
      }
      
      const updatedBusiness = {
        ...business,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      return updatedBusiness;
    } catch (error) {
      console.error('Error updating business:', error);
      throw new Error('Failed to update business');
    }
  },

  // Get business analytics
  getBusinessAnalytics: async (businessId: string, period: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<BusinessAnalytics> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const now = new Date();
      const startDate = new Date(now);
      
      switch (period) {
        case 'daily':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'yearly':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      return {
        business_id: businessId,
        period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        total_orders: Math.floor(Math.random() * 100) + 50,
        total_revenue: Math.floor(Math.random() * 50000) + 10000,
        average_order_value: Math.floor(Math.random() * 500) + 200,
        new_customers: Math.floor(Math.random() * 20) + 5,
        returning_customers: Math.floor(Math.random() * 30) + 15,
        customer_satisfaction: 4.2 + Math.random() * 0.7,
        top_products: [
          {
            product_id: 'product-1',
            product_name: 'Fresh Bananas',
            units_sold: 45,
            revenue: 1575,
            profit_margin: 0.3
          }
        ],
        busiest_hours: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          order_count: Math.floor(Math.random() * 10),
          revenue: Math.floor(Math.random() * 2000)
        })),
        geographic_distribution: [
          {
            city: 'Mumbai',
            order_count: 45,
            revenue: 15000,
            customer_count: 28
          }
        ],
        created_at: now.toISOString()
      };
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      throw new Error('Failed to fetch business analytics');
    }
  },

  // Search businesses with advanced filters
  searchBusinesses: async (query: string, filters?: SearchFilters): Promise<SearchResult> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      let results = [...mockBusinesses];
      
      if (query) {
        const searchTerm = query.toLowerCase();
        results = results.filter(business =>
          business.business_name.toLowerCase().includes(searchTerm) ||
          business.description?.toLowerCase().includes(searchTerm) ||
          business.specialized_categories.some(cat => cat.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply additional filters if provided
      if (filters) {
        if (filters.business_type?.length) {
          results = results.filter(business => 
            filters.business_type!.includes(business.business_type)
          );
        }
        
        if (filters.rating_above) {
          results = results.filter(business => 
            business.avg_rating >= filters.rating_above!
          );
        }
        
        if (filters.delivery_available) {
          results = results.filter(business => business.delivery_available);
        }
      }
      
      return {
        businesses: results,
        products: mockProducts.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description?.toLowerCase().includes(query.toLowerCase())
        ),
        services: [],
        total_results: results.length,
        search_time_ms: 400,
        suggestions: ['Fresh produce', 'Electronics', 'Home services', 'Restaurants']
      };
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw new Error('Failed to search businesses');
    }
  }
};

export default businessService;
