import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    // Verify a secret token to ensure only cron can call this
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Ping the database to keep the project active on the free tier
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id')
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Keep-alive ping successful' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
