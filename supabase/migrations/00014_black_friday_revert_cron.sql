-- 00014_black_friday_revert_cron.sql
-- Black Friday tracksuit price reversion scheduled for Nov 30 23:59:59 WAT (Dec 1 00:00:00 WAT / Nov 30 23:00:00 UTC)

CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION revert_black_friday_tracksuit_price()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Revert STV TRACKSUIT back to regular price (100,000 NGN) and clear compare_at_price
  UPDATE products
  SET base_price = 100000.00,
      compare_at_price = NULL,
      updated_at = NOW()
  WHERE id = 'e83bce3e-038c-4d9d-9df7-7a721895c4b1';

  -- Clear any variant price overrides
  UPDATE product_variants
  SET price_override = NULL
  WHERE product_id = 'e83bce3e-038c-4d9d-9df7-7a721895c4b1';

  -- Self-unschedule so this one-off job does not repeat
  PERFORM cron.unschedule(jobid)
  FROM cron.job
  WHERE jobname = 'revert-black-friday-tracksuit-price';
END;
$$;

-- Revoke execute from public/anon/authenticated and grant to service_role
REVOKE EXECUTE ON FUNCTION revert_black_friday_tracksuit_price() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION revert_black_friday_tracksuit_price() TO service_role;

-- Unschedule existing job if already scheduled
SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'revert-black-friday-tracksuit-price';

-- Schedule at 23:00 UTC on Nov 30 (00:00 WAT Dec 1)
SELECT cron.schedule(
  'revert-black-friday-tracksuit-price',
  '0 23 30 11 *',
  $$SELECT public.revert_black_friday_tracksuit_price()$$
);
