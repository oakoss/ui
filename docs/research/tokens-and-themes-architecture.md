# Tokens and themes architecture (design exploration)

- **Status:** Exploration — input to the future token-taxonomy Proposal and a themes Proposal. Not ratified. No code depends on this yet.
- **Date:** 2026-05-28
- **Scope:** How `@oakoss/tokens` and `@oakoss/themes` relate — tiering, the semantic contract, theme/mode modeling, and community-palette support.
- **Related:** [decision 004](../decisions/004-dtcg-tokens-with-terrazzo.md), [decision 009](../decisions/009-tokens-and-themes-via-registry.md), [decision 011](../decisions/011-styling-layer-tailwind-v4.md), [architectural-standards](architectural-standards.md)

## Why this note exists

Captured while grilling the `@oakoss/tokens` package scaffold. The conversation surfaced the tokens↔themes relationship and how far it can stretch (shadcn-compatible themes, community palettes like Catppuccin/Nord). None of it blocks the scaffold, so the themes design is paused and recorded here for the proposals that will ratify it.

## Three-tier model

Standard design-system tiering, adapted:

1. **Primitive / reference** — raw materials, no meaning: color ramps (e.g. mauve 1–12), spacing scale, type scale, radius scale.
2. **Semantic / contract** — meaning assigned, _references_ primitives: `color.background → {color.mauve.1}`, `color.primary → {color.mauve.12}`. This is the shadcn-shaped interface.
3. **Theme / mode** — the same contract _resolved_ against a palette, per variant and (optionally) per mode.

## Package split

- **`@oakoss/tokens`** owns tiers 1–2 — primitives plus the **semantic contract** (the set of semantic names every theme must satisfy). Single-sourcing the contract here kills the drift problem [decision 011](../decisions/011-styling-layer-tailwind-v4.md) flagged (a variant silently missing a variable) and gives the deferred "theme-contract validation mechanism" a home.
- **`@oakoss/themes`** owns tier 3 — the **per-variant resolution** (which primitive each semantic maps to, per mode). Each theme is a conforming value-set, exposed as its own registry item per [decision 009](../decisions/009-tokens-and-themes-via-registry.md).

themes **consumes** tokens via `workspace:*`. For DTCG references to resolve across the package boundary, `@oakoss/tokens` should export its **raw DTCG source** (a `./dtcg` export, not just compiled CSS) so themes can feed primitives + contract into its own Terrazzo build input.

## shadcn-contract compatibility

