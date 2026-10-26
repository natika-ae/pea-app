# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Next.js version caveat

This project runs **Next.js 16.4 / React 19.3**, which is newer than most training data. Before writing Next.js code, look up the relevant guide in `node_modules/next/dist/docs/` (`01-app/` covers the App Router: getting-started, guides, api-reference). Don't rely on memory for APIs, file conventions, or config options.

## Commands

- `npm run dev` — dev server at http://localhost:3000 (Turbopack). Also regenerates route types in `.next/types` and rewrites the managed block in `AGENTS.md`.
- `npm run build` — production build. This is also the main type check, since there's no separate `tsc` script (`npx tsc --noEmit` works too).
- `npm run start` — serve the production build.
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`) using `eslint-config-next` core-web-vitals and TypeScript presets.
- `npx next typegen` — regenerate the route-aware types (`PageProps`, `LayoutProps`, etc.) without starting dev or build.

No test framework is configured yet.

## Architecture

- **App Router under `src/app/`**: the README's mention of `app/page.tsx` is out of date. The path alias `@/*` maps to `./src/*`.
- **Cache Components + Partial Prefetching are on** (`cacheComponents: true`, `partialPrefetching: true` in `next.config.ts`). This changes the rendering and caching model compared with older Next.js:
  - Caching is opt-in with `"use cache"`, `cacheLife`, and `cacheTag`. Dynamic or uncached data (including `params`, `searchParams`, `cookies()`, `headers()`) has to sit behind `<Suspense>`, or the dev overlay and build will flag it.
  - `<Link>` prefetches only the route's static "App Shell" unless `prefetch={true}` is set.
  - Read `01-app/01-getting-started/08-caching.md` and `01-app/02-guides/adopting-partial-prefetching.md` in the docs folder before writing data-fetching or navigation code. Don't use previous-model caching APIs (e.g. `export const revalidate`, `fetch` cache options) without checking that they still apply.
- **Route-aware type helpers**: `PageProps<'/route'>` and `LayoutProps<'/route'>` are global types generated into `.next/types` (no import needed). See `src/app/layout.tsx` for usage.
- **Styling: Tailwind CSS v4 through Turbopack**, not PostCSS. There's no `postcss.config` or `tailwind.config`. `*.css` files go through the `@tailwindcss/turbopack` loader (configured under `turbopack.rules` in `next.config.ts`). Theme tokens are defined CSS-first in `src/app/globals.css` with `@import "tailwindcss"` and `@theme inline`. Light/dark colors come from `--background`/`--foreground` CSS variables switched by `prefers-color-scheme`.
- **Fonts**: Geist and Geist Mono are loaded with `next/font/google` in the root layout and exposed as `--font-geist-sans`/`--font-geist-mono`, which map to Tailwind's `font-sans`/`font-mono`.
