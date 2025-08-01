import { supabase } from '../lib/supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
    
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
};

export const initializeSupabase = async () => {
  try {
    // Test connection first
    const isConnected = await testSupabaseConnection();
    
    if (!isConnected) {
      console.warn('⚠️ Supabase connection issue: Network request failed');
      return false;
    }
    
    console.log('📊 Database connection established');
    return true;
    
  } catch (error) {
    console.warn('⚠️ Supabase initialization warning:', error);
    return false;
  }
};
