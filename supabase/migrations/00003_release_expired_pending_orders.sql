-- Steezaverse Migration 00003
-- Abandoned-order stock release. During a drop, checkout reservations must not
-- lock inventory forever when a customer abandons payment. This job atomically
-- claims stale `pending` orders (no payment received) and restores their stock.
--
-- Runs entirely inside Postgres via pg_cron (works on the free tier; Vercel
-- free crons only fire daily, far too slow for this). The same function is also
-- exposed via GET /api/cron/release-pending-stock for external schedulers.

-- 1. The release function (idempotent: the UPDATE claim makes overlapping runs safe)
CREATE OR REPLACE FUNCTION release_expired_pending_orders(p_age_minutes INTEGER DEFAULT 20)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  claimed RECORD;
  released INTEGER := 0;
  line RECORD;
BEGIN
  -- Atomically claim stale pending orders so two overlapping runs (or a run
  -- racing a payment webhook) can never process the same order twice.
  FOR claimed IN
    UPDATE orders
    SET status = 'cancelled', updated_at = NOW()
    WHERE status = 'pending'
      AND payment_status = 'pending'
      AND created_at < NOW() - make_interval(mins => p_age_minutes)
    RETURNING id
  LOOP
    -- Restore stock for every line of the cancelled order and audit it.
    FOR line IN
      SELECT variant_id, quantity
      FROM order_items
      WHERE order_id = claimed.id
    LOOP
      UPDATE product_variants
      SET stock_quantity = stock_quantity + line.quantity
      WHERE id = line.variant_id;

      INSERT INTO inventory_log (variant_id, change_qty, reason)
      VALUES (line.variant_id, line.quantity, 'manual');
    END LOOP;

    released := released + 1;
  END LOOP;

  RETURN released;
END;
$$;

-- 2. Schedule it every 20 minutes (drops are the highest-traffic moment; 15-30
--    min windows are typical for checkout reservations).
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'release-expired-pending-stock';

SELECT cron.schedule(
  'release-expired-pending-stock',
  '*/20 * * * *',
  $$SELECT public.release_expired_pending_orders(20)$$
);

-- 3. The function must not be callable by anon/authenticated.
REVOKE EXECUTE ON FUNCTION release_expired_pending_orders(INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION release_expired_pending_orders(INTEGER) TO service_role;