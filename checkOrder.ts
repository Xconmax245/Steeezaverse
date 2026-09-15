import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .eq('order_number', 'STZ-MU1UV0FF')
    .single();
    
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}
main();
