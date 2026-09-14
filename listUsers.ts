import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
supabase.auth.admin.listUsers().then(({data, error}) => {
  if (error) console.error(error);
  else console.log(data.users.map(u => ({id: u.id, email: u.email})));
});
