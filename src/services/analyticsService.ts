import { supabase } from '../lib/supabase';
import {
    Business,
    Review
} from '../types';

export interface BusinessAnalytics {
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    revenue: number;
    averageOrderValue: number;
    ordersTrend: Array<{ date: string; count: number; revenue: number }>;
  };
  reviews: {
    total: number;
    averageRating: number;
    ratingDistribution: Record<number, number>;
    recentReviews: Review[];
  };
  customers: {
    total: number;
    returning: number;
    newThisMonth: number;
  };
  services: {
    mostPopular: Array<{ name: string; orders: number; revenue: number }>;
    leastPopular: Array<{ name: string; orders: number; revenue: number }>;
  };
  performance: {
    conversionRate: number;
    customerSatisfaction: number;
    responseTime: number;
  };
}

export interface PlatformAnalytics {
  overview: {
    totalBusinesses: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    activeUsers: number;
  };
  growth: {
    businessGrowth: Array<{ date: string; count: number; revenue: number }>;
    customerGrowth: Array<{ date: string; count: number; revenue: number }>;
    orderGrowth: Array<{ date: string; count: number; revenue: number }>;
  };
  performance: {
    topPerformingBusinesses: Business[];
    topCategories: Array<{ category: string; businesses: number; orders: number }>;
    topCities: Array<{ city: string; businesses: number; customers: number }>;
  };
  engagement: {
    averageSessionTime: number;
    retentionRate: number;
    churnRate: number;
  };
}

export class AnalyticsService {
  // =====================================================
  // BUSINESS ANALYTICS
  // =====================================================

  static async getBusinessAnalytics(businessId: string, days: number = 30): Promise<BusinessAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      // Get order analytics
      const ordersData = await this.getBusinessOrderAnalytics(businessId, startDateStr);
      
      // Get review analytics
      const reviewsData = await this.getBusinessReviewAnalytics(businessId);
      
      // Get customer analytics
      const customersData = await this.getBusinessCustomerAnalytics(businessId, startDateStr);
      
      // Get service analytics
      const servicesData = await this.getBusinessServiceAnalytics(businessId, startDateStr);
      
      // Get performance metrics
      const performanceData = await this.getBusinessPerformanceMetrics(businessId, startDateStr);

