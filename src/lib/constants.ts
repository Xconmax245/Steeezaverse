// System-wide constants for Steezaverse

export const VAT_AMOUNT_NGN = 500;

/**
 * Fallback launch time for the Take Reeks First Collection (Monday, Nov 23, WAT).
 * The primary source of truth is always the collection's drop_starts_at from the database.
 */
export const TAKE_REEKS_DROP_FALLBACK = "2026-11-23T00:00:00+01:00";

/**
 * Returns the timestamp (ms) for the drop launch.
 * Uses collection's drop_starts_at if provided and valid, otherwise falls back to TAKE_REEKS_DROP_FALLBACK.
 */
export function getDropLaunchTime(dropStartsAt?: string | null): number {
  if (dropStartsAt) {
    const parsed = new Date(dropStartsAt).getTime();
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return new Date(TAKE_REEKS_DROP_FALLBACK).getTime();
}
