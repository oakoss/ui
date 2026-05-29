# Token taxonomy

- **Status:** Draft
- **Comment period ends:** TBD (not yet opened for comment)
- **Authors:** @jbabin91
- **Related:** [decision 011](../decisions/011-styling-layer-tailwind-v4.md) (deferred token taxonomy to a proposal), [decision 004](../decisions/004-dtcg-tokens-with-terrazzo.md), [decision 009](../decisions/009-tokens-and-themes-via-registry.md), [tokens & themes architecture](../research/tokens-and-themes-architecture.md), epic #21 (`@oakoss/tokens` scaffold)

## Summary

Define the token taxonomy for `@oakoss/tokens` — the tier structure, naming, scales, and the semantic contract that themes resolve against. This is the "B" track of the A→B-parallel plan: the `@oakoss/tokens` scaffold ([epic #21](https://github.com/oakoss/ui/issues/21)) proves the Terrazzo→Tailwind pipeline now with a placeholder Mauve primitive ramp; this proposal decides the real system that replaces it.

## Motivation

Token naming is public-API-shaped surface consumers depend on and the thing they most want to fork. Decision 011 explicitly deferred it here rather than letting the scaffold set it implicitly. Getting the tiers and the semantic contract right avoids churning every downstream component, theme, and consumer.

## Detailed design

To be written. The starting model (from the [tokens & themes architecture](../research/tokens-and-themes-architecture.md) research) is three tiers:

1. **Primitive / reference** — raw ramps + scales (no meaning)
2. **Semantic / contract** — meaning assigned, references primitives; adopt the shadcn semantic contract for ecosystem interop
3. **Theme / mode** — resolution of the contract against a palette (lives in `@oakoss/themes`)

Tiers 1–2 live in `@oakoss/tokens`; tier 3 in `@oakoss/themes`.

## Drawbacks

To be written.

## Alternatives

To be written.

## Unresolved questions

From the [research note](../research/tokens-and-themes-architecture.md) (taxonomy-scoped; the last is cross-cutting with the themes proposal):

- Tier-1 naming: Radix-style 12-step ramps? Tailwind numerics? How many ramps ship at v1?
- Does the tier-2 semantic contract live in `@oakoss/tokens` (the research recommends yes) and exactly match shadcn's names, or extend them?
- Spacing / type / radius scales: source and naming.
- Contract-shape validation: how theme variants are checked against the tier-2 contract (distinct from the themes proposal's AA-contrast check).

> Draft stub — captures the deferred taxonomy decision so it isn't lost. Flesh out and open for comment before authoring the real tokens (it runs parallel to the scaffold, not blocking it).
