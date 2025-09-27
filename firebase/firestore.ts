// Firebase Firestore Service for LocalMart
// Handles all database operations as specified in LocalMart requirements

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  GeoPoint,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { firestore } from './config';
import { UserProfile, BusinessProfile } from './auth';

// Product interface for Type A businesses
export interface Product {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  image_urls: string[];
  price: number;
  discount_price?: number;
  stock_quantity: number;
  unit: string;
  is_available: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Service interface for Type B businesses
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  image_urls?: string[];
  base_price?: number;
  estimated_time_mins?: number;
  is_available: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Order interface for Type A (Order & Buy Now)
export interface Order {
  id: string;
  customer_id: string;
  business_id: string;
  total_amount: number;
  delivery_charge: number;
  platform_commission_amount: number;
  order_status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rejected';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: 'card' | 'upi' | 'cod';
  delivery_option: 'delivery' | 'takeaway';
  delivery_address: {
    full_address: string;
    lat: number;
    lng: number;
  };
  order_notes?: string;
  items: OrderItem[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_order: number;
}

// Service Request interface for Type B (Book & Request Service)
export interface ServiceRequest {
  id: string;
  customer_id: string;
  business_id: string;
  service_id?: string;
  problem_description: string;
  photos_urls?: string[];
  service_address: {
    full_address: string;
    lat: number;
    lng: number;
  };
  preferred_date: Timestamp;
  preferred_time_slot: string;
  request_status: 'pending' | 'accepted' | 'rejected' | 'quoted' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  quoted_price?: number;
  actual_charge?: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  scheduled_timestamp?: Timestamp;
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Inquiry interface for Type C (Inquire & Consult)
export interface Inquiry {
  id: string;
  customer_id: string;
  business_id: string;
  inquiry_type: string;
  details: string;
  attachments_urls?: string[];
  budget_range?: string;
  preferred_contact_method: string;
  inquiry_status: 'new' | 'reviewed' | 'contacted' | 'closed' | 'archived';
  created_at: Timestamp;
  updated_at: Timestamp;
}

// Review interface
export interface Review {
  id: string;
  customer_id: string;
  business_id: string;
  order_id?: string;
  service_request_id?: string;
  rating: number;
  comment?: string;
  created_at: Timestamp;
}

// Categories interface
export interface Category {
  id: string;
  name: string;
  icon_url: string;
  description?: string;
  interaction_type: 'type_a' | 'type_b' | 'type_c';
  is_active: boolean;
}

class FirebaseFirestoreService {
  // Business Operations
  async getBusinessesByCategory(category: string, limitCount: number = 20): Promise<BusinessProfile[]> {
    try {
      const q = query(
        collection(firestore, 'businesses'),
        where('specialized_categories', 'array-contains', category),
        where('is_approved', '==', true),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessProfile));
    } catch (error) {
      console.error('Error fetching businesses by category:', error);
      throw error;
    }
  }

