# LifeSong

A web platform for custom, studio-quality songs written for life's greatest moments. Users complete a guided quiz about the occasion, genre, tone, and personal details, then professional songwriters craft a personalized song delivered within 24 hours.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v7
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Payments**: Stripe (server-side checkout via Edge Functions)
- **Analytics**: Mixpanel
- **Deployment**: Netlify

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for Edge Functions and local dev)
- A [Supabase](https://supabase.com/) project
- A [Stripe](https://stripe.com/) account
- A [Mixpanel](https://mixpanel.com/) project


## Getting Started

### 1. Clone the repo

```bash
git clone git@github.com:danielcotlar-ops/LifeSong.git
cd LifeSong
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mixpanel
VITE_MIXPANEL_TOKEN=your_mixpanel_project_token

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Site URL (used by Edge Functions for Stripe redirects)
SITE_URL=http://localhost:5173/
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Project Settings > API > `anon` / `public` key |
| `VITE_MIXPANEL_TOKEN` | Mixpanel > Settings > Project Settings > Token |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys > Publishable key |

### 4. Set up Supabase

#### Database tables

The app uses two main tables. Create them in the Supabase SQL Editor or via migrations:

**`song_requests`** — stores completed song orders:

```sql
create table public.song_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  recipient_name text not null,
  occasion text not null,
  tone text not null,
  energy text not null,
  feelings text[] not null,
  relationship text not null,
  themes text[] not null,
  chorus_hook text,
  golden_memory text,
  avoid text,
  archived_at timestamptz
);

alter table public.song_requests enable row level security;

create policy "Allow anonymous inserts" on public.song_requests
  for insert to anon with check (true);

create policy "Allow authenticated reads" on public.song_requests
  for select to authenticated using (true);

create policy "Allow authenticated updates" on public.song_requests
  for update to authenticated using (true) with check (true);
```

**`spin_leads`** — stores spin-to-win popup leads:

```sql
create table public.spin_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text,
  phone text,
  prize text not null,
  redeemed boolean not null default false,
  archived_at timestamptz
);

alter table public.spin_leads enable row level security;

create policy "Allow anonymous inserts" on public.spin_leads
  for insert to anon with check (true);

create policy "Allow authenticated reads" on public.spin_leads
  for select to authenticated using (true);

create policy "Allow authenticated updates" on public.spin_leads
  for update to authenticated using (true) with check (true);
```

#### Supabase Edge Functions

Two Edge Functions handle the Stripe payment flow. Deploy them with the Supabase CLI:

```bash
supabase link --project-ref your_project_ref
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

Set the required secrets for Edge Functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
supabase secrets set SITE_URL=http://localhost:5173/
```

#### Stripe Webhook

In the Stripe Dashboard, create a webhook endpoint pointing to:

```
https://your-project.supabase.co/functions/v1/stripe-webhook
```

Listen for the `checkout.session.completed` event.

### 5. Run the dev server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

The admin dashboard is at [http://localhost:5173/admin.html](http://localhost:5173/admin.html).

## Project Structure

```
LifeSong/
├── index.html              # Main app entry (loads /src/main.jsx)
├── admin.html              # Admin dashboard (standalone, CDN-based React)
├── package.json
├── vite.config.js          # Vite config with multi-page setup
├── tailwind.config.js      # Custom theme (navy/gold/cream palette)
├── postcss.config.js
├── public/
│   └── _redirects          # Netlify SPA fallback
├── src/
│   ├── main.jsx            # React entry, initializes analytics + router
│   ├── App.jsx             # All components: Nav, Hero, Quiz, Checkout, etc.
│   ├── supabaseClient.js   # Supabase client init
│   ├── analytics.js        # Mixpanel wrapper (init, track, identify)
│   └── index.css           # Global styles, Tailwind directives, animations
└── supabase/
    ├── config.toml          # Supabase local dev config
    ├── seed.sql             # Database seed data
    └── functions/
        ├── create-checkout-session/
        │   └── index.ts     # Creates Stripe checkout session
        └── stripe-webhook/
            └── index.ts     # Handles payment completion
```

## Key Features

- **Multi-step song quiz** — 7-step guided form (recipient, occasion, vibe, emotion, themes, personal details, review + checkout)
- **Stripe checkout** — Server-side Stripe session creation via Supabase Edge Functions
- **Spin-to-win popup** — Email + phone capture with discount wheel
- **Admin dashboard** — View/archive song requests and spin leads, tabbed interface with sorting
- **Mixpanel analytics** — Tracks ~30 events across CTAs, wizard steps, FAQ, spin popup, and page views
- **Responsive design** — Mobile-first with glass-morphism nav, video hero carousel, and animated transitions

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

## Deployment

The app is deployed to **Netlify**. The `public/_redirects` file handles SPA routing.

To deploy:

1. Push to the `master` branch (or your configured deploy branch)
2. Netlify builds with `npm run build` and publishes the `dist/` directory
3. Ensure all `VITE_*` environment variables are set in Netlify's environment settings
4. Edge Functions are deployed separately via `supabase functions deploy`

## Admin Access

The admin panel (`/admin.html`) requires Supabase email/password authentication. Only emails in the `ALLOWED_EMAILS` list within `admin.html` can sign in. To add a new admin:

1. Create the user in Supabase Dashboard > Authentication > Users
2. Add their email to the `ALLOWED_EMAILS` array in `admin.html`
