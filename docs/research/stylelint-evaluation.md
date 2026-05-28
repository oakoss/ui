# Stylelint Evaluation

- **Status:** Recommendation — defer. Don't add stylelint to the toolchain at v0.1. Revisit when a concrete CSS surface ships.
- **Date:** 2026-05-27
- **Scope:** Whether to add stylelint (and which config) for our Tailwind v4 + minimal CSS surface
- **Related:** [decision 011](../decisions/011-styling-layer-tailwind-v4.md) (stylelint explicitly out of scope)

## Context

Decision 011 deferred `stylelint` and custom CSS lint config out of the styling-layer ADR scope ("revisit when actual custom CSS surface exists"). This note records the research that justifies the deferral and documents the triggers that would tip the analysis later.

## What exists for Tailwind + stylelint (2026-05-27)

| Package                                       | Version | Status                                                                                                         | Monthly downloads                                                              |
| --------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `stylelint-config-tailwindcss` (zhilidali)    | 1.0.1   | **Stale.** peerDep `tailwindcss: >=2.2.16` — never updated for v3 or v4                                        | 508k (high adoption despite being stale, because no alternative is well-known) |
| `@dreamsicle.io/stylelint-config-tailwindcss` | 1.2.2   | Published 2026-01-25. peerDep `stylelint: ^16.17.0 \|\| ^17.0.0` matches current. Doesn't pin Tailwind version | 21k (single-vendor; low adoption)                                              |
| Tailwind first-party stylelint config         | —       | **Does not exist.** Tailwind's recommended editor lint is the IntelliSense VS Code extension, not stylelint    | —                                                                              |

The "popular" community config is functionally abandoned for modern Tailwind. The maintained alternative is a single-vendor (dreamsicle.io) config with low adoption — weak bus factor, weak ecosystem fit.

## What stylelint actually catches in a Tailwind v4 setup

Stylelint is a generic CSS linter. With Tailwind's at-rules added to `ignoreAtRules` so they don't error, stylelint catches:

| Failure mode                                                               | Stylelint catches?                                                                     | Already caught by?                                                                                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Property typo in `@layer components` (`colr: red`)                         | Yes                                                                                    | Tailwind compiler (sort of); manual review                                                           |
| Invalid CSS value (`color: #zzz`)                                          | Yes                                                                                    | Tailwind compiler                                                                                    |
| Unknown at-rule (`@aply` instead of `@apply`)                              | Yes (with `ignoreAtRules`)                                                             | Tailwind compiler (errors)                                                                           |
| Style consistency (hex case, semicolons)                                   | Yes                                                                                    | Subjective; no current CSS formatter in the toolchain                                                |
| Best practices (`!important`, `id` selectors, `@import` placement)         | Yes                                                                                    | Code review                                                                                          |
| Token typo in `@theme` (`--clor-brand-500` instead of `--color-brand-500`) | **No** — these are CSS custom property names; stylelint can't validate arbitrary names | Theme-contract validation mechanism (deferred per decision 011 to when `@oakoss/themes` is authored) |
| Invalid utility reference in `@apply bg-typo`                              | **No** — stylelint has no Tailwind awareness                                           | Tailwind compiler (errors at build)                                                                  |
| Unknown Tailwind class in JSX `className` strings                          | **No** — not stylelint's domain                                                        | `eslint-plugin-better-tailwindcss`'s `no-unknown-classes` (decision 011)                             |

The two failure modes that genuinely concern this project — token typos in `@theme` and bad utility references in `@apply` — are **not what stylelint catches**. The token-typo case is outside stylelint's capability (CSS custom properties are arbitrary names); the `@apply` case is handled by Tailwind's own compiler at build time.

## What stylelint adds, evaluated against our actual CSS surface

After decision 011, our CSS as of v0.1 is:

- One root file: `@import "tailwindcss"` + a `@theme { ... }` block **emitted by Terrazzo** (`@terrazzo/plugin-tailwind`). We do not author this by hand.
- Possibly a few hand-authored `@layer components` rules **in the future**, currently zero.

Stylelint would lint a small, mostly machine-generated surface. The genuine remaining value:

- Editor-time feedback on hypothetical `@layer components` rules (faster than waiting for Tailwind's compile step to fail)
- Style consistency on those rules
- Best-practice enforcement (no `!important`, etc.)

All three are low-frequency catches that get triggered only once hand-authored CSS exists.

## Recommendation: defer

Don't add stylelint to the toolchain at v0.1. Reasons:

- **No mature v4-aware shared config exists.** The popular community option is stale; the maintained one is single-vendor with low adoption. Adopting either takes on a meaningful bus-factor risk for marginal value.
- **CSS surface is currently zero hand-authored bytes.** The `@theme` block is Terrazzo-emitted; there are no `@layer components` rules yet.
- **Tailwind's compiler catches the load-bearing failures** (bad `@apply`, unknown at-rules, syntax errors). Stylelint would be a second layer for the same checks.
- **The Tailwind-specific failures we care about** (`@theme` token typos, JSX className typos) are not what stylelint catches. Theme-contract validation and `eslint-plugin-better-tailwindcss` already address those.
- Deferred-until-needed beats added-just-in-case; see [`../decisions/README.md`](../decisions/README.md).

## When to revisit

Three concrete triggers that would tip the analysis:

- We ship a `globals.css` registry item with hand-authored CSS
- We add complex `@layer components` patterns that need consistency enforcement
- A real failure mode surfaces that stylelint catches and Tailwind's compiler doesn't

If revisit comes: write our own minimal config (~10 lines of `ignoreAtRules` for Tailwind's at-rules plus `stylelint-config-recommended`) rather than depend on either of the existing community configs. Re-survey the ecosystem at that time — a first-party Tailwind-aware option may have emerged.

## Sources

- `stylelint-config-tailwindcss` (npm) — verified peerDeps (`stylelint >=13.13.1`, `tailwindcss >=2.2.16`), version 1.0.1, and publish history via `registry.npmjs.org/stylelint-config-tailwindcss` (`time` field) on 2026-05-27
- `@dreamsicle.io/stylelint-config-tailwindcss` (npm) — verified peerDeps (`stylelint: ^16.17.0 || ^17.0.0`), version 1.2.2, and publish date 2026-01-25 via `registry.npmjs.org/@dreamsicle.io/stylelint-config-tailwindcss` (`time` field) on 2026-05-27
- Tailwind CSS IntelliSense extension as Tailwind's recommended editor lint — verified via context7 against `/tailwindlabs/tailwindcss.com` on 2026-05-27
- Stylelint `at-rule-no-unknown` rule with `ignoreAtRules` option — verified via context7 against `/stylelint/stylelint` on 2026-05-27
