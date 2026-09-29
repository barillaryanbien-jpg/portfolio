import { expect, test } from "@playwright/test";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

// Real PostgreSQL policies/functions, with only Supabase's platform schemas stubbed.
// All records below are ephemeral test fixtures, never seeded into Supabase.
test("migration, owner authorization, publication, privacy, and atomic project CRUD", async () => {
  test.setTimeout(120_000);
  const db = new PGlite();
  const owner = "11111111-1111-4111-8111-111111111111";
  const stranger = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      grant usage on schema public, auth, storage to anon, authenticated;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant select,insert,update,delete on storage.objects to anon, authenticated;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
    `);
    await db.exec(
      await readFile("supabase/migrations/001_portfolio.sql", "utf8"),
    );
    await db.query("insert into auth.users(id) values ($1), ($2)", [
      owner,
      stranger,
    ]);
    await db.query("insert into public.portfolio_admins(user_id) values ($1)", [
      owner,
    ]);
    await db.exec("set role anon");
    expect(
      (await db.query("select owner_name from public.get_public_profile()"))
        .rows,
    ).toEqual([{ owner_name: "Ryan Bien N Barilla" }]);
    expect((await db.query("select * from public.projects")).rows).toEqual([]);
    await expect(
      db.query("insert into public.skills(name) values ('Forbidden')"),
    ).rejects.toThrow();
    await expect(db.query("select * from public.profiles")).rejects.toThrow();
    await expect(
      db.query("select * from public.portfolio_admins"),
    ).rejects.toThrow();
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      stranger,
    ]);
    expect(
      (await db.query("select public.is_portfolio_admin() as allowed")).rows,
    ).toEqual([{ allowed: false }]);
    await expect(
      db.query("insert into public.skills(name) values ('Forbidden')"),
    ).rejects.toThrow();
    await expect(
      db.query("insert into public.portfolio_admins(user_id) values ($1)", [
        stranger,
      ]),
    ).rejects.toThrow();
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    expect(
      (await db.query("select public.is_portfolio_admin() as allowed")).rows,
    ).toEqual([{ allowed: true }]);
    const record = {
      title: "Test fixture",
      slug: "test-fixture",
      short_description: null,
      full_description: null,
      category: null,
      live_url: null,
      repository_url: null,
      featured: true,
      is_published: false,
      sort_order: 0,
      cover_image_path: `${owner}/projects/fixture.jpg`,
    };
    const created = await db.query<{ id: string }>(
      "select public.save_project($1::jsonb, $2::text[]) as id",
      [JSON.stringify(record), ["Fixture tag"]],
    );
    const id = created.rows[0].id;
    expect(
      (await db.query("select name from public.project_technologies")).rows,
    ).toEqual([{ name: "Fixture tag" }]);
    await db.query(
      "insert into storage.objects(bucket_id, name) values ('portfolio-images', $1)",
      [record.cover_image_path],
    );
    await db.exec("reset role; set role anon");
    expect((await db.query("select * from public.projects")).rows).toHaveLength(
      0,
    );
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    await db.query("select public.save_project($1::jsonb, $2::text[])", [
      JSON.stringify({ ...record, id, is_published: true }),
      ["Updated tag"],
    ]);
    await expect(
      db.query("select public.save_project($1::jsonb, $2::text[])", [
        JSON.stringify({ ...record, id, title: "Must roll back" }),
        ["Duplicate", "duplicate"],
      ]),
    ).rejects.toThrow();
    expect(
      (await db.query("select title from public.projects where id = $1", [id]))
        .rows,
    ).toEqual([{ title: "Test fixture" }]);
    await db.query("select public.save_contact($1::jsonb)", [
      JSON.stringify({
        email: "test@example.com",
        phone: null,
        location: null,
        availability_text: null,
        contact_heading: "Contact",
        contact_description: null,
      }),
    ]);
    await db.exec("reset role; set role anon");
    expect((await db.query("select * from public.projects")).rows).toHaveLength(
      1,
    );
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      1,
    );
    expect(
      (await db.query("select email from public.get_public_profile()")).rows,
    ).toEqual([{ email: "test@example.com" }]);
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    await db.exec(
      "update public.site_settings set show_contact = false, show_projects = false where id",
    );
    await db.exec("reset role; set role anon");
    expect((await db.query("select * from public.projects")).rows).toHaveLength(
      0,
    );
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    expect(
      (await db.query("select email from public.get_public_profile()")).rows,
    ).toEqual([{ email: null }]);
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    await db.query("delete from public.projects where id = $1", [id]);
    expect(
      (await db.query("select * from public.project_technologies")).rows,
    ).toHaveLength(0);
    const skill = await db.query<{ id: string }>(
      "insert into public.skills(name, is_visible, sort_order) values ('Test skill', true, 2) returning id",
    );
    const social = await db.query<{ id: string }>(
      "insert into public.social_links(platform, url) values ('Test link', 'https://example.com') returning id",
    );
    const statistic = await db.query<{ id: string }>(
      "insert into public.statistics(label, value) values ('Test statistic', '1') returning id",
    );
    await db.exec("reset role; set role anon");
    expect((await db.query("select name from public.skills")).rows).toEqual([
      { name: "Test skill" },
    ]);
    expect(
      (await db.query("select * from public.social_links")).rows,
    ).toHaveLength(1);
    expect(
      (await db.query("select * from public.statistics")).rows,
    ).toHaveLength(1);
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    await db.query(
      "update public.skills set name = 'Updated skill', is_visible = false where id = $1",
      [skill.rows[0].id],
    );
    await db.query(
      "update public.social_links set is_visible = false where id = $1",
      [social.rows[0].id],
    );
    await db.query(
      "update public.statistics set is_visible = false where id = $1",
      [statistic.rows[0].id],
    );
    await db.exec("reset role; set role anon");
    expect((await db.query("select * from public.skills")).rows).toHaveLength(
      0,
    );
    expect(
      (await db.query("select * from public.social_links")).rows,
    ).toHaveLength(0);
    expect(
      (await db.query("select * from public.statistics")).rows,
    ).toHaveLength(0);
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [
      owner,
    ]);
    await db.query("delete from public.skills where id = $1", [
      skill.rows[0].id,
    ]);
    await db.query("delete from public.social_links where id = $1", [
      social.rows[0].id,
    ]);
    await db.query("delete from public.statistics where id = $1", [
      statistic.rows[0].id,
    ]);
    expect((await db.query("select * from public.skills")).rows).toHaveLength(
      0,
    );
  } finally {
    await db.close();
  }
});

test("migration 012 contact_messages RLS, anon submission, and admin authorization", async () => {
  test.setTimeout(120_000);
  const db = new PGlite();
  const owner = "11111111-1111-4111-8111-111111111111";
  const stranger = "22222222-2222-4222-8222-222222222222";
  try {
    await db.exec(`
      create role anon; create role authenticated;
      create schema auth; create schema storage;
      grant usage on schema public, auth, storage to anon, authenticated;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      create table storage.buckets(id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects(id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant select,insert,update,delete on storage.objects to anon, authenticated;
      create function storage.foldername(name text) returns text[] language sql immutable as $$ select string_to_array(name, '/') $$;
    `);
    await db.exec(await readFile("supabase/migrations/001_portfolio.sql", "utf8"));
    await db.exec(await readFile("supabase/migrations/012_create_contact_messages.sql", "utf8"));
    await db.query("insert into auth.users(id) values ($1), ($2)", [owner, stranger]);
    await db.query("insert into public.portfolio_admins(user_id) values ($1)", [owner]);

    // 1. Anon can insert valid messages
    await db.exec("set role anon");
    await db.exec(
      `insert into public.contact_messages (name, email, subject, message)
       values ('John Visitor', 'john@example.com', 'Inquiry', 'Hello Ryan!')`,
    );

    // 2. Anon CANNOT select / read messages
    await expect(db.query("select * from public.contact_messages")).rejects.toThrow();

    // 3. Anon CANNOT update messages
    await expect(
      db.query("update public.contact_messages set is_read = true"),
    ).rejects.toThrow();

    // 4. Anon CANNOT delete messages
    await expect(
      db.query("delete from public.contact_messages"),
    ).rejects.toThrow();

    // Switch to owner to get message ID
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [owner]);
    const inserted = await db.query<{ id: string }>(
      "select id from public.contact_messages where email = 'john@example.com'",
    );
    expect(inserted.rows).toHaveLength(1);
    const msgId = inserted.rows[0].id;

    // 5. Authenticated non-admin (stranger) CANNOT select, update, or delete
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [stranger]);
    expect((await db.query("select * from public.contact_messages")).rows).toHaveLength(0);
    await db.query("update public.contact_messages set is_read = true where id = $1", [msgId]);
    await db.query("delete from public.contact_messages where id = $1", [msgId]);

    // 6. Authenticated owner CAN select, update, and delete
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [owner]);
    const readRes = await db.query<{ name: string; is_read: boolean }>(
      "select name, is_read from public.contact_messages where id = $1",
      [msgId],
    );
    expect(readRes.rows).toEqual([{ name: "John Visitor", is_read: false }]);

    // Mark as read
    await db.query("update public.contact_messages set is_read = true where id = $1", [msgId]);
    const updatedRes = await db.query<{ is_read: boolean }>(
      "select is_read from public.contact_messages where id = $1",
      [msgId],
    );
    expect(updatedRes.rows[0].is_read).toBe(true);

    // Delete message
    await db.query("delete from public.contact_messages where id = $1", [msgId]);
    expect((await db.query("select * from public.contact_messages")).rows).toHaveLength(0);
  } finally {
    await db.close();
  }
});
