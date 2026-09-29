-- Migration: 007_create_certificates.sql
-- Create certificates table with RLS policies, updated_at trigger, and public read permissions

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  issuer text check (issuer is null or length(trim(issuer)) <= 200),
  category text check (category is null or length(trim(category)) <= 100),
  issue_date text check (issue_date is null or length(trim(issue_date)) <= 100),
  expiration_date text check (expiration_date is null or length(trim(expiration_date)) <= 100),
  credential_id text check (credential_id is null or length(trim(credential_id)) <= 200),
  credential_url text check (credential_url is null or credential_url ~ '^https?://'),
  description text check (description is null or length(trim(description)) <= 5000),
  certificate_image_path text,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.certificates enable row level security;

-- Updated_at trigger using existing touch_updated_at function
drop trigger if exists touch_updated_at on public.certificates;
create trigger touch_updated_at
  before update on public.certificates
  for each row execute function public.touch_updated_at();

-- Owner access policy (read, insert, update, delete for authenticated admin)
drop policy if exists owner_access on public.certificates;
create policy owner_access on public.certificates
  for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

grant select, insert, update, delete on public.certificates to authenticated;

-- Public read policy: anonymous visitors can view visible certificate records
drop policy if exists public_certificates on public.certificates;
create policy public_certificates on public.certificates
  for select to anon, authenticated
  using (is_visible);

grant select on public.certificates to anon;

-- Index for ordering public certificate records
create index if not exists certificates_public_order on public.certificates(sort_order, created_at) where is_visible;
