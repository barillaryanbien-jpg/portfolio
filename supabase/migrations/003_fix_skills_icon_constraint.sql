-- Drop the restrictive legacy icon check constraint so any technology icon key can be stored.
-- Application-level validation via Zod and the centralized icon registry handles validity.
alter table public.skills drop constraint if exists skills_icon_check;
