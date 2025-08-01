import { useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../lib/supabase';

export const useSupabaseErrorHandler = () => {
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const checkConnection = async () => {
      try {
        const { success, error } = await testSupabaseConnection();
        
        if (!success && retryCount < maxRetries) {
          retryCount++;
          console.warn(`⚠️ Supabase connection attempt ${retryCount}/${maxRetries} failed:`, error);
          
          // Retry after delay
          setTimeout(checkConnection, 2000 * retryCount);
        } else if (!success) {
          console.error('❌ Supabase connection failed after maximum retries');
        } else {
          console.log('✅ Supabase connection established successfully');
          retryCount = 0;
        }
      } catch (err) {
        console.warn('⚠️ Supabase connection error:', err);
      }
    };

    // Initial connection test
    checkConnection();

    // Set up error handling for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('🔐 User signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        console.log('🔓 User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    handleError: (error: any) => {
      if (error?.message?.includes('Network request failed')) {
        console.warn('⚠️ Network connection issue detected');
        return 'Please check your internet connection and try again.';
      }
      return error?.message || 'An unexpected error occurred';
    }
  };
};
