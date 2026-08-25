# AGENTS.md

Compact guidance for working in this repo. Only non-obvious, verified facts.

## Stack
- Single Next.js 16 app (App Router), React 19, TypeScript (strict), Tailwind v4 (CSS-first config in `app/globals.css`, wired via `@tailwindcss/postcss`).
- UI: HeroUI v3 (`@heroui/react`), icons `@mynaui/icons-react`.
- Backend: Supabase (auth + Postgres), LangChain Groq (`@langchain/groq`) + LangGraph (`@langchain/langgraph`) for chat.
- Not a monorepo. `pnpm-workspace.yaml` only lists `ignoredBuiltDependencies`.

## Commands (use pnpm — `packageManager` pins `pnpm@10.33.0`)
- `pnpm dev` — dev server (http://localhost:3000)
- `pnpm build` — production build
- `pnpm lint` — ESLint (flat config, `eslint-config-next`)
- No test script is configured — do not invent test/typecheck commands.
- Type check manually with `pnpm exec tsc --noEmit` (no `typecheck` script exists).

## Environment
- Required vars (copy `.env.example` → `.env`; `.env*` is gitignored):
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase)
  - `GROQ_API_KEY` (server-only)
- App will fail at runtime/build if these are missing.

## Two Supabase clients — do not mix them up
- `@/lib/supabase/client` — browser singleton (`createClient`, anon key). Safe only in client components/handlers.
- `@/lib/supabase/server` — server-only `createClient()` using `next/headers` cookies. Use in Server Components / Route Handlers for the authenticated user.
- Path alias `@/*` → repo root (see `tsconfig.json` `paths`).

## Chat route convention (easy to "mis-fix")
- `app/api/v1/chat/route.ts` **intentionally** uses the browser `@/lib/supabase/client` and receives the `user` object from the request body (sent by `app/page.tsx`), rather than the server client / server-side auth. Do NOT "correct" this to `lib/supabase/server` unless explicitly asked.
- The route persists to Supabase tables `session` (user_id, title) and `chat` (session_id, role, content). `chat.content` is stored and read back as a **plain string** (not an object). Keep inserts as plain strings to match the History read in the same file.

## Architecture / entrypoints
- `app/page.tsx` — main chat UI (client component, manages messages/sessionId).
- `app/[id]/page.tsx` — per-session view (verify before editing; wired to `sessionId` flow).
- `app/(auth)/auth/callback/page.tsx` — GitHub OAuth callback.
- `handlers/github.oauth.ts` — `handleLoginGithub()` kicks off Supabase GitHub OAuth, redirects to `/auth/callback`.
- `app/api/v1/chat/route.ts` — POST: create/load session, load history, run LangGraph, persist, return `{ message, sessionId }`.

## Other conventions
- GitHub OAuth uses scopes `repo user:email` (see `handlers/github.oauth.ts`).
- No formatter/prettier config present; lint via ESLint only.
