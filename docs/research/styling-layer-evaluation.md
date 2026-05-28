# Styling Layer Evaluation

- **Status:** Decided — Tailwind v4 + `tailwind-variants` + `eslint-plugin-better-tailwindcss` per [decision 011](../decisions/011-styling-layer-tailwind-v4.md). Distribution claims for tokens and themes are superseded by [decision 009](../decisions/009-tokens-and-themes-via-registry.md) — both flow through the registry, not npm.
- **Date:** 2026-05-26 (first pass); rewritten 2026-05-27 with an honest evaluation framework after a session found the original 4-criteria scoring was biased toward Tailwind ecosystem alignment.
- **Scope:** CSS framework / styling layer for oakoss/ui's styled components
- **Related:** [decision 011](../decisions/011-styling-layer-tailwind-v4.md), [decision 009](../decisions/009-tokens-and-themes-via-registry.md) for token/theme distribution

## Why this note was rewritten

The first pass scored 8 options against 4 criteria: official RAC plugin shorthand, Terrazzo plugin existence, shadcn-registry fit, v0 Design Mode support. Tailwind scored 4/4; nothing else scored above 2/4. On re-examination, the criteria were biased:

- **v0 Design Mode supported** — irrelevant to this project (no plan to use v0; matters for consumer-side adoption story, not library authoring).
- **Official RAC plugin** — `tailwindcss-react-aria-components` provides shorthand like `selected:bg-brand` vs `data-[selected]:bg-brand`; convenience, not load-bearing. vanilla-extract's selectors API handles RAC data attributes natively, and Sprinkles can encode the same shorthand.
- **Terrazzo plugin** — named plugins for specific styling layers are convenience; `@terrazzo/plugin-css` is the universal fallback that works for any layer consuming CSS variables (which is basically all of them).
- **shadcn-registry fit** — the `cssVars` field in `registry-item.json` is a generic CSS-variable map (`{ theme, light, dark }`) that works regardless of styling layer; only the `tailwind` field is Tailwind-specific, and it's optional.

Three of the four criteria were about ecosystem alignment rather than styling-layer merit; one didn't apply to this project at all. Evaluating other options only on where they scored against Tailwind's criteria is searching for confirmation, not evaluating.

The rewrite uses ten criteria that actually matter for an OSS component library where contributors are mixed human + agent.

## Evaluation framework

1. **Component author experience** — pleasant to write variants, states, responsive day-to-day
2. **Type safety on token references** — does the toolchain catch `bg-typo` before runtime
3. **Consumer override ergonomics** — how consumers customize/extend our components
4. **Variant API ergonomics** — first-class or bolted-on; slots and compound slots
5. **Longevity / framework-agnostic potential** — survival across framework churn; Lit/WC compatibility post-v1.0
6. **AI tooling alignment** — LLMs produce idiomatic code on the first try
7. **Theming / multi-brand support** — relevant to `@oakoss/themes` (per [decision 009](../decisions/009-tokens-and-themes-via-registry.md))
8. **Consumer tooling overhead** — what consumers add to their build pipeline
9. **Performance** — bundle size, build time, atomic dedup at scale
10. **Production proof points on RAC** — who's actually shipping a RAC-based DS on this layer

## Three contenders after rigorous evaluation

The deep dive narrowed the eight original options to three viable contenders.

