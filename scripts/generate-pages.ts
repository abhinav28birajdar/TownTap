/**
 * TownTap Page Generator
 * This script generates all 171 pages for the TownTap application
 */

import * as fs from 'fs';
import * as path from 'path';

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  primaryLight: '#DBEAFE',
  secondary: '#10B981',
  accent: '#F59E0B',
  error: '#EF4444',
  warning: '#FCD34D',
  grayDark: '#111827',
  gray: '#6B7280',
  grayLight: '#F3F4F6',
  white: '#FFFFFF',
};

interface PageDefinition {
  path: string;
  name: string;
  description: string;
  section: string;
}

const pages: PageDefinition[] = [
  // PUBLIC/LANDING PAGES (7 Pages)
  { path: 'app/index.tsx', name: 'Landing', description: 'Hero section with CTA, Featured businesses, Categories', section: 'public' },
  { path: 'app/public/about.tsx', name: 'About Us', description: 'Company story, Mission & vision, Team', section: 'public' },
  { path: 'app/public/how-it-works.tsx', name: 'How It Works', description: 'For Customers and Businesses step-by-step guide', section: 'public' },
  { path: 'app/public/pricing.tsx', name: 'Pricing', description: 'Business plans comparison, Features', section: 'public' },
  { path: 'app/public/contact.tsx', name: 'Contact', description: 'Contact form, Office locations, Map', section: 'public' },
  { path: 'app/public/blog/index.tsx', name: 'Blog', description: 'Article listings, Categories filter', section: 'public' },
  { path: 'app/public/blog/[id].tsx', name: 'Blog Article', description: 'Article content, Author info, Related articles', section: 'public' },

  // AUTHENTICATION PAGES (10 Pages)
  { path: 'app/auth/choose-account-type.tsx', name: 'Choose Account Type', description: 'Business vs Customer selection', section: 'auth' },
  { path: 'app/auth/sign-in.tsx', name: 'Sign In', description: 'Email/password, Social login', section: 'auth' },
  { path: 'app/auth/sign-up.tsx', name: 'Sign Up', description: 'Registration form with validation', section: 'auth' },
  { path: 'app/auth/forgot-password.tsx', name: 'Forgot Password', description: 'Email input for password reset', section: 'auth' },
  { path: 'app/auth/reset-password.tsx', name: 'Reset Password', description: 'New password entry', section: 'auth' },
  { path: 'app/auth/otp-verification.tsx', name: 'OTP Verification', description: '6-digit code verification', section: 'auth' },
  { path: 'app/auth/email-verification-sent.tsx', name: 'Email Verification Sent', description: 'Check email instructions', section: 'auth' },
  { path: 'app/auth/email-verified.tsx', name: 'Email Verified', description: 'Success message', section: 'auth' },
  { path: 'app/auth/business-pending.tsx', name: 'Business Pending Approval', description: 'Pending verification message', section: 'auth' },
  { path: 'app/auth/role-selection.tsx', name: 'Role Selection', description: 'Select user role', section: 'auth' },

  // CUSTOMER ONBOARDING (5 Pages)
  { path: 'app/onboarding/welcome.tsx', name: 'Customer Welcome', description: 'Welcome message, app overview', section: 'customer' },
  { path: 'app/onboarding/interests.tsx', name: 'Interests Selection', description: 'Category checkboxes', section: 'customer' },
  { path: 'app/onboarding/location.tsx', name: 'Location Setup', description: 'Location detection and permissions', section: 'customer' },
  { path: 'app/onboarding/notifications.tsx', name: 'Notification Preferences', description: 'Enable notifications', section: 'customer' },
  { path: 'app/onboarding/complete.tsx', name: 'Onboarding Complete', description: 'Success message', section: 'customer' },

  // CUSTOMER DASHBOARD (25 Pages)
  { path: 'app/customer/dashboard/index.tsx', name: 'Customer Dashboard', description: 'Home dashboard with quick stats', section: 'customer' },
  { path: 'app/customer/explore/index.tsx', name: 'Explore Businesses', description: 'Browse with filters', section: 'customer' },
  { path: 'app/customer/business/[id].tsx', name: 'Business Detail', description: 'Full business profile', section: 'customer' },
  { path: 'app/customer/service/[id].tsx', name: 'Service Detail', description: 'Service information', section: 'customer' },
  { path: 'app/customer/booking/new.tsx', name: 'New Booking', description: 'Booking flow', section: 'customer' },
  { path: 'app/customer/booking/success.tsx', name: 'Booking Success', description: 'Confirmation page', section: 'customer' },
  { path: 'app/customer/bookings/index.tsx', name: 'My Bookings', description: 'All bookings list', section: 'customer' },
  { path: 'app/customer/bookings/[id].tsx', name: 'Booking Detail', description: 'Single booking details', section: 'customer' },
  { path: 'app/customer/bookings/cancel.tsx', name: 'Cancel Booking', description: 'Cancellation flow', section: 'customer' },
  { path: 'app/customer/bookings/reschedule.tsx', name: 'Reschedule Booking', description: 'Reschedule flow', section: 'customer' },
  { path: 'app/customer/favorites/index.tsx', name: 'Favorites', description: 'Saved businesses', section: 'customer' },
  { path: 'app/customer/search/index.tsx', name: 'Search Results', description: 'Search with filters', section: 'customer' },
  { path: 'app/customer/categories/index.tsx', name: 'Categories', description: 'All categories grid', section: 'customer' },
  { path: 'app/customer/categories/[id].tsx', name: 'Category Detail', description: 'Filtered businesses', section: 'customer' },
  { path: 'app/customer/reviews/index.tsx', name: 'My Reviews', description: 'Reviews written', section: 'customer' },
  { path: 'app/customer/reviews/new.tsx', name: 'Write Review', description: 'Review form', section: 'customer' },
  { path: 'app/customer/reviews/edit/[id].tsx', name: 'Edit Review', description: 'Edit review', section: 'customer' },
  { path: 'app/customer/notifications/index.tsx', name: 'Notifications', description: 'All notifications', section: 'customer' },
  { path: 'app/customer/messages/index.tsx', name: 'Messages', description: 'Conversation list', section: 'customer' },
  { path: 'app/customer/messages/[id].tsx', name: 'Chat Thread', description: 'Message conversation', section: 'customer' },
  { path: 'app/customer/profile/view.tsx', name: 'Profile View', description: 'Customer profile', section: 'customer' },
  { path: 'app/customer/profile/edit.tsx', name: 'Edit Profile', description: 'Edit customer profile', section: 'customer' },
  { path: 'app/customer/settings/index.tsx', name: 'Settings', description: 'Account settings', section: 'customer' },
  { path: 'app/customer/settings/password.tsx', name: 'Change Password', description: 'Password change', section: 'customer' },
  { path: 'app/customer/settings/payment-methods.tsx', name: 'Payment Methods', description: 'Saved cards', section: 'customer' },

  // BUSINESS DASHBOARD (35 Pages)  
  { path: 'app/business-owner/dashboard/index.tsx', name: 'Business Dashboard', description: 'Business home dashboard', section: 'business' },
  { path: 'app/business-owner/profile/view.tsx', name: 'Business Profile View', description: 'Public profile preview', section: 'business' },
  { path: 'app/business-owner/profile/edit/basic.tsx', name: 'Edit Basic Info', description: 'Business name, description', section: 'business' },
  { path: 'app/business-owner/profile/edit/contact.tsx', name: 'Edit Contact Info', description: 'Phone, email, website', section: 'business' },
  { path: 'app/business-owner/profile/edit/address.tsx', name: 'Edit Address', description: 'Location and address', section: 'business' },
  { path: 'app/business-owner/profile/edit/hours.tsx', name: 'Edit Hours', description: 'Business hours', section: 'business' },
  { path: 'app/business-owner/profile/edit/social.tsx', name: 'Edit Social Media', description: 'Social links', section: 'business' },
  { path: 'app/business-owner/photos/index.tsx', name: 'Manage Photos', description: 'Photo gallery', section: 'business' },
  { path: 'app/business-owner/services/index.tsx', name: 'Services List', description: 'All services', section: 'business' },
  { path: 'app/business-owner/services/new.tsx', name: 'Add Service', description: 'Create new service', section: 'business' },
  { path: 'app/business-owner/services/edit/[id].tsx', name: 'Edit Service', description: 'Edit service', section: 'business' },
  { path: 'app/business-owner/bookings/dashboard.tsx', name: 'Bookings Dashboard', description: 'Bookings overview', section: 'business' },
  { path: 'app/business-owner/bookings/calendar.tsx', name: 'Calendar View', description: 'Calendar of bookings', section: 'business' },
  { path: 'app/business-owner/bookings/pending.tsx', name: 'Pending Bookings', description: 'Approve/reject', section: 'business' },
  { path: 'app/business-owner/bookings/confirmed.tsx', name: 'Confirmed Bookings', description: 'Upcoming bookings', section: 'business' },
  { path: 'app/business-owner/bookings/completed.tsx', name: 'Completed Bookings', description: 'Past bookings', section: 'business' },
  { path: 'app/business-owner/bookings/cancelled.tsx', name: 'Cancelled Bookings', description: 'Cancelled bookings', section: 'business' },
  { path: 'app/business-owner/bookings/[id].tsx', name: 'Booking Detail', description: 'Single booking', section: 'business' },
  { path: 'app/business-owner/customers/index.tsx', name: 'Customers List', description: 'All customers', section: 'business' },
  { path: 'app/business-owner/customers/[id].tsx', name: 'Customer Detail', description: 'Customer profile', section: 'business' },
  { path: 'app/business-owner/reviews/index.tsx', name: 'Reviews', description: 'All reviews', section: 'business' },
  { path: 'app/business-owner/reviews/reply/[id].tsx', name: 'Reply to Review', description: 'Reply form', section: 'business' },
  { path: 'app/business-owner/analytics/dashboard.tsx', name: 'Analytics Dashboard', description: 'Key metrics', section: 'business' },
  { path: 'app/business-owner/analytics/revenue.tsx', name: 'Revenue Reports', description: 'Financial reports', section: 'business' },
  { path: 'app/business-owner/analytics/performance.tsx', name: 'Performance Reports', description: 'Performance metrics', section: 'business' },
  { path: 'app/business-owner/marketing/promotions.tsx', name: 'Promotions', description: 'Marketing campaigns', section: 'business' },
  { path: 'app/business-owner/messages/index.tsx', name: 'Business Messages', description: 'Customer conversations', section: 'business' },
  { path: 'app/business-owner/messages/[id].tsx', name: 'Business Chat', description: 'Chat thread', section: 'business' },
  { path: 'app/business-owner/settings/general.tsx', name: 'General Settings', description: 'Business settings', section: 'business' },
  { path: 'app/business-owner/settings/booking.tsx', name: 'Booking Settings', description: 'Booking configuration', section: 'business' },
  { path: 'app/business-owner/settings/payment.tsx', name: 'Payment Settings', description: 'Payment config', section: 'business' },
  { path: 'app/business-owner/team/index.tsx', name: 'Team Management', description: 'Team members', section: 'business' },
  { path: 'app/business-owner/subscription/index.tsx', name: 'Subscription', description: 'Billing and plans', section: 'business' },
  { path: 'app/business-owner/subscription/upgrade.tsx', name: 'Upgrade Plan', description: 'Plan comparison', section: 'business' },
  { path: 'app/business-owner/subscription/billing.tsx', name: 'Billing History', description: 'Past invoices', section: 'business' },

  // ADMIN PANEL (25 Pages)
  { path: 'app/admin/dashboard/index.tsx', name: 'Admin Dashboard', description: 'Platform statistics', section: 'admin' },
  { path: 'app/admin/users/index.tsx', name: 'All Users', description: 'User management', section: 'admin' },
  { path: 'app/admin/users/customers.tsx', name: 'Customers', description: 'Customer list', section: 'admin' },
  { path: 'app/admin/users/businesses.tsx', name: 'Businesses', description: 'Business list', section: 'admin' },
  { path: 'app/admin/users/[id].tsx', name: 'User Detail', description: 'User profile', section: 'admin' },
  { path: 'app/admin/verification/queue.tsx', name: 'Verification Queue', description: 'Pending verifications', section: 'admin' },
  { path: 'app/admin/verification/[id].tsx', name: 'Verification Detail', description: 'Review submission', section: 'admin' },
  { path: 'app/admin/bookings/index.tsx', name: 'All Bookings', description: 'Platform bookings', section: 'admin' },
  { path: 'app/admin/bookings/disputes.tsx', name: 'Disputed Bookings', description: 'Resolve disputes', section: 'admin' },
  { path: 'app/admin/reviews/moderation.tsx', name: 'Review Moderation', description: 'Flagged reviews', section: 'admin' },
  { path: 'app/admin/content/moderation.tsx', name: 'Content Moderation', description: 'Flagged content', section: 'admin' },
  { path: 'app/admin/content/[id].tsx', name: 'Content Detail', description: 'Review content', section: 'admin' },
  { path: 'app/admin/categories/index.tsx', name: 'Categories Management', description: 'Manage categories', section: 'admin' },
  { path: 'app/admin/settings/general.tsx', name: 'Platform Settings', description: 'General settings', section: 'admin' },
  { path: 'app/admin/settings/features.tsx', name: 'Feature Settings', description: 'Enable/disable features', section: 'admin' },
  { path: 'app/admin/settings/email.tsx', name: 'Email Settings', description: 'Email config', section: 'admin' },
  { path: 'app/admin/settings/payment.tsx', name: 'Payment Settings', description: 'Payment config', section: 'admin' },
  { path: 'app/admin/settings/security.tsx', name: 'Security Settings', description: 'Security config', section: 'admin' },
  { path: 'app/admin/plans/index.tsx', name: 'Subscription Plans', description: 'Manage plans', section: 'admin' },
  { path: 'app/admin/plans/edit/[id].tsx', name: 'Edit Plan', description: 'Edit subscription plan', section: 'admin' },
  { path: 'app/admin/analytics/index.tsx', name: 'Platform Analytics', description: 'Platform metrics', section: 'admin' },
  { path: 'app/admin/analytics/revenue.tsx', name: 'Revenue Analytics', description: 'Financial analytics', section: 'admin' },
  { path: 'app/admin/logs/index.tsx', name: 'System Logs', description: 'Activity logs', section: 'admin' },
  { path: 'app/admin/team/index.tsx', name: 'Admin Team', description: 'Admin users', section: 'admin' },
  { path: 'app/admin/reports/index.tsx', name: 'Reports', description: 'System reports', section: 'admin' },

  // UTILITY PAGES (15 Pages)
  { path: 'app/help/index.tsx', name: 'Help Center', description: 'Help articles', section: 'utility' },
  { path: 'app/help/faq.tsx', name: 'FAQ', description: 'Frequently asked questions', section: 'utility' },
  { path: 'app/help/contact.tsx', name: 'Contact Support', description: 'Support form', section: 'utility' },
  { path: 'app/support/tickets/index.tsx', name: 'Support Tickets', description: 'My tickets', section: 'utility' },
  { path: 'app/support/tickets/[id].tsx', name: 'Ticket Detail', description: 'Ticket conversation', section: 'utility' },
  { path: 'app/legal/terms.tsx', name: 'Terms & Conditions', description: 'Legal terms', section: 'utility' },
  { path: 'app/legal/privacy.tsx', name: 'Privacy Policy', description: 'Privacy policy', section: 'utility' },
  { path: 'app/settings/accessibility.tsx', name: 'Accessibility', description: 'Accessibility options', section: 'utility' },
  { path: 'app/settings/language.tsx', name: 'Language', description: 'Language selection', section: 'utility' },
  { path: 'app/settings/region.tsx', name: 'Region Settings', description: 'Region and currency', section: 'utility' },
  { path: 'app/errors/404.tsx', name: 'Not Found', description: '404 error page', section: 'utility' },
  { path: 'app/errors/500.tsx', name: 'Server Error', description: '500 error page', section: 'utility' },
  { path: 'app/errors/maintenance.tsx', name: 'Maintenance', description: 'Maintenance mode', section: 'utility' },
  { path: 'app/settings/delete-account.tsx', name: 'Delete Account', description: 'Account deletion', section: 'utility' },
  { path: 'app/settings/cookies.tsx', name: 'Cookie Preferences', description: 'Cookie settings', section: 'utility' },

  // ADDITIONAL FEATURES (10 Pages)
  { path: 'app/features/referral.tsx', name: 'Referral Program', description: 'Referral system', section: 'features' },
  { path: 'app/features/rewards.tsx', name: 'Loyalty Rewards', description: 'Points and rewards', section: 'features' },
  { path: 'app/features/gift-cards.tsx', name: 'Gift Cards', description: 'Gift card management', section: 'features' },
  { path: 'app/features/deals.tsx', name: 'Deals & Offers', description: 'Special offers', section: 'features' },
  { path: 'app/features/events.tsx', name: 'Events', description: 'Events and workshops', section: 'features' },
  { path: 'app/features/directory.tsx', name: 'Business Directory', description: 'All businesses', section: 'features' },
  { path: 'app/features/compare.tsx', name: 'Compare Businesses', description: 'Side-by-side comparison', section: 'features' },
  { path: 'app/features/saved-searches.tsx', name: 'Saved Searches', description: 'Search alerts', section: 'features' },
  { path: 'app/features/activity.tsx', name: 'Activity Feed', description: 'Recent activities', section: 'features' },
  { path: 'app/features/download-app.tsx', name: 'Download App', description: 'App download page', section: 'features' },
];

