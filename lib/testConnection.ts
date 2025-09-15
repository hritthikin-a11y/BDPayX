import { supabase } from './supabase';

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('🔍 Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('🔍 Supabase Key exists:', !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

    // Test basic connection
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Supabase connection successful');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testBasicQuery = async () => {
  try {
    console.log('🔍 Testing basic query...');

    // Try to get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('❌ Auth error:', userError);
      return { success: false, error: userError.message };
    }

    console.log('✅ Current user:', user?.email || 'No user');

    // Try a simple query that should work even with empty tables
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('❌ Query error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Query successful, found', data?.length || 0, 'records');
    return { success: true, records: data?.length || 0 };
  } catch (error) {
    console.error('❌ Test query failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};