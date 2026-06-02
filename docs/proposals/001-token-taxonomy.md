# Token taxonomy

- **Status:** Draft
- **Comment period ends:** 2026-07-16 (45 days — major proposal; public-API surface)
- **Authors:** @jbabin91
- **Related:** [decision 011](../decisions/011-styling-layer-tailwind-v4.md) (deferred token taxonomy here), [decision 004](../decisions/004-dtcg-tokens-with-terrazzo.md), [decision 009](../decisions/009-tokens-and-themes-via-registry.md), [tokens & themes architecture](../research/tokens-and-themes-architecture.md), epic [#21](https://github.com/oakoss/ui/issues/21) (`@oakoss/tokens` scaffold), issue [#46](https://github.com/oakoss/ui/issues/46), [#30](https://github.com/oakoss/ui/issues/30) (`@oakoss/themes`), [#31](https://github.com/oakoss/ui/issues/31) (first components)

## Summary

Define the token taxonomy `@oakoss/tokens` owns: a three-tier model (primitive → semantic → theme), where tiers 1–2 live in `@oakoss/tokens` and tier 3 in `@oakoss/themes`. Tier-1 primitives are **oakoss-generated OKLCH ramps on Tailwind's `50…950` step scale** that **override** Tailwind's built-in color slots — one palette, not two. Tier-2 semantics **reference** tier-1 primitives through DTCG aliases (never inline literals), and the semantic contract is **shadcn's variable set verbatim plus an additive `oakoss.*` superset**. Coverage spans color, spacing, type, and radius. A machine-readable **contract manifest** enumerates the semantic token paths every theme must resolve, giving theme-conformance validation a token-side source of truth.

## Motivation

Token naming is public-API-shaped: it is the surface consumers depend on and the first thing they fork. [Decision 011](../decisions/011-styling-layer-tailwind-v4.md) deferred the taxonomy to this proposal rather than letting the `@oakoss/tokens` scaffold ([epic #21](https://github.com/oakoss/ui/issues/21)) set it implicitly. The scaffold proved the Terrazzo → Tailwind `@theme` pipeline with a Radix-sourced Mauve `1–12` ramp as an interim seed; this proposal decides the real system that **supersedes** it.

Getting the tiers and the contract right once avoids churning every downstream component, theme, and consumer. Three things have to be settled before `@oakoss/themes` (#30) or the first components (#31) can start:

1. What primitives exist and how they're numbered (tier-1).
2. What semantic names themes must satisfy, and how they get their values (tier-2).
3. How a theme is checked for conformance against that contract.

### Correcting a stale assumption

Epic #21 and earlier research treated "the shadcn Mauve ramp" as a numbered `1–12` primitive scale to import. That is wrong, and the correction shapes this proposal. Verified against shadcn's current theming docs (`ui.shadcn.com/docs/theming`, 2026-06-01): **shadcn ships no primitive color ramp at all.** Its theme output inlines OKLCH _literals_ directly into semantic variables (`--primary: oklch(0.205 0 0)`), and its "base colors" (Neutral, Mauve, Slate, …) only retune the chroma/hue of those literals. The canonical numbered Mauve `1–12` ramp is **Radix Colors'**, not shadcn's. oakoss is therefore not _adopting_ a primitive ramp from anyone — it is **generating its own**, and the value-add over copying shadcn CSS is precisely that ours is a DTCG reference graph rather than inlined literals.

## Detailed design

### Three tiers, two packages

| Tier | Name                  | Owns                                        | Package          | Example                                   |
| ---- | --------------------- | ------------------------------------------- | ---------------- | ----------------------------------------- |
| 1    | Primitive / reference | Raw ramps + scales, no meaning              | `@oakoss/tokens` | `color.red.500`, `space.4`, `radius.base` |
| 2    | Semantic / contract   | Meaning assigned, references tier-1         | `@oakoss/tokens` | `color.primary → {color.mauve.900}`       |
| 3    | Theme / mode          | Tier-2 resolved against a palette, per mode | `@oakoss/themes` | the Mauve light/dark value-set            |

Issue #46's one-liner sketches the tiers as "primitive → semantic → component." This proposal makes the third tier **theme** instead: the contract is resolved per-palette in `@oakoss/themes`, which is what #46 says the third tier "resolves." Component-level needs are met by the tier-2 `oakoss.*` semantic additions rather than a distinct component-token tier. A separate component-token layer is not ruled out, but it is out of scope here.

`@oakoss/themes` consumes `@oakoss/tokens` via `workspace:*`. For DTCG references to resolve across the package boundary, `@oakoss/tokens` exports its **raw DTCG source** (a `./dtcg` export, not only compiled CSS) so themes can feed primitives + contract into its own Terrazzo build. The cross-package composition mechanism (DTCG Resolver Module vs. ad-hoc) is the themes proposal's call, not this one.

### Tier 1 — primitives

**Generated, not imported.** Each ramp is an oakoss-authored OKLCH scale on Tailwind v4's step convention — `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950` (11 stops). Generation anchors each hue at a target chroma/hue and fits a lightness curve across the stops, then validates the contrast pairings the contract relies on (see [contract conformance](#contract-conformance)). Radix's perceptual scale is design _reference_ for where steps should land; the emitted values are oakoss's own. `culori` handles conversion and contrast math in the generation script that lives in `@oakoss/tokens`.

**Override, don't shadow.** The generated ramps reuse Tailwind's color names (`red`, `slate`, …) and step numbers, so `@terrazzo/plugin-tailwind` emits `--color-red-500` etc. that **replace** Tailwind's built-in primitives. The replacement is wholesale: the emitted `@theme` clears Tailwind's default color namespace (`--color-*: initial`) before declaring the oakoss ramps, so there is no second, divergent Tailwind palette underneath — `bg-red-500` resolves to the oakoss red, and a hue we have not authored simply does not exist as a utility (rather than silently falling back to stock Tailwind). "Own the palette" means uniform numbering from a single source.

**Neutrals keep recognizable names.** The tinted grays shadcn derives its base colors from — `gray`, `mauve`, `slate`, `sage`, `olive`, `sand` — ship under those names so consumers migrating from shadcn keep their muscle memory, even though the values are generated rather than Radix-exact.

**Non-color primitives** follow the same "generated scale" pattern:

- `space.*` — a primitive spacing scale on a `0.25rem` base unit (aligned to Tailwind's `--spacing`), so layout utilities stay idiomatic.
- `font.size.*`, `font.weight.*`, `line-height.*`, `letter-spacing.*` — a primitive type scale (modular).
- `radius.*` — a primitive radius scale.

**v1 scope.** The _architecture_ supports the full ramp set and bring-your-own palettes (community palettes like Nord/Catppuccin slot in as tier-1 primitives per the [research note](../research/tokens-and-themes-architecture.md)). v1 _ships_ a curated seed: the neutrals the default theme needs plus the chromatic hues the contract touches (a `red` for `destructive`, and the five `chart` hues). Because the override clears Tailwind's color namespace, an unseeded hue is _absent_, not stock-Tailwind — so the seed must cover every color the v1 theme and components actually reference. Filling out the remaining ramps beyond that is follow-up content, not a taxonomy decision. The exact seed list is an [unresolved question](#unresolved-questions).

### Tier 2 — the semantic contract

Tier-2 tokens are **aliases**, never literals. `color.primary` is `{color.mauve.900}`, not `oklch(...)`. The DTCG reference graph is what [decision 009](../decisions/009-tokens-and-themes-via-registry.md) says justifies building oakoss themes rather than copying shadcn's CSS: one source compiles to CSS/JS/Tailwind/(future Swift) and round-trips to Figma; inlined literals cannot.

The contract is shadcn's set verbatim, then extended. A theme that satisfies the shadcn core is drop-in for any shadcn/community component; an oakoss theme satisfies the core _and_ the `oakoss.*` additions. The superset is always safe: shadcn themes ignore the extras.

The interop core (verified against `ui.shadcn.com/docs/theming`, 2026-06-01):

| Group     | Tokens                                                                                                                                 |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Surface   | `background`/`foreground`, `card`(+`-foreground`), `popover`(+`-foreground`)                                                           |
| Action    | `primary`(+`-foreground`), `secondary`(+`-foreground`), `accent`(+`-foreground`), `muted`(+`-foreground`)                              |
| Status    | `destructive`                                                                                                                          |
| Form/line | `border`, `input`, `ring`                                                                                                              |
| Data viz  | `chart-1` … `chart-5`                                                                                                                  |
| Sidebar   | `sidebar`, `sidebar-foreground`, `sidebar-primary`(+`-foreground`), `sidebar-accent`(+`-foreground`), `sidebar-border`, `sidebar-ring` |
| Radius    | `radius` (base; shadcn derives `radius-sm…4xl` via `calc()`)                                                                           |

`destructive-foreground` is **deprecated** in the current shadcn contract — the `/docs/theming` reference omits it; the older `/installation/manual` page maps it but no longer defines it in `:root`. We mark it optional: emit it (aliased) for backward-compat with components that still reference it, but do not require it for conformance.

The `oakoss.*` additions cover what shadcn's color-and-radius-only contract leaves out, expressed as semantic references into tier-1: `oakoss.space.*` (semantic spacing — inset, gutter, stack), `oakoss.type.*` (semantic type roles — body, heading, code), and any oakoss-specific color roles components need beyond shadcn's set. These are namespaced so they never collide with the interop core.

### Contract conformance

`@oakoss/tokens` **emits** a **contract manifest** — a generated JSON list of the required semantic token paths (the interop core plus required `oakoss.*` tokens, with `destructive-foreground` flagged optional). The dependency runs one way (`@oakoss/themes` → `@oakoss/tokens`), so tokens emits the manifest but does not validate themes against it — that would invert the dependency. Two checks consume the manifest, both running where the theme value-sets live:

1. **Shape (themes package / CI):** every theme value-set resolves every required path. A theme silently missing a variable — the drift [decision 011](../decisions/011-styling-layer-tailwind-v4.md) flagged — fails the themes build.
2. **Contrast (themes proposal):** WCAG 2.2 AA on the required foreground/background pairings. Out of scope here; the manifest gives that check its list of pairings to test.

The manifest is the single source of truth for "what a theme must provide," generated from the tier-2 source so it cannot drift from the contract it describes.

### Migration story

The scaffold's Radix-sourced `mauve.1–12` (shipped in [epic #21](https://github.com/oakoss/ui/issues/21)) was a correct tier-1 seed that proved the Terrazzo → Tailwind pipeline; this proposal **supersedes** it with the generated `mauve-50…950` and the rest of this system. No external consumer depends on it yet (the registry item doesn't exist until #36), so the replacement carries no migration cost; internal references update in the same change.

## Drawbacks

- **Generating AA-tuned ramps is real work** and a maintenance surface — a generation script, per-hue anchors, and contrast validation we own, versus importing Radix's hand-tuned values for free.
- **Overriding Tailwind's primitives** means a consumer who _wanted_ stock Tailwind reds now gets ours. That is the stated intent, but it is a surprise if undocumented; the consumer README (#38) must call it out.
- **Full-coverage scales** (spacing/type/radius as semantic tokens) are a larger contract for every theme to satisfy and validate than shadcn's color-plus-radius surface, and they diverge from Tailwind's native spacing/type DX.
- **Re-deriving the neutrals** rather than using Radix-exact values means our `mauve-500` won't byte-match a Radix/shadcn `mauve` — acceptable because interop is at the semantic layer (`--primary`), not primitive values, but it forecloses "pixel-identical to shadcn's Mauve theme."

## Alternatives

- **Reference + gap-fill primitives** (author ramps only where Tailwind can't supply a DTCG token, keep Tailwind's built-ins for everything else). Smaller tier-1, but leaves two numbering conventions and a partial palette. Rejected in favor of owning the whole palette uniformly.
- **Import the full Radix ramp library as tier-1** (Radix `1–12`, light/dark/alpha). Keeps Radix's hand-tuned perceptual work, but Radix's 12 steps can't be poured losslessly into Tailwind's 11-slot `50…950` without re-bucketing or breaking step semantics. Choosing uniform Tailwind numbering meant giving up Radix as the literal source; we keep Radix only as design reference.
- **shadcn-style inline literals** (tier-2 holds OKLCH values, no tier-1 reference). Simplest interop and byte-identical to shadcn, but discards the DTCG reference graph that [decision 009](../decisions/009-tokens-and-themes-via-registry.md) says is the reason to build oakoss themes at all. Rejected.
- **Match shadcn frozen** (contract is shadcn's set, nothing more). Maximum portability, smallest surface to validate, but no room for oakoss spacing/type semantics without a future breaking contract change. Rejected for an additive superset instead.
- **Color + radius only** (mirror shadcn's scale coverage exactly). Smallest contract, but cedes semantic spacing/type to ad-hoc per-component decisions. Rejected for full coverage.

## Unresolved questions

- **v1 seed ramp list.** Exactly which hues ship at v1 beyond the neutrals + `red` + chart hues, and how many neutrals (just `mauve`, or the full shadcn base-color set)?
- **Ramp generation parameters.** The lightness curve and per-hue chroma/hue anchors, and whether the generator targets specific Radix step landmarks or a fresh curve. Belongs in the tier-1 authoring follow-up, validated by the contrast check.
- **Spacing and type scale specifics.** Step counts, the modular ratio for type, and the exact `oakoss.space.*` / `oakoss.type.*` semantic role names.
- **Dark-mode primitives.** Whether tier-1 ships paired dark ramps or dark is purely a tier-3 resolution concern. Leaning tier-3 (themes own modes), but the generator may need dark stops; confirm with the themes proposal (#30).
- **`./dtcg` export shape.** The precise raw-source export contract `@oakoss/themes` consumes — coordinated with the themes proposal, not decided here.
