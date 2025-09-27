/**
 * FILE: src/services/businessCategoryService.ts
 * PURPOSE: Enhanced Business Category Service supporting Type A, B, C interactions
 * RESPONSIBILITIES: Handle business discovery, categorization, and location-based queries
 */

import { 
  BusinessBase,
  TypeABusiness, 
  TypeBBusiness, 
  TypeCBusiness,
  BusinessCategory,
  BusinessInteractionType,
  LocationData,
  ApiResponse,
  PaginatedResponse
} from '../types/localMartTypes';

export class BusinessCategoryService {
  
  // ========== BUSINESS CATEGORIES ==========
  
  static getBusinessCategories(): BusinessCategory[] {
    return [
      // Type A: Order & Buy Now
      {
        id: 'grocery_store',
        name: 'Grocery Store',
        icon_url: '🛒',
        description: 'Fresh produce, packaged goods, household items',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 1
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy',
        icon_url: '💊',
        description: 'OTC medicines, health products, wellness items',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 2
      },
      {
        id: 'bakery_sweets',
        name: 'Bakery & Sweets',
        icon_url: '🧁',
        description: 'Fresh cakes, pastries, traditional sweets',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 3
      },
      {
        id: 'tailoring_products',
        name: 'Tailoring Products',
        icon_url: '👕',
        description: 'Ready-made apparel, fabrics, accessories',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 4
      },
      {
        id: 'organic_farming',
        name: 'Organic Farming',
        icon_url: '🌱',
        description: 'Fresh farm produce, organic dairy, natural products',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 5
      },
      {
        id: 'stationary_books',
        name: 'Stationary & Books',
        icon_url: '📚',
        description: 'School supplies, office items, books',
        interaction_type: 'type_a',
        is_active: true,
        display_order: 6
      },

      // Type B: Book & Request Service
      {
        id: 'electrician',
        name: 'Electrician',
        icon_url: '⚡',
        description: 'Electrical repairs, installations, wiring',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 7
      },
      {
        id: 'plumber',
        name: 'Plumber',
        icon_url: '🔧',
        description: 'Plumbing repairs, installations, maintenance',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 8
      },
      {
        id: 'sports_coach',
        name: 'Sports Coach',
        icon_url: '🏃',
        description: 'Personal training, fitness, sports coaching',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 9
      },
      {
        id: 'elderly_care',
        name: 'Elderly Care',
        icon_url: '👵',
        description: 'Home care, companionship, medical assistance',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 10
      },
      {
        id: 'tailoring_services',
        name: 'Tailoring Services',
        icon_url: '✂️',
        description: 'Custom stitching, alterations, embroidery',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 11
      },
      {
        id: 'beauty_salon',
        name: 'Beauty & Salon',
        icon_url: '💅',
        description: 'Haircuts, facials, beauty treatments',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 12
      },
      {
        id: 'appliance_repair',
        name: 'Appliance Repair',
        icon_url: '🔌',
        description: 'Home appliance repairs and maintenance',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 13
      },
      {
        id: 'it_repair',
        name: 'IT Repair',
        icon_url: '💻',
        description: 'Computer, laptop, mobile phone repairs',
        interaction_type: 'type_b',
        is_active: true,
        display_order: 14
      },

      // Type C: Inquire & Consult
      {
        id: 'travel_agency',
        name: 'Travel Agency',
        icon_url: '✈️',
        description: 'Custom tours, flight bookings, travel planning',
        interaction_type: 'type_c',
        is_active: true,
        display_order: 15
      },
      {
        id: 'real_estate',
        name: 'Real Estate',
        icon_url: '🏠',
        description: 'Property buying, selling, rentals',
        interaction_type: 'type_c',
        is_active: true,
        display_order: 16
      },
      {
        id: 'construction_handyman',
        name: 'Construction & Handyman',
        icon_url: '🔨',
        description: 'Renovation, carpentry, construction projects',
        interaction_type: 'type_c',
        is_active: true,
        display_order: 17
      },
      {
        id: 'architecture_interior',
        name: 'Architecture & Interior',
        icon_url: '🏛️',
        description: 'Architectural design, interior decoration',
        interaction_type: 'type_c',
        is_active: true,
        display_order: 18
      },
      {
        id: 'legal_consultancy',
        name: 'Legal & Consultancy',
        icon_url: '⚖️',
        description: 'Legal advice, business consultancy',
        interaction_type: 'type_c',
        is_active: true,
        display_order: 19
      }
    ];
  }

