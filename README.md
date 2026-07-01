# Machocise

Camera-based exercise form checker: browse the exercise library, start a workout, and get live green/red feedback as you rep — powered by on-device pose tracking. See [docs/PLAN.md](docs/PLAN.md) for the full product/technical plan.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The camera step needs an HTTPS origin (or `localhost`, which browsers exempt) to work.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run typecheck` — TypeScript checks with no emit
- `npm run data:fetch` — re-fetch and re-classify the exercise dataset into `src/data/exercises.json`
- `npm run sounds:generate` — regenerate the placeholder feedback tones in `public/sounds`

## Project structure

```
src/
  app/                  Next.js App Router routes (library, exercise detail, workout, history)
  components/           One folder per component: Component.tsx + Component.module.scss
  lib/
    exercises/           Server-side dataset loading/filtering
    pose/                Angle math, smoothing, archetype config, rep-counting engine, MediaPipe wrapper
    sound/               Feedback sound playback
    storage/             localStorage session persistence
  styles/                SCSS variables, mixins, reset, globals
  types/                 Shared TypeScript types
scripts/                 One-off data/asset generation scripts (not run at app runtime)
```

Styling uses SCSS Modules (`*.module.scss`) throughout, with shared tokens/mixins in `src/styles`. `next.config.mjs` adds `src/styles` to the Sass load path so any module can `@use "variables"` / `@use "mixins"` without relative-path juggling.

## Accessibility notes

- Skip link, semantic landmarks (`header`/`nav`/`main`), and a global `:focus-visible` ring that components don't override.
- Rep results are announced via an `aria-live` region (`RepCounter`) so the color flash / shake has a non-visual equivalent.
- All motion (rep-counter shake, feedback flash) is cut to near-zero under `prefers-reduced-motion: reduce` (see `src/styles/globals.scss`).
- Camera permission flow explains *why* access is needed before requesting it, and reports denied/unsupported states through `role="status"`.

## Sounds

`public/sounds/correct.wav` and `incorrect.wav` are synthesized placeholder tones (see `scripts/generate-placeholder-sounds.mjs`) standing in for the final sound effects. Drop your own files at those same paths to replace them — no code changes needed.

## Known limitations (by design, for this stage)

- Form-checking uses generic, per-movement-pattern-archetype heuristics rather than exercise-specific rules — see `docs/PLAN.md` §3 and §5 for why, and `src/lib/pose/archetypeConfig.ts` for the current thresholds.
- ~31% of the dataset doesn't match a known archetype and falls back to generic motion tracking with weaker form confidence.
- No accounts/backend — history is local to the browser (`localStorage`).
