# ADR-0007: Fumadocs on Next.js for the docs site, Storybook 10 as secondary explorer

- **Status:** Accepted
- **Date:** 2026-05-26
- **Authors:** @jbabin91

## Context

The docs site has to host long-form prose, MDX-authored guidance, and live component playgrounds. Real-world 2026 DSes overwhelmingly pick Next.js (shadcn/ui v4, Mantine, Radix UI); Adobe and Red Hat build bespoke harnesses for very specific TS-source-extraction behavior; Carbon's Gatsby is legacy.

Fumadocs (MIT, 11.9k stars) is the framework shadcn/ui v4 chose, ships first-class component-playground support ("Fumadocs Story"), and pairs natively with Next.js App Router + React 19 + Tailwind v4 (the styling layer recommendation is pending — see [`../research/styling-layer-evaluation.md`](../research/styling-layer-evaluation.md)).

See [`../research/tooling-evaluation.md`](../research/tooling-evaluation.md) for the full docs-framework comparison.

## Decision

The docs site is **Fumadocs on Next.js**. **Storybook 10** is deployed alongside as the component explorer and visual / a11y test target (free hosting on Chromatic via the OSS plan), not as the primary docs site. Backlight is dead (shut down 2025-06-01), so the "single dual-purpose tool" option is not available regardless.

## Consequences

Easier: same stack as the most relevant 2026 reference (shadcn/ui v4). Fumadocs Story removes the "build your own playground" tax that Vocs, Nextra, and Starlight impose. App Router + React 19 + Tailwind v4 is the path of least resistance.

Harder: heavier build than Vocs or Starlight (acceptable for ~100 components, worth re-evaluating if scope balloons) and coupling to Next.js. The Fumadocs React Router and TanStack Start adapters exist but are less mature.

New risks: Fumadocs depends on Next.js's longevity. If TanStack Start matures into a credible Next alternative, the Fumadocs TanStack adapter is the safer long-term bet. Re-check at v1.0.

## Alternatives considered

- **Vocs.** MIT, used by Wagmi and Viem, but no out-of-the-box component playground — build your own.
- **Nextra v4.** 13.8k stars, MIT, but slowing (last release 2025-12-04).
- **Astro Starlight.** Content-heavy strength; no component playground OOTB.
- **Mintlify / Zeroheight.** Proprietary SaaS; Mintlify $250/mo Pro is steep and creates lock-in concerns.
