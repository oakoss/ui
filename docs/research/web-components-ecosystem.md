# Web Components Ecosystem

- **Status:** Decided. Multi-framework strategy is **React-primary + tokens-shared, defer WC implementation to post-v1.0**.
- **Date:** 2026-05-26
- **Scope:** Web Components landscape in 2026 + multi-framework architectural strategy
- **Related:** ADR-0003

## Decision

oakoss/ui ships React-first on React Aria Components. If a Web Components implementation is added later (post-v1.0):

- It will be written separately in its native idiom (Lit), not compiled from React source
- Both implementations will share `@oakoss/tokens` as the only contract between them
- The React implementation can ship in v0.1; the WC implementation is not committed to

## Multi-framework strategy options considered

| Pattern                                     | What it means                                                                       | Cost                                                                                           | Picked?                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------- |
| Carbon-style dual implementation            | Write twice (React + Lit), share tokens/design only                                 | ~2x maintenance forever; Carbon throws 40 unique committers/90 days at this                    | No                                     |
| Mitosis-style compile-once                  | Write in JSX-like DSL, compile to React/WC/Vue/Svelte                               | Painful DX; **RAC is fundamentally incompatible** (Mitosis can't compile hooks + render props) | No, dismissed                          |
| Lit-primary + React wrappers (UI5 model)    | WC is the source of truth, React wrappers generated                                 | WC becomes the canonical surface; React UX worse                                               | No, wrong fit for React-first audience |
| **React-primary + tokens-shared, defer WC** | Ship React on RAC; tokens framework-agnostic from day 0; add Lit later if justified | Lowest near-term cost; keeps option open                                                       | ✅                                     |

## Architectural commitments this implies (regardless of whether we ever ship WC)

- `@oakoss/tokens` lives in a framework-agnostic package as DTCG-compliant JSON
- A11y test corpus written against rendered DOM behavior (not React-specific) so the same tests can validate a future WC implementation
- Component metadata in a structured format (`react-docgen` JSON committed per component)
- Use native browser primitives where mature (popover, dialog, anchor positioning) so a React wrapper and a future WC wrapper share underlying browser semantics

## 2026 Web Components landscape

### Web Awesome (Shoelace successor)

Real, funded, shipping. Cory LaViska and Fonticons (Font Awesome). $786,282 Kickstarter (Mar–Apr 2024). v3.7.0 on May 12 2026 with monthly cadence. Built on Lit. MIT core plus paid Pro tier. **Materially weaker a11y posture** than RAC: docs say "Everything we develop will be built with accessibility in mind"; no published WCAG conformance claim, no APG mapping, no third-party audit. Not a substrate for our use case.

### oat.ink

Brand new (created 2026-01-15), v0.6.0, MIT, 5,242 stars. Single maintainer (Kailash Nadh, Zerodha CTO). Mostly vanilla CSS with Web Components only for components that need JS, closer to Pico CSS than to Shoelace. No React story. Interesting as a token-strategy reference; not a substrate.

### Shoelace

Archived. Repo `shoelace-style/shoelace` is `"archived": true`. Last npm `@shoelace-style/shoelace` is v2.20.1 (Mar 2025). Successor is Web Awesome.

### Polaris Web Components (Shopify)

**The biggest validation signal of any WC pivot in 2026.** Shopify deprecated `@shopify/polaris` React (archived Jan 2026) and GA'd Polaris Web Components in 2025-10. Strategic reasons: framework-agnostic distribution across Admin/Checkout/POS/Customer Accounts, eliminate React runtime overhead in UI extensions. **Architecture is unusual**: built on Shopify's own `remote-dom` library running in a Preact-based sandbox for extensions, not pure Lit or FAST. Sandbox-specific; not a model we'd replicate.

### Adobe Spectrum Web Components

Active, parallel to RAC. Apache-2.0, built on Lit. Adobe's own documented split: **RAC = build your own DS; Spectrum WC = framework-agnostic consumers (non-React Adobe products, partner integrations, web SDK embeds).** Adobe itself agrees RAC is the right substrate for a React-first DS.

### Carbon Web Components

Consolidated. Standalone repo archived 2023-03; both `@carbon/react` and `@carbon/web-components` now live as siblings under `carbon-design-system/carbon` with shared tokens. **Cleanest dual-implementation pattern in the wild**, and the model we'd follow if oakoss/ui ever went multi-framework.

### Microsoft Fluent UI Web Components

Stuck in RC. Stable v2.20.1 (Mar 2025); v3.x in RC since early 2026 (3.0.0-rc.20 on May 19 2026). Built on `@microsoft/fast-element`.

### Material Web (Google)

**In maintenance mode pending new maintainers.** Last release v2.4.1 (Oct 27 2025). Effective dead end.

### Open UI Initiative / native browser primitives (the underrated 2026 finding)

- **Popover API**: Baseline Newly Available — stable in every major browser
- **CSS anchor positioning**: Chrome 125+, Firefox 132+, Safari 18.2+ (full `@position-try` in 18.4+); Interop 2026 focus area
- **`<dialog>`**: universal; `closedby="any"` in Chrome 134+
- **Customizable `<select>`** (`appearance: base-select`): Chrome 134+
- **`command`/`commandfor` invokers**: Chrome 135+
- **View Transitions** (cross-document): Interop 2026 focus area

A "**shadow conformance**" pattern is emerging: newer DSes wrap native primitives directly instead of re-implementing positioning logic. Worth designing oakoss/ui to follow suit (RAC's roadmap is moving this direction).

## Mitosis specifically: dismissed with evidence

`BuilderIO/mitosis`: 13,838 stars. Two contributors carry the project (`steve8708` 721 commits = Builder.io CEO; `samijaber` 487 commits). Between v0.12.1 (Jul 2025) and v0.13.0 (Jan 2026) the main branch saw essentially one commit cluster, then four more months quiet through May 2026.

Mitosis is a DSL, not idiomatic JSX. Requires `useStore` (its own), `<Show>`/`<For>` instead of `if`/`.map()`. **RAC compatibility is essentially zero.** RAC is hooks-and-render-props depending on stable React context propagation and refs; Mitosis's static control flow plus Mitosis-specific `useStore` cannot author a RAC composition and emit correct React. Voorhoede's published case study: _"I would not create a design system with Mitosis as its core yet."_

For oakoss/ui, **per-framework rewriting is cheaper than a Mitosis port** because RAC's design has no equivalent in Vue/Svelte/Solid; those rewrites would happen regardless.

## Synthesis

The 2026 WC moment is **real for framework-agnostic distribution surfaces** (Shopify, IBM, Adobe-external) and **not for React DS substrates inside React apps**. Adobe's own documented guidance confirms this. No WC library reopens the RAC decision.

## Sources

- Web Awesome: `webawesome.com/docs/frameworks/react/`, `webawesome.com/docs/resources/accessibility`, `shoelace-style/webawesome` (gh API), Kickstarter / BackerKit data, `blog.fontawesome.com/introducing-web-awesome/`
- oat.ink: `oat.ink`, `knadh/oat` (gh API)
- Shopify Polaris React (archived) and Web Components: `Shopify/polaris-react` (gh API), `shopify.com/partners/blog/polaris-unified-and-for-the-web`, `shopify.dev/docs/api/polaris/using-polaris-web-components`
- Adobe Spectrum Web Components: `adobe/spectrum-web-components` (gh API), `opensource.adobe.com/spectrum-web-components/`
- Carbon: `carbon-design-system/carbon` monorepo with `packages/react` + `packages/web-components`
- Microsoft Fluent UI WC: `microsoft/fluentui` monorepo + npm `@fluentui/web-components` dist-tags
- Material Web: `material-components/material-web` README + v2.4.1 release
- USWDS Elements: `uswds/uswds-elements` (alpha.6 Dec 2025, single beta component)
- Interop 2026: `web.dev/blog/interop-2026`, `hacks.mozilla.org/2026/02/launching-interop-2026/`, `webkit.org/blog/17818/`, `github.com/web-platform-tests/interop`
- Mitosis: `BuilderIO/mitosis` (gh API), `@builder.io/mitosis` npm, Mitosis quickstart docs, Voorhoede production report
