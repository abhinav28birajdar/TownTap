import { getOrCreateProfile, supabase, testSupabaseConnection } from '../src/lib/supabase';

/**
 * Test Supabase connection and functionality
 */
export const runSupabaseTests = async () => {
  console.log('🧪 Starting Supabase Tests...\n');

  // Test 1: Basic Connection
  console.log('1️⃣ Testing Supabase Connection...');
  try {
    const connectionTest = await testSupabaseConnection();
    if (connectionTest) {
      console.log('✅ Supabase connection successful');
    } else {
      console.log('❌ Supabase connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error);
    return false;
  }

  // Test 2: Auth State
  console.log('\n2️⃣ Testing Auth State...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('⚠️ No authenticated user:', error.message);
    } else if (user) {
      console.log('✅ User authenticated:', user.email);
      
      // Test profile access
      console.log('\n3️⃣ Testing Profile Access...');
      const { data: profile, error: profileError } = await getOrCreateProfile(user.id);
      if (profileError) {
        console.log('❌ Profile error:', (profileError as any)?.message || profileError);
      } else if (profile) {
        console.log('✅ Profile loaded:', profile.full_name || 'No name set');
      }
    } else {
      console.log('⚠️ No user session');
    }
  } catch (error) {
    console.log('❌ Auth test error:', error);
  }

  // Test 3: Database Access
  console.log('\n4️⃣ Testing Database Access...');
  try {
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('id, name')
      .limit(5);
    
    if (error) {
      console.log('❌ Database access error:', error.message);
    } else {
      console.log(`✅ Database accessible - found ${businesses?.length || 0} businesses`);
    }
  } catch (error) {
    console.log('❌ Database test error:', error);
  }

  // Test 4: Realtime Connection
  console.log('\n5️⃣ Testing Realtime Connection...');
  try {
    const channel = supabase
      .channel('test-channel')
      .on('presence', { event: 'sync' }, () => {
        console.log('✅ Realtime connection working');
      })
      .subscribe();

    // Clean up
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 2000);
  } catch (error) {
    console.log('❌ Realtime test error:', error);
  }

  console.log('\n🎉 Supabase tests completed!\n');
  return true;
};

/**
 * Initialize user profile if needed
 */
export const initializeUserProfile = async (userData?: any) => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      return { success: false, error: 'No authenticated user' };
    }

    console.log('👤 Initializing profile for user:', user.email);

    const { data: profile, error: profileError } = await getOrCreateProfile(
      user.id,
      userData || {
        full_name: user.email?.split('@')[0] || '',
        user_type: 'customer'
      }
    );

    if (profileError) {
      console.log('❌ Failed to create profile:', (profileError as any)?.message || profileError);
      return { success: false, error: (profileError as any)?.message || 'Profile creation failed' };
    }

    console.log('✅ Profile initialized:', profile?.full_name || 'No name');
    return { success: true, profile };

  } catch (error: any) {
    console.log('❌ Profile initialization error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Fix common profile issues
 */
export const fixProfileIssues = async () => {
  console.log('🔧 Fixing profile issues...\n');

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ No authenticated user found');
      return false;
    }

    // Try to get existing profile
    const { data: existingProfile, error: getError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (getError && getError.code !== 'PGRST116') {
      console.log('❌ Error checking profile:', getError.message);
      return false;
    }

    if (!existingProfile) {
      console.log('📝 Creating missing profile...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            full_name: user.email?.split('@')[0] || '',
            user_type: 'customer',
            email_verified: user.email_confirmed_at ? true : false,
          }
        ])
        .select()
        .single();

      if (createError) {
        console.log('❌ Failed to create profile:', createError.message);
        return false;
      }

      console.log('✅ Profile created successfully');
      return true;
    } else {
      console.log('✅ Profile already exists');
      return true;
    }

  } catch (error: any) {
    console.log('❌ Fix profile error:', error.message);
    return false;
  }
};
