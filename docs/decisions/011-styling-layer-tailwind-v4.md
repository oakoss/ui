# Styling layer: Tailwind v4 + tailwind-variants + eslint-plugin-better-tailwindcss

- **Status:** Accepted
- **Date:** 2026-05-27
- **Authors:** @jbabin91

## Context

The styling layer was the only architectural choice still pending after PR #14. The original research note at [`../research/styling-layer-evaluation.md`](../research/styling-layer-evaluation.md) recommended Tailwind v4 — but on examination its scoring framework was rigged: four criteria (RAC plugin shorthand, Terrazzo plugin, shadcn-registry fit, v0 Design Mode) that all favored Tailwind ecosystem alignment, none of which evaluated styling layers on their own merits.

A second pass against ten criteria that actually matter for an OSS component library with mixed human + agent contributors — author experience, type safety, consumer override ergonomics, variant API quality, longevity, AI tooling alignment, theming support, consumer tooling overhead, performance, and production proof on RAC — surfaced three genuinely viable contenders rather than one obvious winner:

- **Tailwind v4 + tailwind-variants + eslint-plugin-better-tailwindcss** — best AI tooling alignment, simplest consumer setup, native shadcn-registry fit, `@theme` + `@import` matches [decision 009](009-tokens-and-themes-via-registry.md) cleanly, JollyUI and Adobe react-aria-starter as production RAC-based DS proof.
- **vanilla-extract** — strongest compile-time type safety, official Terrazzo plugin, Braid (Seek's design system) as direct RAC-based DS proof, theme contracts as TS types. Adobe's `@react-spectrum/s2` uses a similar atomic-CSS-in-TS approach (style macro) on RAC — precedent for the build-time-typed-CSS pattern.
- **CSS Modules + PostCSS** — longest framework-agnostic lifespan, lowest consumer tooling tax. No direct RAC-based DS production precedent located (Adobe's v3 react-spectrum uses CSS Modules but predates RAC; s2 — the RAC-based Spectrum — uses the style macro instead).

Panda CSS surfaced the strongest slot-variant API (`sva()`), but its distribution model is incompatible with shadcn registry copy-source distribution — three of four Panda distribution strategies require consumers to install Panda and run `panda codegen`; the fourth (static CSS) sacrifices the recipe customization that's the reason to use Panda. UnoCSS lacks RAC integration, Terrazzo plugin, and production RAC-based DS proof.

Two findings shifted the picture:

- **`tailwind-variants` over CVA** — the conventional Tailwind variant story is CVA, but TV adds native slots (`tv({ slots: {...} })`), compound slots (`compoundSlots`), recipe composition (`extend`), and built-in `tailwind-merge` integration. This neutralizes Panda's slot-API advantage and closes the variant-ergonomics gap with vanilla-extract's `recipe()`.
- **`eslint-plugin-better-tailwindcss`** — its `no-unknown-classes` rule catches the `bg-typo`-silently-no-ops failure mode at lint time, with explicit support for Tailwind v4's `@theme` block and custom component classes (`detectComponentClasses`). The "Tailwind has zero type safety on token references" argument becomes "lint-time vs compile-time" — both surface errors before runtime, both visible in the editor.

With those two pieces in scope, the remaining differentiation between Tailwind v4 + TV + better-tailwindcss and vanilla-extract narrows to authoring verbosity, AI tooling alignment, and theme-contract enforcement across multi-brand variants (where vanilla-extract's `createTheme()` enforces contract shape and Tailwind's `@theme` is duck-typed).

## Decision

The styling layer for oakoss/ui is:

- **Tailwind v4** as the CSS framework. CSS-first `@theme` block configuration; there is no `tailwind.config.ts` in v4-only setups.
- **`tailwind-variants`** (TV) as the variant API. Not CVA. TV provides native `slots`, `compoundSlots`, `extend` for recipe composition, and built-in `tailwind-merge` integration.
- **`eslint-plugin-better-tailwindcss`** as the type-safety mechanism. `no-unknown-classes` catches unknown Tailwind classes (including token typos) at lint time. `no-deprecated-classes` catches v3-style syntax that LLMs sometimes produce.

This decision locks the framework choice and the variant + lint tools that pair with it. Out of scope for this decision:

- **Theme structure and token taxonomy** — token naming (Radix-style 12-step scales? Tailwind-style numerics? Spectrum-style semantic mapping?) is a downstream choice that will surface when `@oakoss/tokens` is actually authored. Goes into a proposal under [`../proposals/`](../proposals/) at that time.
- **Specific `@theme` output shape from `@terrazzo/plugin-tailwind`** — the build pipeline's output structure is an implementation choice for the first tokens PR.
- **`stylelint` and custom CSS lint config** — stylelint is for CSS files (not className strings), and our CSS surface is minimal at this stage. Revisit when actual custom CSS surface exists (a `globals.css` registry item, complex `@layer components` rules, etc.).
- **Consumer ESLint configuration** — whether and how consumers install `eslint-plugin-better-tailwindcss` themselves. Our authoring side benefits regardless.

## Consequences

Easier:

- **Consumer onboarding.** A single Vite plugin (`@tailwindcss/vite`) or PostCSS plugin gets a consumer up and running. No codegen step, no per-file compilation, no special bundler configuration.
- **`@oakoss/themes` distribution.** Each theme variant ships as a registry item containing an `@theme` block. Consumers `shadcn add @oakoss/themes/<variant>` and `@import` the resulting CSS file. Matches the [decision 009](009-tokens-and-themes-via-registry.md) distribution model directly.
- **AI tooling alignment.** Claude Code, Cursor, GitHub Copilot all generate idiomatic Tailwind reflexively. For a project with mixed human + agent contributors, the default-generated code is more likely to be correct on the first try.
- **Existing shadcn-ecosystem migration.** Any community shadcn registry item is portable into our project zero-rewrite. Forking the broader ecosystem stays cheap.
- **Migration target ergonomics.** Per the original research, Tailwind is the cheapest both-directions migration target. If a future decision supersedes this one, the rewrite cost to anything else is bounded.
- **Slot variant ergonomics via TV.** Multi-part components (`Dialog.Root` / `Dialog.Header` / `Dialog.Body` / `Dialog.Footer`) can be authored with a single `tv({ slots: {...} })` call rather than the multi-instance CVA pattern that shadcn-ui currently uses.

Harder:

- **No compile-time type safety on token references.** `bg-typo` for a nonexistent token still renders nothing at runtime. Mitigation: `eslint-plugin-better-tailwindcss` catches this at lint time with `no-unknown-classes` (surfaces in IDE + CI). For agent contributors, ESLint errors are equally noisy as TS errors. The functional gap with vanilla-extract's compile-time check is mostly closed but not eliminated.
- **Theme contract enforcement is duck-typed.** Tailwind's `@theme` block is CSS variables — if `default.css` defines `--color-brand-500` and `corporate.css` forgets to, there's no error; consumers get unset variables that fall back to nothing. Mitigation: address via a theme-contract validation mechanism to be specified when `@oakoss/themes` is authored. Less elegant than vanilla-extract's `createTheme()` contract enforcement but recoverable.
- **Single-vendor risk.** Tailwind Labs Inc. is the maintainer; the project is a venture-funded single-vendor commercial venture. Mitigation: AI tooling and shadcn ecosystem familiarity make migration off Tailwind cheap if the project's direction ever stops fitting. Counterpart: vanilla-extract is maintained by Seek (smaller team, slower 2026 cadence), so vendor risk is comparable.
- **`tailwind-variants` is a third-party dependency.** Not maintained by Tailwind Labs; maintained by the HeroUI team. Mitigation: HeroUI uses TV in production, library has active maintenance, API surface is stable.

New risks:

- **Tailwind v4 ecosystem maturity.** v4 went stable in early 2025; some plugins and configs still reference v3 idioms. Mitigation: `eslint-plugin-better-tailwindcss`'s `no-deprecated-classes` rule catches v3 leftovers; `@terrazzo/plugin-tailwind` targets v4's `@theme` directly (verified in [`../research/architectural-standards.md`](../research/architectural-standards.md)'s 2026-05-27 verification log).
- **Custom-CSS surface drift.** If we ship significant custom CSS beyond the `@theme` block, re-evaluate CSS-file linting (stylelint or alternatives) then. Deferred per the scope-tightly discipline.

## Alternatives considered

- **vanilla-extract.** Strongest compile-time type safety (theme contracts as TS types, `RecipeVariants<typeof button>` inference, scoped class names that sidestep CSS cascade entirely). Official Terrazzo plugin (`@terrazzo/plugin-vanilla-extract`). Braid (Seek's RAC-based design system) is direct production proof. Rejected because the variant-ergonomics gap is mostly closed by `tailwind-variants`, the type-safety gap is mostly closed by `eslint-plugin-better-tailwindcss`, AI tooling alignment is worse, the authoring is more verbose than class strings, and the consumer override convention (theme contract + recipe composition) departs from the className-pass-through that shadcn-ecosystem users expect. The decision was close; the deciding factor was AI tooling alignment for a project where agents contribute significant code.
- **Panda CSS.** Best slot-variant API (`sva()` is uniquely well-designed) and `createStyleContext` produces compound React components automatically. Rejected because the distribution model is incompatible with shadcn-registry copy-source distribution — three of four Panda library-distribution strategies require consumers to install Panda and run `panda codegen`; the fourth (static CSS) sacrifices the recipe customization that's the reason to use Panda. No production RAC-based DS proof located (Park UI is on Ark UI, not RAC). The slot-API advantage was neutralized once we evaluated `tailwind-variants` over CVA.
- **CSS Modules + PostCSS.** Longest framework-agnostic lifespan (output is pure CSS; bundler-native in Vite/Webpack/Parcel). Lowest consumer tooling tax (zero plugins to install). Rejected because the variant API is manual (class composition + `clsx`), authoring requires more boilerplate per component, AI tooling alignment is universal-CSS rather than ecosystem-idiomatic, the framework-agnostic-lifespan argument is hypothetical given [decision 003](003-react-primary-defer-web-components.md) defers Web Components to post-v1.0, and no direct RAC-based DS production precedent was located. (Adobe's v3 `@react-spectrum/*` packages use CSS Modules but predate RAC; the RAC-based `@react-spectrum/s2` uses the style macro instead — closer in spirit to vanilla-extract than to plain CSS Modules.)
- **UnoCSS.** Engine-based atomic CSS with preset system and fast builds. Rejected because there's no official RAC integration, no Terrazzo plugin, and no production RAC-based DS using UnoCSS located. Mostly Tailwind-similar without the ecosystem benefits.
- **Tailwind v4 + CVA.** The shadcn-ecosystem default variant story. Rejected in favor of `tailwind-variants` because TV adds native slots, compound slots, recipe composition (`extend`), and built-in `tailwind-merge` integration that CVA lacks. TV is the better tool for the same role.
- **Master CSS, Open Props, StyleX.** Dismissed in the original research; nothing changed on re-examination. Master CSS is effectively stale (v2 in RC since early 2024). Open Props is a token library, not a styling layer. StyleX is compiler-coupled and hostile to shadcn-registry distribution.

## Sources

- Tailwind v4 CSS-first `@theme` directive and v3 → v4 migration docs (verified via context7 against `/tailwindlabs/tailwindcss.com`, 2026-05-27).
- `tailwind-variants` slots, compoundSlots, extend, VariantProps (verified via context7 against `/heroui-inc/tailwind-variants`, 2026-05-27).
- `eslint-plugin-better-tailwindcss` `no-unknown-classes` and `no-deprecated-classes` rules, Tailwind v4 support, `detectComponentClasses` for custom utilities (verified via context7 against `/schoero/eslint-plugin-better-tailwindcss`, 2026-05-27).
- vanilla-extract `recipe()` API, selectors API for RAC data attributes, Sprinkles conditions (verified via context7 against `/vanilla-extract-css/vanilla-extract`, 2026-05-27).
- Panda CSS `sva()` slot recipes, `createStyleContext`, four-strategy component-library distribution doc (verified via context7 against `/chakra-ui/panda`, 2026-05-27).
- `@terrazzo/plugin-tailwind` health and Terrazzo 2.0 transition (verified in PR #11's [verification log](../research/architectural-standards.md#verification-log)).
- Adobe `@react-spectrum/s2` style macro vs v3 CSS Modules distinction (`react-spectrum.adobe.com/s2/`).
- JollyUI as RAC-based shadcn-style DS on Tailwind; Adobe react-aria-starter; Braid (Seek) on vanilla-extract; Adobe react-spectrum on CSS Modules — production proof points cited in [`../research/styling-layer-evaluation.md`](../research/styling-layer-evaluation.md).
