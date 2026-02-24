# CLAUDE.md

## Project Overview
FlipCard — a flashcard web app built with Next.js, Tailwind CSS, Framer Motion, and Supabase. Users create shareable decks of flashcards identified by unique URLs. Clicking a card triggers a flip animation that expands to full screen, revealing detailed content on the back.

## Design Spec
Read `flipcard-style-guide.md` in the project root for the complete design system, component specs, database schema, animation behavior, and architecture. All implementation decisions should follow this document. When in doubt, refer back to the style guide.

## Mandatory First Step
Invoke the `frontend-design` skill before writing any frontend code, every session, no exceptions. Read and internalize the skill's best practices before creating or modifying any components, pages, or styles.

## Key Rules
- Always use the unified data access layer (`lib/data.ts`), never call Supabase directly from components or server actions
- App must run without Supabase configured — local fallback mode with in-memory store and sample data is required
- All styling uses Tailwind utility classes — no custom CSS files beyond `globals.css`
- Use Framer Motion for the card flip/expand animation
- Support both light and dark mode using Tailwind's `class` strategy — test every component in both modes
- All mutations go through Next.js server actions (not client-side Supabase calls) to keep auth-readiness
- Do not install extra dependencies without asking first
- After making changes, run the dev server and check for errors before reporting back

## Tech Stack
- Next.js (App Router)
- Tailwind CSS v3+
- Framer Motion
- Lucide React (icons)
- Supabase (PostgreSQL) — optional for local dev, required for production
- Deployed on Vercel

## URL Structure
- `/` — Landing page (create new deck or enter existing deck URL)
- `/deck/{uuid}` — Card grid for a specific deck