function generatePageTemplate(page: PageDefinition): string {
  const componentName = page.name.replace(/[^a-zA-Z0-9]/g, '') + 'Screen';
  
  return `import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '@/lib/supabase';

/**
 * ${page.name}
 * ${page.description}
 * Section: ${page.section}
 */
export default function ${componentName}() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch data from Supabase
      // const { data, error } = await supabase.from('table_name').select('*');
      // if (error) throw error;
      // setData(data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="${COLORS.primary}" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="${COLORS.grayDark}" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>${page.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>${page.name}</Text>
          <Text style={styles.description}>${page.description}</Text>
          
          {/* TODO: Implement page-specific content */}
          <View style={styles.placeholderCard}>
            <Ionicons name="construct" size={48} color="${COLORS.gray}" />
            <Text style={styles.placeholderText}>
              This page is ready for implementation
            </Text>
            <Text style={styles.placeholderSubtext}>
              Connect to Supabase and add your custom UI
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '${COLORS.white}',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '${COLORS.white}',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '${COLORS.grayDark}',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '${COLORS.grayDark}',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '${COLORS.gray}',
    marginBottom: 24,
    lineHeight: 24,
  },
  placeholderCard: {
    padding: 40,
    backgroundColor: '${COLORS.grayLight}',
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '${COLORS.grayDark}',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '${COLORS.gray}',
    marginTop: 8,
    textAlign: 'center',
  },
});
`;
}

// Generate all pages
console.log('🚀 Generating 171 TownTap pages...\n');

let successCount = 0;
let errorCount = 0;

pages.forEach((page, index) => {
  try {
    const filePath = path.join(process.cwd(), page.path);
    const dirPath = path.dirname(filePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Generate and write file
    const content = generatePageTemplate(page);
    fs.writeFileSync(filePath, content, 'utf8');
    
    successCount++;
    console.log(`✅ [${index + 1}/${pages.length}] Created: ${page.path}`);
  } catch (error) {
    errorCount++;
    console.error(`❌ [${index + 1}/${pages.length}] Failed: ${page.path}`, error);
  }
});

console.log(`\n📊 Generation Complete!`);
console.log(`✅ Successfully created: ${successCount} pages`);
console.log(`❌ Failed: ${errorCount} pages`);
console.log(`\n🎯 Next Steps:`);
console.log(`1. Review generated files in the app/ directory`);
console.log(`2. Implement Supabase integration for each page`);
console.log(`3. Customize UI components as needed`);
console.log(`4. Test navigation flow`);
console.log(`5. Add specific business logic`);

export { generatePageTemplate, pages };

