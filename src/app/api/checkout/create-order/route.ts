import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getServerSessionClient } from '@/lib/supabase/server-session';
import { verifyDiscountCondition } from '@/lib/discounts';
import { sendTelegramAlert } from '@/lib/telegram';
import { initializePayment, PaymentGateway } from '@/lib/payments';
import { isValidPhoneNumber } from 'libphonenumber-js';

// Creates a `pending` order, atomically reserves stock, and initializes the
// payment session. The order is only marked `paid` by the gateway webhook —
// never at creation time.
//
// Stock semantics: quantities are decremented here (single atomic RPC per line)
// to prevent overselling during a checkout rush. If the payment session fails
// to initialize, stock is restored and the order is cancelled. Abandoned
// pending orders are cancelled and their stock released by the DB-side job in
// migration 00003 (pg_cron every 20 min; also triggerable via
// /api/cron/release-pending-stock).

interface CartLine {
  quantity: number;
  variant: {
    id: string;
    sku: string | null;
    size: string | null;
    color: string | null;
    stock_quantity: number;
    price_override: number | null;
    product: {
      id: string;
      name: string;
      slug: string;
      base_price: number;
      status: string;
      is_drop: boolean;
      drop_starts_at: string | null;
    };
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cartId,
      customerId: providedCustomerId,
      email,
      whatsappNumber,
      shippingAddressId,
      shippingAddress,
      gateway,
      discountCode,
    } = body;

