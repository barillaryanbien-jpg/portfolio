-- Migration 013: Add project screenshot display modes and positioning presentation metadata

alter table public.projects
  add column if not exists cover_display_type text not null default 'desktop'
    check (cover_display_type in ('desktop', 'tablet', 'mobile', 'auto')),
  add column if not exists cover_fit text not null default 'cover'
    check (cover_fit in ('cover', 'contain')),
  add column if not exists cover_position_x numeric not null default 50.0
    check (cover_position_x between -100.0 and 200.0),
  add column if not exists cover_position_y numeric not null default 50.0
    check (cover_position_y between -100.0 and 200.0),
  add column if not exists cover_zoom numeric not null default 1.0
    check (cover_zoom between 0.2 and 5.0);

-- Update save_project to support the presentation columns
create or replace function public.save_project(record jsonb, technologies text[]) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare saved_project_id uuid; tag text; i integer := 0;
begin
  if not public.is_portfolio_admin() then raise exception 'Forbidden' using errcode = '42501'; end if;
  if cardinality(technologies) > 30 then raise exception 'Too many technologies'; end if;
  if nullif(record->>'id', '') is not null then
    saved_project_id := (record->>'id')::uuid;
    update public.projects set
      title = record->>'title',
      slug = record->>'slug',
      short_description = record->>'short_description',
      full_description = record->>'full_description',
      cover_image_path = record->>'cover_image_path',
      category = record->>'category',
      live_url = record->>'live_url',
      repository_url = record->>'repository_url',
      featured = (record->>'featured')::boolean,
      is_published = (record->>'is_published')::boolean,
      sort_order = (record->>'sort_order')::integer,
      cover_display_type = coalesce(nullif(record->>'cover_display_type', ''), 'desktop'),
      cover_fit = coalesce(nullif(record->>'cover_fit', ''), 'cover'),
      cover_position_x = coalesce((record->>'cover_position_x')::numeric, 50.0),
      cover_position_y = coalesce((record->>'cover_position_y')::numeric, 50.0),
      cover_zoom = coalesce((record->>'cover_zoom')::numeric, 1.0),
      updated_at = now()
    where id = saved_project_id;
    if not found then raise exception 'Project no longer exists' using errcode = 'P0002'; end if;
  else
    insert into public.projects (
      title, slug, short_description, full_description, cover_image_path,
      category, live_url, repository_url, featured, is_published, sort_order,
      cover_display_type, cover_fit, cover_position_x, cover_position_y, cover_zoom
    )
    values (
      record->>'title',
      record->>'slug',
      record->>'short_description',
      record->>'full_description',
      record->>'cover_image_path',
      record->>'category',
      record->>'live_url',
      record->>'repository_url',
      (record->>'featured')::boolean,
      (record->>'is_published')::boolean,
      (record->>'sort_order')::integer,
      coalesce(nullif(record->>'cover_display_type', ''), 'desktop'),
      coalesce(nullif(record->>'cover_fit', ''), 'cover'),
      coalesce((record->>'cover_position_x')::numeric, 50.0),
      coalesce((record->>'cover_position_y')::numeric, 50.0),
      coalesce((record->>'cover_zoom')::numeric, 1.0)
    )
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
