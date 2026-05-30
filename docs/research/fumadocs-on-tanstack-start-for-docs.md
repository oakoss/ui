# Fumadocs on TanStack Start for the docs site, Storybook 10 as secondary explorer

- **Status:** Adopted (2026-05-29)
- **Date:** 2026-05-27 (researched), 2026-05-29 (adopted)
- **Scope:** Docs-site framework and component explorer
- **Note:** This is a research recommendation, not an ADR — per [decisions/README](../decisions/README.md) (line 18), docs-site-framework choices live here, not in `decisions/`.
- **Related:** [tooling evaluation](tooling-evaluation.md), [styling layer evaluation](styling-layer-evaluation.md)

## Context

The docs site has to host long-form prose, MDX-authored guidance, and live component playgrounds. Real-world 2026 DSes overwhelmingly pick Next.js (shadcn/ui v4, Mantine, Radix UI); Adobe and Red Hat build bespoke harnesses for very specific TS-source-extraction behavior; Carbon's Gatsby is legacy.

Fumadocs (MIT) was originally a Next.js-only framework, but **Fumadocs 15.2** extended `fumadocs-core` with first-class support for additional React frameworks — explicitly: TanStack Start, React Router, and Waku. The TanStack Start integration ships an official Vite-based template (`@tanstack/react-start/plugin/vite`) wired with `fumadocs-mdx/vite`, Tailwind v4, and prerendering enabled by default. The "less mature adapter" caveat in the original write-up no longer applies as of 2026-05-27.

The docs/demo/recipe layer is **intended** to be TanStack-heavy going forward: TanStack Router/Query for the app shell, `@tanstack/react-table` for data-table recipes. Adopting TanStack Start is a forward commitment to that direction. At adoption time the only committed TanStack dependency is `@tanstack/react-table` (in a v0.2 epic), so this rests on intended direction, not current usage. The rationale for accepting pre-1.0 TanStack Start over the precedent-heavy Next.js stack: that intended TanStack app layer, the faster Vite dev server, and Fumadocs' framework-agnostic core (a later switch to Next.js is a host-config change, not a content rewrite).

See [`tooling-evaluation.md`](tooling-evaluation.md) for the full docs-framework comparison.

## Recommendation

The docs site is **Fumadocs on TanStack Start**, using the official Vite + `@tanstack/react-start/plugin/vite` + `fumadocs-mdx/vite` + `@tailwindcss/vite` setup with prerendering enabled. **Storybook 10** is deployed alongside as the component explorer and visual / a11y test target (visual regression via self-hosted Playwright — see [visual regression testing](visual-regression-testing.md)), not as the primary docs site. Backlight is dead (shut down 2025-06-01), so the "single dual-purpose tool" option is not available regardless.

## Adoption note (2026-05-29)

Adopted as written on the host framework, with the rationale corrected. The original write-up justified TanStack Start by "ecosystem coherence," but at adoption time the only committed TanStack dependency in the repo was `@tanstack/react-table` (a v0.2 epic) — the broader coherence was speculative. The basis as corrected in Context: an **intended** TanStack-heavy app layer, Vite dev speed, and Fumadocs' framework-agnostic escape hatch. Fallback trigger: if TanStack Start's pre-1.0 upstream (plugin API / SSR semantics) becomes a blocker, fall back to Fumadocs on Next.js (a host-config change, not a content rewrite) and re-check at v1.0.

## Consequences

Easier: alignment with the intended TanStack-heavy app layer (today only `@tanstack/react-table`, in a v0.2 epic). Vite-based dev server is faster than Next.js's. Fumadocs 15.2's framework-agnostic split (`fumadocs-core` + per-framework adapter) means the doc-tooling investment moves cleanly if we ever change host frameworks again. Fumadocs Story removes the "build your own playground" tax that Vocs, Nextra, and Starlight impose.

Harder: fewer "production DS docs sites on TanStack Start" reference points than Next.js (shadcn/ui v4, Mantine, and Radix UI all use Next.js for their docs). TanStack Start is younger and has fewer war stories. The bus factor on the TanStack Start adapter is narrower than the Next.js one.

New risks: TanStack Start itself is still pre-1.0 at the time of writing; its plugin API and SSR semantics could shift. Mitigation: Fumadocs's framework-agnostic core means a switch back to Next.js (or sideways to React Router) is mostly a host-config change, not a rewrite of MDX content or component playgrounds.

## Alternatives considered

- **Fumadocs on Next.js.** The original recommendation. Strongest precedent (shadcn/ui v4 uses this exact stack), most production references. Fall back here if TanStack Start's adapter or upstream stability becomes a blocker. Re-check at v1.0.
- **Fumadocs on React Router.** Also officially supported in 15.2. Reasonable if we want Remix-style data routing without TanStack lock-in. Less ecosystem alignment for us than TanStack Start.
- **Vocs.** MIT, used by Wagmi and Viem, but no out-of-the-box component playground — build your own.
- **Nextra v4.** 13.8k stars, MIT, but slowing (last release 2025-12-04).
- **Astro Starlight.** Content-heavy strength; no component playground OOTB.
- **Mintlify / Zeroheight.** Proprietary SaaS; Mintlify $250/mo Pro is steep and creates lock-in concerns.

## Sources

- Fumadocs 15.2 framework-agnostic support (Next.js, TanStack Start, React Router, Waku), official Vite + TanStack Start template, and prerendering defaults — verified via context7 query against `/fuma-nama/fumadocs` (2026-05-27)
- TanStack Start Vite plugin (`@tanstack/react-start/plugin/vite`) and Tailwind v4 integration (`@tailwindcss/vite`) — per the Fumadocs example fixture at `packages/create-app/test/fixtures/tanstack-vite-config.txt`
- Production references on Fumadocs+Next.js (shadcn/ui v4, Mantine, Radix UI) — from an earlier (never-ratified) docs-framework draft (2026-05-26); not re-verified
- Backlight shutdown date (2025-06-01) — from the same draft; not re-verified
- Alternatives table metadata (Vocs license + users, Nextra v4 stars + last release, Astro Starlight + Mintlify/Zeroheight characteristics) — from the same draft, cross-referenced against `tooling-evaluation.md`'s Sources; not re-verified
