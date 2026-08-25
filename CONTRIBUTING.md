# Contributing to Ineem

Thanks for your interest in contributing! This guide covers how to get the project
running locally and the conventions we follow so your PR fits right in.

## Prerequisites

- Node.js 20+ (or whatever LTS you prefer)
- [pnpm](https://pnpm.io/) `10.33.0` (the repo pins this via `packageManager`)
- A Supabase project (free tier is fine)
- A Groq API key for the chat backend

## Setup

1. Fork and clone the repo:

   ```bash
   git clone https://github.com/<your-username>/ineem.git
   cd ineem
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Fill in the following variables (`.env*` is gitignored — never commit it):

   | Variable | Purpose |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
   | `GROQ_API_KEY` | Server-only Groq key for the chat route |

4. Run the dev server:

   ```bash
   pnpm dev
   ```

   App is served at http://localhost:3000.

## Useful commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint (flat config, `eslint-config-next`) |
| `pnpm exec tsc --noEmit` | Type check (no `typecheck` script exists) |

> There is no test suite configured yet — please run `pnpm lint` and
> `pnpm exec tsc --noEmit` before opening a PR.

## Project conventions

- **Framework**: Next.js 16 (App Router), React 19, TypeScript strict mode.
- **Styling**: Tailwind CSS v4 with CSS-first config in `app/globals.css`.
- **UI**: HeroUI v3 (`@heroui/react`), icons from `@mynaui/icons-react`.
- **Backend**: Supabase (auth + Postgres) and LangChain/LangGraph with Groq.
- **Package manager**: Always use `pnpm`, never `npm`/`yarn`.

### Supabase clients — don't mix them up

- `@/lib/supabase/client` — browser singleton (anon key). Use only in client
  components/handlers.
- `@/lib/supabase/server` — server-only client using `next/headers` cookies.
  Use in Server Components and Route Handlers for the authenticated user.

### Chat route

`app/api/v1/chat/route.ts` intentionally uses the **browser** Supabase client and
receives the `user` object from the request body (sent by `app/page.tsx`). Do not
"fix" this to the server client unless explicitly asked.

Chat history is persisted to the `session` and `chat` tables. `chat.content` is
stored and read back as a **plain string**, not an object — keep inserts as plain
strings.

### Database 

```postgresql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  github_refresh_token text,
  github_access_token text,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.session (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT session_pkey PRIMARY KEY (id),
  CONSTRAINT session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.chat (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  content jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_pkey PRIMARY KEY (id),
  CONSTRAINT chat_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.session(id)
);
CREATE TABLE public.repositories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  repo_uid text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  repo_name text DEFAULT ''::text,
  branch text DEFAULT 'main'::text,
  CONSTRAINT repositories_pkey PRIMARY KEY (id),
  CONSTRAINT repositories_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.code_embeddings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  repository_id uuid NOT NULL,
  file_path text NOT NULL,
  chunk_index integer NOT NULL DEFAULT 0,
  content text NOT NULL,
  embedding USER-DEFINED NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT code_embeddings_pkey PRIMARY KEY (id),
  CONSTRAINT code_embeddings_repository_id_fkey FOREIGN KEY (repository_id) REFERENCES public.repositories(id)
);
```

### Code style

- No Prettier config — formatting is enforced via ESLint only. Run `pnpm lint`.
- No comments unless asked; keep code self-documenting.
- Use the `@/*` path alias for imports (maps to repo root).
- Follow existing patterns when adding components — check neighboring files first.

## Submitting changes

1. Create a feature branch off `main`:

   ```bash
   git checkout -b feat/your-change
   ```

2. Make your changes, keeping commits focused and descriptive.
3. Ensure `pnpm lint` and `pnpm exec tsc --noEmit` pass.
4. Push and open a Pull Request against `main` with a clear description of:
   - what problem you're solving
   - how you tested it
   - any env vars or migrations required

## Reporting issues

Open a GitHub issue with steps to reproduce, expected vs. actual behavior, and
your environment (OS, Node version, browser if relevant). Please do not include
secrets or API keys.

## Code of conduct

Be respectful and constructive. We want this to be a welcoming project for
developers of all experience levels.
