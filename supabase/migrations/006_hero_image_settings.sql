-- Migration 006: Add Hero Image positioning and display mode settings to public.profiles

alter table public.profiles
  add column if not exists hero_image_mode text not null default 'cutout'
    check (hero_image_mode in ('cutout', 'full')),
  add column if not exists hero_image_scale numeric not null default 1.0
    check (hero_image_scale between 0.1 and 5.0),
  add column if not exists hero_image_position_x numeric not null default 50.0
    check (hero_image_position_x between -100.0 and 200.0),
  add column if not exists hero_image_position_y numeric not null default 50.0
    check (hero_image_position_y between -100.0 and 200.0);

-- Update get_public_profile() to return the updated profiles row structure
create or replace function public.get_public_profile() returns setof public.profiles
language sql stable security definer set search_path = '' as $$
  select p.id, p.owner_name, p.professional_title, p.short_intro,
    case when s.show_about then p.bio end, p.profile_image_path, p.resume_path,
    case when s.show_contact then p.email end,
    case when s.show_contact then p.phone end,
    case when s.show_contact then p.location end,
    case when s.show_contact then p.availability_text end,
    case when s.show_about then p.about_heading end,
    case when s.show_about then p.secondary_description end,
    case when s.show_about then p.about_image_path end,
    p.created_at, p.updated_at,
    p.hero_image_mode, p.hero_image_scale, p.hero_image_position_x, p.hero_image_position_y
  from public.profiles p cross join public.site_settings s where p.id and s.id;
$$;
