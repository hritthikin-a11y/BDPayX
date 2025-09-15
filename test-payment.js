// Simple test script to check if the Edge Function is accessible
const SUPABASE_URL = "https://enzrnxiqjadyjuverbvm.supabase.co";
const CREATE_PAYMENT_URL = `${SUPABASE_URL}/functions/v1/create-payment`;

async function testEdgeFunction() {
  try {
    console.log('Testing Edge Function at:', CREATE_PAYMENT_URL);

    const response = await fetch(CREATE_PAYMENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVuenJueGlxamFkeWp1dmVyYnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1Mjk0NTgsImV4cCI6MjA3MzEwNTQ1OH0.wHfB3G9dLiIUpK21Qsk4MAAHnEklZtiaWSZQpU9GPHs',
      },
      body: JSON.stringify({
        fullname: "Test User",
        email: "test@example.com",
        amount: "100",
        success_url: "bdpayx://payment-success",
        cancel_url: "bdpayx://payment-cancel"
      }),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    const text = await response.text();
    console.log('Response body:', text);

    if (response.ok) {
      console.log('✅ Edge Function is accessible');
    } else {
      console.log('❌ Edge Function returned error');
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

testEdgeFunction();