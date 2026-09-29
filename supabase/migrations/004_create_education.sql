-- Migration: 004_create_education.sql
-- Create education table with RLS policies, updated_at trigger, and public read permissions

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null check (length(trim(institution)) between 1 and 200),
  degree text not null check (length(trim(degree)) between 1 and 200),
  field_of_study text check (field_of_study is null or length(trim(field_of_study)) <= 200),
  start_date text check (start_date is null or length(trim(start_date)) <= 100),
  end_date text check (end_date is null or length(trim(end_date)) <= 100),
  is_current boolean not null default false,
  location text check (location is null or length(trim(location)) <= 200),
  description text check (description is null or length(trim(description)) <= 5000),
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.education enable row level security;

-- Updated_at trigger using existing touch_updated_at function
drop trigger if exists touch_updated_at on public.education;
create trigger touch_updated_at
  before update on public.education
  for each row execute function public.touch_updated_at();

-- Owner access policy (read, insert, update, delete for authenticated admin)
drop policy if exists owner_access on public.education;
create policy owner_access on public.education
  for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

grant select, insert, update, delete on public.education to authenticated;

-- Public read policy: anonymous visitors can view visible education records
drop policy if exists public_education on public.education;
create policy public_education on public.education
  for select to anon, authenticated
  using (is_visible);

grant select on public.education to anon;

-- Index for ordering public education records
create index if not exists education_public_order on public.education(sort_order, created_at) where is_visible;
