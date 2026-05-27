# Tooling Evaluation — Testing & Docs

- **Status:** Recommendation. Chromatic with Argos fallback; jsx-a11y + addon-a11y; Fumadocs on TanStack Start + Storybook 10.
- **Date:** 2026-05-26
- **Scope:** Visual regression CI, accessibility CI, documentation site framework
- **Related:** [visual testing](visual-testing-with-chromatic.md), [accessibility testing](accessibility-testing-with-storybook-addon-a11y.md), [fumadocs on TanStack Start](fumadocs-on-tanstack-start-for-docs.md)

## Decisions

| Layer                            | Pick                                                                                                | Fallback                                                      |
| -------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Visual regression CI             | Chromatic free OSS tier (35k Chrome snapshots/mo)                                                   | Argos (MIT, 5k snapshots/mo) if Chromatic eligibility rejects |
| A11y CI                          | `eslint-plugin-jsx-a11y` + `@storybook/addon-a11y` with test-runner `parameters.a11y.test: 'error'` | `@axe-core/playwright` for docs-site E2E once we have it      |
| Docs framework                   | Fumadocs on TanStack Start                                                                          | Fumadocs on Next.js (the original recommendation)             |
| Component explorer + test target | Storybook 10                                                                                        | —                                                             |

## Visual regression CI

### Options compared

| Tool                                | License                           | OSS pricing (2026)                                                                                                                                         | Storybook native | Playwright native                 | Status                                                         |
| ----------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------- | -------------------------------------------------------------- |
| **Chromatic**                       | Proprietary SaaS (Storybook team) | **35k snapshots/mo, Chrome only**; eligibility: 100+ contributors OR 40k weekly npm downloads OR 10k stars OR 5+ contributors for company/government-built | First-class      | Yes (`@chromatic-com/playwright`) | Active; `chromatic` v17.0.1 today                              |
| **Argos**                           | MIT, fully OSS (`argos-ci/argos`) | Hobby: 5,000 screenshots/mo free                                                                                                                           | Yes              | Yes                               | Active, pushed today; cloud + self-hostable                    |
| **Lost Pixel**                      | MIT engine                        | —                                                                                                                                                          | Was              | Was                               | **Dead.** Repo archived 2026-04-22 (joined Figma)              |
| **Percy** (BrowserStack)            | Proprietary SaaS                  | Pricing page 404 today                                                                                                                                     | Yes              | Yes                               | Maintained but opaque pricing                                  |
| **Playwright `toHaveScreenshot()`** | Apache 2.0, built-in              | $0                                                                                                                                                         | Story URL only   | Native                            | Mature, but **no PR review UI**; reviewers must pull branches  |
| **Vitest browser mode VRT**         | MIT, built-in (v5)                | $0                                                                                                                                                         | Indirect         | Via providers                     | First-class in v5.0.0-beta.3 (2026-05-19); no PR review UI yet |

### Reasoning

Chromatic free OSS tier is the path of least friction:

- 35k snapshots/mo handles a single-library Storybook comfortably
- Chrome-only is a v0.1-acceptable limitation
- oakoss/ui qualifies under the company-built clause with just 5+ contributors

If Chromatic rejects the application, Argos is MIT, healthy, and 5k snapshots/mo on the free tier is enough for one library's PR smoke checks.

**Playwright `toHaveScreenshot` alone is insufficient.** No PR review UI is a major usability cost; reviewers have to pull branches locally to inspect diffs. Use it only as a no-budget fallback.

## Accessibility CI

### Options compared

| Tool                                                        | Catches                                                                                         | Best fit                                                |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **axe-core** (Deque)                                        | The engine everything wraps; WCAG 2.1/2.2 rules — contrast, ARIA misuse, focus, name/role/value | Underneath everything else                              |
| **`@storybook/addon-a11y`** v10.4.1                         | Per-story axe scans via test-runner; fails CI when `parameters.a11y.test: 'error'`              | Component-level a11y in CI with per-story granularity   |
| **`@axe-core/playwright`** v4.11.3                          | Whole-page scans in Playwright tests                                                            | Integration/page-level a11y in E2E                      |
| **`@axe-core/react`** v4.11.3                               | Logs violations to dev console during render                                                    | Dev-time only, not CI                                   |
| **`@axe-core/cli`** v4.11.3                                 | Scans deployed URLs                                                                             | Smoke test against deployed docs                        |
| **Pa11y**                                                   | HTMLCS or axe-core wrapper                                                                      | Niche; addon-a11y covers the same ground with better DX |
| **`eslint-plugin-jsx-a11y`** v6.10.2 (last publish 2024-10) | Static AST checks: missing alt, `tabIndex`, role validity                                       | Lint-time baseline, mandatory                           |
| **`eslint-plugin-react-aria`**                              | **Does not exist.** Verified; npm 404                                                           | —                                                       |

### Important finding

**There is no React Aria-specific ESLint plugin.** RAC consumers rely on `eslint-plugin-jsx-a11y` plus runtime axe checks. `eslint-plugin-jsx-a11y` is slow-moving (last publish 18+ months ago); useful for native-element mistakes but cannot reason about RAC's render output. The real a11y net is **`@storybook/addon-a11y` running axe against rendered stories in CI**.

### Layered defense for v0.1

