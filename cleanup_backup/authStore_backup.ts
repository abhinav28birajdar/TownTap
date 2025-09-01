import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthState {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  loading: boolean; // alias for isLoading for compatibility
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  setSession: (session: Session | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: AuthError | null }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // alias for signOut
  login: (email: string, password: string) => Promise<{ error?: AuthError | null }>; // alias for signIn
  updateProfile: (updates: any) => Promise<{ error?: any }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError | null }>;
  initialize: () => Promise<void>;
  checkAuth: () => Promise<void>; // alias for initialize
  fetchUserProfile: (userId: string) => Promise<void>;
  createOrUpdateProfile: (user: User) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      userProfile: null,
      isLoading: true,
      loading: true, // alias for isLoading
      isAuthenticated: false,
      error: null,

      setSession: (session) => {
        set({ 
          session, 
          user: session?.user || null,
          isAuthenticated: !!session 
        });
      },

      setUserProfile: (userProfile) => {
        set({ userProfile });
      },

      setLoading: (isLoading) => {
        set({ isLoading, loading: isLoading });
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, loading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (!error && data.session) {
            get().setSession(data.session);
            await get().fetchUserProfile(data.session.user.id);
          }
          
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ isLoading: false, loading: false });
        }
      },

      signUp: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, loading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName || email.split('@')[0],
              },
            },
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        } finally {
          set({ isLoading: false, loading: false });
        }
      },

      signOut: async () => {
        set({ isLoading: true, loading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            set({ 
              session: null, 
              user: null, 
              userProfile: null, 
              isAuthenticated: false 
            });
            // Clear any cached data
            await AsyncStorage.multiRemove(['user_preferences', 'cart_items']);
          }
        } catch (error) {
          console.error('Error in signOut:', error);
        } finally {
          set({ isLoading: false, loading: false });
        }
      },

      updateProfile: async (updates: any) => {
        const { session } = get();
        if (!session?.user) {
          return { error: 'No user session' };
        }

        try {
          const { error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', session.user.id);

          if (!error) {
            // Refresh profile data
            await get().fetchUserProfile(session.user.id);
          }

          return { error };
        } catch (error) {
          return { error };
        }
      },

      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'towntap://reset-password',
          });
          return { error };
        } catch (error) {
          return { error: error as AuthError };
        }
      },

      fetchUserProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            set({ userProfile: data });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      },

      initialize: async () => {
        set({ isLoading: true, loading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!error && session) {
            get().setSession(session);
            await get().fetchUserProfile(session.user.id);
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            get().setSession(session);
            
            if (event === 'SIGNED_IN' && session?.user) {
              await get().createOrUpdateProfile(session.user);
              await get().fetchUserProfile(session.user.id);
            }
            
            if (event === 'SIGNED_OUT') {
              await AsyncStorage.multiRemove(['user_preferences', 'cart_items']);
            }
          });
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          set({ isLoading: false, loading: false });
        }
      },

      createOrUpdateProfile: async (user: User) => {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!existingProfile) {
            const { error } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                email_verified: user.email_confirmed_at ? true : false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (error) {
              console.error('Error creating profile:', error);
            }
          }
        } catch (error) {
          console.error('Error in createOrUpdateProfile:', error);
        }
      },

      // Alias methods for compatibility
      logout: async () => {
        return get().signOut();
      },

      login: async (email: string, password: string) => {
        return get().signIn(email, password);
      },

      checkAuth: async () => {
        return get().initialize();
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        session: state.session,
        userProfile: state.userProfile,
      }),
    }
  )
);
