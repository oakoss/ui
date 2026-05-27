# Styling Layer Evaluation

- **Status:** PENDING decision. Tailwind v4 recommended by research, awaiting confirmation.
- **Date:** 2026-05-26
- **Scope:** CSS framework / styling layer for oakoss/ui's styled components
- **Related:** Future decision

## TL;DR

Research recommends **Tailwind v4** as the only option simultaneously native to shadcn registry, v0 Design Mode, the official RAC plugin, and Terrazzo's first-party plugin. Not yet locked — decision pending.

## Stack constraints driving the choice

- Primitive layer: React Aria Components ([decided](primitive-layer-evaluation.md))
- Distribution: shadcn-compatible registry ([decided](distribution-model.md)). Components ship as copy-pasted source into consumer repos.
- Token pipeline: DTCG 2025.10 authoring + Terrazzo build ([decided](architectural-standards.md))
- Multi-framework: React-primary + tokens-shared, defer WC ([decided](web-components-ecosystem.md))
- AI tooling: v0, shadcn MCP, Cursor, Claude Code

## Options evaluated

| Option                | Official RAC integration                              | Terrazzo plugin                                           | shadcn-registry fit                          | v0 supported    | Type safety on tokens              | Production examples on RAC                              |
| --------------------- | ----------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------- | --------------- | ---------------------------------- | ------------------------------------------------------- |
| **Tailwind v4**       | Official plugin (`tailwindcss-react-aria-components`) | Yes (`@terrazzo/plugin-tailwind`)                         | Cleanest                                     | **Only one**    | None (silently no-ops on bad refs) | Adobe starter, JollyUI, Untitled UI React               |
| UnoCSS                | None                                                  | No (workaround: emit CSS vars via `@terrazzo/plugin-css`) | Needs config                                 | No              | Limited                            | None located                                            |
| Open Props            | N/A — token library, not a styling layer              | N/A (already DTCG-aligned)                                | Token import only                            | No              | None                               | None located                                            |
| Master CSS            | None                                                  | No                                                        | Needs config                                 | No              | Limited                            | None — v1 stale since 2022; v2 in beta since early 2024 |
| CSS Modules + PostCSS | Native via selectors API                              | Use `@terrazzo/plugin-css`                                | Needs bundler config                         | Custom CSS only | Strong via typed CSS Modules       | Adobe react-spectrum uses similar                       |
| vanilla-extract       | Native via selectors                                  | **Official** `@terrazzo/plugin-vanilla-extract`           | Heavy consumer setup                         | No              | **Best of the field**              | Braid (Seek's RAC-based DS)                             |
| Panda CSS             | Via conditions API                                    | No                                                        | Heavy consumer setup (needs `panda codegen`) | No              | Excellent                          | Park UI (Ark UI, not RAC)                               |
| StyleX (Meta)         | Via selectors                                         | No                                                        | Hostile (compiler-coupled)                   | No              | Strong                             | None located                                            |

## Critical corrections to surface

- **Open Props is a token library, not a styling layer.** Its own docs: "sub-atomic styles…foundational building blocks rather than pre-built components." It complements; it does not replace. With DTCG tokens already from Terrazzo, Open Props would be redundant as a token source.
- **Master CSS is effectively stale.** v1.37.7 from 2022-11; latest npm publish 2025-06; v2 in beta/RC since early 2024. Not viable for a new production library.
- **`eslint-plugin-react-aria` does not exist.** Verified via npm. No styling-layer choice can fix this; RAC consumers rely on `eslint-plugin-jsx-a11y` and runtime axe checks regardless.

## Recommendation: Tailwind v4

**Single biggest reason:** It is the only styling layer that is simultaneously native to (a) shadcn registry, (b) v0 Design Mode, (c) the official RAC plugin, and (d) Terrazzo's first-party plugin. No other option scores on more than 2 of those 4.

Concrete enabling features:

- `tailwindcss-react-aria-components` plugin provides shorter modifier syntax (`selected:bg-blue-400` vs `data-[selected]:bg-blue-400`) with autocomplete
- v4's CSS-first `@theme` directive supports `@import` from external files, so `@oakoss/theme-default` ships as an npm package consumers `@import`
- `@terrazzo/plugin-tailwind` targets v4's `@theme` config and supports paired properties (`--text-xs--line-height`)
- RSC-compatible (pure CSS output, zero runtime)
- v0 Design Mode (Vercel) is Tailwind-only as of 2026
- Largest training-data volume; LLMs produce idiomatic Tailwind by default

**Biggest risk:** Tailwind v4 has no compile-time enforcement of token references. `bg-typo` for a nonexistent token silently renders nothing. Mitigation: ship `@terrazzo/plugin-js` TS exports alongside the `@theme` block so consumers writing custom styles get token autocomplete and compile-time checking.

## Decision matrix (if priorities shift)

| If you weight most heavily…                                                             | Pick                                                        |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| AI-tooling alignment + ecosystem velocity                                               | **Tailwind v4**                                             |
| Token type safety + zero-runtime + first-party Terrazzo integration                     | **vanilla-extract**                                         |
| Maximum build performance at very large scale + atomic dedup                            | UnoCSS or StyleX                                            |
| Cleanest path to a post-v1.0 Web Components implementation + minimum consumer toolchain | CSS Modules + PostCSS (with Terrazzo CSS plugin for tokens) |

## Migration cost if we change our mind later

- Tailwind → CSS Modules: ~1 week per component family (mechanical class translation; community converters exist)
- Tailwind → vanilla-extract: ~2 weeks per family (selectors API rewrite + theme contract authoring)
- Tailwind → Panda/StyleX: ~3 weeks per family (recipes/atomic API + consumer-side toolchain migration)
- Anything → Tailwind: easiest direction (existing AI tooling does the translation)

**Tailwind is the cheapest both-directions migration target.** This matters more than the styling layer being objectively "best" in isolation.

## Sources

- Tailwind CSS v4 docs + `tailwindcss-react-aria-components` package
- UnoCSS, Open Props, Master CSS, vanilla-extract, Panda CSS, StyleX official docs + GitHub repos (last release / commit cadence verified via `gh api` 2026-05-26)
- Terrazzo integrations page (`terrazzo.app/docs/integrations`) — Tailwind, CSS, Sass, JS/TS, vanilla-extract plugins
- React Aria Components Styling docs (`react-aria.adobe.com/styling`)
- shadcn `registry-item.json` schema (Tailwind assumed in `cssVars`, `css`, `tailwind` fields)
- shadcn variant-without-Tailwind discussion (#2832)
- v0 docs + Vercel community thread "v0 + Tailwind 4 + Next 16"
- DTCG specification stable announcement (Oct 2025)
- StyleX at Meta — Engineering blog Jan 2026
- pkgpulse 2026 reviews: Tailwind vs UnoCSS, Panda CSS vs Tailwind
- React Aria CSS handling discussion (`adobe/react-spectrum#5736`)
