# Primitive Layer Evaluation

- **Status:** Decided — React Aria Components
- **Date:** 2026-05-26
- **Scope:** Headless React primitive library powering oakoss/ui's behavior and accessibility layer
- **Related:** [decision 001](../decisions/001-react-aria-components-as-primitive-layer.md)

## Decision

React Aria Components (RAC, `react-aria-components`) is the primitive layer for oakoss/ui.

## Requirements that drove this

- React-only (multi-framework deferred to post-v1.0; see [`web-components-ecosystem.md`](web-components-ecosystem.md))
- Accessibility shipped first-party: i18n, RTL, drag-and-drop, virtualization
- Full-system scope (~50 component target)
- Compatible with shadcn-style registry distribution

## Options evaluated

| Library                   | i18n                                           | RTL                                      | DnD                                | Virtualization                                                                      | DatePicker                                                                                                | Maintainer health (90d)                                                                     | Verdict                                        |
| ------------------------- | ---------------------------------------------- | ---------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| **React Aria Components** | 37 locales                                     | Full                                     | `useDragAndDrop` (keyboard + SR)   | `Virtualizer` (v1.17 added horizontal + window-scroll)                              | Full (DateField, DatePicker, DateRangePicker, Calendar, 7 calendar systems via `@internationalized/date`) | 232 commits in 90 days; all 5 top committers are Adobe employees                            | ★ Chosen                                       |
| Base UI (MUI team)        | RTL was broken until v1.5.0 (May 19 2026)      | Patchy                                   | None                               | Userland only (Combobox `virtualized` prop hooks to TanStack Virtual)               | Absent — issues #1709, #3332 open 12+ months                                                              | 469 commits, 7 paid MUI staff                                                               | Strong engineering but fails a11y requirements |
| Ark UI (Chakra team)      | `LocaleProvider` via `@internationalized/date` | Yes                                      | None                               | Userland                                                                            | Full                                                                                                      | 100 commits ark + 254 zag; **Segun ≈ 85–90% of all human commits**                          | Bus factor concern; missing DnD                |
| Ariakit (Diego Haz)       | None — no LocaleProvider, no locale prop       | Undocumented (#2930 closed without docs) | None (0 issues even discussing it) | Experimental (`CollectionRenderer`/`SelectRenderer` only; "API will likely change") | None (#1890 open since 2022)                                                                              | ~97% of human commits in last 180 days from Diego Haz; ~$170/mo on Open Collective          | Disqualified — fails all 4 a11y requirements   |
| Radix UI                  | n/a                                            | n/a                                      | n/a                                | n/a                                                                                 | n/a                                                                                                       | Last stable Aug 13 2025; only RC builds since; last `main` commit Feb 13 2026 is a CI tweak | Coasting; not viable for a new project         |

Also surveyed and dismissed: Headless UI (too narrow, 15 components; Tailwind Labs now recommends paid Catalyst on top of it), Floating UI (positioning library, not a primitive layer), HeroUI primitives (none published separately from styled lib), native browser APIs alone (insufficient for a full DS; see [`web-components-ecosystem.md`](web-components-ecosystem.md)), build-your-own (6–18 engineer-months of work that vendors solve better).

## Reasoning

RAC is the only contender shipping i18n + RTL + DnD + virtualization as first-party primitives. Each of the others requires bolting on at least two of these with third-party libraries, which means integration risk, version skew, and a11y testing burden on the seams.

Concrete evidence beyond requirements:

- 37 locales documented; 5 SR/browser test matrix published (VoiceOver/Safari+Chrome, JAWS/Firefox+Chrome, NVDA, iOS, TalkBack/Android). No peer publishes anything comparable.
- `useDragAndDrop` ships keyboard + screen reader DnD out of the box, which is the hardest a11y problem in DnD.
- `Virtualizer` expanded in v1.17 (Apr 2026) with horizontal and window-scroll modes.
- Adobe ships Spectrum 2 (`@react-spectrum/s2`) monthly on top of RAC; the dogfooding is real and continuous.
- **JollyUI** proves the RAC + shadcn-CLI-compatible registry combination works, which kills the "registry distribution risk" concern raised early in the evaluation.

## Honest tradeoffs

- **247 KB gzipped if barrel-imported.** Mitigation: adopt v1.17's sub-path imports (`react-aria-components/Button`). Non-negotiable for the registry model.
- **Composition is more verbose** than Radix/Base UI (`DialogTrigger > Button + Modal > Dialog > Heading slot="title"` for a basic case). Initial authoring tax; does not compound.
- **600 open issues** vs Base UI's 315, but closure rate is healthy (18 closed in last 7 days at time of investigation).
- **WCAG conformance level not explicitly claimed** on the quality page. A curious gap to flag: the docs reference WCAG as "a good resource" rather than asserting AA conformance.
- **Adoption asymmetry**: ~2.8M weekly downloads vs `@radix-ui/react-dialog` at ~53.9M. Fewer copy-paste examples; LLMs default to Radix patterns. Mitigated by Adobe's own examples plus JollyUI / HeroUI / IntentUI references.

## Production users beyond Adobe

- HeroUI (formerly NextUI). Homepage states: "built on React Aria and Tailwind CSS v4"
- JollyUI: shadcn-CLI-compatible RAC registry
- IntentUI
- WordPress Gutenberg (uses Ariakit, not RAC, but cited as an a11y-rigorous React DS for comparison)

## Sources

- React Aria Components v1.17.0 release notes (Apr 2026)
- `adobe/react-spectrum` GitHub API: commits, releases, issues
- `mui/base-ui` GitHub + v1.5.0 release notes
- `chakra-ui/ark` + `chakra-ui/zag` GitHub
- `ariakit/ariakit` GitHub + Open Collective + WordPress Gutenberg migration PRs (#55580, #48440, #63564, #63123)
- `adobe/react-spectrum/packages/@react-spectrum/s2/src/Button.tsx` — composition pattern
- bundlephobia per-package size data
- npm registry download stats (May 19–25 2026)
- JollyUI homepage and changelog (shadcn CLI support)
- React Advanced 2025 — "Building Interactive Async UI with React 19 and Ariakit" (Aurora Scharff)
- InfoQ: Base UI v1 with 35 components (Feb 2026)
- shadcn changelog 2026-01 (Base UI registry) and 2026-02 (unified Radix UI Package)
