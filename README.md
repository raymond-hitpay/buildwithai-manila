# HitPay · Build with AI — Manila — workshop resources

A resources web app for the **Build with AI** workshop (Fri 27 Nov, Common Ground
McKinley). Attendees open it during the session to download files and copy prompts.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS v4**.

## Pages

| Route | What it is |
|-------|------------|
| `/` | Full-screen hero (Home) |
| `/resources` | Prerequisites, "Your folders", the three hands-on cards, links, feedback |
| `/resources/warmup` · `/website` · `/store` | The three hands-on modules, each its own page |
| `/showcase` | Crowdsourced showcase — paste a link, preview its UI, upvote + react, live |

## Editing content

**All workshop content lives in `lib/content.ts`** — text, links, prompts, the
prerequisites list, and the hands-on modules. You rarely need to touch the
components.

- A link shown as `[Something link]` is a **placeholder**. Set its `href` to a real
  URL to turn it into a working button. Leave `href: null` to keep it a visible
  placeholder.
- Inside prompt text, anything in `[square brackets]` is highlighted on screen so
  people know to replace it. The Copy button still copies it verbatim.
- **Never** put API keys or secrets in this file.

Placeholders still to fill in before the session:
`[zip link]`, `[Viber link]`, `[kit link]`, `[template link]`, `[topics link]`,
`[Sheet link]`, `[CSV link]`, and the Sheet name in Store · Step 4.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

```bash
npm run build      # production build (uses Turbopack)
npm start          # serve the production build
```

## Project structure

```
app/            # routes (App Router) + globals.css
components/      # TopNav, Hero, PageHead, blocks, cards, icons …
lib/content.ts  # ALL content (edit here)
public/         # circuit.svg, skyline.svg, HitPay logo + mark
```

## Showcase (`/showcase`)

A live, crowdsourced gallery. Attendees paste a link to the site they built, it
pulls a title / description / UI preview automatically, and everyone can upvote
and react to each entry — updating in real time. There's a **Scan to join** QR
for the page and a per-project QR to open any site on a phone.

Everything runs on **Supabase** (Postgres + Auth + Realtime). Sign-in is a
**magic link** emailed to the attendee — no passwords.

### One-time setup

1. **Create a Supabase project** (or use an existing one).
2. **Run the schema.** Open the Supabase SQL editor and run the whole of
   [`supabase/schema.sql`](supabase/schema.sql). It creates the `submissions`,
   `votes`, and `reactions` tables, row-level-security policies, and turns on
   realtime.
3. **Add env vars.** Copy `.env.local.example` → `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx            # Project Settings → API → anon/public
   ```
   On Vercel, add the same two variables under **Project → Settings → Environment
   Variables**.
4. **Allow the redirect.** In Supabase → **Authentication → URL Configuration**,
   set the Site URL and add your deploy URL + `/showcase` to the redirect
   allow-list (and `http://localhost:3000/showcase` for local dev) so magic links
   return to the right place.

Until the env vars are set, `/showcase` shows a friendly "needs Supabase" panel
instead of the gallery, so the rest of the site is unaffected.

### How it works

- **Link preview** — `app/api/preview/route.ts` fetches the pasted URL server-side
  and reads its `og:title` / `og:description` / `og:image` / favicon. Sites with no
  OG image fall back to a live full-page screenshot (WordPress mShots).
- **Submit / vote / react** — client components in `components/showcase/` talk to
  Supabase directly; RLS keeps each person to their own rows.
- **Live** — a Supabase realtime channel on all three tables refreshes every
  connected browser as entries, votes, and reactions change.

## Deploy (Vercel)

The repo is already linked to the HitPay Vercel project. Vercel auto-detects the
**Next.js** framework preset — no configuration needed. Pushes to `main` deploy
automatically.

> Note: `tailwindcss` / `@tailwindcss/postcss` are pinned to `4.1.18`. Tailwind
> `4.3.x` ships a broken `magic-string` dependency that fails the build, so don't
> bump those two past `4.1.x` without testing the build.