      return {
        orders: ordersData,
        reviews: reviewsData,
        customers: customersData,
        services: servicesData,
        performance: performanceData
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get business analytics');
    }
  }

  private static async getBusinessOrderAnalytics(businessId: string, startDate: string) {
    try {
      // Get all orders for the business
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate);

      if (error) throw error;

      const total = orders.length;
      const pending = orders.filter(o => o.status === 'pending').length;
      const completed = orders.filter(o => o.status === 'completed').length;
      const cancelled = orders.filter(o => o.status === 'cancelled').length;
      
      const completedOrders = orders.filter(o => o.status === 'completed');
      const revenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const averageOrderValue = completedOrders.length > 0 ? revenue / completedOrders.length : 0;

      // Calculate daily trends
      const ordersTrend = this.calculateDailyTrends(orders, 'total_amount');

      return {
        total,
        pending,
        completed,
        cancelled,
        revenue,
        averageOrderValue,
        ordersTrend
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getBusinessReviewAnalytics(businessId: string) {
    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles!reviews_customer_id_fkey (
            id,
            name,
            avatar_url
          )
        `)
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = total > 0 ? totalRating / total : 0;

      const ratingDistribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Ensure all ratings 1-5 are represented
      for (let i = 1; i <= 5; i++) {
        if (!ratingDistribution[i]) {
          ratingDistribution[i] = 0;
        }
      }

      const recentReviews = reviews.slice(0, 5);

      return {
        total,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentReviews
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getBusinessCustomerAnalytics(businessId: string, startDate: string) {
    try {
      // Get unique customers who ordered from this business
      const { data: allCustomers, error: allError } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('business_id', businessId);

      if (allError) throw allError;

      const uniqueCustomerIds = [...new Set(allCustomers.map(o => o.customer_id))];
      const total = uniqueCustomerIds.length;

      // Get returning customers (customers with more than one order)
      const customerOrderCounts = allCustomers.reduce((acc, order) => {
        acc[order.customer_id] = (acc[order.customer_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const returning = Object.values(customerOrderCounts).filter(count => count > 1).length;

      // Get new customers this month
      const { data: newCustomers, error: newError } = await supabase
        .from('orders')
        .select('customer_id')
        .eq('business_id', businessId)
        .gte('created_at', startDate);

      if (newError) throw newError;

      const newThisMonth = [...new Set(newCustomers.map(o => o.customer_id))].length;

      return {
        total,
        returning,
        newThisMonth
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getBusinessServiceAnalytics(businessId: string, startDate: string) {
    try {
      // Get order items to analyze service popularity
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          *,
          order:orders!order_items_order_id_fkey (
            business_id,
            status,
            created_at
          )
        `)
        .eq('order.business_id', businessId)
        .gte('order.created_at', startDate);

      if (error) throw error;

      const serviceStats = orderItems.reduce((acc, item) => {
        const serviceName = item.service_name || item.product_name || 'Unknown';
        if (!acc[serviceName]) {
          acc[serviceName] = { orders: 0, revenue: 0 };
        }
        acc[serviceName].orders += item.quantity;
        acc[serviceName].revenue += item.total_price;
        return acc;
      }, {} as Record<string, { orders: number; revenue: number }>);

      const services = Object.entries(serviceStats).map(([name, stats]) => ({
        name,
        orders: (stats as any).orders,
        revenue: (stats as any).revenue
      }));

      const mostPopular = services
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      const leastPopular = services
        .sort((a, b) => a.orders - b.orders)
        .slice(0, 5);

      return {
        mostPopular,
        leastPopular
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getBusinessPerformanceMetrics(businessId: string, startDate: string) {
    try {
      // Get business profile views vs orders for conversion rate
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('business_id', businessId)
        .gte('created_at', startDate);

      // Get reviews for customer satisfaction
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId);

      const conversionRate = 0; // Would need to track profile views to calculate
      const customerSatisfaction = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;
      const responseTime = 0; // Would need to track message response times

      return {
        conversionRate,
        customerSatisfaction: Math.round(customerSatisfaction * 10) / 10,
        responseTime
      };
    } catch (error: any) {
      throw error;
    }
  }

  // =====================================================
  // PLATFORM ANALYTICS
  // =====================================================

  static async getPlatformAnalytics(days: number = 30): Promise<PlatformAnalytics> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString();

      const overview = await this.getPlatformOverview();
      const growth = await this.getPlatformGrowth(startDateStr);
      const performance = await this.getPlatformPerformance();
      const engagement = await this.getPlatformEngagement(startDateStr);

      return {
        overview,
        growth,
        performance,
        engagement
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get platform analytics');
    }
  }

  private static async getPlatformOverview() {
    try {
      const [businessCount, customerCount, orderCount, revenueData] = await Promise.all([
        supabase.from('businesses').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'customer'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('status', 'completed')
      ]);

      const totalRevenue = revenueData.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Calculate active users (users with activity in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeUsers } = await supabase
        .from('orders')
        .select('customer_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      const uniqueActiveUsers = [...new Set(activeUsers?.map(o => o.customer_id) || [])].length;

      return {
        totalBusinesses: businessCount.count || 0,
        totalCustomers: customerCount.count || 0,
        totalOrders: orderCount.count || 0,
        totalRevenue,
        activeUsers: uniqueActiveUsers
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getPlatformGrowth(startDate: string) {
    try {
      const [businesses, customers, orders] = await Promise.all([
        supabase.from('businesses').select('created_at').gte('created_at', startDate),
        supabase.from('profiles').select('created_at').eq('user_type', 'customer').gte('created_at', startDate),
        supabase.from('orders').select('created_at, total_amount').gte('created_at', startDate)
      ]);

      const businessGrowth = this.calculateDailyTrends(businesses.data || [], null);
      const customerGrowth = this.calculateDailyTrends(customers.data || [], null);
      const orderGrowth = this.calculateDailyTrends(orders.data || [], 'total_amount');

      return {
        businessGrowth,
        customerGrowth,
        orderGrowth
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getPlatformPerformance() {
    try {
      // Top performing businesses
      const { data: topBusinesses } = await supabase
        .from('businesses')
        .select('*')
        .order('rating', { ascending: false })
        .order('reviews_count', { ascending: false })
        .limit(10);

      // Top categories
      const { data: categoryData } = await supabase
        .from('businesses')
        .select('category')
        .not('category', 'is', null);

      const categoryStats = categoryData?.reduce((acc, business) => {
        const category = business.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topCategories = Object.entries(categoryStats)
        .map(([category, businesses]) => ({ category, businesses, orders: 0 }))
        .sort((a, b) => b.businesses - a.businesses)
        .slice(0, 10);

      // Top cities
      const { data: cityData } = await supabase
        .from('businesses')
        .select('city');

      const cityStats = cityData?.reduce((acc, business) => {
        const city = business.city;
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      const topCities = Object.entries(cityStats)
        .map(([city, businesses]) => ({ city, businesses, customers: 0 }))
        .sort((a, b) => b.businesses - a.businesses)
        .slice(0, 10);

      return {
        topPerformingBusinesses: topBusinesses || [],
        topCategories,
        topCities
      };
    } catch (error: any) {
      throw error;
    }
  }

  private static async getPlatformEngagement(startDate: string) {
    try {
      // These would require additional tracking in a real application
      return {
        averageSessionTime: 0,
        retentionRate: 0,
        churnRate: 0
      };
    } catch (error: any) {
      throw error;
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  private static calculateDailyTrends(
    data: Array<{ created_at: string; [key: string]: any }>,
    valueField: string | null
  ): Array<{ date: string; count: number; revenue: number }> {
    const trends = data.reduce((acc, item) => {
      const date = item.created_at.split('T')[0]; // Get date part only
      if (!acc[date]) {
        acc[date] = { count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      if (valueField && item[valueField]) {
        acc[date].revenue += item[valueField];
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    return Object.entries(trends).map(([date, data]) => ({
      date,
      count: data.count,
      revenue: data.revenue
    })).sort((a, b) => a.date.localeCompare(b.date));
  }

  // =====================================================
  // EXPORT & REPORTING
  // =====================================================

  static async exportBusinessReport(businessId: string, format: 'csv' | 'json' = 'json') {
    try {
      const analytics = await this.getBusinessAnalytics(businessId);
      
      if (format === 'csv') {
        return this.convertToCSV(analytics);
      }
      
      return analytics;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export business report');
    }
  }

  static async exportPlatformReport(format: 'csv' | 'json' = 'json') {
    try {
      const analytics = await this.getPlatformAnalytics();
      
      if (format === 'csv') {
        return this.convertToCSV(analytics);
      }
      
      return analytics;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to export platform report');
    }
  }

  private static convertToCSV(data: any): string {
    // Simple CSV conversion - would need more sophisticated handling for nested objects
    const flatten = (obj: any, prefix = ''): any => {
      let flattened: any = {};
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flatten(obj[key], `${prefix}${key}_`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flatten(data);
    const headers = Object.keys(flattened);
    const values = Object.values(flattened);
    
    return [headers.join(','), values.join(',')].join('\n');
  }

  // =====================================================
  // REAL-TIME ANALYTICS
  // =====================================================

  static subscribeToBusinessMetrics(businessId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`business_metrics_${businessId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `business_id=eq.${businessId}`
      }, callback)
      .subscribe();
  }

  static subscribeToPlatformMetrics(callback: (payload: any) => void) {
    return supabase
      .channel('platform_metrics')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'businesses'
      }, callback)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders'
      }, callback)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profiles'
      }, callback)
      .subscribe();
  }
}

export default AnalyticsService;
