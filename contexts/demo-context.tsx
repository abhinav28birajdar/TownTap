import { Database } from '@/lib/database.types';
import React, { createContext, useContext, useState } from 'react';

type Business = Database['public']['Tables']['businesses']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Review = Database['public']['Tables']['reviews']['Row'];
type Service = Database['public']['Tables']['services']['Row'];

type DemoContextType = {
  isDemo: boolean;
  setDemo: (enabled: boolean) => void;
  demoCategories: Category[];
  demoBusinesses: Business[];
  demoServices: Service[];
  demoBookings: Booking[];
  demoReviews: Review[];
  currentUser: {
    id: string;
    role: 'customer' | 'business_owner';
    full_name: string;
    phone: string;
    avatar_url: string | null;
  } | null;
  setCurrentUser: (user: any) => void;
};

const DemoContext = createContext<DemoContextType | undefined>(undefined);

// Demo data
const demoCategories: Category[] = [
  { id: '1', name: 'Carpenter', slug: 'carpenter', icon: 'hammer', created_at: new Date().toISOString() },
  { id: '2', name: 'Plumber', slug: 'plumber', icon: 'water', created_at: new Date().toISOString() },
  { id: '3', name: 'Electrician', slug: 'electrician', icon: 'flash', created_at: new Date().toISOString() },
  { id: '4', name: 'Cleaning', slug: 'cleaning', icon: 'sparkles', created_at: new Date().toISOString() },
  { id: '5', name: 'Barber', slug: 'barber', icon: 'cut', created_at: new Date().toISOString() },
  { id: '6', name: 'Catering', slug: 'catering', icon: 'restaurant', created_at: new Date().toISOString() },
];

const demoBusinesses: Business[] = [
  {
    id: '1',
    owner_id: 'demo-business-owner-1',
    name: 'Quick Fix Carpentry',
    description: 'Professional carpentry services with 10+ years experience',
    category_id: '1',
    address: '123 Main St, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    opening_hours: { mon: '9:00-18:00', tue: '9:00-18:00', wed: '9:00-18:00', thu: '9:00-18:00', fri: '9:00-18:00', sat: '10:00-16:00' },
    phone: '+1-555-0123',
    avatar_url: null,
    avg_rating: 4.8,
    total_reviews: 124,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    owner_id: 'demo-business-owner-2',
    name: 'Premium Plumbing Solutions',
    description: 'Expert plumbing services available 24/7',
    category_id: '2',
    address: '456 Oak Ave, Midtown',
    latitude: 40.7589,
    longitude: -73.9851,
    opening_hours: { all: '24/7' },
    phone: '+1-555-0456',
    avatar_url: null,
    avg_rating: 4.6,
    total_reviews: 89,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    owner_id: 'demo-business-owner-3',
    name: 'Spark Electric Co.',
    description: 'Licensed electricians for all your electrical needs',
    category_id: '3',
    address: '789 Pine St, Uptown',
    latitude: 40.7831,
    longitude: -73.9712,
    opening_hours: { mon: '8:00-17:00', tue: '8:00-17:00', wed: '8:00-17:00', thu: '8:00-17:00', fri: '8:00-17:00' },
    phone: '+1-555-0789',
    avatar_url: null,
    avg_rating: 4.9,
    total_reviews: 156,
    is_verified: true,
    created_at: new Date().toISOString(),
  },
];

const demoServices: Service[] = [
  { id: '1', business_id: '1', title: 'Furniture Assembly', description: 'Professional furniture assembly service', price: 75, duration_minutes: 120, created_at: new Date().toISOString() },
  { id: '2', business_id: '1', title: 'Cabinet Installation', description: 'Kitchen and bathroom cabinet installation', price: 150, duration_minutes: 240, created_at: new Date().toISOString() },
  { id: '3', business_id: '2', title: 'Pipe Repair', description: 'Fix leaking or damaged pipes', price: 95, duration_minutes: 90, created_at: new Date().toISOString() },
  { id: '4', business_id: '2', title: 'Drain Cleaning', description: 'Professional drain cleaning service', price: 65, duration_minutes: 60, created_at: new Date().toISOString() },
  { id: '5', business_id: '3', title: 'Electrical Wiring', description: 'New electrical wiring installation', price: 200, duration_minutes: 180, created_at: new Date().toISOString() },
  { id: '6', business_id: '3', title: 'Light Fixture Installation', description: 'Install new light fixtures', price: 45, duration_minutes: 45, created_at: new Date().toISOString() },
];

const demoBookings: Booking[] = [
  {
    id: '1',
    customer_id: 'demo-customer-1',
    business_id: '1',
    service_id: '1',
    status: 'completed',
    scheduled_for: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    price: 75,
    payment_method: 'cash',
    payment_status: 'paid',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    customer_id: 'demo-customer-1',
    business_id: '2',
    service_id: '3',
    status: 'in_progress',
    scheduled_for: new Date().toISOString(),
    price: 95,
    payment_method: 'online',
    payment_status: 'paid',
    created_at: new Date().toISOString(),
  },
];

const demoReviews: Review[] = [
  {
    id: '1',
    booking_id: '1',
    customer_id: 'demo-customer-1',
    business_id: '1',
    rating: 5,
    comment: 'Excellent service! Very professional and finished on time.',
    created_at: new Date().toISOString(),
  },
];

export const DemoProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDemo, setIsDemo] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const setDemo = (enabled: boolean) => {
    setIsDemo(enabled);
    if (enabled) {
      // Set demo customer user
      setCurrentUser({
        id: 'demo-customer-1',
        role: 'customer',
        full_name: 'John Demo',
        phone: '+1-555-0001',
        avatar_url: null,
      });
    } else {
      setCurrentUser(null);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemo,
        setDemo,
        demoCategories,
        demoBusinesses,
        demoServices,
        demoBookings,
        demoReviews,
        currentUser,
        setCurrentUser,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};