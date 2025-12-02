import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number');

const phoneSchema = z.string()
  .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number')
  .min(1, 'Phone number is required');

const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// Authentication Schemas
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  dateOfBirth: z.date().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  marketingOptIn: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Profile Schemas
export const profileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter date in YYYY-MM-DD format').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

export const updateProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema.optional(),
  dateOfBirth: z.date().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(1, 'Country is required'),
  }).optional(),
  preferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
    }),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'contacts']),
      showLocation: z.boolean(),
      showPhone: z.boolean(),
    }),
    theme: z.enum(['light', 'dark', 'system']),
    language: z.string(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string(),
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// Business Schemas
export const businessRegistrationSchema = z.object({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(1, 'Please select a category'),
  subcategory: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
    country: z.string().min(1, 'Country is required'),
  }),
  businessHours: z.object({
    monday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    tuesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    wednesday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    thursday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    friday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    saturday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
    sunday: z.object({ open: z.string(), close: z.string(), closed: z.boolean() }),
  }),
  services: z.array(z.object({
    name: z.string().min(1, 'Service name is required'),
    description: z.string().min(10, 'Service description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be a positive number'),
    duration: z.number().min(15, 'Duration must be at least 15 minutes'),
    category: z.string().min(1, 'Service category is required'),
  })).min(1, 'At least one service is required'),
  licenseNumber: z.string().optional(),
  insurance: z.object({
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
    expirationDate: z.date().optional(),
  }).optional(),
  taxId: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string()
    .min(2, 'Service name must be at least 2 characters')
    .max(100, 'Service name must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  price: z.number()
    .min(0, 'Price must be a positive number')
    .max(10000, 'Price seems unreasonably high'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(480, 'Duration cannot exceed 8 hours'),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  isActive: z.boolean(),
  requirements: z.array(z.string()).optional(),
  images: z.array(z.object({
    uri: z.string().url(),
    type: z.string(),
    name: z.string(),
  })).optional(),
});

// Booking Schemas
export const bookingSchema = z.object({
  businessId: z.string().min(1, 'Business selection is required'),
  serviceId: z.string().min(1, 'Service selection is required'),
  date: z.date().refine(date => date >= new Date(), {
    message: 'Booking date cannot be in the past',
  }),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  contactInfo: z.object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
  }),
  preferences: z.object({
    reminderTime: z.enum(['15min', '30min', '1hour', '1day']).optional(),
    communicationMethod: z.enum(['email', 'sms', 'app']),
  }).optional(),
  emergencyContact: z.object({
    name: nameSchema,
    phone: phoneSchema,
    relationship: z.string().min(1, 'Relationship is required'),
  }).optional(),
});

export const reviewSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars')
    .int('Rating must be a whole number'),
  title: z.string()
    .min(5, 'Review title must be at least 5 characters')
    .max(100, 'Review title must be less than 100 characters'),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  wouldRecommend: z.boolean(),
  serviceQuality: z.number().min(1).max(5).int(),
  valueForMoney: z.number().min(1).max(5).int(),
  punctuality: z.number().min(1).max(5).int(),
  communication: z.number().min(1).max(5).int(),
  photos: z.array(z.object({
    uri: z.string().url(),
    type: z.string(),
    name: z.string(),
  })).optional(),
});

// Search and Filter Schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    radius: z.number().min(1).max(100), // km
    address: z.string().optional(),
  }).optional(),
  filters: z.object({
    category: z.string().optional(),
    subcategory: z.string().optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
    }).optional(),
    rating: z.number().min(1).max(5).optional(),
    availability: z.object({
      date: z.date().optional(),
      time: z.string().optional(),
    }).optional(),
    distance: z.number().min(1).max(100).optional(),
    verified: z.boolean().optional(),
    instantBooking: z.boolean().optional(),
  }).optional(),
  sortBy: z.enum(['relevance', 'distance', 'rating', 'price-low', 'price-high', 'newest']).optional(),
});

// Type exports for TypeScript
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type BusinessRegistrationFormData = z.infer<typeof businessRegistrationSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;

// Validation utilities
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};

export const validatePassword = (password: string): boolean => {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
};

export const validatePhone = (phone: string): boolean => {
  try {
    phoneSchema.parse(phone);
    return true;
  } catch {
    return false;
  }
};

// Form field validation helpers
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  return errors[fieldName]?.message;
};

export const isFieldInvalid = (errors: any, fieldName: string): boolean => {
  return !!errors[fieldName];
};

// Custom validation rules
export const customValidationRules = {
  businessEmail: (email: string) => {
    // Business emails should not be from common free providers for verification
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (freeProviders.includes(domain)) {
      return 'Please use a business email address';
    }
    return true;
  },
  
  futureDate: (date: Date) => {
    if (date <= new Date()) {
      return 'Date must be in the future';
    }
    return true;
  },
  
  businessHours: (open: string, close: string) => {
    if (open >= close) {
      return 'Opening time must be before closing time';
    }
    return true;
  },
  
  minimumAge: (dateOfBirth: Date, minAge: number = 18) => {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    
    if (age < minAge) {
      return `You must be at least ${minAge} years old`;
    }
    return true;
  },
};