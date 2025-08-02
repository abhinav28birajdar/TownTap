import { supabase, supabaseAdmin } from '../lib/supabase';
import {
  LoginForm,
  OnboardingData,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  SignUpForm,
  User
} from '../types';
import { generateReferralCode } from '../utils/helpers';

export class AuthService {
  // =====================================================
  // AUTHENTICATION METHODS
  // =====================================================

  static async signUp(data: SignUpForm) {
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            user_type: data.userType,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const profileData: ProfileInsert = {
          id: authData.user.id,
          full_name: data.fullName,
          phone: data.phone,
          user_type: data.userType,
          avatar_url: null,
          is_verified: false,
          email_verified: false,
          phone_verified: false,
          date_of_birth: null,
          gender: null,
          language_preference: 'en',
          notification_preferences: {
            push: true,
            email: true,
            sms: true
          },
          referral_code: generateReferralCode(data.fullName),
          referred_by: null,
        };

        const { data: profile, error: profileError } = await (supabaseAdmin || supabase)
          .from('profiles')
          .insert(profileData)
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't throw error during signup - the trigger should handle it
          console.warn('Profile creation failed, but user account was created. Profile will be created on next login.');
        }

        return {
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            phone: data.phone,
            profile: (profile as Profile) || {
              id: authData.user.id,
              full_name: data.fullName,
              phone: data.phone,
              user_type: data.userType,
              email_verified: false,
              phone_verified: false,
              is_verified: false,
              avatar_url: null,
              date_of_birth: null,
              gender: null,
              language_preference: 'en',
              notification_preferences: { push: true, email: true, sms: true },
              loyalty_points: 0,
              membership_tier: 'bronze',
              referral_code: generateReferralCode(data.fullName),
              referred_by: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Profile
          },
          session: authData.session
        };
      }

      throw new Error('User creation failed');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Handle specific RLS policy errors
      if (error.message && error.message.includes('row-level security policy')) {
        throw new Error('Account created successfully, but profile setup needs completion. Please try logging in.');
      }
      
      throw new Error(error.message || 'Sign up failed');
    }
  }

  static async signIn(data: LoginForm) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const profile = await this.getProfile(authData.user.id);
        
        return {
          user: {
            id: authData.user.id,
            email: authData.user.email!,
            phone: authData.user.phone,
            profile
          },
          session: authData.session
        };
      }

      throw new Error('Sign in failed');
    } catch (error: any) {
      throw new Error(error.message || 'Sign in failed');
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Sign out failed');
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'towntap://reset-password',
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  static async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Password update failed');
    }
  }

  // =====================================================
  // PROFILE METHODS
  // =====================================================

  static async getProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error('Profile not found');
      }
      
      // If multiple profiles exist (shouldn't happen), use the first one
      if (data.length > 1) {
        console.warn(`Multiple profiles found for user ${userId}, using the first one`);
        // Optionally, clean up duplicate profiles here
      }
      
      return data[0] as Profile;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  }

  static async updateProfile(userId: string, updates: ProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      let profile;
      try {
        profile = await this.getProfile(user.id);
      } catch (error: any) {
        // If profile doesn't exist, try to create it
        if (error.message.includes('Profile not found')) {
          console.log('Profile not found, creating basic profile for user:', user.id);
          
          try {
            const profileData: ProfileInsert = {
              id: user.id,
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '',
              phone: user.user_metadata?.phone || user.phone || null,
              user_type: user.user_metadata?.userType || user.user_metadata?.user_type || 'customer',
              avatar_url: null,
              is_verified: false,
              email_verified: user.email_confirmed_at ? true : false,
              phone_verified: false,
              date_of_birth: null,
              gender: null,
              language_preference: 'en',
              notification_preferences: { push: true, email: true, sms: true },
              referral_code: generateReferralCode(user.user_metadata?.full_name || user.email?.split('@')[0] || ''),
              referred_by: null,
            };

            const { data: newProfile, error: createError } = await (supabaseAdmin || supabase)
              .from('profiles')
              .insert(profileData)
              .select()
              .single();

            if (createError) {
              console.error('Failed to create profile:', createError);
              // Return a basic profile object to prevent app crashes
              profile = {
                id: user.id,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                phone: user.phone || null,
                user_type: 'customer',
                email_verified: false,
                phone_verified: false,
                is_verified: false,
                avatar_url: null,
                date_of_birth: null,
                gender: null,
                language_preference: 'en',
                notification_preferences: { push: true, email: true, sms: true },
                loyalty_points: 0,
                membership_tier: 'bronze',
                referral_code: generateReferralCode(user.email?.split('@')[0] || ''),
                referred_by: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Profile;
            } else {
              profile = newProfile as Profile;
            }
          } catch (createError) {
            console.error('Error creating profile:', createError);
            throw error; // Re-throw original error
          }
        } else {
          throw error; // Re-throw other errors
        }
      }
      
      return {
        id: user.id,
        email: user.email!,
        phone: user.phone,
        profile
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async completeOnboarding(userId: string, onboardingData: OnboardingData) {
    try {
      const updates: ProfileUpdate = {
        full_name: onboardingData.personalInfo.fullName,
        phone: onboardingData.personalInfo.phone,
        user_type: onboardingData.userType,
      };

      // If business owner, we'll handle business creation in a separate service
      const profile = await this.updateProfile(userId, updates);
      
      return profile;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to complete onboarding');
    }
  }

  // =====================================================
  // SOCIAL AUTHENTICATION
  // =====================================================

  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'towntap://auth-callback',
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Google sign in failed');
    }
  }

  static async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'towntap://auth-callback',
        }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Apple sign in failed');
    }
  }

  // =====================================================
  // PHONE VERIFICATION
  // =====================================================

  static async sendPhoneOTP(phone: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  }

  static async verifyPhoneOTP(phone: string, token: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });

      if (error) throw error;

      // Update profile to mark phone as verified
      if (data.user) {
        await this.updateProfile(data.user.id, { phone_verified: true });
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  }

  // =====================================================
  // SESSION MANAGEMENT
  // =====================================================

  static async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh session');
    }
  }

  static onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // =====================================================
  // REFERRAL SYSTEM
  // =====================================================

  static async applyReferralCode(userId: string, referralCode: string) {
    try {
      // Find the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrer) {
        throw new Error('Invalid referral code');
      }

      // Update the current user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ referred_by: referrer.id })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Create referral record
      const { error: referralError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrer.id,
          referred_id: userId,
          referral_code: referralCode,
          status: 'pending'
        });

      if (referralError) throw referralError;

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply referral code');
    }
  }

  // =====================================================
  // ACCOUNT MANAGEMENT
  // =====================================================

  static async deleteAccount(userId: string) {
    try {
      // This will cascade delete all related data due to foreign key constraints
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      // Sign out the user
      await this.signOut();

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account');
    }
  }

  static async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<{ push: boolean; email: boolean; sms: boolean }>
  ) {
    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      const updatedPreferences = {
        ...currentProfile?.notification_preferences,
        ...preferences
      };

      const { data, error } = await supabase
        .from('profiles')
        .update({ notification_preferences: updatedPreferences })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update notification preferences');
    }
  }
}

export default AuthService;