    if (!cartId || typeof cartId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'cartId is required' },
        { status: 400 }
      );
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'email is required for payment' },
        { status: 400 }
      );
    }
    if (gateway !== 'paystack' && gateway !== 'flutterwave') {
      return NextResponse.json(
        { success: false, error: "gateway must be 'paystack' or 'flutterwave'" },
        { status: 400 }
      );
    }
    if (!whatsappNumber || typeof whatsappNumber !== 'string' || !isValidPhoneNumber(whatsappNumber)) {
      return NextResponse.json(
        { success: false, error: 'A valid E.164 WhatsApp number is required' },
        { status: 400 }
      );
    }

    let customerId = providedCustomerId;
    const normalizedEmail = email.trim().toLowerCase();

    // Email-Upsert & Shadow User Logic
    if (!customerId) {
      const { data: existingCustomer } = await (getSupabaseAdmin() as any)
        .from('customers')
        .select('id')
        .eq('email', normalizedEmail)
        .single();
        
      if (existingCustomer) {
        customerId = existingCustomer.id;
        await (getSupabaseAdmin() as any)
          .from('customers')
          .update({ 
            whatsapp_number: whatsappNumber,
            name: shippingAddress?.full_name?.trim() || null
          })
          .eq('id', customerId);
      } else {
        const { data: authData, error: authError } = await getSupabaseAdmin().auth.admin.createUser({
          email: normalizedEmail,
          email_confirm: true,
          user_metadata: { name: shippingAddress?.full_name?.trim() || '' }
        });
        
        if (authError || !authData.user) {
          // If the user already exists in auth.users (but was missing from customers table), fetch their ID
          if (authError?.status === 422 || authError?.message?.toLowerCase().includes('already registered')) {
            const { data: searchData, error: searchError } = await getSupabaseAdmin().auth.admin.listUsers();
            const existingAuthUser = searchData?.users?.find(u => u.email === normalizedEmail);
            
            if (existingAuthUser) {
              customerId = existingAuthUser.id;
            } else {
              console.error("Auth creation error (and not found in search):", authError, searchError);
              return NextResponse.json({ success: false, error: `Failed to process customer account: ${authError?.message || 'Unknown error'}` }, { status: 500 });
            }
          } else {
            console.error("Auth creation error:", authError);
            return NextResponse.json({ success: false, error: `Failed to process customer account: ${authError?.message || 'Unknown error'}` }, { status: 500 });
          }
        } else {
          customerId = authData.user.id;
        }
        
        await (getSupabaseAdmin() as any)
          .from('customers')
          .insert({
            id: customerId,
            email: normalizedEmail,
            name: shippingAddress?.full_name?.trim() || null,
            whatsapp_number: whatsappNumber
          });
      }
    } else {
      await (getSupabaseAdmin() as any)
        .from('customers')
        .update({ whatsapp_number: whatsappNumber })
        .eq('id', customerId);
    }

    let finalShippingAddressId = shippingAddressId;

    if (!finalShippingAddressId) {
      if (!shippingAddress || typeof shippingAddress !== 'object') {
        return NextResponse.json({ success: false, error: 'shippingAddress or shippingAddressId is required' }, { status: 400 });
      }
      
      const { full_name, line1, line2, city, state, phone } = shippingAddress;
      if (!full_name || typeof full_name !== 'string' || full_name.trim().length === 0 || full_name.length > 100) return NextResponse.json({ success: false, error: 'Invalid full_name' }, { status: 400 });
      if (!line1 || typeof line1 !== 'string' || line1.trim().length === 0 || line1.length > 255) return NextResponse.json({ success: false, error: 'Invalid line1' }, { status: 400 });
      if (line2 && (typeof line2 !== 'string' || line2.length > 255)) return NextResponse.json({ success: false, error: 'Invalid line2' }, { status: 400 });
      if (!city || typeof city !== 'string' || city.trim().length === 0 || city.length > 100) return NextResponse.json({ success: false, error: 'Invalid city' }, { status: 400 });
      if (!state || typeof state !== 'string' || state.trim().length === 0 || state.length > 100) return NextResponse.json({ success: false, error: 'Invalid state' }, { status: 400 });
      if (!phone || typeof phone !== 'string' || phone.trim().length === 0 || phone.length > 50) return NextResponse.json({ success: false, error: 'Invalid phone' }, { status: 400 });

      // Insert address securely via server role
      const { data: newAddr, error: addrError } = await (getSupabaseAdmin() as any)
        .from('addresses')
        .insert({
          customer_id: customerId || null,
          full_name: full_name.trim(),
          line1: line1.trim(),
          line2: line2 ? line2.trim() : null,
          city: city.trim(),
          state: state.trim(),
          phone: phone.trim(),
          is_default: false
        })
        .select('id')
        .single();
        
      if (addrError || !newAddr) {
        return NextResponse.json({ success: false, error: 'Failed to save address' }, { status: 500 });
      }
      finalShippingAddressId = newAddr.id;
    } else {
      // Validate saved address if customer is logged in
      if (customerId) {
        const { data: existingAddr } = await (getSupabaseAdmin() as any)
           .from('addresses')
           .select('id')
           .eq('id', finalShippingAddressId)
           .eq('customer_id', customerId)
           .single();
        if (!existingAddr) {
           return NextResponse.json({ success: false, error: 'Invalid shippingAddressId' }, { status: 400 });
        }
      }
    }

    // 1. Fetch cart lines with variant + product data (single nested query).
    const { data: rawItems, error: itemsError } = await (getSupabaseAdmin() as any)
      .from('cart_items')
      .select(
        `quantity,
         variant:product_variants(
           id, sku, size, color, stock_quantity, price_override,
           product:products(id, name, slug, base_price, status, is_drop, drop_starts_at)
         )`
      )
      .eq('cart_id', cartId);

    if (itemsError) throw itemsError;
    if (!rawItems?.length) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    const lines: CartLine[] = rawItems.map((item: any) => ({
      quantity: item.quantity,
      variant: item.variant,
    }));

    // 2. Validate every line is purchasable and in stock.
    for (const line of lines) {
      const p = line.variant?.product;
      if (!p) {
        return NextResponse.json(
          { success: false, error: 'Cart contains an unavailable item' },
          { status: 400 }
        );
      }
      if (p.status !== 'published' && !p.is_drop) {
        return NextResponse.json(
          { success: false, error: `${p.name} is not available for purchase` },
          { status: 400 }
        );
      }
      if (p.is_drop && p.drop_starts_at) {
        if (new Date() < new Date(p.drop_starts_at)) {
          return NextResponse.json(
            { success: false, error: `${p.name} is not yet available for purchase` },
            { status: 400 }
          );
        }
      }
      if (line.variant.stock_quantity < line.quantity) {
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${p.name}` },
          { status: 409 }
        );
      }
    }

    // 3. Compute totals.
    const subtotal = lines.reduce((sum, line) => {
      const unitPrice = line.variant.price_override ?? line.variant.product.base_price;
      return sum + unitPrice * line.quantity;
    }, 0);

    // 4. Validate discount (if provided).
    let discountAmount = 0;
    if (discountCode) {
      const { data: discount, error: discountError } = await getSupabaseAdmin()
        .from('discounts')
        .select('*')
        .ilike('code', discountCode.trim())
        .eq('active', true)
        .single();

      if (discountError || !discount) {
        return NextResponse.json(
          { success: false, error: 'Invalid discount code' },
          { status: 400 }
        );
      }

      const d = discount as any;
      const now = new Date();
      if (d.expires_at && new Date(d.expires_at) < now) {
        return NextResponse.json(
          { success: false, error: 'Discount expired' },
          { status: 400 }
        );
      }
      if (d.min_order_value && subtotal < Number(d.min_order_value)) {
        return NextResponse.json(
          { success: false, error: `Minimum order value of ${d.min_order_value} required` },
          { status: 400 }
        );
      }
      if (d.usage_limit && d.times_used >= d.usage_limit) {
        return NextResponse.json(
          { success: false, error: 'Discount usage limit reached' },
          { status: 400 }
        );
      }

      discountAmount =
        d.type === 'percentage'
          ? (subtotal * Number(d.value)) / 100
          : Math.min(Number(d.value), subtotal);
    }

    const shippingCost = Number(process.env.SHIPPING_COST_NGN || 0);
    const total = Math.max(0, subtotal - discountAmount) + shippingCost;

    // 5. Generate order identifiers.
    const orderNumber = `STZ-${Date.now().toString(36).toUpperCase()}`;
    const paymentReference = `STZ-${Date.now()}-${crypto
      .randomBytes(4)
      .toString('hex')
      .toUpperCase()}`;

    // 6. Atomically reserve stock (single guarded UPDATE per line via RPC).
    const reserved: CartLine[] = [];
    for (const line of lines) {
      const { data: ok, error: rpcError } = await (getSupabaseAdmin().rpc as any)(
        'decrement_stock',
        { p_variant_id: line.variant.id, p_qty: line.quantity }
      );
      if (rpcError) {
        await restoreStock(reserved); // release what was already reserved
        throw rpcError;
      }
      if (ok === false) {
        // Another checkout grabbed the last unit between validation and now.
        await restoreStock(reserved); // release only the lines we reserved
        return NextResponse.json(
          { success: false, error: `Insufficient stock for ${line.variant.product.name}` },
          { status: 409 }
        );
      }
      reserved.push(line);

      // Trigger Telegram Alert for Low Stock (Threshold = 5)
      const previousStock = line.variant.stock_quantity;
      const newStock = previousStock - line.quantity;
      if (previousStock > 5 && newStock <= 5) {
        const adminUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://steezaverse.com';
        const variantText = `(${line.variant.color}, ${line.variant.size})`;
        sendTelegramAlert({
          type: 'telegram_low_stock_alert',
          text: `⚠️ <b>Low stock:</b> ${line.variant.product.name} ${variantText} — ${newStock} left\n\nAdmin: ${adminUrl}/admin/products/${line.variant.product.id}`,
        }).catch(err => console.error('Telegram low stock alert failed:', err));
      }
    }

    // 7. Create the pending order.
    const { data: order, error: orderError } = await (getSupabaseAdmin() as any)
      .from('orders')
      .insert([
        {
          customer_id: customerId || null,
          order_number: orderNumber,
          status: 'pending',
          subtotal: round2(subtotal),
          discount_amount: round2(discountAmount),
          shipping_cost: round2(shippingCost),
          total: round2(total),
          payment_status: 'pending',
          payment_reference: paymentReference,
          payment_gateway: gateway,
          shipping_address_id: finalShippingAddressId || null,
          discount_code: discountCode || null,
        },
      ])
      .select()
      .single();

    if (orderError) {
      await restoreStock(lines);
      throw orderError;
    }

    // 8. Snapshot line items.
    const orderItems = lines.map((line) => ({
      order_id: order.id,
      variant_id: line.variant.id,
      quantity: line.quantity,
      unit_price: round2(line.variant.price_override ?? line.variant.product.base_price),
      product_name_snapshot: line.variant.product.name,
      variant_snapshot: {
        sku: line.variant.sku,
        size: line.variant.size,
        color: line.variant.color,
      },
    }));

    const { error: itemsInsertError } = await (getSupabaseAdmin() as any)
      .from('order_items')
      .insert(orderItems);

    if (itemsInsertError) {
      await restoreStock(lines);
      await (getSupabaseAdmin() as any).from('orders').delete().eq('id', order.id);
      throw itemsInsertError;
    }

    // 9. Initialize the payment session.
    try {
      const callbackUrl = `${
        process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      }/checkout/complete?reference=${paymentReference}&gateway=${gateway}`;

      const session = await initializePayment({
        gateway: gateway as PaymentGateway,
        email,
        amount: total,
        reference: paymentReference,
        callbackUrl,
        orderId: order.id,
      });

      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber,
        paymentReference,
        authorizationUrl: session.authorizationUrl,
        gateway,
      });
    } catch (paymentError: any) {
      // Payment session failed — release stock, cancel the order.
      await restoreStock(lines);
      await (getSupabaseAdmin() as any)
        .from('orders')
        .update({ status: 'cancelled', payment_status: 'failed' })
        .eq('id', order.id);
      throw paymentError;
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Best-effort release of reserved stock (log 'manual' entries for audit). */
async function restoreStock(lines: CartLine[]): Promise<void> {
  for (const line of lines) {
    await (getSupabaseAdmin().rpc as any)('adjust_stock', {
      p_variant_id: line.variant.id,
      p_change_qty: line.quantity,
      p_reason: 'manual',
      p_admin_id: null,
    });
  }
}