import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getCurrentUser, getProfile, signIn, signOut, signUp } from '../lib/supabase';
import { AuthState, Profile, User } from '../types';

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

      // Actions
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await signIn(email, password);
          
          if (error) {
            set({ loading: false, error: error.message });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Fetch user profile
            const { data: profile, error: profileError } = await getProfile(data.user.id);
            if (profileError) {
              set({ loading: false, error: profileError.message });
              return { success: false, error: profileError.message };
            }

            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              phone: data.user.phone,
              profile: profile as Profile,
            };

            set({ user, loading: false });
            return { success: true };
          }
          
          set({ loading: false });
          return { success: false, error: 'Login failed' };
          
        } catch (error: any) {
          console.error('Login error:', error);
          set({ loading: false, error: error.message || 'Network error occurred' });
          return { success: false, error: error.message || 'Network error occurred' };
        }
      },

      register: async (email: string, password: string, userData: any) => {
        set({ loading: true, error: null });
        
        try {
          const { data, error } = await signUp(email, password, userData);
          
          if (error) {
            set({ loading: false, error: error.message });
            return { success: false, error: error.message };
          }

          // User will need to confirm email before being logged in
          set({ loading: false });
          return { success: true };
          
        } catch (error: any) {
          set({ loading: false, error: error.message });
          return { success: false, error: error.message };
        }
      },

      logout: async () => {
        set({ loading: true });
        
        try {
          await signOut();
          set({ user: null, loading: false, error: null });
        } catch (error: any) {
          set({ loading: false, error: error.message });
        }
      },

      checkAuth: async () => {
        set({ loading: true });
        
        try {
          const { user, error } = await getCurrentUser();
          
          if (error) {
            set({ user: null, loading: false, error: error.message });
            return;
          }
          
          if (user) {
            // Fetch user profile
            const { data: profile, error: profileError } = await getProfile(user.id);
            if (profileError) {
              set({ user: null, loading: false, error: profileError.message });
              return;
            }

            const userData: User = {
              id: user.id,
              email: user.email || '',
              phone: user.phone,
              profile: profile as Profile,
            };

            set({ user: userData, loading: false, error: null });
          } else {
            set({ user: null, loading: false, error: null });
          }
        } catch (error: any) {
          set({ user: null, loading: false, error: error.message });
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
