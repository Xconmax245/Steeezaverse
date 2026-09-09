-- Steezaverse Migration 00005
-- Lightweight visitor analytics: one row per page view, written by the
-- client-side AnalyticsTracker beacon (POST /api/analytics/track). Visitor
-- identity comes from a localStorage UUID so "visitors" = distinct visitor_id
-- while "page views" = row count. Aggregation happens in the admin dashboard;
-- if the table grows large, swap the dashboard query for a daily rollup.

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  visitor_id TEXT,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views (viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views (visitor_id, viewed_at);