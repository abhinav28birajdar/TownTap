// Auth Store using Zustand
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { AuthState, User } from '../types';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (user: User) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        });
      },

      updateUser: async (updatedUser: User) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Implement actual Supabase update when dependencies are available
          // const { data, error } = await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
          
          // Mock implementation for now
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            user: { ...updatedUser, updated_at: new Date().toISOString() },
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Update failed',
            isLoading: false,
          });
        }
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Implement actual Supabase auth when dependencies are available
          // const { data, error } = await authHelpers.signInWithEmail(email, password);
          
          // Mock implementation for now
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email,
            full_name: 'Test User',
            user_type: 'customer',
            locale: 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign in failed',
            isLoading: false,
          });
        }
      },

      signUp: async (email: string, password: string, userData: any) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Implement actual Supabase auth when dependencies are available
          // const { data, error } = await authHelpers.signUpWithEmail(email, password, userData);
          
          // Mock implementation for now
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: Math.random().toString(),
            email,
            full_name: userData.full_name,
            user_type: userData.user_type,
            locale: 'en',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign up failed',
            isLoading: false,
          });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          
          // TODO: Implement actual Supabase auth when dependencies are available
          // await authHelpers.signOut();
          
          // Mock implementation for now
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Sign out failed',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