The strategy is to adopt the **shadcn semantic contract** (the surface tokens — `--background`/`--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, each with its `-foreground` pair where applicable — plus `--border`, `--input`, `--ring`, `--chart-1..5`, `--sidebar-*`, `--radius`) as the tier-2 interface. The win is **bidirectional ecosystem interop**, not the palettes:

- any shadcn/community component drops onto an oakoss theme zero-rewrite,
- oakoss components run under any shadcn theme,
- consumers migrating from shadcn keep their muscle memory.

This serves [decision 002](../decisions/002-registry-led-hybrid-distribution.md) ("forking the shadcn ecosystem stays cheap") and [decision 011](../decisions/011-styling-layer-tailwind-v4.md) ("any community shadcn registry item is portable zero-rewrite"). The contract is the asset; specific palettes are content.

The differentiator that justifies oakoss themes existing over copying shadcn's CSS: they are **DTCG-native**, so one source compiles to CSS/JS/Tailwind/(future Swift) and can round-trip to Figma via Tokens Studio — things hand-authored shadcn CSS can't do. The Tokens Studio round-trip is real but **lossy** (typography/spacing/color divergences requiring custom normalization, per [architectural-standards](architectural-standards.md)); verify it before relying on it in the themes proposal.

Current shadcn theming (verified 2026-05-28): **OKLCH** values, Tailwind v4 CSS-first `@theme inline`, base colors Neutral/Stone/Zinc plus newer Mauve/Olive/Mist/Taupe. Note Terrazzo reproduces the _theming result_ its own way (mode selectors / mode variants), not shadcn's byte-exact `@theme inline` + `:root`/`.dark` structure — the byte-exact shadcn `cssVars` shape is the registry generator that [decision 009](../decisions/009-tokens-and-themes-via-registry.md) marks TBD.

## Theme and mode are two independent axes

Light/dark is **not** a universal axis. Two separate axes:

1. **Theme** (required) — which resolution of the contract (Mauve, Mist, Nord, Catppuccin-Mocha). Selected by which CSS is imported / a `data-theme` attribute. Each theme is its own registry item.
2. **Mode** (optional, per-theme) — light/dark _within_ a theme that ships a pair. Selected by `.dark` / `prefers-color-scheme`.

A theme declares which modes it supports:

- **shadcn-style (Mauve, Mist):** `[light, dark]` — auto-switches.
- **Nord:** single mode — no light counterpart. One resolution.
- **Catppuccin:** flavors are _themes_, not modes (1 light Latte + 3 dark flavors don't fit a binary). Up to 4 themes, or curated pairs — a per-palette call.

Refinements:

- A single-mode theme must still declare a `color-scheme` (Nord is dark-colored → `color-scheme: dark`) so the browser renders scrollbars, form controls, and inputs correctly. Terrazzo's css plugin accepts a per-mode `scheme` (color-scheme) on each `modeSelectors` entry.
- Mode-toggle behavior must be defined: a light/dark toggle is a no-op when the active theme declares only one mode (e.g. Nord stays Nord). Defined, not surprising.

## Community palettes (Catppuccin, Nord, …)

These are **tier-1 primitive palettes**, not themes — fixed named hues (Catppuccin ~26/flavor, Nord 16), with no semantic mapping. They slot in with no new architecture:

- import the palette as tier-1 primitives,
- the oakoss tier-2 contract stays fixed,
- a theme is a tier-3 resolution mapping the contract onto that palette.

Honest caveats:

- **The palette is the easy 10%; the semantic mapping is the work.** Deciding which Nord hue is `primary` vs `accent` vs `chart-3` is subjective curation — Catppuccin maintains hundreds of hand-authored "ports" for exactly this reason.
- **WCAG 2.2 AA is the oakoss value-add.** Community palettes weren't designed to hit 4.5:1 / 3:1 on every semantic pairing. Every shipped theme must be **contrast-validated against the contract**. "Contract-conformant + AA-validated" is the differentiator over raw palettes.
- **Licensing:** verify each palette's license before shipping (most are MIT-ish) and attribute; respect the community brands.

The product is the **mechanism**, not the catalog: a stable contract + a resolution mechanism + conformance guarantees, enabling "bring any palette — Catppuccin, Nord, or your brand's — and get a conformant, shadcn-compatible, AA-validated theme." Ship a curated few (Mauve default + maybe one or two community staples) to prove the pattern; BYO-palette is the first-class capability.

## Mechanism: DTCG Resolver Module

"One contract, N resolutions (each with 1+ modes)" is what the **DTCG Resolver Module** expresses. Per [architectural-standards](architectural-standards.md), it is the spec mechanism [decision 009](../decisions/009-tokens-and-themes-via-registry.md)'s multi-theme commitment needs, it is **preview-draft** (`do-not-cite-directly`), and Terrazzo 2.x is adding support for it. Verify maturity when themes is actually built — do not lock themes on a moving spec.

Terrazzo capability (verified 2026-05-28 via context7 against `/terrazzoapp/terrazzo`): `plugin-css` emits OKLCH and handles light/dark via `modeSelectors` (`:root`, `[data-mode="dark"]`, `@media (prefers-color-scheme: dark)`) with per-mode `color-scheme`; `plugin-tailwind` maps DTCG tokens to Tailwind v4 theme categories and does dark mode via `modeVariants`. A single-mode theme is the degenerate N=1 case.

## Implication for the tokens scaffold

Because themes consumes tokens, a _resolved theme_ belongs in themes, not tokens. The tokens scaffold seeds with a **primitive ramp** (the Mauve ramp, OKLCH) — tier-1, genuinely tokens-layer — to prove DTCG→`@theme`. The Mauve _theme_ (tier-3 semantic resolution, light/dark) becomes `@oakoss/themes` content later. Realistic seed, correct layer.

## Open questions for the proposals

For the **token-taxonomy Proposal**:

- Tier-1 naming: Radix-style 12-step ramps? Tailwind numerics? How many ramps ship?
- Does the tier-2 semantic contract live in `@oakoss/tokens` (recommended here) and exactly match shadcn's names, or extend them?
- Spacing / type / radius scales: source and naming.

For the **themes Proposal**:

- Theme ↔ mode modeling as two axes (above); the `color-scheme` and toggle-no-op rules.
- Which palettes ship at v1 (Mauve default + curated few) vs BYO-only.
- The contrast-validation mechanism (how AA conformance is enforced per theme against the contract).
- Cross-package DTCG composition: the `./dtcg` source export from tokens and how themes' Terrazzo build consumes it; Resolver Module vs ad-hoc mode layout.
- The byte-exact shadcn `cssVars` registry generator (the TBD from [decision 009](../decisions/009-tokens-and-themes-via-registry.md)).
