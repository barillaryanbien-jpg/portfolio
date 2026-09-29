-- Migration: 010_certificate_asset_visibility.sql
-- Include certificate image paths in the same public asset checks used by
-- profile, about, project, and skill images. This preserves older certificate
-- records that still reference Supabase Storage paths while new certificate
-- uploads can use Cloudinary HTTPS URLs.

create or replace function public.is_public_asset(bucket text, object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when bucket = 'portfolio-files' then exists(select 1 from public.profiles where resume_path = object_path)
    when bucket = 'portfolio-images' then
      exists(select 1 from public.profiles where profile_image_path = object_path)
      or exists(select 1 from public.profiles p cross join public.site_settings s where s.show_about and nullif(trim(p.bio), '') is not null and p.about_image_path = object_path)
      or exists(select 1 from public.projects p cross join public.site_settings s where s.show_projects and p.is_published and p.cover_image_path = object_path)
      or exists(select 1 from public.skills k cross join public.site_settings s where s.show_skills and k.is_visible and k.icon_path = object_path)
      or exists(select 1 from public.certificates c where c.is_visible and c.certificate_image_path = object_path)
    else false end;
$$;

create or replace function public.asset_is_referenced(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_portfolio_admin() and (
    exists(select 1 from public.profiles where object_path in (profile_image_path, about_image_path, resume_path))
    or exists(select 1 from public.projects where cover_image_path = object_path)
    or exists(select 1 from public.skills where icon_path = object_path)
    or exists(select 1 from public.certificates where certificate_image_path = object_path)
  );
$$;

revoke all on function public.is_public_asset(text,text) from public;
grant execute on function public.is_public_asset(text,text) to anon, authenticated;
revoke all on function public.asset_is_referenced(text) from public;
grant execute on function public.asset_is_referenced(text) to authenticated;
