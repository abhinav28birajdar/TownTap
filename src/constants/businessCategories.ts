// FILE: src/constants/businessCategories.ts
// PURPOSE: Comprehensive business categories and subcategories for TownTap platform

export interface BusinessSubcategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  averageDeliveryTime?: string;
  popularTimes?: string[];
}

export interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subcategories: BusinessSubcategory[];
  isPopular?: boolean;
  orderIndex: number;
}

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'food_beverage',
    name: 'Food & Beverage',
    description: 'Restaurants, cafes, food delivery, and beverage services',
    icon: '🍽️',
    color: '#FF6B6B',
    isPopular: true,
    orderIndex: 1,
    subcategories: [
      {
        id: 'restaurant',
        name: 'Restaurant',
        description: 'Full-service dining establishments',
        icon: '🍽️',
        keywords: ['restaurant', 'dining', 'food', 'meal'],
        averageDeliveryTime: '30-45 mins',
        popularTimes: ['12:00-14:00', '19:00-22:00']
      },
      {
        id: 'fast_food',
        name: 'Fast Food',
        description: 'Quick service restaurants and fast food chains',
        icon: '🍔',
        keywords: ['fast food', 'burger', 'quick', 'takeaway'],
        averageDeliveryTime: '15-25 mins',
        popularTimes: ['12:00-14:00', '18:00-21:00']
      },
      {
        id: 'cafe_coffee',
        name: 'Cafe & Coffee',
        description: 'Coffee shops, cafes, and beverage outlets',
        icon: '☕',
        keywords: ['cafe', 'coffee', 'tea', 'beverages'],
        averageDeliveryTime: '10-20 mins',
        popularTimes: ['08:00-11:00', '15:00-17:00']
      },
      {
        id: 'bakery',
        name: 'Bakery & Desserts',
        description: 'Bakeries, pastry shops, and dessert specialists',
        icon: '🧁',
        keywords: ['bakery', 'cake', 'pastry', 'dessert', 'bread'],
        averageDeliveryTime: '20-30 mins',
        popularTimes: ['09:00-12:00', '16:00-19:00']
      },
      {
        id: 'ice_cream',
        name: 'Ice Cream & Frozen',
        description: 'Ice cream parlors and frozen treats',
        icon: '🍦',
        keywords: ['ice cream', 'frozen', 'gelato', 'sorbet'],
        averageDeliveryTime: '15-25 mins',
        popularTimes: ['14:00-22:00']
      },
      {
        id: 'street_food',
        name: 'Street Food',
        description: 'Local street food vendors and food trucks',
        icon: '🌮',
        keywords: ['street food', 'local', 'chaat', 'snacks'],
        averageDeliveryTime: '20-30 mins',
        popularTimes: ['17:00-23:00']
      },
      {
        id: 'juice_smoothie',
        name: 'Juice & Smoothies',
        description: 'Fresh juice bars and smoothie shops',
        icon: '🥤',
        keywords: ['juice', 'smoothie', 'fresh', 'healthy'],
        averageDeliveryTime: '10-15 mins',
        popularTimes: ['08:00-11:00', '16:00-19:00']
      }
    ]
  },
  {
    id: 'retail_shopping',
    name: 'Retail & Shopping',
    description: 'Stores, markets, and retail businesses',
    icon: '🛍️',
    color: '#4ECDC4',
    isPopular: true,
    orderIndex: 2,
    subcategories: [
      {
        id: 'grocery_store',
        name: 'Grocery Store',
        description: 'Supermarkets and grocery stores',
        icon: '🛒',
        keywords: ['grocery', 'supermarket', 'food', 'daily needs'],
        averageDeliveryTime: '45-60 mins'
      },
      {
        id: 'convenience_store',
        name: 'Convenience Store',
        description: 'Local convenience stores and mini marts',
        icon: '🏪',
        keywords: ['convenience', 'local store', 'quick shopping'],
        averageDeliveryTime: '20-30 mins'
      },
      {
        id: 'clothing_fashion',
        name: 'Clothing & Fashion',
        description: 'Fashion stores, boutiques, and clothing retailers',
        icon: '👗',
        keywords: ['clothing', 'fashion', 'apparel', 'boutique'],
        averageDeliveryTime: '2-3 hours'
      },
      {
        id: 'electronics',
        name: 'Electronics',
        description: 'Electronics stores and gadget shops',
        icon: '📱',
        keywords: ['electronics', 'gadgets', 'mobile', 'computer'],
        averageDeliveryTime: '2-4 hours'
      },
      {
        id: 'books_stationery',
        name: 'Books & Stationery',
        description: 'Book stores and stationery shops',
        icon: '📚',
        keywords: ['books', 'stationery', 'office supplies'],
        averageDeliveryTime: '1-2 hours'
      },
      {
        id: 'pharmacy',
        name: 'Pharmacy & Health',
        description: 'Pharmacies and health product stores',
        icon: '💊',
        keywords: ['pharmacy', 'medicine', 'health', 'medical'],
        averageDeliveryTime: '30-45 mins'
      }
    ]
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Professional and personal services',
    icon: '🔧',
    color: '#45B7D1',
    isPopular: true,
    orderIndex: 3,
    subcategories: [
      {
        id: 'salon_spa',
        name: 'Salon & Spa',
        description: 'Beauty salons, spas, and wellness centers',
        icon: '💅',
        keywords: ['salon', 'spa', 'beauty', 'wellness', 'massage'],
        popularTimes: ['10:00-18:00']
      },
      {
        id: 'fitness_gym',
        name: 'Fitness & Gym',
        description: 'Gyms, fitness centers, and yoga studios',
        icon: '🏋️',
        keywords: ['gym', 'fitness', 'yoga', 'workout'],
        popularTimes: ['06:00-10:00', '18:00-22:00']
      },
      {
        id: 'laundry_dry_cleaning',
        name: 'Laundry & Dry Cleaning',
        description: 'Laundry services and dry cleaning',
        icon: '👕',
        keywords: ['laundry', 'dry cleaning', 'washing'],
        averageDeliveryTime: '24-48 hours'
      },
      {
        id: 'repair_maintenance',
        name: 'Repair & Maintenance',
        description: 'Repair services and maintenance providers',
        icon: '🔧',
        keywords: ['repair', 'maintenance', 'fix', 'service'],
        averageDeliveryTime: '2-4 hours'
      },
      {
        id: 'photography',
        name: 'Photography',
        description: 'Photography studios and photographers',
        icon: '📸',
        keywords: ['photography', 'photo', 'studio', 'photographer']
      },
      {
        id: 'education_tutoring',
        name: 'Education & Tutoring',
        description: 'Educational services and tutoring centers',
        icon: '📖',
        keywords: ['education', 'tutoring', 'classes', 'learning']
      }
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Medical and healthcare services',
    icon: '🏥',
    color: '#FF9FF3',
    orderIndex: 4,
    subcategories: [
      {
        id: 'clinic',
        name: 'Clinic',
        description: 'Medical clinics and healthcare centers',
        icon: '🏥',
        keywords: ['clinic', 'doctor', 'medical', 'health']
      },
      {
        id: 'dental',
        name: 'Dental Care',
        description: 'Dental clinics and orthodontists',
        icon: '🦷',
        keywords: ['dental', 'dentist', 'teeth', 'oral health']
      },
      {
        id: 'eye_care',
        name: 'Eye Care',
        description: 'Optometrists and eye care specialists',
        icon: '👁️',
        keywords: ['eye care', 'optometrist', 'vision', 'glasses']
      },
      {
        id: 'veterinary',
        name: 'Veterinary',
        description: 'Veterinary clinics and pet care',
        icon: '🐕',
        keywords: ['veterinary', 'vet', 'pet care', 'animal health']
      }
    ]
  },
  {
    id: 'automotive',
    name: 'Automotive',
    description: 'Vehicle services and automotive businesses',
    icon: '🚗',
    color: '#54A0FF',
    orderIndex: 5,
    subcategories: [
      {
        id: 'car_service',
        name: 'Car Service & Repair',
        description: 'Auto repair and maintenance services',
        icon: '🔧',
        keywords: ['car service', 'auto repair', 'maintenance', 'garage']
      },
      {
        id: 'car_wash',
        name: 'Car Wash',
        description: 'Car washing and detailing services',
        icon: '🚿',
        keywords: ['car wash', 'detailing', 'cleaning'],
        averageDeliveryTime: '1-2 hours'
      },
      {
        id: 'fuel_station',
        name: 'Fuel Station',
        description: 'Gas stations and fuel services',
        icon: '⛽',
        keywords: ['fuel', 'gas station', 'petrol', 'diesel']
      },
      {
        id: 'car_rental',
        name: 'Car Rental',
        description: 'Vehicle rental services',
        icon: '🚙',
        keywords: ['car rental', 'vehicle rental', 'hire']
      }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Entertainment and recreational businesses',
    icon: '🎬',
    color: '#FFA726',
    orderIndex: 6,
    subcategories: [
      {
        id: 'cinema',
        name: 'Cinema & Movies',
        description: 'Movie theaters and cinemas',
        icon: '🎬',
        keywords: ['cinema', 'movies', 'theater', 'film']
      },
      {
        id: 'gaming_arcade',
        name: 'Gaming & Arcade',
        description: 'Gaming centers and arcades',
        icon: '🎮',
        keywords: ['gaming', 'arcade', 'video games', 'entertainment']
      },
      {
        id: 'sports_recreation',
        name: 'Sports & Recreation',
        description: 'Sports facilities and recreational centers',
        icon: '⚽',
        keywords: ['sports', 'recreation', 'games', 'activity']
      },
      {
        id: 'event_venue',
        name: 'Event Venues',
        description: 'Event halls and party venues',
        icon: '🎉',
        keywords: ['event venue', 'party hall', 'celebration', 'function']
      }
    ]
  },
  {
    id: 'professional',
    name: 'Professional Services',
    description: 'Business and professional services',
    icon: '💼',
    color: '#5F27CD',
    orderIndex: 7,
    subcategories: [
      {
        id: 'legal',
        name: 'Legal Services',
        description: 'Law firms and legal consultants',
        icon: '⚖️',
        keywords: ['legal', 'lawyer', 'law firm', 'advocate']
      },
      {
        id: 'accounting',
        name: 'Accounting & Finance',
        description: 'Accounting firms and financial advisors',
        icon: '📊',
        keywords: ['accounting', 'finance', 'tax', 'advisor']
      },
      {
        id: 'consulting',
        name: 'Consulting',
        description: 'Business consultants and advisory services',
        icon: '📋',
        keywords: ['consulting', 'advisor', 'business', 'strategy']
      },
      {
        id: 'real_estate',
        name: 'Real Estate',
        description: 'Real estate agents and property services',
        icon: '🏠',
        keywords: ['real estate', 'property', 'housing', 'agent']
      }
    ]
  },
  {
    id: 'home_garden',
    name: 'Home & Garden',
    description: 'Home improvement and gardening services',
    icon: '🏡',
    color: '#00D2D3',
    orderIndex: 8,
    subcategories: [
      {
        id: 'home_improvement',
        name: 'Home Improvement',
        description: 'Home renovation and improvement services',
        icon: '🔨',
        keywords: ['home improvement', 'renovation', 'construction']
      },
      {
        id: 'gardening',
        name: 'Gardening & Landscaping',
        description: 'Garden maintenance and landscaping services',
        icon: '🌱',
        keywords: ['gardening', 'landscaping', 'plants', 'lawn']
      },
      {
        id: 'cleaning',
        name: 'Cleaning Services',
        description: 'House cleaning and maintenance services',
        icon: '🧹',
        keywords: ['cleaning', 'house cleaning', 'maintenance'],
        averageDeliveryTime: '2-4 hours'
      },
      {
        id: 'pest_control',
        name: 'Pest Control',
        description: 'Pest control and extermination services',
        icon: '🐛',
        keywords: ['pest control', 'extermination', 'insects']
      }
    ]
  }
];

export const getBusinessCategoryById = (categoryId: string): BusinessCategory | undefined => {
  return BUSINESS_CATEGORIES.find(category => category.id === categoryId);
};

export const getBusinessSubcategoryById = (categoryId: string, subcategoryId: string): BusinessSubcategory | undefined => {
  const category = getBusinessCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getPopularCategories = (): BusinessCategory[] => {
  return BUSINESS_CATEGORIES.filter(category => category.isPopular);
};

export const searchCategories = (query: string): BusinessCategory[] => {
  const searchTerm = query.toLowerCase();
  return BUSINESS_CATEGORIES.filter(category => 
    category.name.toLowerCase().includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm) ||
    category.subcategories.some(sub => 
      sub.name.toLowerCase().includes(searchTerm) ||
      sub.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    )
  );
};

export const getCategorySubcategories = (categoryId: string): BusinessSubcategory[] => {
  const category = getBusinessCategoryById(categoryId);
  return category?.subcategories || [];
};