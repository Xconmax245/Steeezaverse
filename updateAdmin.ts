import { createClient } from '@supabase/supabase-js';

async function updateAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, serviceKey);

  const oldEmail = 'ademolasultan19@gmail.com';
  const newEmail = 'steezaverse12@gmail.com';
  const newPassword = 'STEEZAVERSE';
  
  // Find user by old email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users:', listError);
    return;
  }
  
  const user = users.users.find(u => u.email === oldEmail);
  if (!user) {
    console.error('User not found in auth.users!');
    return;
  }
  
  // Update Auth credentials
  const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
    email: newEmail,
    password: newPassword,
    email_confirm: true // explicitly confirm new email
  });
  
  if (updateError) {
    console.error('Error updating user auth:', updateError);
    return;
  }
  
  // Update admin_users table
  const { error: dbError } = await supabase
    .from('admin_users')
    .update({ email: newEmail })
    .eq('email', oldEmail);
    
  if (dbError) {
    console.error('Error updating admin_users table:', dbError);
    return;
  }
  
  console.log('Successfully updated Admin Email to', newEmail, 'and Password to', newPassword);
}

updateAdmin();
