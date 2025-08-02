import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthService } from '../services/authService';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      loading: false,
      error: null,
      hasCompletedOnboarding: false,
      isAuthenticated: false,

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          const result = await AuthService.signIn({ email, password });
          
          const user: User = {
            id: result.user.id,
            email: result.user.email,
            phone: result.user.phone,
            profile: result.user.profile,
          };

          set({ user, loading: false, isAuthenticated: true });
          return { success: true };
          
        } catch (error: any) {
          console.error('Login error:', error);
          set({ loading: false, error: error.message || 'Login failed' });
          return { success: false, error: error.message || 'Login failed' };
        }
      },

      register: async (email: string, password: string, userData: any) => {
        set({ loading: true, error: null });
        
        try {
          const signUpData = {
            fullName: userData.full_name || userData.fullName || '',
            email,
            phone: userData.phone_number || userData.phone || '',
            password,
            confirmPassword: password, // For compatibility
            userType: userData.user_type || 'customer',
            acceptTerms: true,
          };

          const result = await AuthService.signUp(signUpData);
          
          // User will need to confirm email before being logged in
          set({ loading: false });
          return { success: true };
          
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ loading: false, error: error.message || 'Registration failed' });
          return { success: false, error: error.message || 'Registration failed' };
        }
      },

      logout: async () => {
        set({ loading: true });
        
        try {
          await AuthService.signOut();
          set({ user: null, loading: false, error: null, isAuthenticated: false });
        } catch (error: any) {
          console.error('Logout error:', error);
          set({ loading: false, error: error.message });
        }
      },

      checkAuth: async () => {
        set({ loading: true });
        
        try {
          const user = await AuthService.getCurrentUser();
          
          if (user) {
            set({ user, loading: false, error: null, isAuthenticated: true });
          } else {
            set({ user: null, loading: false, error: null, isAuthenticated: false });
          }
        } catch (error: any) {
          console.error('Auth check error:', error);
          set({ user: null, loading: false, error: error.message, isAuthenticated: false });
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
