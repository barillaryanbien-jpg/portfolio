-- Migration: 009_statistics_public_order.sql
-- Supports the public statistics query:
--   where is_visible = true order by sort_order, created_at
-- Other public collection tables already have equivalent partial indexes.

create index if not exists statistics_public_order
  on public.statistics(sort_order, created_at)
  where is_visible;
