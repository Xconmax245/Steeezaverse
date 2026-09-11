import { getSupabaseAdmin } from './supabase/server';

type TelegramAlertType = 'telegram_order_alert' | 'telegram_low_stock_alert' | 'telegram_waitlist_alert';

interface TelegramAlertPayload {
  type: TelegramAlertType;
  text: string;
}

/**
 * Sends a message to the configured Telegram chat/group.
 * Fire-and-forget: does not throw errors on failure, logs result to `notification_log`.
 */
export async function sendTelegramAlert({ type, text }: TelegramAlertPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('Telegram bot token or chat ID is not configured.');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const status = res.ok ? 'sent' : 'failed';

    if (!res.ok) {
      console.error('Telegram alert failed:', await res.text());
    }

    // Log the notification
    await (getSupabaseAdmin() as any)
      .from('notification_log')
      .insert([
        {
          type,
          recipient: chatId,
          status,
        },
      ]);
  } catch (error) {
    console.error('Telegram alert fetch error:', error);
    await (getSupabaseAdmin() as any)
      .from('notification_log')
      .insert([
        {
          type,
          recipient: chatId,
          status: 'failed',
        },
      ]).catch(() => {});
  }
}
