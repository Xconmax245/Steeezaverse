const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://crkjjxfpuoygkmbkluvg.supabase.co',
  'sb_publishable_tT52xucMbXL2-jo3jNgyZQ_W_JIkes5'
);

async function testOtp() {
  console.log("Sending OTP to test email...");
  const { data, error } = await supabase.auth.signInWithOtp({
    email: 'testauth@mailinator.com',
  });
  
  if (error) {
    console.error("Error sending OTP:", error.message);
    return;
  }
  
  console.log("OTP sent. Check https://www.mailinator.com/v2/inbox.jsp?zone=public&query=testauth");
  console.log("Run the verification step next by hardcoding the token you receive.");
}

testOtp();