| Axis                  | Tailwind v4 + TV + better-tailwindcss                                 | vanilla-extract                                                                                                       | CSS Modules + PostCSS                                                                                                            |
| --------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Author experience     | Class strings + TV recipes                                            | TS files + `recipe()`                                                                                                 | CSS files + class composition                                                                                                    |
| Type safety on tokens | Lint-time via `no-unknown-classes`                                    | **Compile-time via theme contracts**                                                                                  | Compile-time via typed CSS Modules                                                                                               |
| Consumer overrides    | className pass-through + `tailwind-merge` (built into TV)             | Theme contract overrides + composition                                                                                | Class composition + `:global`                                                                                                    |
| Slot variants         | TV `slots` + `compoundSlots`                                          | Multi-instance (one `recipe()` per slot)                                                                              | Multi-instance (one class per slot)                                                                                              |
| Variant API           | TV `tv()` (built-in `tailwind-merge`, `extend` for composition)       | `recipe()` (`variants`, `compoundVariants`, `defaultVariants`, boolean variants)                                      | Manual via `clsx`                                                                                                                |
| Longevity             | Tied to Tailwind Labs roadmap                                         | Tied to Seek's vanilla-extract roadmap                                                                                | **Bundler-native; longest lifespan**                                                                                             |
| AI tooling alignment  | **Strongest — dominant in LLM training data**                         | Moderate                                                                                                              | Universal CSS knowledge                                                                                                          |
| Theme system          | `@theme` block + `@import` from external files (matches decision 009) | `createTheme()` contracts (typed, enforced across variants)                                                           | Manual CSS variable management                                                                                                   |
| Consumer tooling      | `@tailwindcss/vite` plugin                                            | vanilla-extract Vite plugin                                                                                           | None (bundler-native)                                                                                                            |
| Performance           | Oxide engine; atomic output                                           | Build-time TS compilation; per-component CSS                                                                          | Bundler-native; per-component scoped CSS                                                                                         |
| RAC production proof  | JollyUI; Adobe react-aria-starter                                     | **Braid (Seek's RAC-based DS)**; Adobe `@react-spectrum/s2` uses a comparable atomic-CSS-in-TS approach (style macro) | **None located** (Adobe v3 react-spectrum uses CSS Modules but predates RAC; s2 — the RAC-based Spectrum — uses the style macro) |
| Vendor risk           | Tailwind Labs (venture-funded; commercial)                            | Seek (smaller team; slower 2026 cadence)                                                                              | **Distributed across bundler maintainers**                                                                                       |

## Dismissed contenders

- **Panda CSS.** Best slot-variant API (`sva()` with `createStyleContext` for compound components is uniquely well-designed). Rejected because the distribution model is incompatible with shadcn-registry copy-source distribution — three of four documented library-distribution strategies require consumers to install Panda and run `panda codegen`; the fourth (static CSS) sacrifices the recipe customization that's the reason to use Panda. No production RAC-based DS using Panda located (Park UI is on Ark UI, not RAC).
- **UnoCSS.** Engine-based atomic CSS with preset system and fast builds. Rejected because there's no official RAC integration, no Terrazzo plugin, and no production RAC-based DS using UnoCSS located. Mostly Tailwind-similar without the ecosystem benefits.
- **Master CSS.** Effectively stale. v1.37.7 from 2022-11; v2 in RC since early 2024.
- **Open Props.** Not a styling layer — it's a token library. Redundant given DTCG + Terrazzo.
- **StyleX (Meta).** Compiler-coupled (Babel/SWC plugin required); hostile to shadcn-registry copy-source distribution. At FAANG scale, StyleX wins on bundle size at scale; at this project's scale, the tooling tax dominates.

## Why Tailwind v4 + TV + better-tailwindcss

Two findings narrowed the gap with vanilla-extract:

### `tailwind-variants` over CVA

CVA is the shadcn-ecosystem default but lacks slots and built-in conflict resolution. `tailwind-variants` (TV) adds:

- **Native slots** via `tv({ slots: {...} })` — equivalent ergonomics to Panda's `sva()` for multi-part components like Dialog/Menu/Tabs/Accordion. RAC patterns map cleanly.
- **`compoundSlots`** for cross-slot rules (e.g., "apply `font-medium` to `tab` and `cursor` slots when `size` is `sm` or `md`").
- **Component composition via `extend`** for variant inheritance (build a base button recipe; derive icon-button, submit-button via extension).
- **Built-in `tailwind-merge` integration** — automatic conflict resolution without the `cn()` dance.
- **Full type inference** via `VariantProps<typeof button>`.

This neutralizes the slot-variant gap that initially made Panda interesting.

### `eslint-plugin-better-tailwindcss`

The "Tailwind has zero compile-time type safety on tokens" gap is mostly recovered:

- **`no-unknown-classes`** flags any class not in the Tailwind config / `@theme` block. `bg-typo` becomes an ESLint error in the editor and CI.
- **`no-deprecated-classes`** catches v3 syntax that LLMs sometimes produce.
- **Explicit Tailwind v4 support** including the CSS-first `@theme` directive and custom component classes (`detectComponentClasses` for `@layer components { .btn {...} }`).

The gap with vanilla-extract narrows from "compile-time vs lint-time" — both surface errors before runtime, both visible in the editor. For agent contributors, ESLint errors are equally noisy as TS errors.

### Remaining differentiation

| Axis                                     | Tailwind v4 + TV + better-tailwindcss             | vanilla-extract                  |
| ---------------------------------------- | ------------------------------------------------- | -------------------------------- |
| Type safety on token refs                | Lint-time                                         | Compile-time                     |
| Theme contract enforcement (multi-brand) | Duck-typed (need own validation step)             | **Enforced via `createTheme()`** |
| Author verbosity                         | Lower (class strings)                             | Higher (TS files)                |
| AI tooling alignment                     | **Dominant in LLM training data**                 | Moderate                         |
| Slot variants                            | TV `slots`                                        | Multi-instance                   |
| Consumer override convention             | className pass-through (matches shadcn-ecosystem) | Theme contract override          |
| Migration target ease                    | **Cheapest both directions**                      | Mid                              |
| RAC production proof                     | JollyUI, Adobe starter                            | Braid                            |

The deciding factors for oakoss/ui: AI tooling alignment (agents contribute significant code); consumer onboarding simplicity (shadcn registry model assumes minimal consumer toolchain); shadcn-ecosystem migration cost (we may want to fork community registry items). The type-safety gap is mostly closed by `eslint-plugin-better-tailwindcss`; the theme-contract gap is recoverable via a build-time validation step when `@oakoss/themes` is authored.

vanilla-extract is strong — Braid is a real production RAC-based DS, the type safety is best in field, the theme contracts are the most principled multi-brand story. The decision was close. The deciding axis was AI tooling alignment for a project where agents write substantial code.

## Out of scope for decision 011

These are downstream choices that surface when the styling layer is actually exercised. Per the scope-tightly discipline in [`../decisions/README.md`](../decisions/README.md), they belong in proposals or future decisions, not this ADR:

- **Token naming taxonomy.** Radix-style 12-step scales? Tailwind-style numerics (50-950)? Spectrum/Carbon-style semantic mapping? Belongs in a proposal when `@oakoss/tokens` is authored.
- **Specific `@theme` output shape from `@terrazzo/plugin-tailwind`.** Build pipeline implementation detail for the first tokens PR.
- **`stylelint` and custom CSS lint config.** Stylelint lints CSS files, not className strings (that's `eslint-plugin-better-tailwindcss`). Our CSS surface is minimal at this stage — revisit when meaningful custom CSS exists (a `globals.css` registry item, complex `@layer components` rules).
- **Consumer ESLint configuration.** Whether and how consumers install `eslint-plugin-better-tailwindcss` themselves. Our authoring side benefits regardless.
- **Specific `tailwind-merge` configuration.** Custom class groups, conflict resolution edge cases — surface when an actual conflict appears.

## Migration cost if we change our mind later

Ordinal rather than absolute (concrete per-component effort depends on component family size, test coverage, and how much logic vs. presentation is in the file):

- **Cheapest exit:** Tailwind → CSS Modules (mechanical class translation; existing community converters reduce manual work)
- **Mid:** Tailwind → vanilla-extract (selectors API rewrite + theme contract authoring)
- **Most expensive:** Tailwind → Panda or StyleX (recipes/atomic API rewrite + the consumer-side toolchain has to migrate too)
- **Easiest direction (any → Tailwind):** existing AI tooling does most of the translation

**Tailwind is the cheapest both-directions migration target.** This matters more than the styling layer being objectively "best" in isolation.

## Sources

- Tailwind v4 CSS-first `@theme` directive and v3 → v4 migration docs — verified via context7 against `/tailwindlabs/tailwindcss.com`, 2026-05-27
- `tailwind-variants` slots, compoundSlots, extend, VariantProps — verified via context7 against `/heroui-inc/tailwind-variants`, 2026-05-27
- `eslint-plugin-better-tailwindcss` `no-unknown-classes` and `no-deprecated-classes` rules, Tailwind v4 support, `detectComponentClasses` for custom utilities — verified via context7 against `/schoero/eslint-plugin-better-tailwindcss`, 2026-05-27
- vanilla-extract `recipe()` API, selectors API for RAC data attributes, Sprinkles conditions — verified via context7 against `/vanilla-extract-css/vanilla-extract`, 2026-05-27
- Panda CSS `sva()` slot recipes, `createStyleContext`, four-strategy component-library distribution doc — verified via context7 against `/chakra-ui/panda`, 2026-05-27
- `@terrazzo/plugin-tailwind` health and Terrazzo 2.0 transition — verified in PR #11's verification log in [`architectural-standards.md`](architectural-standards.md)
- Production proof points: JollyUI and Adobe react-aria-starter (Tailwind), Braid (vanilla-extract), Park UI (Panda on Ark UI, not RAC). No CSS-Modules RAC-based DS located; Adobe v3 `@react-spectrum/*` uses CSS Modules but predates RAC, and `@react-spectrum/s2` (the RAC-based Spectrum) uses the style macro instead — `react-spectrum.adobe.com/s2/` covers the style macro
- Vendor / bus factor data: Tailwind Labs is venture-funded; Seek (vanilla-extract maintainer) public team size; Chakra (Panda) founder transition (2025)