1. `eslint-plugin-jsx-a11y`: static lint baseline
2. `@storybook/addon-a11y` with `parameters.a11y.test: 'error'`: component-level runtime axe in CI
3. `@axe-core/playwright`: added when E2E tests exist (post-v0.1)

## Documentation site framework

### Real-world DS docs in 2026 (verified from source)

| Design system             | Docs stack                                             |
| ------------------------- | ------------------------------------------------------ |
| **shadcn/ui** (apps/v4)   | **Next.js + Fumadocs MDX**                             |
| **React Aria / Spectrum** | Custom Parcel build with bespoke transformers          |
| **Mantine**               | Next.js (static export to GitHub Pages)                |
| **Radix UI**              | Next.js (bootstrapped with `create-next-app`)          |
| **Carbon**                | Gatsby + `gatsby-theme-carbon` (legacy choice)         |
| **PatternFly**            | Custom `@patternfly/documentation-framework` on Rspack |

The pattern: mature React-first DSes overwhelmingly pick Next.js (shadcn, Mantine, Radix). Adobe and Red Hat build bespoke harnesses because they want very specific TS-source-extraction behavior. Carbon's Gatsby choice is a legacy artifact.

### Options compared

| Framework       | License          | Stars | Component playground                                  | Used by                               |
| --------------- | ---------------- | ----- | ----------------------------------------------------- | ------------------------------------- |
| **Fumadocs**    | MIT              | 11.9k | "Fumadocs Story" — live playgrounds for UI components | shadcn/ui v4                          |
| Vocs            | MIT              | 1.5k  | None OOTB (build with MDX)                            | Wagmi, Viem                           |
| Nextra v4       | MIT              | 13.8k | Build your own                                        | Last release 2025-12-04 — slowing     |
| Astro Starlight | MIT              | 8.5k  | None OOTB                                             | Content-heavy docs                    |
| Storybook 10    | MIT              | 90k   | Native, world-class                                   | Use as **secondary** test target      |
| Mintlify        | Proprietary SaaS | —     | Yes                                                   | $250/mo Pro is steep; lock-in concern |
| Zeroheight      | Proprietary SaaS | —     | No                                                    | $49/editor/mo                         |
| Backlight       | —                | —     | —                                                     | **Dead.** Shut down 2025-06-01        |

### Reasoning

**Fumadocs on TanStack Start** ships first-class component-playground support ("Fumadocs Story") that competing frameworks make you build yourself, and stays aligned with the TanStack ecosystem we already use elsewhere. Fumadocs 15.2 made TanStack Start a first-class target (alongside Next.js, React Router, and Waku), so the "less mature adapter" caveat that drove the original Next.js recommendation no longer applies as of 2026-05-27.

**Tradeoffs:**

- Fewer "production DS docs sites on TanStack Start" reference points than the Next.js stack (shadcn/ui v4, Mantine, Radix UI all use Fumadocs-on-Next.js)
- Heavier build than Vocs/Starlight (acceptable for ~100 components)
- Less brand-distinct out of the box than a custom Next site (more flexible than Nextra)

**Storybook 10** deployed alongside as the component explorer and visual/a11y test target (free hosting on Chromatic via OSS plan), not as the primary docs site.

## Reconsider at v1.0

- If snapshots exceed 35k/mo: evaluate Argos Pro ($100/mo) or Chromatic Starter ($179/mo) for Safari/Firefox coverage
- If self-hostable visual testing becomes a requirement (regulated industries, air-gapped CI): Argos is the only credible MIT option
- Add `@axe-core/playwright` once we have E2E coverage of the docs site
- Watch Vitest browser-mode VRT. Could collapse "Storybook + Chromatic" into "Vitest + Argos" once the review-UI gap closes.
- Re-check for `eslint-plugin-react-aria`. Plausible the Adobe team or community publishes one.
- If TanStack Start regresses in stability or its plugin/SSR semantics shift painfully, fall back to Fumadocs on Next.js (the previous recommendation). Re-check at v1.0.

## Sources

- Chromatic pricing + OSS docs + Playwright integration (`chromatic.com/pricing`, `/docs/open-source/`, `/docs/playwright/`)
- Argos: `argos-ci.com/pricing`, `argos-ci/argos` (gh API)
- Lost Pixel: `lost-pixel.com`, `lost-pixel/lost-pixel` (archived)
- Playwright snapshot testing docs (`playwright.dev/docs/test-snapshots`)
- Vitest browser visual regression docs (`vitest.dev/guide/browser/visual-regression-testing`)
- Storybook a11y addon (`storybook.js.org/docs/writing-tests/accessibility-testing`)
- axe-core (`dequelabs/axe-core` gh API), `@axe-core/playwright` v4.11.3
- `eslint-plugin-jsx-a11y` v6.10.2 (npm); `eslint-plugin-react-aria` 404 (verified non-existence)
- Fumadocs: `fumadocs.dev`, `fuma-nama/fumadocs` (gh API)
- shadcn/ui apps/v4 package.json (confirms Next.js + Fumadocs MDX)
- Mantine apps/mantine.dev package.json (Next.js)
- Adobe `react-spectrum` `.parcelrc` (custom Parcel)
- PatternFly `@patternfly/documentation-framework` on Rspack
- Carbon `carbon-website` package.json (Gatsby)
- Backlight shutdown notice (June 2025)
