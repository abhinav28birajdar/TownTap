import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { UserProfile, ExtendedUser } from '../types';

interface AuthState {
  user: ExtendedUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: ExtendedUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,

      setUser: (user: ExtendedUser | null) => {
        set({ 
          user, 
          isAuthenticated: !!user,
          error: null 
        });
      },

      setProfile: (profile: UserProfile | null) => {
        set({ profile });
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            });
            await get().refreshProfile();
          }
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string, userData?: any) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData || {},
            },
          });

          if (error) throw error;

          if (data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
            });
          }
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'towntap://auth/reset-password',
          });

          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Clean up notification subscriptions
      try {
        const { NotificationService } = require('../services/notificationService');
        NotificationService.cleanup();
      } catch (notificationError) {
        console.error('Error cleaning up notifications:', notificationError);
        // Non-fatal error, continue with sign out
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        set({ 
          user: null, 
          profile: null,
          isAuthenticated: false,
          isLoading: false,
          error: sessionError.message 
        });
        return;
      }

      if (session?.user) {
        set({
          user: session.user,
          isAuthenticated: true,
        });

        // Fetch user profile
        await get().refreshProfile();
        
        // Initialize notification system
        try {
          const { NotificationService } = require('../services/notificationService');
          await NotificationService.initialize(session.user.id);
        } catch (notificationError) {
          console.error('Error initializing notifications:', notificationError);
          // Non-fatal error, continue with auth initialization
        }
      } else {
        set({
          user: null,
          profile: null,
          isAuthenticated: false,
        });
      }
      
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      console.error('Auth initialization error:', error);
      set({ 
        error: errorMessage,
        isLoading: false,
        user: null,
        profile: null,
        isAuthenticated: false,
      });
    }
  },      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            throw error;
          }

          // Extend user object with profile data
          const extendedUser: ExtendedUser = {
            ...user,
            user_type: profile?.user_type,
            name: profile?.full_name || profile?.display_name,
            full_name: profile?.full_name,
            business_name: profile?.business_name,
            business_id: profile?.business_id,
          };

          set({ 
            profile: profile || null,
            user: extendedUser,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          console.error('Profile fetch error:', error);
          set({ error: errorMessage });
        }
      },

      updateProfile: async (updates: Partial<UserProfile>) => {
        const { user, profile } = get();
        if (!user) throw new Error('User not authenticated');

        try {
          set({ isLoading: true, error: null });

          const updatedProfile = { ...profile, ...updates };
          
          const { data, error } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              ...updatedProfile,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (error) throw error;

          set({ 
            profile: data,
            isLoading: false 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Profile update failed';
          set({ 
            error: errorMessage,
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: AuthState) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event: any, session: any) => {
  const { setUser, refreshProfile, setLoading } = useAuthStore.getState();
  
  console.log('Auth state changed:', event, session?.user?.id);
  
  switch (event) {
    case 'SIGNED_IN':
      if (session?.user) {
        setUser(session.user);
        await refreshProfile();
      }
      break;
      
    case 'SIGNED_OUT':
      setUser(null);
      useAuthStore.setState({ 
        profile: null, 
        isAuthenticated: false,
        error: null 
      });
      break;
      
    case 'TOKEN_REFRESHED':
      if (session?.user) {
        setUser(session.user);
      }
      break;
      
    case 'USER_UPDATED':
      if (session?.user) {
        setUser(session.user);
        await refreshProfile();
      }
      break;
  }
  
  setLoading(false);
});