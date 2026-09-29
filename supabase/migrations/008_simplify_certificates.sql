-- Migration: 008_simplify_certificates.sql
-- Ensure legacy fields in public.certificates are nullable and do not enforce NOT NULL

do $$
begin
  -- If public.certificates table exists, ensure issuer is nullable
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'certificates'
      and column_name = 'issuer'
      and is_nullable = 'NO'
  ) then
    alter table public.certificates alter column issuer drop not null;
  end if;
end $$;

-- Make check constraint safely allow null or empty values
alter table if exists public.certificates drop constraint if exists certificates_issuer_check;
alter table if exists public.certificates add constraint certificates_issuer_check check (issuer is null or length(trim(issuer)) <= 200);
