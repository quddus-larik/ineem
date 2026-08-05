# AGENTS.md

Monorepo with two independent apps. There is no root package.json / workspace — each app is standalone.

- `backend/` — Node.js Express API (JavaScript, ESM). Uses **pnpm** (`pnpm-lock.yaml`).
- `native-ap/` — Expo (SDK 57) React Native app. Uses **npm** (`package-lock.json`).

## Backend

- Run: `npm run dev` (nodemon) or `npm start`. Listens on port `3000`. No build step.
- `package.json` has `"type": "module"` — relative imports MUST include the `.js` extension (e.g. `./routes/upload.route.js`). Omitting it crashes with `ERR_MODULE_NOT_FOUND`.
- Entrypoint `index.js` mounts the router at `/pdf`:
  - `GET /pdf` — health check
  - `POST /pdf/upload` — multipart upload, field name `file` (multer). Saves to `uploads/` (auto-created via `fs.mkdirSync`), parses via the pipeline, then deletes the file.
- File `pipeline/unstuctured-api.js` is **intentionally misspelled** ("unstuctured"). Do not rename it.
- Parsing calls the Unstructured **Transform** API via raw `fetch` — the `unstructured-client` SDK in dependencies is NOT used and targets the wrong (legacy) endpoint. Request: `POST $UNSTRUCTURED_API_URL` with header `Authorization: Bearer $UNSTRUCTURED_API_KEY`.
- Config lives in `backend/.env` (gitignored): `UNSTRUCTURED_API_KEY`, `UNSTRUCTURED_API_URL` (default `https://platform-api.transform.unstructured.io/api/v1/general/v0/general`). Loaded via `dotenv/config`.
- No tests, no lint/typecheck scripts.

## Native app

- Entrypoints are expo-router file routes under `native-ap/src/app/`; `@/*` aliases `./src/*`. TypeScript strict, React Compiler enabled.
- `package.json` scripts: `start` / `android` / `ios` (expo), `lint`, `lint:fix`, `format`, `format:check`, `typecheck` (`tsc --noEmit`).
- Stack: HeroUI Native (`heroui-native`), Uniwind + Tailwind v4, `@gorhom/bottom-sheet`. Providers are wired in `src/app/_layout.tsx` — new root providers go there.

## Misc

- `WORKFLOW.md` at the root is an aspirational tech-selection doc (docling, langchain, langgraph, Neon pgvector, Supabase) — most of it is not yet implemented in the code.