  async searchBusinesses(searchQuery: string, userLat?: number, userLng?: number, radiusKm: number = 10): Promise<BusinessProfile[]> {
    try {
      // For now, we'll do a simple text search. In production, you'd use more sophisticated search
      const q = query(
        collection(firestore, 'businesses'),
        where('is_approved', '==', true),
        where('status', '==', 'active'),
        orderBy('business_name'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      let businesses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessProfile));
      
      // Filter by search query
      if (searchQuery) {
        businesses = businesses.filter(business => 
          business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          business.specialized_categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      
      // TODO: Add geographical filtering using GeoPoint if coordinates provided
      
      return businesses;
    } catch (error) {
      console.error('Error searching businesses:', error);
      throw error;
    }
  }

  async getFeaturedBusinesses(limitCount: number = 10): Promise<BusinessProfile[]> {
    try {
      const q = query(
        collection(firestore, 'businesses'),
        where('is_approved', '==', true),
        where('status', '==', 'active'),
        orderBy('avg_rating', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BusinessProfile));
    } catch (error) {
      console.error('Error fetching featured businesses:', error);
      throw error;
    }
  }

  // Product Operations (Type A)
  async getProductsByBusiness(businessId: string): Promise<Product[]> {
    try {
      const q = query(
        collection(firestore, 'products'),
        where('business_id', '==', businessId),
        where('is_available', '==', true),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'products'), {
        ...productData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, updates: Partial<Product>): Promise<void> {
    try {
      const docRef = doc(firestore, 'products', productId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Service Operations (Type B)
  async getServicesByBusiness(businessId: string): Promise<Service[]> {
    try {
      const q = query(
        collection(firestore, 'services'),
        where('business_id', '==', businessId),
        where('is_available', '==', true),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  }

  async createService(serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'services'), {
        ...serviceData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Order Operations (Type A)
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'orders'), {
        ...orderData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: Order['order_status']): Promise<void> {
    try {
      const docRef = doc(firestore, 'orders', orderId);
      await updateDoc(docRef, {
        order_status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(firestore, 'orders'),
        where('customer_id', '==', customerId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  async getOrdersByBusiness(businessId: string): Promise<Order[]> {
    try {
      const q = query(
        collection(firestore, 'orders'),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      console.error('Error fetching business orders:', error);
      throw error;
    }
  }

  // Service Request Operations (Type B)
  async createServiceRequest(requestData: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'service_requests'), {
        ...requestData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating service request:', error);
      throw error;
    }
  }

  async updateServiceRequestStatus(requestId: string, status: ServiceRequest['request_status']): Promise<void> {
    try {
      const docRef = doc(firestore, 'service_requests', requestId);
      await updateDoc(docRef, {
        request_status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating service request status:', error);
      throw error;
    }
  }

  async getServiceRequestsByCustomer(customerId: string): Promise<ServiceRequest[]> {
    try {
      const q = query(
        collection(firestore, 'service_requests'),
        where('customer_id', '==', customerId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
    } catch (error) {
      console.error('Error fetching customer service requests:', error);
      throw error;
    }
  }

  async getServiceRequestsByBusiness(businessId: string): Promise<ServiceRequest[]> {
    try {
      const q = query(
        collection(firestore, 'service_requests'),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
    } catch (error) {
      console.error('Error fetching business service requests:', error);
      throw error;
    }
  }

  // Inquiry Operations (Type C)
  async createInquiry(inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'inquiries'), {
        ...inquiryData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating inquiry:', error);
      throw error;
    }
  }

  async updateInquiryStatus(inquiryId: string, status: Inquiry['inquiry_status']): Promise<void> {
    try {
      const docRef = doc(firestore, 'inquiries', inquiryId);
      await updateDoc(docRef, {
        inquiry_status: status,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      throw error;
    }
  }

  async getInquiriesByCustomer(customerId: string): Promise<Inquiry[]> {
    try {
      const q = query(
        collection(firestore, 'inquiries'),
        where('customer_id', '==', customerId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
    } catch (error) {
      console.error('Error fetching customer inquiries:', error);
      throw error;
    }
  }

  async getInquiriesByBusiness(businessId: string): Promise<Inquiry[]> {
    try {
      const q = query(
        collection(firestore, 'inquiries'),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
    } catch (error) {
      console.error('Error fetching business inquiries:', error);
      throw error;
    }
  }

  // Review Operations
  async createReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, 'reviews'), {
        ...reviewData,
        created_at: serverTimestamp()
      });
      
      // Update business average rating
      await this.updateBusinessRating(reviewData.business_id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(firestore, 'reviews'),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  private async updateBusinessRating(businessId: string): Promise<void> {
    try {
      const reviews = await this.getReviewsByBusiness(businessId);
      const totalReviews = reviews.length;
      const avgRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0;

      const businessRef = doc(firestore, 'businesses', businessId);
      await updateDoc(businessRef, {
        avg_rating: avgRating,
        total_reviews: totalReviews,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating business rating:', error);
    }
  }

  // Category Operations
  async getCategories(): Promise<Category[]> {
    try {
      const q = query(
        collection(firestore, 'categories'),
        where('is_active', '==', true),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToOrderUpdates(businessId: string, callback: (orders: Order[]) => void): () => void {
    const q = query(
      collection(firestore, 'orders'),
      where('business_id', '==', businessId),
      orderBy('created_at', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      callback(orders);
    });
  }

  subscribeToServiceRequestUpdates(businessId: string, callback: (requests: ServiceRequest[]) => void): () => void {
    const q = query(
      collection(firestore, 'service_requests'),
      where('business_id', '==', businessId),
      orderBy('created_at', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRequest));
      callback(requests);
    });
  }

  subscribeToInquiryUpdates(businessId: string, callback: (inquiries: Inquiry[]) => void): () => void {
    const q = query(
      collection(firestore, 'inquiries'),
      where('business_id', '==', businessId),
      orderBy('created_at', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const inquiries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry));
      callback(inquiries);
    });
  }
}

// Export singleton instance
export const firestoreService = new FirebaseFirestoreService();
export default firestoreService;