import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { variantId, changeQty, reason, adminId } = await request.json();

    // Note: Stock decrement/increment should be atomic. 
    // In Postgres, this is best done with an RPC call to a PL/pgSQL function.
    // Placeholder logic for incrementing stock via RPC (assuming an rpc 'adjust_stock' exists):
    
    /*
    const { data, error } = await supabaseAdmin.rpc('adjust_stock', {
      p_variant_id: variantId,
      p_change_qty: changeQty
    });
    if (error) throw error;
    */

    // Also log to inventory_log
    const { error: logError } = await supabaseAdmin
      .from('inventory_log')
      .insert([{ variant_id: variantId, change_qty: changeQty, reason, admin_id: adminId }] as any);

    if (logError) throw logError;

    return NextResponse.json({ success: true, message: 'Inventory adjusted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
