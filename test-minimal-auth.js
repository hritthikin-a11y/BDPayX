// Test minimal auth without any complications
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMinimalAuth() {
  console.log('🧪 Testing minimal auth flow...');
  
  let authChangeCount = 0;
  let authEvents = [];
  
  // Listen for auth changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      authChangeCount++;
      authEvents.push(`${event}: ${session?.user?.email || 'No user'}`);
      console.log(`📊 Auth change #${authChangeCount}:`, event, session?.user?.email || 'No user');
    }
  );
  
  try {
    // Test basic sign in
    const testEmail = 'minimal@test.com';
    const testPassword = 'testpassword123';
    
    console.log('🔐 Creating test user...');
    await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    console.log('🔐 Signing in...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.log('⚠️  Sign in issue:', error.message);
    } else {
      console.log('✅ Sign in successful');
    }
    
    // Wait for auth state to settle
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log(`📈 Total auth changes: ${authChangeCount}`);
    console.log('📋 Auth events:', authEvents);
    
    if (authChangeCount <= 3) {
      console.log('✅ Auth flow is clean and controlled');
    } else {
      console.log('❌ Too many auth state changes detected');
    }
    
    // Sign out
    console.log('🚪 Signing out...');
    await supabase.auth.signOut();
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📈 Final auth changes: ${authChangeCount}`);
    console.log('📋 Final auth events:', authEvents);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    subscription.unsubscribe();
    console.log('🧹 Test completed');
  }
}

testMinimalAuth();