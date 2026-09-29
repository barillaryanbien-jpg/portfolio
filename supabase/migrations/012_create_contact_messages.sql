-- Migration: 012_create_contact_messages.sql
-- Create contact_messages table with RLS policies, rate/length constraints, and admin management

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  email text not null check (length(trim(email)) between 5 and 254 and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  subject text not null check (length(trim(subject)) between 1 and 200),
  message text not null check (length(trim(message)) between 1 and 5000),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.contact_messages enable row level security;

-- Public / Anonymous insert policy: allow anyone (public visitors) to submit a contact message
drop policy if exists public_insert_contact_messages on public.contact_messages;
create policy public_insert_contact_messages on public.contact_messages
  for insert to anon, authenticated
  with check (true);

grant insert on public.contact_messages to anon, authenticated;

-- Owner access policy: only authenticated portfolio owner can read, update (mark read/unread), and delete messages
drop policy if exists owner_manage_contact_messages on public.contact_messages;
create policy owner_manage_contact_messages on public.contact_messages
  for all to authenticated
  using ((select public.is_portfolio_admin()))
  with check ((select public.is_portfolio_admin()));

grant select, update, delete on public.contact_messages to authenticated;

-- Revoke read, update, delete from public / anonymous users
revoke select, update, delete on public.contact_messages from anon;

-- Indexes for performance: sorting newest first, and partial index for unread badge count / filter
create index if not exists contact_messages_created_at_idx on public.contact_messages(created_at desc);
create index if not exists contact_messages_unread_idx on public.contact_messages(created_at desc) where not is_read;
