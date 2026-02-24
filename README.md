# FlipCard

A flashcard web app for interview prep, studying, or anything. Create shareable decks, add cards with a front (word/phrase) and back (detailed notes), and click any card to flip it open full-screen.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-purple)

---

## Features

- **Shareable decks** — every deck gets a unique UUID-based URL you can bookmark or send to anyone
- **Flip animation** — click a card to expand it full-screen with a smooth Framer Motion transition
- **Category filtering** — tag cards and filter by category within a deck
- **Full CRUD** — add, edit, and delete cards and categories inline without leaving the page
- **Dark mode** — system preference detected on load, toggleable, persisted in `localStorage`
- **Local-first** — runs entirely without a database; in-memory store with sample data works out of the box
- **Supabase-ready** — add env vars to switch to a real PostgreSQL database with zero code changes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion 11 |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) — optional |
| Deployment | Vercel |

---

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later (comes with Node)

---

## Running Locally

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd flipcard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

That's it — no database, no environment variables needed. The app runs in **local mode** with an in-memory store pre-seeded with sample interview prep cards. A yellow banner at the top of deck pages reminds you that data resets on server restart.

---

## Connecting Supabase (optional)

For persistent data, wire up a Supabase project:

1. Create a free project at [supabase.com](https://supabase.com)

2. Run the schema SQL in the Supabase SQL Editor (found in [`flipcard-style-guide.md`](./flipcard-style-guide.md), section 13)

3. Create a `.env.local` file in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Restart the dev server — the app automatically switches to Supabase mode when both vars are present.

> **Note:** The local mode banner disappears and data now persists across restarts.

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — fonts, dark mode FOUC script, header
│   ├── page.tsx                # Landing page — create deck or enter existing URL
│   ├── actions.ts              # Server actions for all mutations
│   ├── not-found.tsx           # Global 404
│   └── deck/[deckId]/
│       ├── page.tsx            # Deck page — server component
│       └── not-found.tsx       # Deck-specific 404
├── components/
│   ├── ui/                     # Reusable primitives (Button, Modal, Toast, etc.)
│   ├── landing/                # Landing page components
│   ├── deck/                   # Deck page components (CardGrid, FlashCard, etc.)
│   ├── Header.tsx
│   ├── DarkModeToggle.tsx
│   └── LocalModeBanner.tsx
├── hooks/
│   ├── useDarkMode.ts
│   └── useToast.ts
├── lib/
│   ├── data.ts                 # Unified data access layer (Supabase or fallback)
│   ├── store.ts                # In-memory fallback store with sample data
│   ├── supabase.ts             # Supabase client (lazy-loaded)
│   └── utils.ts                # cn() utility
└── types/
    └── index.ts                # TypeScript interfaces
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server at `localhost:3000` |
| `npm run build` | Build for production |
| `npm run start` | Start production server (after build) |
| `npm run lint` | Run ESLint |

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Next.js and handles everything else

Without the Supabase env vars, the Vercel deployment also runs in local mode (data resets on each cold start).

---

## Architecture Notes

- **All mutations go through server actions** (`src/app/actions.ts`) — makes it straightforward to add auth checks in one place later
- **Data layer is a single import** — components never call Supabase directly; everything goes through `lib/data.ts`
- **Optimistic updates** — card create/edit/delete updates the UI immediately and syncs in the background, rolling back on error
- **Auth-ready schema** — RLS is enabled on all Supabase tables with permissive policies for v1; UUIDs in URLs provide security through obscurity until auth is added