  static getCategoriesByType(interactionType: BusinessInteractionType): BusinessCategory[] {
    return this.getBusinessCategories().filter(cat => cat.interaction_type === interactionType);
  }

  static getCategoryById(categoryId: string): BusinessCategory | null {
    return this.getBusinessCategories().find(cat => cat.id === categoryId) || null;
  }

  // ========== BUSINESS DISCOVERY ==========

  /**
   * Get businesses near a location with advanced filtering
   */
  static async getNearbyBusinesses(
    location: LocationData,
    options: {
      radius?: number; // in km
      interaction_type?: BusinessInteractionType;
      category?: string;
      is_open_now?: boolean;
      min_rating?: number;
      supports_delivery?: boolean;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<PaginatedResponse<BusinessBase>> {
    const {
      radius = 5,
      interaction_type,
      category,
      is_open_now = false,
      min_rating = 0,
      supports_delivery,
      limit = 20,
      offset = 0
    } = options;

    try {
      // In Firebase implementation, this would use GeoFirestore
      // For now, simulating with mock data
      const mockBusinesses = this.generateMockBusinesses(location, radius);
      
      let filteredBusinesses = mockBusinesses;

      // Apply filters
      if (interaction_type) {
        filteredBusinesses = filteredBusinesses.filter(b => b.interaction_type === interaction_type);
      }

      if (category) {
        filteredBusinesses = filteredBusinesses.filter(b => 
          b.specialized_categories.includes(category) || b.category.id === category
        );
      }

      if (min_rating > 0) {
        filteredBusinesses = filteredBusinesses.filter(b => b.avg_rating >= min_rating);
      }

      if (is_open_now) {
        filteredBusinesses = filteredBusinesses.filter(b => this.isBusinessOpenNow(b));
      }

      if (supports_delivery && interaction_type === 'type_a') {
        filteredBusinesses = filteredBusinesses.filter(b => 
          (b as TypeABusiness).supports_delivery
        );
      }

      // Pagination
      const total = filteredBusinesses.length;
      const paginatedData = filteredBusinesses.slice(offset, offset + limit);

      return {
        data: paginatedData,
        pagination: {
          page: Math.floor(offset / limit) + 1,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_next: offset + limit < total,
          has_prev: offset > 0
        }
      };

    } catch (error) {
      console.error('Error fetching nearby businesses:', error);
      throw error;
    }
  }

  /**
   * Search businesses with text query
   */
  static async searchBusinesses(
    query: string,
    location?: LocationData,
    options: {
      interaction_type?: BusinessInteractionType;
      category?: string;
      limit?: number;
    } = {}
  ): Promise<BusinessBase[]> {
    const { interaction_type, category, limit = 10 } = options;

    try {
      // In Firebase, this would use full-text search or Algolia
      const allBusinesses = location 
        ? this.generateMockBusinesses(location, 10)
        : this.generateMockBusinesses({ latitude: 0, longitude: 0 }, 50);

      let results = allBusinesses.filter(business => {
        const matchesQuery = 
          business.business_name.toLowerCase().includes(query.toLowerCase()) ||
          business.description.toLowerCase().includes(query.toLowerCase()) ||
          business.specialized_categories.some(cat => 
            cat.toLowerCase().includes(query.toLowerCase())
          );

        const matchesType = !interaction_type || business.interaction_type === interaction_type;
        const matchesCategory = !category || business.specialized_categories.includes(category);

        return matchesQuery && matchesType && matchesCategory;
      });

      return results.slice(0, limit);

    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  /**
   * Get featured businesses across all categories
   */
  static async getFeaturedBusinesses(
    location?: LocationData,
    limit: number = 10
  ): Promise<BusinessBase[]> {
    try {
      const businesses = location 
        ? this.generateMockBusinesses(location, 20)
        : this.generateMockBusinesses({ latitude: 0, longitude: 0 }, 50);
      
      return businesses
        .filter(b => b.is_featured && b.status === 'active')
        .sort((a, b) => b.avg_rating - a.avg_rating)
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching featured businesses:', error);
      throw error;
    }
  }

  /**
   * Get business recommendations based on user preferences
   */
  static async getRecommendedBusinesses(
    userId: string,
    location: LocationData,
    limit: number = 5
  ): Promise<BusinessBase[]> {
    try {
      // In real implementation, this would analyze user's order history,
      // favorite categories, and use ML for recommendations
      const nearbyBusinesses = this.generateMockBusinesses(location, 10);
      
      return nearbyBusinesses
        .filter(b => b.avg_rating >= 4.0)
        .sort(() => Math.random() - 0.5) // Random for demo
        .slice(0, limit);

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Check if business is currently open
   */
  static isBusinessOpenNow(business: BusinessBase): boolean {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const daySchedule = business.operating_hours[currentDay];
    if (!daySchedule || !daySchedule.is_open) {
      return false;
    }

    if (daySchedule.is_24_hours) {
      return true;
    }

    if (daySchedule.open_time && daySchedule.close_time) {
      return currentTime >= daySchedule.open_time && currentTime <= daySchedule.close_time;
    }

    return false;
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  static calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Generate mock businesses for demonstration
   */
  private static generateMockBusinesses(center: LocationData, count: number): BusinessBase[] {
    const categories = this.getBusinessCategories();
    const businesses: BusinessBase[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const lat = center.latitude + (Math.random() - 0.5) * 0.1; // ~5km radius
      const lng = center.longitude + (Math.random() - 0.5) * 0.1;

      const baseBusiness: BusinessBase = {
        id: `business_${i + 1}`,
        owner_id: `owner_${i + 1}`,
        business_name: this.generateBusinessName(category),
        logo_url: `https://example.com/logos/business_${i + 1}.jpg`,
        banner_url: `https://example.com/banners/business_${i + 1}.jpg`,
        gallery_images: [
          `https://example.com/gallery/business_${i + 1}_1.jpg`,
          `https://example.com/gallery/business_${i + 1}_2.jpg`
        ],
        description: this.generateBusinessDescription(category),
        address: {
          id: `addr_${i + 1}`,
          full_address: `${i + 1} Main Street, Local Area`,
          street: `${i + 1} Main Street`,
          city: 'Mumbai',
          state: 'Maharashtra',
          zip_code: '400001',
          latitude: lat,
          longitude: lng,
          is_default: true
        },
        location: { latitude: lat, longitude: lng } as any, // Mock GeoPoint
        contact_person: `Contact Person ${i + 1}`,
        contact_phone: `+91 98765${String(i + 1).padStart(5, '0')}`,
        contact_email: `business${i + 1}@example.com`,
        whatsapp_number: `+91 98765${String(i + 1).padStart(5, '0')}`,
        operating_hours: this.generateOperatingHours(),
        category,
        interaction_type: category.interaction_type,
        specialized_categories: [category.id],
        is_approved: true,
        status: 'active',
        is_featured: Math.random() < 0.3, // 30% chance of being featured
        avg_rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)), // 3.5-5.0
        total_reviews: Math.floor(Math.random() * 100) + 5,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      };

      businesses.push(baseBusiness);
    }

    return businesses;
  }

  private static generateBusinessName(category: BusinessCategory): string {
    const prefixes = ['Local', 'City', 'Express', 'Premium', 'Quick', 'Royal', 'Golden'];
    const suffixes = ['Services', 'Store', 'Shop', 'Hub', 'Center', 'Plaza', 'Point'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${category.name} ${suffix}`;
  }

  private static generateBusinessDescription(category: BusinessCategory): string {
    const descriptions: Record<string, string> = {
      'grocery_store': 'Fresh fruits, vegetables, dairy products, and daily essentials at competitive prices.',
      'pharmacy': 'Certified pharmacy with wide range of medicines, health supplements, and wellness products.',
      'bakery_sweets': 'Freshly baked goods, custom cakes, traditional sweets, and festive specialties.',
      'electrician': 'Professional electrical services including repairs, installations, and maintenance.',
      'plumber': 'Expert plumbing solutions for residential and commercial properties.',
      'travel_agency': 'Complete travel planning services, tour packages, and booking assistance.',
      'real_estate': 'Professional real estate services for buying, selling, and renting properties.'
    };

    return descriptions[category.id] || category.description || 'Quality services at affordable prices.';
  }

  private static generateOperatingHours() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hours: any = {};

    days.forEach(day => {
      const isOpen = Math.random() > 0.1; // 90% chance of being open
      hours[day] = {
        is_open: isOpen,
        open_time: isOpen ? '09:00' : undefined,
        close_time: isOpen ? '18:00' : undefined,
        is_24_hours: false
      };
    });

    return hours;
  }
}

export default BusinessCategoryService;