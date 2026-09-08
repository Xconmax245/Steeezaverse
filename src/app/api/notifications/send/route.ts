import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { type, recipient, data } = await request.json();

    // Send email logic goes here using an email provider (Resend, SendGrid, etc.)

    // Log the notification
    const { error: logError } = await (supabaseAdmin.from('notification_log') as any)
      .insert([{ type, recipient, status: 'sent' }]);

    if (logError) throw logError;

    return NextResponse.json({ success: true, message: 'Notification sent' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
