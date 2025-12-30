import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@supabase/supabase-js';
import Toast from 'react-native-toast-message';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'business_owner' | 'admin';
  date_of_birth: string | null;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
  preferences: {
    notifications: boolean;
    marketing_emails: boolean;
    location_sharing: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  verified_email: boolean;
  verified_phone: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface AuthState {
  // Authentication state
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isSigningOut: boolean;
  error: string | null;
  
  // Profile state
  profileLoading: boolean;
  profileError: string | null;
  
  // Demo mode
  isDemoMode: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<boolean>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<boolean>;
  
  // Profile actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  uploadAvatar: (uri: string) => Promise<string | null>;
  deleteAccount: () => Promise<boolean>;
  
  // Password actions
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  
  // Demo actions
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  
  // Utility actions
  refreshSession: () => Promise<void>;
  clearError: () => void;
  initialize: () => Promise<void>;
  fetchUserProfile: (userId: string) => Promise<UserProfile | null>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isLoading: false,
      isSigningIn: false,
      isSigningUp: false,
      isSigningOut: false,
      error: null,
      profileLoading: false,
      profileError: null,
      isDemoMode: false,

      // Sign in
      signIn: async (email: string, password: string): Promise<boolean> => {
        set({ isSigningIn: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, isSigningIn: false });
            Toast.show({
              type: 'error',
              text1: 'Sign In Failed',
              text2: error.message,
              position: 'top',
            });
            return false;
          }

          if (data.user) {
            // Fetch user profile
            const profile = await get().fetchUserProfile(data.user.id);
            
            set({
              user: profile,
              session: data.session,
              isSigningIn: false,
              error: null,
              isDemoMode: false,
            });

            Toast.show({
              type: 'success',
              text1: 'Welcome back!',
              text2: `Good to see you again, ${profile?.first_name || 'User'}`,
              position: 'top',
            });
            
            return true;
          }

          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isSigningIn: false });
          
          Toast.show({
            type: 'error',
            text1: 'Sign In Error',
            text2: errorMessage,
            position: 'top',
          });
          
          return false;
        }
      },

      // Sign up
      signUp: async (email: string, password: string, userData: Partial<UserProfile>): Promise<boolean> => {
        set({ isSigningUp: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: userData.full_name,
                first_name: userData.first_name,
                last_name: userData.last_name,
                role: userData.role || 'customer',
              },
            },
          });

          if (error) {
            set({ error: error.message, isSigningUp: false });
            Toast.show({
              type: 'error',
              text1: 'Sign Up Failed',
              text2: error.message,
              position: 'top',
            });
            return false;
          }

          if (data.user) {
            // Create user profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  full_name: userData.full_name ?? null,
                  first_name: userData.first_name ?? null,
                  last_name: userData.last_name ?? null,
                  role: userData.role || 'customer',
                  phone: userData.phone ?? null,
                  preferences: JSON.stringify({
                    notifications: true,
                    marketing_emails: false,
                    location_sharing: true,
                    theme: 'system',
                    language: 'en',
                  }),
                  verified_email: false,
                  verified_phone: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              ] as Partial<import('../lib/database.types').Database['public']['Tables']['profiles']['Insert']>[]);

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }

            set({
              user: null, // User needs to verify email first
              session: data.session,
              isSigningUp: false,
              error: null,
            });

            Toast.show({
              type: 'success',
              text1: 'Account Created!',
              text2: 'Please check your email to verify your account',
              position: 'top',
            });
            
            return true;
          }

          return false;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isSigningUp: false });
          
          Toast.show({
            type: 'error',
            text1: 'Sign Up Error',
            text2: errorMessage,
            position: 'top',
          });
          
          return false;
        }
      },

      // Sign out
      signOut: async (): Promise<void> => {
        set({ isSigningOut: true, error: null });
        
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            set({ error: error.message, isSigningOut: false });
            return;
          }

          set({
            user: null,
            session: null,
            isSigningOut: false,
            error: null,
            isDemoMode: false,
          });

          Toast.show({
            type: 'info',
            text1: 'Signed Out',
            text2: 'You have been signed out successfully',
            position: 'top',
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isSigningOut: false });
        }
      },

      // Sign in with provider
      signInWithProvider: async (provider: 'google' | 'apple'): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: 'towntap://auth/callback',
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return false;
          }

          set({ isLoading: false });
          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<UserProfile>): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        set({ profileLoading: true, profileError: null });
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
              preferences: updates.preferences ? JSON.stringify(updates.preferences) : undefined,
            } as Partial<import('../lib/database.types').Database['public']['Tables']['profiles']['Update']>)
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            set({ profileError: error.message, profileLoading: false });
            return false;
          }

          set({
            user: data ? { ...(user as object), ...(data as object) } as UserProfile : user,
            profileLoading: false,
            profileError: null,
          });

          Toast.show({
            type: 'success',
            text1: 'Profile Updated',
            text2: 'Your profile has been updated successfully',
            position: 'top',
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ profileError: errorMessage, profileLoading: false });
          return false;
        }
      },

      // Upload avatar
      uploadAvatar: async (uri: string): Promise<string | null> => {
        const { user } = get();
        if (!user) return null;

        try {
          // Create form data
          const formData = new FormData();
          formData.append('file', {
            uri,
            type: 'image/jpeg',
            name: `avatar-${user.id}.jpg`,
          } as any);

          const fileName = `avatars/${user.id}-${Date.now()}.jpg`;
          
          const { data, error } = await supabase.storage
            .from('avatars')
            .upload(fileName, formData, {
              cacheControl: '3600',
              upsert: true,
            });

          if (error) {
            console.error('Avatar upload error:', error);
            return null;
          }

          const { data: publicData } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

          // Update profile with new avatar URL
          await get().updateProfile({ avatar_url: publicData.publicUrl });

          return publicData.publicUrl;
        } catch (error) {
          console.error('Avatar upload error:', error);
          return null;
        }
      },

      // Delete account
      deleteAccount: async (): Promise<boolean> => {
        const { user } = get();
        if (!user) return false;

        try {
          // Delete user profile
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

          if (profileError) {
            console.error('Error deleting profile:', profileError);
            return false;
          }

          // Delete auth user
          const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

          if (authError) {
            console.error('Error deleting auth user:', authError);
            return false;
          }

          // Clear local state
          set({
            user: null,
            session: null,
            error: null,
            isDemoMode: false,
          });

          Toast.show({
            type: 'info',
            text1: 'Account Deleted',
            text2: 'Your account has been deleted successfully',
            position: 'top',
          });

          return true;
        } catch (error) {
          console.error('Delete account error:', error);
          return false;
        }
      },

      // Reset password
      resetPassword: async (email: string): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'towntap://auth/reset-password',
          });

          set({ isLoading: false });

          if (error) {
            set({ error: error.message });
            return false;
          }

          Toast.show({
            type: 'success',
            text1: 'Password Reset',
            text2: 'Check your email for reset instructions',
            position: 'top',
          });

          return true;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      // Update password
      updatePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
        try {
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) {
            Toast.show({
              type: 'error',
              text1: 'Password Update Failed',
              text2: error.message,
              position: 'top',
            });
            return false;
          }

          Toast.show({
            type: 'success',
            text1: 'Password Updated',
            text2: 'Your password has been updated successfully',
            position: 'top',
          });

          return true;
        } catch (error) {
          console.error('Update password error:', error);
          return false;
        }
      },

      // Demo mode
      enableDemoMode: () => {
        const demoUser: UserProfile = {
          id: 'demo-user-123',
          email: 'demo@towntap.com',
          full_name: 'Demo User',
          first_name: 'Demo',
          last_name: 'User',
          phone: '+1234567890',
          avatar_url: null,
          role: 'customer',
          date_of_birth: null,
          location: {
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY',
          },
          preferences: {
            notifications: true,
            marketing_emails: false,
            location_sharing: true,
            theme: 'light',
            language: 'en',
          },
          verified_email: true,
          verified_phone: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_login_at: new Date().toISOString(),
        };

        set({
          user: demoUser,
          session: null,
          isDemoMode: true,
          error: null,
        });

        Toast.show({
          type: 'info',
          text1: 'Demo Mode Enabled',
          text2: 'You are now using the app in demo mode',
          position: 'top',
        });
      },

      disableDemoMode: () => {
        set({
          user: null,
          session: null,
          isDemoMode: false,
          error: null,
        });
      },

      // Utility actions
      refreshSession: async (): Promise<void> => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session refresh error:', error);
            return;
          }

          if (session) {
            const profile = await get().fetchUserProfile(session.user.id);
            set({ session, user: profile });
          } else {
            set({ session: null, user: null });
          }
        } catch (error) {
          console.error('Session refresh error:', error);
        }
      },

      clearError: () => {
        set({ error: null, profileError: null });
      },

      // Initialize auth state
      initialize: async (): Promise<void> => {
        set({ isLoading: true });
        
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
            return;
          }

          if (session) {
            const profile = await get().fetchUserProfile(session.user.id);
            set({
              session,
              user: profile,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          // Set up auth listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            
            if (event === 'SIGNED_IN' && session) {
              const profile = await get().fetchUserProfile(session.user.id);
              set({ session, user: profile, isDemoMode: false });
            } else if (event === 'SIGNED_OUT') {
              set({ session: null, user: null, isDemoMode: false });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              set({ session });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false });
        }
      },

      // Helper function to fetch user profile
      fetchUserProfile: async (userId: string): Promise<UserProfile | null> => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            return null;
          }

          return data as UserProfile;
        } catch (error) {
          console.error('Error fetching profile:', error);
          return null;
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isDemoMode: state.isDemoMode,
        user: state.isDemoMode ? state.user : null, // Only persist demo user
      }),
    }
  )
);

export default useAuthStore;