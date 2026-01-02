/**
 * TownTap - Complete Page Generator
 * Generates all 171 pages as specified in the requirements
 */

import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.join(__dirname, '..', 'app');

// Color constants for reference in generated code
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

interface PageConfig {
  path: string;
  title: string;
  description: string;
  requiresAuth?: boolean;
  userType?: 'customer' | 'business' | 'admin' | 'public';
}

// All 171 pages organized by section
const pages: PageConfig[] = [
  // ===== SECTION 1: PUBLIC/LANDING PAGES (7 Pages) =====
  { path: 'public/landing', title: 'Landing Page', description: 'Hero section with CTA, how it works, featured businesses, categories, testimonials', userType: 'public' },
  { path: 'public/about', title: 'About Us', description: 'Company story, mission & vision, team members, values, contact info', userType: 'public' },
  { path: 'public/how-it-works', title: 'How It Works', description: 'For customers and businesses sections, step-by-step guide, video tutorials', userType: 'public' },
  { path: 'public/pricing', title: 'Pricing', description: 'Business plans comparison, free vs premium features, monthly/yearly toggle, FAQ', userType: 'public' },
  { path: 'public/contact', title: 'Contact Us', description: 'Contact form, office locations, phone/email/address, map integration', userType: 'public' },
  { path: 'public/blog/index', title: 'Blog', description: 'Article listings, categories filter, search, featured posts', userType: 'public' },
  { path: 'public/blog/[slug]', title: 'Blog Article', description: 'Article content, author info, related articles, share buttons, comments', userType: 'public' },

  // ===== SECTION 2: AUTHENTICATION PAGES (10 Pages) =====
  { path: 'auth/choose-account-type', title: 'Choose Account Type', description: 'Business or customer account selection with feature comparison', userType: 'public' },
  { path: 'auth/sign-in', title: 'Customer Login', description: 'Email/password fields, remember me, forgot password, social login', userType: 'public' },
  { path: 'auth/business-sign-in', title: 'Business Login', description: 'Business email/password fields, remember me, forgot password', userType: 'public' },
  { path: 'auth/sign-up', title: 'Customer Registration', description: 'Full name, email, phone, password with strength indicator, terms acceptance', userType: 'public' },
  { path: 'auth/business-sign-up/step-1', title: 'Business Registration Step 1', description: 'Business name, type/category, email, phone, description, year established', userType: 'public' },
  { path: 'auth/business-sign-up/step-2', title: 'Business Registration Step 2', description: 'Full address, city/state/ZIP, country, map picker, website, social media', userType: 'public' },
  { path: 'auth/business-sign-up/step-3', title: 'Business Registration Step 3', description: 'Owner info, ID proof upload, business license upload', userType: 'public' },
  { path: 'auth/business-sign-up/step-4', title: 'Business Registration Step 4', description: 'Review all information, terms & conditions, submit for verification', userType: 'public' },
  { path: 'auth/forgot-password', title: 'Forgot Password', description: 'Email input, send reset link button, instructions', userType: 'public' },
  { path: 'auth/reset-password', title: 'Reset Password', description: 'New password, confirm password, strength indicator, reset button', userType: 'public' },

  // ===== SECTION 3: EMAIL VERIFICATION PAGES (4 Pages) =====
  { path: 'auth/verification-sent', title: 'Email Verification Sent', description: 'Success message, check email instructions, resend button, change email option', userType: 'public' },
  { path: 'auth/verify-code', title: 'Email Verification Code', description: 'Verification code input (6 digits), verify button, resend code, timer', userType: 'public' },
  { path: 'auth/verified-success', title: 'Email Verified Success', description: 'Success message, continue to dashboard, animation/checkmark', userType: 'public' },
  { path: 'auth/business-pending', title: 'Business Pending Approval', description: 'Pending verification message, what happens next, estimated time', userType: 'public' },

  // ===== SECTION 4: CUSTOMER ONBOARDING (5 Pages) =====
  { path: 'onboarding/welcome', title: 'Customer Welcome', description: 'Welcome message, brief app overview, get started button', requiresAuth: true, userType: 'customer' },
  { path: 'onboarding/interests', title: 'Interests Selection', description: 'Category checkboxes (Food, Beauty, Fitness, etc.), at least 3 selections', requiresAuth: true, userType: 'customer' },
  { path: 'onboarding/location', title: 'Location Setup', description: 'Current location detection, manual location input, permissions request', requiresAuth: true, userType: 'customer' },
  { path: 'onboarding/notifications', title: 'Notification Preferences', description: 'Push, email, SMS toggles, notification types checklist', requiresAuth: true, userType: 'customer' },
  { path: 'onboarding/complete', title: 'Onboarding Complete', description: 'Success message, profile completion %, go to dashboard', requiresAuth: true, userType: 'customer' },

  // ===== SECTION 5: BUSINESS ONBOARDING (8 Pages) =====
  { path: 'business/onboarding/welcome', title: 'Business Welcome', description: 'Congratulations message, quick tour option, dashboard overview', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/profile', title: 'Complete Business Profile', description: 'Logo upload, cover photo, detailed description, business hours', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/services', title: 'Add Services', description: 'Service name, description, price, duration, category', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/categories', title: 'Service Categories Setup', description: 'Create custom categories, organize services, set featured', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/hours', title: 'Business Hours Config', description: 'Days of operation, opening/closing times, break times, holiday hours', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/photos', title: 'Business Photos Upload', description: 'Upload photos, gallery management, set featured, minimum 3 photos', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/payment', title: 'Payment Setup', description: 'Payment methods, bank account, Stripe/PayPal connect', requiresAuth: true, userType: 'business' },
  { path: 'business/onboarding/tour', title: 'Dashboard Tour', description: 'Interactive tutorial, feature highlights, quick tips', requiresAuth: true, userType: 'business' },

  // ===== SECTION 6: CUSTOMER DASHBOARD (25 Pages) =====
  { path: 'customer/dashboard/index', title: 'Customer Dashboard', description: 'Welcome message, quick stats, upcoming bookings, recommended businesses', requiresAuth: true, userType: 'customer' },
  { path: 'customer/explore/index', title: 'Explore Businesses', description: 'Search bar, category filters, location/price/rating filters, business cards', requiresAuth: true, userType: 'customer' },
  { path: 'customer/business/[id]', title: 'Business Detail', description: 'Cover photo, logo, rating, services list, hours, location map, reviews', requiresAuth: true, userType: 'customer' },
  { path: 'customer/service/[id]', title: 'Service Detail', description: 'Service image, name, description, price, duration, availability calendar', requiresAuth: true, userType: 'customer' },
  { path: 'customer/booking/select-service', title: 'Booking Step 1 - Service', description: 'Available services list, details, quantity, special requests', requiresAuth: true, userType: 'customer' },
  { path: 'customer/booking/select-datetime', title: 'Booking Step 2 - Date/Time', description: 'Calendar picker, available time slots, duration display', requiresAuth: true, userType: 'customer' },
  { path: 'customer/booking/customer-info', title: 'Booking Step 3 - Info', description: 'Name, phone, email (pre-filled), additional notes', requiresAuth: true, userType: 'customer' },
  { path: 'customer/booking/confirm', title: 'Booking Step 4 - Confirm', description: 'Review details, service summary, price breakdown, cancellation policy', requiresAuth: true, userType: 'customer' },
  { path: 'customer/booking/success', title: 'Booking Success', description: 'Success message, booking reference, add to calendar, view booking', requiresAuth: true, userType: 'customer' },
  { path: 'customer/bookings/index', title: 'My Bookings', description: 'Tabs: All, Upcoming, Past, Cancelled. Booking cards with quick actions', requiresAuth: true, userType: 'customer' },
  { path: 'customer/bookings/[id]', title: 'Booking Detail', description: 'Full booking info, business details, date/time, status, payment, actions', requiresAuth: true, userType: 'customer' },
  { path: 'customer/bookings/cancel', title: 'Cancel Booking', description: 'Booking summary, cancellation reasons, refund policy, confirm button', requiresAuth: true, userType: 'customer' },
  { path: 'customer/bookings/reschedule', title: 'Reschedule Booking', description: 'Current details, new date picker, new time slots, policy', requiresAuth: true, userType: 'customer' },
  { path: 'customer/favorites/index', title: 'My Favorites', description: 'Saved businesses grid, remove option, quick book, sort options', requiresAuth: true, userType: 'customer' },
  { path: 'customer/search/index', title: 'Search Results', description: 'Search query display, filter sidebar, results count, map view option', requiresAuth: true, userType: 'customer' },
  { path: 'customer/categories/index', title: 'All Categories', description: 'Categories grid, category icons, business count per category', requiresAuth: true, userType: 'customer' },
  { path: 'customer/categories/[id]', title: 'Category Detail', description: 'Category name, description, filtered businesses, sub-categories', requiresAuth: true, userType: 'customer' },
  { path: 'customer/reviews/index', title: 'My Reviews', description: 'Reviews list with edit/delete, pending reviews section', requiresAuth: true, userType: 'customer' },
  { path: 'customer/reviews/new', title: 'Write Review', description: 'Business info, star rating, review title & text, photo upload', requiresAuth: true, userType: 'customer' },
  { path: 'customer/reviews/edit/[id]', title: 'Edit Review', description: 'Current review details, edit rating/text, update photos, delete option', requiresAuth: true, userType: 'customer' },
  { path: 'customer/notifications/index', title: 'Notifications', description: 'Tabs: All, Unread, Bookings, Promotions. Notification cards, mark as read', requiresAuth: true, userType: 'customer' },
  { path: 'customer/messages/index', title: 'Messages Inbox', description: 'Conversation list, unread count, last message preview, new message button', requiresAuth: true, userType: 'customer' },
  { path: 'customer/messages/[id]', title: 'Chat Thread', description: 'Business info header, message history, text input, send button, attachments', requiresAuth: true, userType: 'customer' },
  { path: 'customer/profile/view', title: 'Customer Profile', description: 'Profile picture, name, email, phone, location, member since, stats', requiresAuth: true, userType: 'customer' },
  { path: 'customer/profile/edit', title: 'Edit Profile', description: 'Upload picture, edit name/phone/email/location, bio, preferences', requiresAuth: true, userType: 'customer' },

  // ===== SECTION 7: CUSTOMER ACCOUNT PAGES (7 Pages) =====
  { path: 'customer/settings/index', title: 'Account Settings', description: 'Profile, password, notifications, privacy, payment, language, help links', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/password', title: 'Change Password', description: 'Current password, new password, confirm, requirements, change button', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/notifications', title: 'Notification Settings', description: 'Email, push, SMS toggles. Types: confirmations, reminders, promotions', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/privacy', title: 'Privacy Settings', description: 'Profile visibility, show/hide email/phone, review visibility, data sharing', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/payment-methods', title: 'Payment Methods', description: 'Saved cards list, add new card, default payment, remove card', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/add-payment', title: 'Add Payment Method', description: 'Card number, name, expiry, CVV, billing address, set as default', requiresAuth: true, userType: 'customer' },
  { path: 'customer/settings/switch-to-business', title: 'Switch to Business', description: 'Information about business accounts, benefits, register button', requiresAuth: true, userType: 'customer' },

  // ===== SECTION 8: BUSINESS DASHBOARD (35 Pages) =====
  { path: 'business/dashboard/index', title: 'Business Dashboard', description: 'Quick stats cards, revenue chart, recent bookings, pending actions', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/preview', title: 'Public Profile View', description: 'View as customer sees it badge, business info, services, reviews', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/edit-basic', title: 'Edit Basic Info', description: 'Business name, category, description, tagline, keywords, year', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/edit-contact', title: 'Edit Contact Info', description: 'Phone, email, website, WhatsApp number', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/edit-address', title: 'Edit Address', description: 'Street, city, state, ZIP, country, map picker, service area', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/edit-hours', title: 'Edit Hours', description: 'Days, opening/closing times, break time, 24/7, seasonal, holiday', requiresAuth: true, userType: 'business' },
  { path: 'business/profile/edit-social', title: 'Edit Social Media', description: 'Facebook, Instagram, Twitter, LinkedIn, YouTube, TikTok URLs', requiresAuth: true, userType: 'business' },
  { path: 'business/photos/index', title: 'Photos Management', description: 'Current photos, upload new, set featured, reorder, captions, delete', requiresAuth: true, userType: 'business' },
  { path: 'business/photos/logo-cover', title: 'Logo & Cover', description: 'Upload/change logo, upload/change cover photo, cropping tool', requiresAuth: true, userType: 'business' },
  { path: 'business/services/index', title: 'Services List', description: 'All services table, search, filter by category, sort, add new button', requiresAuth: true, userType: 'business' },
  { path: 'business/services/new', title: 'Add New Service', description: 'Name, category, description, price, duration, image, availability', requiresAuth: true, userType: 'business' },
  { path: 'business/services/[id]', title: 'Edit Service', description: 'Edit all fields, view booking history, service analytics, duplicate', requiresAuth: true, userType: 'business' },
  { path: 'business/services/categories', title: 'Service Categories', description: 'Existing categories list, add new, edit, reorder, delete', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/index', title: 'Bookings Dashboard', description: 'Summary cards, bookings table, status filters, date range, search', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/calendar', title: 'Bookings Calendar', description: 'Monthly/weekly/daily view, color-coded status, click to view, drag', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/pending', title: 'Pending Bookings', description: 'Pending list, booking cards with accept/reject, bulk approve', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/confirmed', title: 'Confirmed Bookings', description: 'Confirmed list, upcoming highlighted, sort by date, quick actions', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/completed', title: 'Completed Bookings', description: 'Past bookings list, filter by date, total revenue, export data', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/cancelled', title: 'Cancelled Bookings', description: 'Cancelled list, reason display, cancelled by, refund status', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/[id]', title: 'Booking Detail', description: 'Reference, status, customer info, service, date/time, price, actions', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/add-manual', title: 'Add Manual Booking', description: 'Select customer, service, date/time, price, payment status, notes', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/reschedule/[id]', title: 'Reschedule Booking', description: 'Current details, new date/time, reason, notify customer checkbox', requiresAuth: true, userType: 'business' },
  { path: 'business/bookings/cancel/[id]', title: 'Cancel Booking', description: 'Summary, reason dropdown, refund options, notify checkbox, confirm', requiresAuth: true, userType: 'business' },
  { path: 'business/customers/index', title: 'Customers List', description: 'All customers table, search, filter, sort, customer cards, export', requiresAuth: true, userType: 'business' },
  { path: 'business/customers/[id]', title: 'Customer Detail', description: 'Profile info, contact, booking history, total bookings/revenue, notes', requiresAuth: true, userType: 'business' },
  { path: 'business/reviews/index', title: 'Reviews & Ratings', description: 'Overall rating, total reviews, breakdown, reviews list, filter, search', requiresAuth: true, userType: 'business' },
  { path: 'business/reviews/reply/[id]', title: 'Reply to Review', description: 'Original review display, customer info, reply text area, submit', requiresAuth: true, userType: 'business' },
  { path: 'business/analytics/index', title: 'Analytics Dashboard', description: 'Date range, key metrics, views/bookings/revenue charts, popular services', requiresAuth: true, userType: 'business' },
  { path: 'business/analytics/revenue', title: 'Revenue Reports', description: 'Total revenue, by service, by customer, trends chart, payment breakdown', requiresAuth: true, userType: 'business' },
  { path: 'business/analytics/performance', title: 'Performance Reports', description: 'Conversion rate, average booking value, retention, utilization', requiresAuth: true, userType: 'business' },
  { path: 'business/analytics/customers', title: 'Customer Insights', description: 'Total customers, new vs returning, demographics, top customers', requiresAuth: true, userType: 'business' },
  { path: 'business/promotions/index', title: 'Promotions', description: 'Active promotions list, performance, create new button, types', requiresAuth: true, userType: 'business' },
  { path: 'business/promotions/new', title: 'Create Promotion', description: 'Name, type, discount, applicable services, dates, limits, terms', requiresAuth: true, userType: 'business' },
  { path: 'business/promotions/[id]', title: 'Edit Promotion', description: 'Edit details, view usage, pause/resume, delete, save changes', requiresAuth: true, userType: 'business' },
  { path: 'business/notifications/index', title: 'Business Notifications', description: 'Tabs: All, Bookings, Customers, System. Notification list, mark read', requiresAuth: true, userType: 'business' },
  { path: 'business/messages/index', title: 'Business Inbox', description: 'Customer conversations list, unread count, search, filter, quick replies', requiresAuth: true, userType: 'business' },
  { path: 'business/messages/[id]', title: 'Business Chat', description: 'Customer info header, message history, quick replies, attachments', requiresAuth: true, userType: 'business' },
  { path: 'business/settings/general', title: 'General Settings', description: 'Business name, type, tax info, currency, time zone, language', requiresAuth: true, userType: 'business' },
  { path: 'business/settings/booking', title: 'Booking Settings', description: 'Buffer time, min/max advance booking, auto-accept, templates', requiresAuth: true, userType: 'business' },
  { path: 'business/settings/payment', title: 'Payment Settings', description: 'Payment methods, deposit requirements, refund policy, tax rates', requiresAuth: true, userType: 'business' },
  { path: 'business/settings/notifications', title: 'Notification Settings', description: 'Email, SMS, push toggles. Triggers: new booking, cancellation, review', requiresAuth: true, userType: 'business' },
  { path: 'business/team/index', title: 'Team Management', description: 'Team members list, add member button, cards with role/permissions', requiresAuth: true, userType: 'business' },
  { path: 'business/team/add', title: 'Add Team Member', description: 'Name, email, role selection (admin/manager/staff), permissions', requiresAuth: true, userType: 'business' },
  { path: 'business/team/[id]', title: 'Edit Team Member', description: 'Edit details, change role, update permissions, deactivate, remove', requiresAuth: true, userType: 'business' },
  { path: 'business/team/schedule', title: 'Team Schedule', description: 'Calendar view of staff schedules, assign staff, availability settings', requiresAuth: true, userType: 'business' },
  { path: 'business/subscription/index', title: 'Subscription & Billing', description: 'Current plan, features, usage stats, upgrade/downgrade, billing cycle', requiresAuth: true, userType: 'business' },
  { path: 'business/subscription/upgrade', title: 'Upgrade Plan', description: 'Available plans comparison, feature comparison, pricing, select button', requiresAuth: true, userType: 'business' },
  { path: 'business/subscription/history', title: 'Billing History', description: 'Past invoices list, invoice cards, download button, payment history', requiresAuth: true, userType: 'business' },
  { path: 'business/subscription/payment-method', title: 'Payment Method', description: 'Current payment method, change method, add backup, billing address', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/profile', title: 'Owner Profile', description: 'Owner name, email, phone, role, profile picture, edit button', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/edit', title: 'Edit Owner Profile', description: 'Change picture, edit name/phone/email, personal preferences', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/account-settings', title: 'Account Settings', description: 'Password & security, 2FA, login history, devices, privacy, delete', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/change-password', title: 'Change Password', description: 'Current password, new password, confirm, change button', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/two-factor', title: 'Two-Factor Auth', description: 'Enable/disable 2FA, setup instructions, QR code, backup codes', requiresAuth: true, userType: 'business' },
  { path: 'business/owner/switch-to-customer', title: 'Switch to Customer', description: 'Switch role explanation, view as customer, add personal account', requiresAuth: true, userType: 'business' },

  // ===== SECTION 9: SHARED UTILITY PAGES (15 Pages) =====
  { path: 'help/index', title: 'Help & Support', description: 'Search help articles, category browse, popular articles, contact support', userType: 'public' },
  { path: 'help/faq', title: 'FAQ', description: 'Collapsible FAQ sections, search FAQs, categories, still need help CTA', userType: 'public' },
  { path: 'support/submit-ticket', title: 'Submit Support Ticket', description: 'Category selection, subject, description, attach files, priority', requiresAuth: true },
  { path: 'support/tickets/index', title: 'My Support Tickets', description: 'Open tickets, closed tickets, ticket status, view details, create new', requiresAuth: true },
  { path: 'support/tickets/[id]', title: 'Support Ticket Detail', description: 'Ticket info, conversation thread, reply, attach files, close ticket', requiresAuth: true },
  { path: 'legal/terms', title: 'Terms & Conditions', description: 'Full legal text, last updated date, table of contents, print/download', userType: 'public' },
  { path: 'legal/privacy', title: 'Privacy Policy', description: 'Privacy policy text, data handling, cookie policy, user rights', userType: 'public' },
  { path: 'settings/cookies', title: 'Cookie Preferences', description: 'Essential, analytics, marketing cookies toggles, save preferences', userType: 'public' },
  { path: 'settings/accessibility', title: 'Accessibility Settings', description: 'Font size, high contrast, screen reader optimization, keyboard nav', userType: 'public' },
  { path: 'settings/language', title: 'Language Selection', description: 'Available languages list, current language highlighted, change button', userType: 'public' },
  { path: 'settings/region', title: 'Region Settings', description: 'Country selection, time zone, currency, date format', userType: 'public' },
  { path: 'errors/404', title: 'Error 404', description: 'Friendly error message, search functionality, popular links, go home', userType: 'public' },
  { path: 'errors/500', title: 'Error 500', description: 'Server error message, try again button, report problem, go home', userType: 'public' },
  { path: 'errors/maintenance', title: 'Maintenance Mode', description: 'Maintenance notice, expected duration, status updates, contact info', userType: 'public' },
  { path: 'settings/delete-account', title: 'Delete Account', description: 'Warning message, consequences, reason dropdown, password confirm', requiresAuth: true },

  // ===== SECTION 10: ADMIN PANEL (25 Pages) =====
  { path: 'admin/dashboard/index', title: 'Admin Dashboard', description: 'Platform statistics, total users/bookings/revenue, growth charts', requiresAuth: true, userType: 'admin' },
  { path: 'admin/users/index', title: 'User Management', description: 'Users table (customers + businesses), search, filter, suspend/activate', requiresAuth: true, userType: 'admin' },
  { path: 'admin/users/customers', title: 'Customer Management', description: 'Customer list, details, activity history, suspend/delete account', requiresAuth: true, userType: 'admin' },
  { path: 'admin/users/businesses', title: 'Business Management', description: 'Business list, verification/subscription status, approve/reject/suspend', requiresAuth: true, userType: 'admin' },
  { path: 'admin/users/[id]', title: 'User Detail', description: 'Complete user info, status, activity log, bookings, tickets, admin notes', requiresAuth: true, userType: 'admin' },
  { path: 'admin/verification/queue', title: 'Verification Queue', description: 'Pending verifications list, business info, documents, approve/reject', requiresAuth: true, userType: 'admin' },
  { path: 'admin/verification/[id]', title: 'Verification Detail', description: 'Business profile, owner info, documents viewer, checklist, approve/reject', requiresAuth: true, userType: 'admin' },
  { path: 'admin/verification/document/[id]', title: 'Document Verification', description: 'Document viewer, type, status, approve/reject, request resubmission', requiresAuth: true, userType: 'admin' },
  { path: 'admin/bookings/index', title: 'Bookings Management', description: 'All platform bookings, filter by status/date/business, disputed bookings', requiresAuth: true, userType: 'admin' },
  { path: 'admin/bookings/disputes', title: 'Disputed Bookings', description: 'Dispute list, details, evidence from both parties, resolve, refund', requiresAuth: true, userType: 'admin' },
  { path: 'admin/reviews/moderation', title: 'Reviews Moderation', description: 'Flagged reviews, content, reporter info, approve/remove, contact', requiresAuth: true, userType: 'admin' },
  { path: 'admin/content/moderation', title: 'Content Moderation', description: 'Flagged content count, types, moderation queue, statistics', requiresAuth: true, userType: 'admin' },
  { path: 'admin/content/[id]', title: 'Content Detail', description: 'Content details, report reason, reporter info, approve/remove/warn/ban', requiresAuth: true, userType: 'admin' },
  { path: 'admin/categories/index', title: 'Categories Management', description: 'All categories list, add new, edit, reorder, analytics, delete', requiresAuth: true, userType: 'admin' },
  { path: 'admin/settings/general', title: 'Platform Settings', description: 'Platform name, logo, favicon, default language/currency/timezone', requiresAuth: true, userType: 'admin' },
  { path: 'admin/settings/features', title: 'Feature Settings', description: 'Enable/disable features: booking, payment, review, messaging toggles', requiresAuth: true, userType: 'admin' },
  { path: 'admin/settings/email', title: 'Email Settings', description: 'Email templates, SMTP settings, sender name, test email function', requiresAuth: true, userType: 'admin' },
  { path: 'admin/settings/payment', title: 'Payment Settings', description: 'Payment gateways, commission rates, platform fees, payout schedule', requiresAuth: true, userType: 'admin' },
  { path: 'admin/settings/security', title: 'Security Settings', description: 'Password policies, session timeout, 2FA requirement, IP whitelist', requiresAuth: true, userType: 'admin' },
  { path: 'admin/plans/index', title: 'Subscription Plans', description: 'All plans list, create new plan, edit features, pricing, archive', requiresAuth: true, userType: 'admin' },
  { path: 'admin/plans/edit/[id]', title: 'Edit Plan', description: 'Plan name, description, price, features checklist, limits, save', requiresAuth: true, userType: 'admin' },
  { path: 'admin/reports/index', title: 'Financial Reports', description: 'Total platform revenue, by plan, commission earned, payout pending', requiresAuth: true, userType: 'admin' },
  { path: 'admin/analytics/index', title: 'Analytics & Insights', description: 'User growth, business growth, booking trends, popular categories', requiresAuth: true, userType: 'admin' },
  { path: 'admin/logs/index', title: 'System Logs', description: 'Activity logs, error logs, security logs, filter by date/type, export', requiresAuth: true, userType: 'admin' },
  { path: 'admin/team/index', title: 'Admin Users', description: 'Admin list, add new admin, edit permissions, remove admin, activity log', requiresAuth: true, userType: 'admin' },

  // ===== SECTION 11: ADDITIONAL FEATURES (10 Pages) =====
  { path: 'features/referral', title: 'Referral Program', description: 'Referral link, referral statistics, rewards earned, referred users', requiresAuth: true },
  { path: 'features/rewards', title: 'Loyalty Rewards', description: 'Points balance, rewards catalog, redeem rewards, transaction history', requiresAuth: true },
  { path: 'features/gift-cards', title: 'Gift Cards', description: 'Purchase gift card, balance, redeem, send gift card, transaction history', requiresAuth: true },
  { path: 'features/deals', title: 'Deals & Offers', description: 'Available deals, filter by category, location-based offers, saved offers', userType: 'public' },
  { path: 'features/events', title: 'Events & Workshops', description: 'Upcoming events, event details, register, my registered events, past events', userType: 'public' },
  { path: 'features/directory', title: 'Business Directory', description: 'All businesses listing, advanced filters, map view, featured, recently added', userType: 'public' },
  { path: 'features/compare', title: 'Compare Businesses', description: 'Select businesses to compare, side-by-side comparison, features, pricing', userType: 'public' },
  { path: 'features/saved-searches', title: 'Saved Searches', description: 'Saved search queries, alert settings, edit search, delete, create alert', requiresAuth: true },
  { path: 'features/activity', title: 'Activity Feed', description: 'Recent activities, filter by type, social interactions, achievements', requiresAuth: true },
  { path: 'features/download-app', title: 'Download App', description: 'Download links (iOS/Android), QR code, app features, screenshots, ratings', userType: 'public' },
];

function generatePageContent(page: PageConfig): string {
  const componentName = page.path
    .split('/')
    .pop()!
    .replace(/\[.*?\]/g, 'Dynamic')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
    .replace(/^Index$/, 'Index')
    + 'Screen';

  const isDynamic = page.path.includes('[');
  const dynamicParams = page.path.match(/\[(.*?)\]/g)?.map(p => p.slice(1, -1)) || [];

  return `/**
 * ${page.title}
 * 
 * ${page.description}
 * 
 * User Type: ${page.userType || 'all'}
 * Requires Auth: ${page.requiresAuth ? 'Yes' : 'No'}
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack${isDynamic ? ', useLocalSearchParams' : ''}, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

// Color Constants
const Colors = {
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

export default function ${componentName}() {
  ${isDynamic ? `const { ${dynamicParams.join(', ')} } = useLocalSearchParams<{ ${dynamicParams.map(p => `${p}: string`).join('; ')} }>();` : ''}
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [${isDynamic ? dynamicParams.join(', ') : ''}]);

  const loadData = async () => {
    try {
      setLoading(true);
      // TODO: Fetch data from Supabase
      // const { data, error } = await supabase
      //   .from('table_name')
      //   .select('*');
      
      // Simulated data load
      await new Promise(resolve => setTimeout(resolve, 500));
      setData({});
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: '${page.title}' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: '${page.title}',
          headerStyle: { backgroundColor: Colors.white },
          headerTintColor: Colors.grayDark,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Page Header */}
        <View style={styles.header}>
          <Text style={styles.title}>${page.title}</Text>
          <Text style={styles.subtitle}>
            ${page.description}
          </Text>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          {/* TODO: Implement ${page.title} UI components */}
          <View style={styles.placeholder}>
            <Ionicons name="construct-outline" size={48} color={Colors.gray} />
            <Text style={styles.placeholderText}>
              Content coming soon
            </Text>
            <Text style={styles.placeholderSubtext}>
              This page is being developed
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              // TODO: Primary action
            }}
          >
            <Text style={styles.primaryButtonText}>Primary Action</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.grayDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
  },
  content: {
    flex: 1,
    minHeight: 300,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.grayLight,
    borderRadius: 16,
    padding: 32,
    minHeight: 200,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.grayDark,
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.grayLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.grayDark,
    fontSize: 16,
    fontWeight: '600',
  },
});
`;
}

function generateLayoutFile(folderPath: string, title: string): string {
  return `import { Stack } from 'expo-router';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    />
  );
}
`;
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createPageFile(page: PageConfig) {
  const fullPath = path.join(APP_DIR, page.path + '.tsx');
  const dirPath = path.dirname(fullPath);
  
  ensureDirectoryExists(dirPath);
  
  // Only create if doesn't exist
  if (!fs.existsSync(fullPath)) {
    const content = generatePageContent(page);
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Created: ${page.path}`);
  } else {
    console.log(`⏭️ Exists: ${page.path}`);
  }
}

function createLayoutFiles() {
  const layoutFolders = [
    { path: 'public', title: 'Public' },
    { path: 'auth', title: 'Auth' },
    { path: 'onboarding', title: 'Onboarding' },
    { path: 'customer', title: 'Customer' },
    { path: 'customer/dashboard', title: 'CustomerDashboard' },
    { path: 'customer/explore', title: 'CustomerExplore' },
    { path: 'customer/booking', title: 'CustomerBooking' },
    { path: 'customer/bookings', title: 'CustomerBookings' },
    { path: 'customer/favorites', title: 'CustomerFavorites' },
    { path: 'customer/search', title: 'CustomerSearch' },
    { path: 'customer/categories', title: 'CustomerCategories' },
    { path: 'customer/reviews', title: 'CustomerReviews' },
    { path: 'customer/notifications', title: 'CustomerNotifications' },
    { path: 'customer/messages', title: 'CustomerMessages' },
    { path: 'customer/profile', title: 'CustomerProfile' },
    { path: 'customer/settings', title: 'CustomerSettings' },
    { path: 'business', title: 'Business' },
    { path: 'business/onboarding', title: 'BusinessOnboarding' },
    { path: 'business/dashboard', title: 'BusinessDashboard' },
    { path: 'business/profile', title: 'BusinessProfile' },
    { path: 'business/photos', title: 'BusinessPhotos' },
    { path: 'business/services', title: 'BusinessServices' },
    { path: 'business/bookings', title: 'BusinessBookings' },
    { path: 'business/customers', title: 'BusinessCustomers' },
    { path: 'business/reviews', title: 'BusinessReviews' },
    { path: 'business/analytics', title: 'BusinessAnalytics' },
    { path: 'business/promotions', title: 'BusinessPromotions' },
    { path: 'business/notifications', title: 'BusinessNotifications' },
    { path: 'business/messages', title: 'BusinessMessages' },
    { path: 'business/settings', title: 'BusinessSettings' },
    { path: 'business/team', title: 'BusinessTeam' },
    { path: 'business/subscription', title: 'BusinessSubscription' },
    { path: 'business/owner', title: 'BusinessOwner' },
    { path: 'admin', title: 'Admin' },
    { path: 'admin/dashboard', title: 'AdminDashboard' },
    { path: 'admin/users', title: 'AdminUsers' },
    { path: 'admin/verification', title: 'AdminVerification' },
    { path: 'admin/bookings', title: 'AdminBookings' },
    { path: 'admin/reviews', title: 'AdminReviews' },
    { path: 'admin/content', title: 'AdminContent' },
    { path: 'admin/categories', title: 'AdminCategories' },
    { path: 'admin/settings', title: 'AdminSettings' },
    { path: 'admin/plans', title: 'AdminPlans' },
    { path: 'admin/reports', title: 'AdminReports' },
    { path: 'admin/analytics', title: 'AdminAnalytics' },
    { path: 'admin/logs', title: 'AdminLogs' },
    { path: 'admin/team', title: 'AdminTeam' },
    { path: 'help', title: 'Help' },
    { path: 'support', title: 'Support' },
    { path: 'support/tickets', title: 'SupportTickets' },
    { path: 'legal', title: 'Legal' },
    { path: 'settings', title: 'Settings' },
    { path: 'errors', title: 'Errors' },
    { path: 'features', title: 'Features' },
  ];

  for (const folder of layoutFolders) {
    const layoutPath = path.join(APP_DIR, folder.path, '_layout.tsx');
    const dirPath = path.dirname(layoutPath);
    
    ensureDirectoryExists(dirPath);
    
    if (!fs.existsSync(layoutPath)) {
      const content = generateLayoutFile(folder.path, folder.title);
      fs.writeFileSync(layoutPath, content);
      console.log(`📁 Created layout: ${folder.path}/_layout.tsx`);
    }
  }
}

// Main execution
console.log('🚀 Starting TownTap Page Generator...\n');

// Create layout files first
console.log('📁 Creating layout files...\n');
createLayoutFiles();

// Create all pages
console.log('\n📄 Creating page files...\n');
let created = 0;
let skipped = 0;

for (const page of pages) {
  const fullPath = path.join(APP_DIR, page.path + '.tsx');
  if (!fs.existsSync(fullPath)) {
    createPageFile(page);
    created++;
  } else {
    console.log(`⏭️ Exists: ${page.path}`);
    skipped++;
  }
}

console.log(`\n✨ Complete!`);
console.log(`   📄 Pages created: ${created}`);
console.log(`   ⏭️ Pages skipped: ${skipped}`);
console.log(`   📊 Total pages: ${pages.length}`);
