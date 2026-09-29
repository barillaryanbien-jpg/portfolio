alter table public.education
  add column if not exists current_academic_level text
  check (
    current_academic_level is null
    or length(trim(current_academic_level)) <= 100
  );

create table if not exists public.experience (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 200),
  organization text check (organization is null or length(trim(organization)) <= 200),
  type text check (type is null or length(trim(type)) <= 100),
  start_date text check (start_date is null or length(trim(start_date)) <= 100),
  end_date text check (end_date is null or length(trim(end_date)) <= 100),
  is_current boolean not null default false,
  description text check (description is null or length(trim(description)) <= 5000),
  status text check (status is null or length(trim(status)) <= 100),
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.experience enable row level security;

drop trigger if exists touch_updated_at on public.experience;
create trigger touch_updated_at
  before update on public.experience
  for each row execute function public.touch_updated_at();

drop policy if exists owner_access on public.experience;
create policy owner_access on public.experience
  for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

drop policy if exists public_experience on public.experience;
create policy public_experience on public.experience
  for select to anon, authenticated
  using (is_visible);

grant select, insert, update, delete on public.experience to authenticated;
grant select on public.experience to anon;

create index if not exists experience_public_order
  on public.experience(sort_order, created_at)
  where is_visible;
