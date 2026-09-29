# Ryan Bien N Barilla — Portfolio

A cream editorial homepage built with Next.js App Router, strict TypeScript, Tailwind CSS, Cormorant Garamond, and Manrope. Page content renders on the server. The initial data contains only the owner's name; the architectural hero is decorative CSS, not a portrait.

## Run locally

```sh
npm ci
npm run dev
```

Visit http://localhost:3000. For production, run `npm run build` followed by `npm start`.

## Admin and Supabase

Follow [the Supabase setup guide](supabase/README.md) to connect the database, run the migration, and create the single owner account. Visit `/admin/login` to manage the portfolio. There is no public registration. Every editor and mutation checks authenticated owner access, backed by PostgreSQL Row Level Security.

`src/lib/portfolio-data.ts` loads public content anonymously on the server and maps database rows to the existing `PortfolioData` contract. Admin sessions cannot leak drafts into public queries. Content saves revalidate the homepage without a rebuild. `src/data/portfolio.ts` is only the name-and-generic-label fallback before Supabase is configured; it is not the permanent database.

Empty projects, skills, and hero statistics keep neutral presentation slots without fake records, numbers, or technology logos. The Contact CTA remains visible; its action is disabled until contact methods exist. About stays hidden until biography content is provided. Default navigation is filtered against visible sections; optional navigation data can change its labels and order. Generic heading and CTA copy lives alongside the data, separate from personal records. Hero actions accept real URLs or supported homepage section anchors. Profile and project images use `next/image`; an uploaded profile image automatically replaces the cream portrait placeholder. Project and skill records sort by `order`.

Upload images and PDF resumes through Admin. Supabase's private Storage buckets issue time-limited URLs; the image host is configured from `NEXT_PUBLIC_SUPABASE_URL`. `IMAGE_ORIGIN` optionally enables another trusted image host. Set `SITE_URL` to the real deployment URL to enable canonical and Open Graph URLs. See `.env.example`. No fictional domain or social metadata is supplied. Replace `src/app/icon.svg` if a custom favicon is available.

## Verification

```sh
npm run lint
npm run typecheck
npm run build
npx playwright install chromium
npm test
```

Browser tests check empty-data presentation, console errors, anchor destinations, mobile navigation, keyboard access, reduced motion, local font loading, and overflow at 320, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 pixels. Screenshots are written to the ignored `test-results/` directory. The Latin variable fonts are bundled in `src/app/fonts/` and served through `next/font/local`, with their SIL Open Font Licenses alongside them. Development and production builds do not need to contact Google Fonts.

Framework setup follows the official [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation) and [Tailwind CSS Next.js guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs).
