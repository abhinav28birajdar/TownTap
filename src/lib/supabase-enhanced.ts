import { supabase } from './supabase';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '../types';

export interface AuthError {
  message: string;
  status?: number;
}

export interface AuthResponse {
  user?: User;
  session?: Session;
  error?: AuthError;
}

// Enhanced authentication functions
export const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
};

export const signUpWithEmail = async (email: string, password: string, userData?: Partial<UserProfile>): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData || {},
      },
    });

    if (error) {
      return { error: { message: error.message } };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
};

export const signOut = async (): Promise<{ error?: AuthError }> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: { message: error.message } };
    }
    return {};
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

// Auth state listener
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// Password reset
export const resetPassword = async (email: string): Promise<{ error?: AuthError }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      return { error: { message: error.message } };
    }
    return {};
  } catch (error) {
    return { error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
};

export { supabase };
export default supabase;