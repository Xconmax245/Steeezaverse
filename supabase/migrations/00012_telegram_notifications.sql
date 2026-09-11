-- 00012_telegram_notifications.sql

-- Drop the old constraint and add the new one allowing telegram notification types
ALTER TABLE notification_log DROP CONSTRAINT IF EXISTS notification_log_type_check;
ALTER TABLE notification_log ADD CONSTRAINT notification_log_type_check 
  CHECK (type IN (
    'order_confirmation', 
    'shipping_update', 
    'waitlist_notify', 
    'low_stock', 
    'telegram_order_alert', 
    'telegram_low_stock_alert', 
    'telegram_waitlist_alert'
  ));
