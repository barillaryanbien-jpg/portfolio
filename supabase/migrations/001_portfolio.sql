begin;

-- One owner, enrolled only through the SQL editor. Never writable through the API.
create table public.portfolio_admins (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;

create function public.is_portfolio_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.portfolio_admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to anon, authenticated;

create table public.profiles (
  id boolean primary key default true check (id),
  owner_name text not null check (length(trim(owner_name)) between 1 and 120),
  professional_title text, short_intro text, bio text,
  profile_image_path text, resume_path text,
  email text, phone text, location text, availability_text text,
  about_heading text, secondary_description text, about_image_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.site_settings (
  id boolean primary key default true check (id),
  brand_name text, hero_eyebrow text not null default 'Personal portfolio',
  hero_caption text default 'Portfolio', hero_cta_text text not null default 'View My Work',
  contact_heading text not null default 'Have a Project in Mind?',
  contact_description text default 'A conversation is a good place to start. Let’s explore what we could create together.',
  footer_text text not null default 'All rights reserved.',
  projects_heading text not null default 'Featured Projects', projects_description text,
  skills_heading text not null default 'Tools I Work With', skills_description text,
  show_statistics boolean not null default true, show_projects boolean not null default true,
  show_skills boolean not null default true, show_about boolean not null default true,
  show_contact boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.statistics (
  id uuid primary key default gen_random_uuid(),
  label text not null check (length(trim(label)) between 1 and 100),
  value text not null check (length(trim(value)) between 1 and 30), suffix text,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text, full_description text, cover_image_path text, category text,
  live_url text check (live_url is null or live_url ~ '^https?://'),
  repository_url text check (repository_url is null or repository_url ~ '^https?://'),
  featured boolean not null default false, is_published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.project_technologies (
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 50),
  sort_order integer not null default 0,
  primary key(project_id, name)
);
create unique index project_technologies_unique_name on public.project_technologies(project_id, lower(name));
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 100),
  icon text check (icon is null or icon in ('code','terminal','database','globe','layers','palette','cloud','cpu')),
  icon_path text, category text,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (length(trim(platform)) between 1 and 60),
  url text not null check (url ~ '^https?://'), username text,
  sort_order integer not null default 0 check (sort_order between 0 and 10000),
  is_visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
do $$ declare t text; begin
  foreach t in array array['profiles','site_settings','statistics','projects','skills','social_links'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', t);
    execute format('create policy owner_access on public.%I for all to authenticated using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()))', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
alter table public.project_technologies enable row level security;
create policy owner_access on public.project_technologies for all to authenticated
  using ((select public.is_portfolio_admin())) with check ((select public.is_portfolio_admin()));
grant select, insert, update, delete on public.project_technologies to authenticated;
revoke all on public.profiles from anon;
grant select on public.site_settings, public.statistics, public.projects, public.skills, public.social_links, public.project_technologies to anon;
create policy public_settings on public.site_settings for select to anon, authenticated using (true);
create policy public_projects on public.projects for select to anon, authenticated using (
  is_published and (select show_projects from public.site_settings where id)
);
create policy public_technologies on public.project_technologies for select to anon, authenticated using (
  exists(select 1 from public.projects p where p.id = project_id and p.is_published)
);
create policy public_skills on public.skills for select to anon, authenticated using (
  is_visible and (select show_skills from public.site_settings where id)
);
create policy public_statistics on public.statistics for select to anon, authenticated using (
  is_visible and (select show_statistics from public.site_settings where id)
);
create policy public_socials on public.social_links for select to anon, authenticated using (is_visible);

-- The underlying profile is owner-only. Public reads explicitly mask disabled sections.
create function public.get_public_profile() returns setof public.profiles
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
    p.created_at, p.updated_at
  from public.profiles p cross join public.site_settings s where p.id and s.id;
$$;
revoke all on function public.get_public_profile() from public;
grant execute on function public.get_public_profile() to anon, authenticated;

-- Project and technology writes are one transaction, so tags cannot be half-saved.
create function public.save_project(record jsonb, technologies text[]) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare saved_project_id uuid; tag text; i integer := 0;
begin
  if not public.is_portfolio_admin() then raise exception 'Forbidden' using errcode = '42501'; end if;
  if cardinality(technologies) > 30 then raise exception 'Too many technologies'; end if;
  if nullif(record->>'id', '') is not null then
    saved_project_id := (record->>'id')::uuid;
    update public.projects set
      title = record->>'title', slug = record->>'slug', short_description = record->>'short_description',
      full_description = record->>'full_description', cover_image_path = record->>'cover_image_path',
      category = record->>'category', live_url = record->>'live_url', repository_url = record->>'repository_url',
      featured = (record->>'featured')::boolean, is_published = (record->>'is_published')::boolean,
      sort_order = (record->>'sort_order')::integer where id = saved_project_id;
    if not found then raise exception 'Project no longer exists' using errcode = 'P0002'; end if;
  else
    insert into public.projects (title, slug, short_description, full_description, cover_image_path, category, live_url, repository_url, featured, is_published, sort_order)
    values (record->>'title', record->>'slug', record->>'short_description', record->>'full_description', record->>'cover_image_path', record->>'category', record->>'live_url', record->>'repository_url', (record->>'featured')::boolean, (record->>'is_published')::boolean, (record->>'sort_order')::integer)
    returning id into saved_project_id;
  end if;
  delete from public.project_technologies where project_id = saved_project_id;
  foreach tag in array technologies loop
    insert into public.project_technologies(project_id, name, sort_order) values (saved_project_id, trim(tag), i);
    i := i + 1;
  end loop;
  return saved_project_id;
end;
$$;
revoke all on function public.save_project(jsonb, text[]) from public;
grant execute on function public.save_project(jsonb, text[]) to authenticated;

-- Private buckets. Draft / staged files cannot be downloaded by anonymous visitors.
create function public.save_contact(record jsonb) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_portfolio_admin() then raise exception 'Forbidden' using errcode = '42501'; end if;
  update public.profiles set email = record->>'email', phone = record->>'phone', location = record->>'location', availability_text = record->>'availability_text' where id;
  update public.site_settings set contact_heading = record->>'contact_heading', contact_description = record->>'contact_description' where id;
end;
$$;
revoke all on function public.save_contact(jsonb) from public;
grant execute on function public.save_contact(jsonb) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('portfolio-images','portfolio-images',false,5242880,array['image/jpeg','image/png','image/webp']),
  ('portfolio-files','portfolio-files',false,10485760,array['application/pdf']);

create function public.is_public_asset(bucket text, object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when bucket = 'portfolio-files' then exists(select 1 from public.profiles where resume_path = object_path)
    when bucket = 'portfolio-images' then
      exists(select 1 from public.profiles where profile_image_path = object_path)
      or exists(select 1 from public.profiles p cross join public.site_settings s where s.show_about and nullif(trim(p.bio), '') is not null and p.about_image_path = object_path)
      or exists(select 1 from public.projects p cross join public.site_settings s where s.show_projects and p.is_published and p.cover_image_path = object_path)
      or exists(select 1 from public.skills k cross join public.site_settings s where s.show_skills and k.is_visible and k.icon_path = object_path)
    else false end;
$$;
revoke all on function public.is_public_asset(text,text) from public;
grant execute on function public.is_public_asset(text,text) to anon, authenticated;
create policy portfolio_public_download on storage.objects for select to anon, authenticated
  using (public.is_public_asset(bucket_id, name));
create policy portfolio_owner_storage on storage.objects for all to authenticated
  using (bucket_id in ('portfolio-images','portfolio-files') and (select public.is_portfolio_admin()))
  with check (bucket_id in ('portfolio-images','portfolio-files') and (select public.is_portfolio_admin()) and (storage.foldername(name))[1] = (select auth.uid())::text);

create function public.asset_is_referenced(object_path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select public.is_portfolio_admin() and (
    exists(select 1 from public.profiles where object_path in (profile_image_path, about_image_path, resume_path))
    or exists(select 1 from public.projects where cover_image_path = object_path)
    or exists(select 1 from public.skills where icon_path = object_path)
  );
$$;
revoke all on function public.asset_is_referenced(text) from public;
grant execute on function public.asset_is_referenced(text) to authenticated;

create index projects_public_order on public.projects(sort_order, created_at) where is_published;
create index skills_public_order on public.skills(sort_order, created_at) where is_visible;
create index social_links_public_order on public.social_links(sort_order, created_at) where is_visible;
insert into public.profiles(id, owner_name) values (true, 'Ryan Bien N Barilla');
insert into public.site_settings(id) values (true);

commit;
