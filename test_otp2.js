const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://crkjjxfpuoygkmbkluvg.supabase.co',
  'sb_publishable_tT52xucMbXL2-jo3jNgyZQ_W_JIkes5',
  {
    auth: {
      flowType: 'implicit',
      persistSession: false,
    }
  }
);

async function testOtp() {
  const email = 'ademolasultan19@gmail.com'; // user's email
  
  // We can't actually sign them in or verify without the code,
  // but we can test if we can send the OTP.
  // Wait, I shouldn't send an OTP to the user's real email, that will spam them.
  // Let me just check if the user exists.
  
  // Can I query the users table? No, it's protected.
  console.log("Script executed.");
}

testOtp();
