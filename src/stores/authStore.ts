// =====================================================
// ENHANCED TOWNTAP - AUTH STORE
// Comprehensive authentication state management with AI
// =====================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  resetPassword,
  sendOTP,
  signInWithEmail,
  signInWithPhone,
  signInWithProvider,
  signUpWithEmail,
  supabase,
  signOut as supabaseSignOut,
  verifyOTP
} from '../lib/supabase-enhanced';
import { RealtimeService } from '../services/realtimeService';
import { UserProfile } from '../types/enhanced';
import { requestUserPermissionAndGetToken } from '../utils/pushNotifications';

// Auth state interface
interface AuthState {
  // User data
  user: UserProfile | null;
  userProfile: UserProfile | null; // Alias for compatibility
  session: any;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Onboarding state
  onboardingCompleted: boolean;
  userType: 'customer' | 'business_owner' | null;
  
  // Error handling
  error: string | null;
  
  // Authentication methods
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<boolean>;
  signInWithPhone: (phone: string, password: string) => Promise<boolean>;
  sendOTP: (phone: string) => Promise<boolean>;
  verifyOTP: (phone: string, token: string) => Promise<boolean>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'apple') => Promise<boolean>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Alias for signOut
  resetPassword: (email: string) => Promise<boolean>;
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  checkAuth: () => Promise<void>; // Alias for initialize
  
  // Onboarding
  completeOnboarding: (userType: 'customer' | 'business_owner', preferences?: any) => Promise<boolean>;
  setUserType: (userType: 'customer' | 'business_owner') => void;
  
  // Utility methods
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  setupRealtimeSubscriptions: () => void;
  cleanupRealtimeSubscriptions: () => void;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      get userProfile() { return get().user; }, // Computed property that syncs with user
      session: null,
      isAuthenticated: false,
      loading: false,
      onboardingCompleted: false,
      userType: null,
      error: null,

      // Sign in with email
      signInWithEmail: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { user, session } = await signInWithEmail(email, password);
          
          if (user && session) {
            // Fetch full profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            set({
              user: profile,
              session,
              isAuthenticated: true,
              onboardingCompleted: profile?.onboarding_completed || false,
              userType: profile?.user_type || null,
              loading: false,
            });
            
            // Initialize real-time subscriptions after successful login
            get().setupRealtimeSubscriptions();
            
            return true;
          }
          
          set({ loading: false, error: 'Invalid credentials' });
          return false;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Sign in failed' 
          });
          return false;
        }
      },

      // Sign up with email
      signUpWithEmail: async (email: string, password: string, userData = {}) => {
        try {
          set({ loading: true, error: null });
          
          const { user, session } = await signUpWithEmail(email, password, {
            email,
            full_name: userData.full_name,
            phone: userData.phone,
          });
          
          if (user) {
            // Create profile in database
            const profileData = {
              id: user.id,
              email: user.email!,
              full_name: userData.full_name || '',
              phone: userData.phone || '',
              user_type: userData.user_type || 'customer',
              language_preference: 'en',
              ai_preferences: {},
              personality_insights: {},
              spending_habits: {},
              is_verified: false,
              is_active: true,
              onboarding_completed: false,
              loyalty_tier: 'bronze',
              total_loyalty_points: 0,
              wallet_balance: 0,
              ...userData,
            };
            
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .insert(profileData)
              .select()
              .single();
            
            if (profileError) {
              console.error('Profile creation error:', profileError);
            }
            
            set({
              user: profile || profileData,
              session,
              isAuthenticated: true,
              onboardingCompleted: false,
              userType: (profileData.user_type === 'customer' || profileData.user_type === 'business_owner') 
                ? profileData.user_type : 'customer',
              loading: false,
            });
            
            // Initialize real-time subscriptions after successful sign-up
            get().setupRealtimeSubscriptions();
            
            return true;
          }
          
          set({ loading: false, error: 'Sign up failed' });
          return false;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Sign up failed' 
          });
          return false;
        }
      },

      // Sign in with phone
      signInWithPhone: async (phone: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { user, session } = await signInWithPhone(phone, password);
          
          if (user && session) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            set({
              user: profile,
              session,
              isAuthenticated: true,
              onboardingCompleted: profile?.onboarding_completed || false,
              userType: profile?.user_type || null,
              loading: false,
            });
            
            return true;
          }
          
          set({ loading: false, error: 'Invalid credentials' });
          return false;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Sign in failed' 
          });
          return false;
        }
      },

      // Send OTP
      sendOTP: async (phone: string) => {
        try {
          set({ loading: true, error: null });
          
          await sendOTP(phone);
          
          set({ loading: false });
          return true;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Failed to send OTP' 
          });
          return false;
        }
      },

      // Verify OTP
      verifyOTP: async (phone: string, token: string) => {
        try {
          set({ loading: true, error: null });
          
          const { user, session } = await verifyOTP(phone, token);
          
          if (user && session) {
            // Check if profile exists
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();
            
            if (!profile) {
              // Create new profile
              const newProfile: Partial<UserProfile> = {
                id: user.id,
                email: user.email || '',
                phone: user.phone || phone,
                user_type: 'customer',
                language_preference: 'en',
                ai_preferences: {},
                personality_insights: {},
                spending_habits: {},
                is_verified: true,
                is_active: true,
                onboarding_completed: false,
                loyalty_tier: 'bronze',
                total_loyalty_points: 0,
                wallet_balance: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              await supabase
                .from('profiles')
                .insert(newProfile);
                
              set({
                user: newProfile as UserProfile,
                session,
                isAuthenticated: true,
                onboardingCompleted: false,
                userType: 'customer',
                loading: false,
              });
              
              // Initialize real-time subscriptions after successful login
              get().setupRealtimeSubscriptions();
            } else {
              set({
                user: profile,
                session,
                isAuthenticated: true,
                onboardingCompleted: profile.onboarding_completed,
                userType: profile.user_type,
                loading: false,
              });
              
              // Initialize real-time subscriptions after successful login
              get().setupRealtimeSubscriptions();
            }
            
            return true;
          }
          
          set({ loading: false, error: 'Invalid OTP' });
          return false;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'OTP verification failed' 
          });
          return false;
        }
      },

      // Sign in with provider
      signInWithProvider: async (provider: 'google' | 'facebook' | 'apple') => {
        try {
          set({ loading: true, error: null });
          
          const { url } = await signInWithProvider(provider);
          
          // Note: In a real app, you'd handle the OAuth flow here
          // For now, we'll just return false as this requires additional setup
          
          set({ loading: false, error: 'OAuth not configured' });
          return false;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || `${provider} sign in failed` 
          });
          return false;
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ loading: true });
          
          // Clean up real-time subscriptions before signing out
          get().cleanupRealtimeSubscriptions();
          
          await supabaseSignOut();
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            onboardingCompleted: false,
            userType: null,
            loading: false,
            error: null,
          });
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Sign out failed' 
          });
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          
          await resetPassword(email);
          
          set({ loading: false });
          return true;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Password reset failed' 
          });
          return false;
        }
      },

      // Update profile
      updateProfile: async (updates: Partial<UserProfile>) => {
        try {
          const { user } = get();
          if (!user) return false;
          
          set({ loading: true, error: null });
          
          const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          
          set({
            user: updatedProfile,
            loading: false,
          });
          
          return true;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Profile update failed' 
          });
          return false;
        }
      },

      // Refresh profile
      refreshProfile: async () => {
        try {
          const { user } = get();
          if (!user) return;
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            set({
              user: profile,
              onboardingCompleted: profile.onboarding_completed,
              userType: profile.user_type,
            });
          }
        } catch (error) {
          console.error('Failed to refresh profile:', error);
        }
      },

      // Complete onboarding
      completeOnboarding: async (userType: 'customer' | 'business_owner', preferences = {}) => {
        try {
          const { user } = get();
          if (!user) return false;
          
          set({ loading: true, error: null });
          
          const updates = {
            user_type: userType,
            onboarding_completed: true,
            ai_preferences: preferences,
            updated_at: new Date().toISOString(),
          };
          
          const { data: updatedProfile, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();
          
          if (error) throw error;
          
          set({
            user: updatedProfile,
            onboardingCompleted: true,
            userType,
            loading: false,
          });
          
          return true;
        } catch (error: any) {
          set({ 
            loading: false, 
            error: error.message || 'Onboarding completion failed' 
          });
          return false;
        }
      },

      // Set user type
      setUserType: (userType: 'customer' | 'business_owner') => {
        set({ userType });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Set loading
      setLoading: (loading: boolean) => {
        set({ loading });
      },

      // Initialize auth state
      initialize: async () => {
        try {
          set({ loading: true });
          
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            set({
              user: profile,
              session,
              isAuthenticated: true,
              onboardingCompleted: profile?.onboarding_completed || false,
              userType: profile?.user_type || null,
              loading: false,
            });
            
            // Initialize real-time subscriptions for restored session
            get().setupRealtimeSubscriptions();
          } else {
            set({
              user: null,
              session: null,
              isAuthenticated: false,
              onboardingCompleted: false,
              userType: null,
              loading: false,
            });
          }
          
          // Set up auth state change listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              set({
                user: profile,
                session,
                isAuthenticated: true,
                onboardingCompleted: profile?.onboarding_completed || false,
                userType: profile?.user_type || null,
              });
              
              // Initialize real-time subscriptions on auth state change
              get().setupRealtimeSubscriptions();
            } else {
              // Clean up real-time subscriptions when user signs out
              get().cleanupRealtimeSubscriptions();
              
              set({
                user: null,
                session: null,
                isAuthenticated: false,
                onboardingCompleted: false,
                userType: null,
              });
            }
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ loading: false });
        }
      },

      // Aliases for compatibility
      logout: async () => {
        return get().signOut();
      },
      
      checkAuth: async () => {
        return get().initialize();
      },

      // Real-time subscription management
      setupRealtimeSubscriptions: () => {
        const user = get().user;
        if (!user?.id) return;

        // Setup push notifications first
        requestUserPermissionAndGetToken(user.id).catch(error => {
          console.error('Failed to setup push notifications:', error);
        });

        // Subscribe to user notifications
        RealtimeService.subscribeToNotifications(user.id, (payload) => {
          console.log('New notification:', payload);
          // Handle notification updates
        });

        // Subscribe to order updates
        RealtimeService.subscribeToOrderUpdates(user.id, (payload) => {
          console.log('Order update:', payload);
          // Handle order updates
        });

        // Subscribe to messages
        RealtimeService.subscribeToUserMessages(user.id, (payload) => {
          console.log('New message:', payload);
          // Handle message updates
        });

        // Subscribe to payment updates
        RealtimeService.subscribeToPaymentUpdates(user.id, (payload) => {
          console.log('Payment update:', payload);
          // Handle payment updates
        });

        // If business owner, subscribe to business updates
        if (user.user_type === 'business_owner') {
          // Subscribe to service request updates
          RealtimeService.subscribeToServiceRequestUpdates(user.id, (payload) => {
            console.log('Service request update:', payload);
            // Handle service request updates
          });
        }

        console.log('✅ Real-time subscriptions initialized for user:', user.id);
      },

      cleanupRealtimeSubscriptions: () => {
        RealtimeService.unsubscribeAll();
        console.log('🧹 All real-time subscriptions cleaned up');
      },
    }),
    {
      name: 'enhanced-towntap-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        onboardingCompleted: state.onboardingCompleted,
        userType: state.userType,
      }),
    }
  )
);

// Selectors for easier access
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    onboardingCompleted: store.onboardingCompleted,
    userType: store.userType,
  };
};

export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    signInWithEmail: store.signInWithEmail,
    signUpWithEmail: store.signUpWithEmail,
    signInWithPhone: store.signInWithPhone,
    sendOTP: store.sendOTP,
    verifyOTP: store.verifyOTP,
    signInWithProvider: store.signInWithProvider,
    signOut: store.signOut,
    resetPassword: store.resetPassword,
    updateProfile: store.updateProfile,
    refreshProfile: store.refreshProfile,
    completeOnboarding: store.completeOnboarding,
    setUserType: store.setUserType,
    clearError: store.clearError,
    setLoading: store.setLoading,
    initialize: store.initialize,
  };
};

export default useAuthStore;
