# Supabase setup

The public design is unchanged. The Admin and data adapter are in this Next.js app; Supabase provides authentication, PostgreSQL, and private file storage. There is no service-role key in this implementation.

## 1. Connect the project

Create a Supabase project and wait until its status is Healthy. Open **Connect** to find the project URL and **publishable key**. A legacy **anon key** also works. API keys are also available under project settings. Do not use the database password, a secret key, or service-role key.

Copy `.env.example` to `.env.local` if it does not already exist. Set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_publishable_or_anon_key
```

Keep the variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY` even when using a publishable key. `.env.local` is ignored by Git. `SITE_URL` is optional until deployment; `IMAGE_ORIGIN` is only needed for additional external image hosts. Supabase Storage's origin is configured automatically.

## 2. Create the database and buckets

In Supabase, open **SQL Editor → New query**. Paste the entire contents of [migrations/001_portfolio.sql](migrations/001_portfolio.sql) and click **Run**. Run this migration once on a new project. It is transactional; if it fails, resolve the error before proceeding. Do not rerun an already successful migration or delete existing tables to retry.

The migration creates normalized content tables, relational project technology records, owner authorization, RLS policies, and two private buckets. Only the name and generic presentation labels are seeded. Projects, skills, statistics, and socials start empty.

## 3. Create and enroll the single owner

1. Open **Authentication → Users → Add user → Create a user**.
2. Enter your real email and a strong, unique password. Confirm the user through the dashboard's auto-confirm option if offered. Do not put these credentials in source code or chat.
3. Copy the new user's **User UID**.
4. Open a new SQL query and run the following after replacing `YOUR_USER_UUID`:

```sql
insert into public.portfolio_admins (singleton, user_id)
values (true, 'YOUR_USER_UUID'::uuid);
```

The singleton constraint permits only one owner. Supabase users who are not enrolled here cannot enter the workspace or change content. There is no signup UI and API users cannot enroll themselves.

5. In Authentication settings, turn off **Allow new users to sign up**. Leave email/password sign-in enabled. Review Supabase's authentication rate limits for your deployment.

If you intentionally replace the owner later, update the allowlist only from the trusted Supabase SQL editor. Existing file paths retain their original owner prefix; migrate those assets to the new owner before editing them through the app.

## 4. Start and sign in

```sh
npm install
npm run dev
```

Restart the server after changing environment variables. Open `http://localhost:3000/admin/login` and sign in with the account you created. The authentication cookies are HTTP-only and the workspace is server-protected. Production deployments must use HTTPS.

## 5. Publish your content

- **Profile:** name, title, introduction, biography, portrait, PDF resume, and public contact fields.
- **Projects:** create a record, upload its cover, add technology tags, then enable **Published** and **Featured** for homepage display. Draft is the default. Full descriptions and slugs are stored for future detail pages; this task does not add public project-detail routes.
- **Skills / Statistics / Social links:** add your real records, set their visibility, and use display order to arrange them.
- **About / Contact:** edit the same shared profile information in focused forms. Contact invitation text is shared with Settings.
- **Settings:** change generic labels and section visibility. Turning off Projects also removes the hero work link; disabling About or Contact masks those profile fields from the public RPC.

Images support JPEG, PNG, and WebP up to 5 MB. Resumes support PDF up to 10 MB. Select a file, preview it, click **Upload file**, then **Save changes**. Removing a file also requires confirmation and a save. Replaced files are deleted only after the record saves and only when no other content references them.

Uploads that are abandoned without saving remain private, unreferenced files. Periodically review those files in Supabase Storage; the app does not bulk-delete files or run a destructive background cleanup. Existing signed download URLs remain usable until their one-hour expiration, even if a record is subsequently hidden. No browser can revoke a file already downloaded.

Refresh `/` after saving. The homepage reads anonymously on the server with no data cache; server actions also revalidate `/` and `/admin`. Signing in as the owner never causes unpublished records to appear in public queries.

## Verification and limits

```sh
npm run typecheck
npm run lint
npm run build
npm test
```

Automated coverage includes homepage regression checks, unauthenticated route protection, login responsiveness, input validation, and executing the actual migration in an embedded PostgreSQL engine with Supabase platform schemas stubbed. The database test verifies owner/non-owner access, public privacy, draft visibility, private storage policies, atomic project/tag saves, and cascading deletion. Test fixtures are ephemeral and are not inserted into your Supabase project.

These checks do not replace a real Supabase integration test. After connecting your project, verify login/logout, each editor, image/PDF upload and replacement, publication, ordering, section visibility, and the refreshed homepage. Authenticated UI and real Auth/Storage behavior cannot be verified before a configured project and owner session exist.

Never use a public production project for fabricated test records. Use your real content or a separate test Supabase project.

Implementation references: [Supabase SSR authentication](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).
