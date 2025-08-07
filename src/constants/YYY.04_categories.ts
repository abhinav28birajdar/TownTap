// =====================================================
// ENHANCED TOWNTAP - BUSINESS CATEGORIES SYSTEM
// Comprehensive categorization with icons and interaction types
// =====================================================

export type BusinessInteractionType = 'cart' | 'calendar' | 'chat' | 'hybrid';

export interface BusinessCategory {
  id: string;
  name: string;
  nameHi: string; // Hindi translation
  description: string;
  descriptionHi: string;
  icon: string; // Ionicons icon name
  color: string; // Color from our color palette
  interactionType: BusinessInteractionType;
  subcategories?: string[];
  isPopular?: boolean;
  searchKeywords: string[]; // For AI search enhancement
}

export const BusinessCategories: Record<string, BusinessCategory> = {
  // Food & Beverages (Cart-based)
  restaurants: {
    id: 'restaurants',
    name: 'Restaurants',
    nameHi: 'रेस्तराँ',
    description: 'Local restaurants and dining',
    descriptionHi: 'स्थानीय रेस्तराँ और भोजन',
    icon: 'restaurant',
    color: '#FF6B6B',
    interactionType: 'cart',
    isPopular: true,
    subcategories: ['North Indian', 'South Indian', 'Chinese', 'Fast Food', 'Street Food', 'Sweets'],
    searchKeywords: ['food', 'dining', 'restaurant', 'eat', 'meal', 'delivery', 'takeaway', 'भोजन', 'खाना'],
  },
  
  cafes: {
    id: 'cafes',
    name: 'Cafes & Bakery',
    nameHi: 'कैफे और बेकरी',
    description: 'Coffee shops, tea stalls, bakeries',
    descriptionHi: 'कॉफी शॉप, चाय की दुकान, बेकरी',
    icon: 'cafe',
    color: '#8B4513',
    interactionType: 'cart',
    subcategories: ['Coffee', 'Tea', 'Bakery Items', 'Snacks', 'Ice Cream'],
    searchKeywords: ['coffee', 'tea', 'cafe', 'bakery', 'snacks', 'cake', 'कॉफी', 'चाय', 'केक'],
  },

  // Retail & Shopping (Cart-based)
  grocery: {
    id: 'grocery',
    name: 'Grocery & Staples',
    nameHi: 'किराना और आवश्यक वस्तुएं',
    description: 'Daily essentials and groceries',
    descriptionHi: 'दैनिक आवश्यकताएं और किराना',
    icon: 'basket',
    color: '#4ECDC4',
    interactionType: 'cart',
    isPopular: true,
    subcategories: ['Vegetables', 'Fruits', 'Dairy', 'Packaged Foods', 'Household Items'],
    searchKeywords: ['grocery', 'vegetables', 'fruits', 'milk', 'daily', 'essentials', 'किराना', 'सब्जी', 'फल'],
  },

  pharmacy: {
    id: 'pharmacy',
    name: 'Pharmacy & Health',
    nameHi: 'दवाखाना और स्वास्थ्य',
    description: 'Medicines and health products',
    descriptionHi: 'दवाइयां और स्वास्थ्य उत्पाद',
    icon: 'medical',
    color: '#45B7D1',
    interactionType: 'cart',
    isPopular: true,
    subcategories: ['Medicines', 'Health Supplements', 'Medical Equipment', 'Baby Care'],
    searchKeywords: ['medicine', 'pharmacy', 'health', 'medical', 'drug', 'दवा', 'स्वास्थ्य', 'मेडिकल'],
  },

  electronics: {
    id: 'electronics',
    name: 'Electronics & Mobile',
    nameHi: 'इलेक्ट्रॉनिक्स और मोबाइल',
    description: 'Electronics, mobile phones, accessories',
    descriptionHi: 'इलेक्ट्रॉनिक्स, मोबाइल फोन, एक्सेसरीज़',
    icon: 'phone-portrait',
    color: '#96CEB4',
    interactionType: 'hybrid',
    subcategories: ['Mobile Phones', 'Laptops', 'Accessories', 'Home Appliances', 'Repair'],
    searchKeywords: ['mobile', 'phone', 'laptop', 'electronics', 'repair', 'मोबाइल', 'इलेक्ट्रॉनिक्स'],
  },

  fashion: {
    id: 'fashion',
    name: 'Fashion & Clothing',
    nameHi: 'फैशन और कपड़े',
    description: 'Clothing, shoes, accessories',
    descriptionHi: 'कपड़े, जूते, एक्सेसरीज़',
    icon: 'shirt',
    color: '#FFEAA7',
    interactionType: 'cart',
    subcategories: ['Men Clothing', 'Women Clothing', 'Kids Clothing', 'Shoes', 'Bags', 'Jewelry'],
    searchKeywords: ['clothes', 'fashion', 'shirt', 'dress', 'shoes', 'कपड़े', 'फैशन', 'जूते'],
  },

  // Services (Calendar-based)
  beauty: {
    id: 'beauty',
    name: 'Beauty & Salon',
    nameHi: 'सौंदर्य और सैलून',
    description: 'Beauty salons, spas, grooming',
    descriptionHi: 'ब्यूटी सैलून, स्पा, ग्रूमिंग',
    icon: 'cut',
    color: '#DDA0DD',
    interactionType: 'calendar',
    isPopular: true,
    subcategories: ['Hair Cut', 'Hair Color', 'Facial', 'Massage', 'Manicure', 'Pedicure'],
    searchKeywords: ['salon', 'beauty', 'haircut', 'facial', 'massage', 'सैलून', 'ब्यूटी', 'बाल'],
  },

  homeServices: {
    id: 'homeServices',
    name: 'Home Services',
    nameHi: 'घरेलू सेवाएं',
    description: 'Repair, maintenance, cleaning',
    descriptionHi: 'मरम्मत, रखरखाव, सफाई',
    icon: 'hammer',
    color: '#98D8C8',
    interactionType: 'calendar',
    isPopular: true,
    subcategories: ['Electrician', 'Plumber', 'AC Repair', 'Cleaning', 'Carpenter', 'Painter'],
    searchKeywords: ['repair', 'electrician', 'plumber', 'cleaning', 'मरम्मत', 'इलेक्ट्रीशियन', 'सफाई'],
  },

  automotive: {
    id: 'automotive',
    name: 'Automotive Services',
    nameHi: 'ऑटोमोटिव सेवाएं',
    description: 'Vehicle repair, maintenance, fuel',
    descriptionHi: 'वाहन मरम्मत, रखरखाव, ईंधन',
    icon: 'car',
    color: '#F7DC6F',
    interactionType: 'calendar',
    subcategories: ['Car Repair', 'Bike Repair', 'Car Wash', 'Fuel Station', 'Spare Parts'],
    searchKeywords: ['car', 'bike', 'repair', 'service', 'fuel', 'कार', 'बाइक', 'मरम्मत'],
  },

  health: {
    id: 'health',
    name: 'Healthcare Services',
    nameHi: 'स्वास्थ्य सेवाएं',
    description: 'Doctors, clinics, diagnostics',
    descriptionHi: 'डॉक्टर, क्लिनिक, निदान',
    icon: 'medical',
    color: '#85C1E9',
    interactionType: 'calendar',
    isPopular: true,
    subcategories: ['General Physician', 'Specialist', 'Dentist', 'Lab Tests', 'Physiotherapy'],
    searchKeywords: ['doctor', 'clinic', 'health', 'medical', 'test', 'डॉक्टर', 'क्लिनिक', 'स्वास्थ्य'],
  },

  education: {
    id: 'education',
    name: 'Education & Coaching',
    nameHi: 'शिक्षा और कोचिंग',
    description: 'Tutoring, coaching, skill development',
    descriptionHi: 'ट्यूशन, कोचिंग, कौशल विकास',
    icon: 'school',
    color: '#BB8FCE',
    interactionType: 'calendar',
    subcategories: ['Academic Tuition', 'Competitive Exams', 'Music', 'Dance', 'Art', 'Sports'],
    searchKeywords: ['tuition', 'coaching', 'education', 'learn', 'ट्यूशन', 'कोचिंग', 'शिक्षा'],
  },

  // Professional Services (Chat-based)
  legal: {
    id: 'legal',
    name: 'Legal Services',
    nameHi: 'कानूनी सेवाएं',
    description: 'Lawyers, legal consultation',
    descriptionHi: 'वकील, कानूनी सलाह',
    icon: 'library',
    color: '#34495E',
    interactionType: 'chat',
    subcategories: ['Civil Law', 'Criminal Law', 'Property Law', 'Family Law', 'Business Law'],
    searchKeywords: ['lawyer', 'legal', 'advocate', 'court', 'वकील', 'कानूनी', 'अदालत'],
  },

  financial: {
    id: 'financial',
    name: 'Financial Services',
    nameHi: 'वित्तीय सेवाएं',
    description: 'Banking, insurance, investment',
    descriptionHi: 'बैंकिंग, बीमा, निवेश',
    icon: 'card',
    color: '#2ECC71',
    interactionType: 'chat',
    subcategories: ['Banking', 'Insurance', 'Loans', 'Investment', 'Tax Services'],
    searchKeywords: ['bank', 'insurance', 'loan', 'investment', 'tax', 'बैंक', 'बीमा', 'लोन'],
  },

  realEstate: {
    id: 'realEstate',
    name: 'Real Estate',
    nameHi: 'रियल एस्टेट',
    description: 'Property buying, selling, renting',
    descriptionHi: 'संपत्ति खरीदना, बेचना, किराया',
    icon: 'home',
    color: '#E67E22',
    interactionType: 'chat',
    subcategories: ['Buy Property', 'Sell Property', 'Rent', 'PG/Hostel', 'Commercial'],
    searchKeywords: ['property', 'house', 'rent', 'buy', 'sell', 'संपत्ति', 'घर', 'किराया'],
  },

  // Entertainment & Lifestyle
  entertainment: {
    id: 'entertainment',
    name: 'Entertainment',
    nameHi: 'मनोरंजन',
    description: 'Events, parties, entertainment',
    descriptionHi: 'कार्यक्रम, पार्टी, मनोरंजन',
    icon: 'musical-notes',
    color: '#F1948A',
    interactionType: 'hybrid',
    subcategories: ['Event Planning', 'Photography', 'DJ Services', 'Catering', 'Decorations'],
    searchKeywords: ['event', 'party', 'entertainment', 'photography', 'कार्यक्रम', 'पार्टी'],
  },

  travel: {
    id: 'travel',
    name: 'Travel & Transport',
    nameHi: 'यात्रा और परिवहन',
    description: 'Travel agencies, transport services',
    descriptionHi: 'ट्रैवल एजेंसी, परिवहन सेवाएं',
    icon: 'airplane',
    color: '#3498DB',
    interactionType: 'chat',
    subcategories: ['Travel Packages', 'Hotel Booking', 'Transport', 'Tour Guide'],
    searchKeywords: ['travel', 'tour', 'hotel', 'transport', 'यात्रा', 'टूर', 'होटल'],
  },

  // Other Services
  other: {
    id: 'other',
    name: 'Other Services',
    nameHi: 'अन्य सेवाएं',
    description: 'Miscellaneous services',
    descriptionHi: 'विविध सेवाएं',
    icon: 'ellipsis-horizontal',
    color: '#95A5A6',
    interactionType: 'chat',
    subcategories: ['Consultation', 'Custom Services'],
    searchKeywords: ['other', 'miscellaneous', 'custom', 'अन्य', 'विविध'],
  },
} as const;

// Helper functions
export const getPopularCategories = (): BusinessCategory[] => {
  return Object.values(BusinessCategories).filter(category => category.isPopular);
};

export const getCategoriesByType = (type: BusinessInteractionType): BusinessCategory[] => {
  return Object.values(BusinessCategories).filter(category => category.interactionType === type);
};

export const getCategoryById = (id: string): BusinessCategory | undefined => {
  return BusinessCategories[id];
};

export const searchCategories = (query: string, language: 'en' | 'hi' = 'en'): BusinessCategory[] => {
  const searchTerm = query.toLowerCase();
  
  return Object.values(BusinessCategories).filter(category => {
    const name = language === 'hi' ? category.nameHi : category.name;
    const description = language === 'hi' ? category.descriptionHi : category.description;
    
    return (
      name.toLowerCase().includes(searchTerm) ||
      description.toLowerCase().includes(searchTerm) ||
      category.searchKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
      (category.subcategories?.some(sub => sub.toLowerCase().includes(searchTerm)) ?? false)
    );
  });
};

export type CategoryId = keyof typeof BusinessCategories;
