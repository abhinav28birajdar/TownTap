import { Dimensions } from 'react-native';

// Screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const DIMENSIONS = {
  screenWidth,
  screenHeight,
  padding: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
};

// Color constants (legacy - prefer using theme)
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#64D2FF',
  
  // Grays
  black: '#000000',
  white: '#FFFFFF',
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C7C7CC',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#1C1C1E',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
  },
  
  // Text colors
  text: {
    primary: '#000000',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    inverse: '#FFFFFF',
  },
};

// Content templates for AI content generation
export const CONTENT_TEMPLATES = {
  SOCIAL_MEDIA: {
    INSTAGRAM_POST: {
      id: 'instagram_post',
      name: 'Instagram Post',
      description: 'Engaging Instagram post with hashtags',
      template: 'Create an engaging Instagram post for a {businessType} business about {topic}. Include relevant hashtags and emojis. Keep it under 2200 characters.',
      maxLength: 2200,
    },
    FACEBOOK_POST: {
      id: 'facebook_post',
      name: 'Facebook Post',
      description: 'Facebook post with call-to-action',
      template: 'Write a compelling Facebook post for a {businessType} business about {topic}. Include a clear call-to-action and engaging content.',
      maxLength: 63206,
    },
    TWITTER_POST: {
      id: 'twitter_post',
      name: 'Twitter/X Post',
      description: 'Short and impactful Twitter post',
      template: 'Create a concise and impactful Twitter post for a {businessType} business about {topic}. Keep it under 280 characters with relevant hashtags.',
      maxLength: 280,
    },
  },
  
  MARKETING: {
    EMAIL_SUBJECT: {
      id: 'email_subject',
      name: 'Email Subject Line',
      description: 'Compelling email subject line',
      template: 'Write 5 compelling email subject lines for a {businessType} business promoting {topic}. Make them attention-grabbing and relevant.',
      maxLength: 100,
    },
    PRODUCT_DESCRIPTION: {
      id: 'product_description',
      name: 'Product Description',
      description: 'Detailed product description',
      template: 'Write a detailed and persuasive product description for {topic} from a {businessType} business. Highlight key features and benefits.',
      maxLength: 1000,
    },
    PROMOTIONAL_COPY: {
      id: 'promotional_copy',
      name: 'Promotional Copy',
      description: 'Marketing promotional content',
      template: 'Create promotional copy for a {businessType} business advertising {topic}. Make it persuasive and include a strong call-to-action.',
      maxLength: 500,
    },
  },
  
  BUSINESS: {
    BLOG_POST: {
      id: 'blog_post',
      name: 'Blog Post',
      description: 'Informative blog post',
      template: 'Write an informative blog post about {topic} for a {businessType} business. Include an engaging introduction, main points, and conclusion.',
      maxLength: 2000,
    },
    PRESS_RELEASE: {
      id: 'press_release',
      name: 'Press Release',
      description: 'Professional press release',
      template: 'Write a professional press release for a {businessType} business announcing {topic}. Follow standard press release format.',
      maxLength: 1500,
    },
    CUSTOMER_EMAIL: {
      id: 'customer_email',
      name: 'Customer Email',
      description: 'Customer communication email',
      template: 'Write a professional email to customers from a {businessType} business regarding {topic}. Keep it friendly and informative.',
      maxLength: 800,
    },
  },
  
  REVIEWS: {
    REVIEW_RESPONSE: {
      id: 'review_response',
      name: 'Review Response',
      description: 'Response to customer review',
      template: 'Write a professional response to a customer review for a {businessType} business. The review topic is: {topic}. Be courteous and address their concerns.',
      maxLength: 300,
    },
  },
};

// Animation constants
export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'ease-in-out',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
  },
};

// API constants
export const API = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
};

export default {
  DIMENSIONS,
  COLORS,
  CONTENT_TEMPLATES,
  ANIMATIONS,
  API,
  STORAGE_KEYS,
};