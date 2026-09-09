import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin-auth';

const VALID_REASONS = ['restock', 'damage', 'manual'];

// Admin manual stock adjustment. Uses the atomic `adjust_stock` RPC (single
// guarded UPDATE + inventory_log insert in one transaction) — never
// read-then-write. Usage: { variantId, changeQty, reason, adminId? }
export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { variantId, changeQty, reason, adminId } = await request.json();

    if (!variantId || typeof variantId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'variantId is required' },
        { status: 400 }
      );
    }
    if (typeof changeQty !== 'number' || !Number.isInteger(changeQty) || changeQty === 0) {
      return NextResponse.json(
        { success: false, error: 'changeQty must be a non-zero integer' },
        { status: 400 }
      );
    }
    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { success: false, error: `reason must be one of: ${VALID_REASONS.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: ok, error } = await (getSupabaseAdmin().rpc as any)('adjust_stock', {
      p_variant_id: variantId,
      p_change_qty: changeQty,
      p_reason: reason,
      p_admin_id: adminId || null,
    });

    if (error) throw error;

    if (ok === false) {
      return NextResponse.json(
        { success: false, error: 'Adjustment would put stock below zero' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, message: 'Inventory adjusted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}