// ================================================================
// 🚀 MOCK AUTHENTICATION STORE FOR TESTING
// ================================================================

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,

  initialize: () => {
    // Auto-login for testing
    const mockUser: User = {
      id: 'test-user-123',
      email: 'customer@towntap.com',
      user_metadata: {
        full_name: 'Test Customer',
        phone: '+91 9876543210',
      },
    };

    set({ user: mockUser, loading: false });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'test-user-123',
      email: email,
      user_metadata: {
        full_name: 'Test Customer',
        phone: '+91 9876543210',
      },
    };

    set({ user: mockUser, loading: false });
  },

  signUp: async (email: string, password: string, fullName: string, phone: string) => {
    set({ loading: true });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: 'new-user-' + Date.now(),
      email: email,
      user_metadata: {
        full_name: fullName,
        phone: phone,
      },
    };

    set({ user: mockUser, loading: false });
  },

  signOut: () => {
    set({ user: null, loading: false });
  },
}));
