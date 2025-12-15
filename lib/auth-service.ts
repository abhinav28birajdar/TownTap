/**
 * Authentication Service
 * Handles all auth operations with Supabase
 */

import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: 'customer' | 'business_owner';
}

export interface SignInData {
  email: string;
  password: string;
}

export const AuthService = {
  /**
   * Sign up new user
   */
  async signUp(data: SignUpData) {
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            phone: data.phone,
            role: data.role,
          },
        },
      });

      if (authError) throw authError;

      // 2. Create user profile in users table
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: data.email,
          phone: data.phone,
          full_name: data.fullName,
          role: data.role,
          email_verified: false,
          phone_verified: false,
        } as any);

        if (profileError) throw profileError;

        // 3. Create wallet for user
        await supabase.from('wallets').insert({
          user_id: authData.user.id,
          balance: 0,
        } as any);
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Sign in existing user
   */
  async signIn(data: SignInData) {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // Fetch full user profile
      if (authData.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        return { data: { ...authData, userData }, error: null };
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'towntap://reset-password',
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message };
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: error.message };
    }
  },

  /**
   * Verify OTP
   */
  async verifyOTP(phone: string, otp: string) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      // Update phone_verified status
      if (data.user) {
        await (supabase
          .from('users') as any)
          .update({ phone_verified: true })
          .eq('id', data.user.id);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('OTP verification error:', error);
      return { data: null, error: error.message };
    }
  },

  /**
   * Resend OTP
   */
  async resendOTP(phone: string) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      return { error: error.message };
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        return { user: userData, error: null };
      }

      return { user: null, error: null };
    } catch (error: any) {
      console.error('Get current user error:', error);
      return { user: null, error: error.message };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: any) {
    try {
      const { data, error } = await (supabase
        .from('users') as any)
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { data: null, error: error.message };
    }
  },
};
