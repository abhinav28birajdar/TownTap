// Core Services
export { default as AISearchService } from './aiSearchService';
export { default as AnalyticsService } from './analyticsService';
export { default as AuthService } from './authService';
export { default as EnhancedMessagingService } from './enhancedMessagingService';
export { default as LoyaltyReferralService } from './loyaltyReferralService';
export { default as MessagingService } from './messagingService';
export { default as NotificationService } from './notificationService';
export { default as OrderService } from './orderService';
export { default as PaymentService } from './paymentService';
export { default as RealTimeTrackingService } from './realTimeTrackingService';
export { default as ReviewService } from './reviewService';

// Additional Services
export { BusinessService } from './businessService';

// Advanced Service Types
export type {
    AIRecommendation,
    SearchAnalytics, SmartSearchQuery
} from './aiSearchService';

export type {
    MessageTemplate, ScheduledMessage, VideoCall, VoiceMessage
} from './enhancedMessagingService';

export type {
    CouponCode, CustomerLoyalty, LoyaltyProgram, ReferralProgram
} from './loyaltyReferralService';

export type {
    NotificationMessage, NotificationPreferences, NotificationTemplate
} from './notificationService';

export type {
    GeofenceArea, LocationUpdate, RouteOptimization
} from './realTimeTrackingService';

// Service Types
export type {
    BusinessAnalytics,
    PlatformAnalytics
} from './analyticsService';

export type {
    PaymentGatewayConfig, PaymentIntent,
    PaymentMethod
} from './paymentService';

// Import for Services object
import AISearchService from './aiSearchService';
import AnalyticsService from './analyticsService';
import AuthService from './authService';
import { BusinessService } from './businessService';
import EnhancedMessagingService from './enhancedMessagingService';
import LoyaltyReferralService from './loyaltyReferralService';
import MessagingService from './messagingService';
import NotificationService from './notificationService';
import OrderService from './orderService';
import PaymentService from './paymentService';
import RealTimeTrackingService from './realTimeTrackingService';
import ReviewService from './reviewService';

// Re-export important functions for easy access
export const Services = {
  AI: AISearchService,
  Analytics: AnalyticsService,
  Auth: AuthService,
  Business: BusinessService,
  EnhancedMessaging: EnhancedMessagingService,
  Loyalty: LoyaltyReferralService,
  Messaging: MessagingService,
  Notification: NotificationService,
  Order: OrderService,
  Payment: PaymentService,
  RealTimeTracking: RealTimeTrackingService,
  Review: ReviewService
};

export default Services;
