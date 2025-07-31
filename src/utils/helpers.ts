// =====================================================
// Utility Helper Functions for TownTap
// =====================================================

/**
 * Generate a unique referral code based on user's name
 */
export function generateReferralCode(fullName: string): string {
  const prefix = fullName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${randomSuffix}`;
}

/**
 * Format phone number for consistency
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Add country code if missing (assuming India +91)
  if (cleanPhone.length === 10) {
    return `+91${cleanPhone}`;
  }
  
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return `+${cleanPhone}`;
  }
  
  return cleanPhone.startsWith('+') ? phone : `+${cleanPhone}`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toFixed(2)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    case 'long':
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'datetime':
      return `${formatDate(dateObj, 'short')} ${formatDate(dateObj, 'time')}`;
    default:
      return dateObj.toLocaleDateString('en-IN');
  }
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TT${dateString}${randomString}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Indian phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || (cleanPhone.length === 12 && cleanPhone.startsWith('91'));
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Debounce function for search optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: any;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(past, 'short');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Get file extension from URL or filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Format business hours for display
 */
export function formatBusinessHours(hours: Record<string, any>): string {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const openDays = daysOfWeek.filter(day => 
    hours[day] && !hours[day].is_closed
  );

  if (openDays.length === 0) return 'Closed';
  if (openDays.length === 7) {
    const firstDay = hours[openDays[0]];
    return `Daily ${firstDay.open} - ${firstDay.close}`;
  }

  // Group consecutive days with same hours
  const groups: string[] = [];
  let currentGroup = [openDays[0]];
  let currentHours = `${hours[openDays[0]].open} - ${hours[openDays[0]].close}`;

  for (let i = 1; i < openDays.length; i++) {
    const dayHours = `${hours[openDays[i]].open} - ${hours[openDays[i]].close}`;
    if (dayHours === currentHours) {
      currentGroup.push(openDays[i]);
    } else {
      groups.push(formatDayGroup(currentGroup, currentHours));
      currentGroup = [openDays[i]];
      currentHours = dayHours;
    }
  }
  groups.push(formatDayGroup(currentGroup, currentHours));

  return groups.join(', ');
}

function formatDayGroup(days: string[], hours: string): string {
  if (days.length === 1) {
    return `${capitalizeWords(days[0])} ${hours}`;
  }
  return `${capitalizeWords(days[0])}-${capitalizeWords(days[days.length - 1])} ${hours}`;
}

/**
 * Get color based on rating
 */
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return '#4CAF50'; // Green
  if (rating >= 3.5) return '#FF9800'; // Orange
  if (rating >= 2.5) return '#FFC107'; // Yellow
  return '#F44336'; // Red
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'pending':
      return '#FF9800';
    case 'accepted':
    case 'confirmed':
      return '#2196F3';
    case 'in_progress':
    case 'on_route':
      return '#673AB7';
    case 'completed':
    case 'delivered':
      return '#4CAF50';
    case 'cancelled':
    case 'rejected':
      return '#F44336';
    default:
      return '#757575';
  }
}

/**
 * Parse search query for smart matching
 */
export function parseSearchQuery(query: string): {
  keywords: string[];
  location?: string;
  category?: string;
  urgent?: boolean;
} {
  const keywords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  // Check for location indicators
  const locationWords = ['near', 'in', 'at', 'around'];
  const locationIndex = keywords.findIndex(word => locationWords.includes(word));
  const location = locationIndex !== -1 && locationIndex < keywords.length - 1 
    ? keywords[locationIndex + 1] 
    : undefined;

  // Check for urgency indicators
  const urgentWords = ['urgent', 'emergency', 'asap', 'immediate'];
  const urgent = keywords.some(word => urgentWords.includes(word));

  // Common service categories for better matching
  const categories = [
    'plumber', 'electrician', 'carpenter', 'painter', 'cleaning', 
    'mechanic', 'doctor', 'lawyer', 'tutor', 'chef'
  ];
  const category = keywords.find(word => categories.includes(word));

  return {
    keywords: keywords.filter(word => 
      !locationWords.includes(word) && 
      !urgentWords.includes(word) &&
      word !== location &&
      word !== category
    ),
    location,
    category,
    urgent
  };
}
