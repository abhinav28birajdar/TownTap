// FILE: src/context/index.tsx
// PURPOSE: Centralized export for all context providers and hooks

export { AuthProvider, useAuth } from './AuthContext';
export { CartProvider, useCart } from './CartContext';
export { LanguageProvider, useLanguage } from './LanguageContext';
export { LocationProvider, useLocation } from './LocationContext';
export { ThemeProvider, useTheme } from './ThemeContext';

// Re-export types for convenience
export type { BusinessLocation, CartItem, LocationRegion, SignInCredentials, SignUpCredentials, UserProfile } from '../types';

