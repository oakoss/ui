# Enterprise Design System References

- **Status:** Reference. None became a primitive layer for oakoss/ui; all are architectural, governance, or scope references.
- **Date:** 2026-05-26
- **Scope:** Patterns to borrow (and avoid) from 21 enterprise design systems surveyed

## Why this exists

The primitive layer decision is locked (React Aria Components). None of the enterprise DSes surveyed here became a primitive candidate; all ship fully-styled components with no separately published headless layer. They collectively offer the best architectural, governance, and scope-management patterns for an OSS enterprise DS in 2026.

## Patterns to borrow

### Governance (Carbon + GOV.UK + USWDS)

- **Separate `oakoss/proposals` repo** with documented proposal workflow, 3-day FCP, weekly review (Carbon's model)
- **Separate `oakoss/roadmap` repo** with GitHub Projects board, Experimental → Alpha → Beta → RC → GA status labels (Carbon's model)
- **Three-stage proposal flow** (propose → develop → review) with a named working group (GOV.UK's model)
- **45-day public comment window** for new component proposals (USWDS's model)
- **Long-tail dist-tags** (`latest-v0`, `latest-v1`, etc.) so enterprise consumers can stay on major versions without forking (GOV.UK's `govuk-frontend` model)
- **`.all-contributorsrc`, `developer-handbook.md`, `style.md`, `postmortems/`** visible at the repo root as external-contributor signals (Carbon)

### Docs IA per component page (GOV.UK — the gold standard)

1. When to use
2. When not to use
3. How it works
4. Research
5. Accessibility
6. Discussion (link to GitHub)

Almost no React DS in 2026 ships these six sections per component. Differentiates oakoss/ui at the docs-quality level.

### Composition pattern (Adobe Spectrum 2 `Button.tsx`)

```ts
import { Button as RACButton, ButtonProps as RACButtonProps } from 'react-aria-components/Button';
import { ContextValue } from 'react-aria-components/slots';

export const ButtonContext = createContext<ContextValue<Partial<ButtonProps>, ...>>(null);
// Omit RAC className/style/render, add your own StyleProps, wrap with focusRing/pressScale helpers
```

Textbook RAC-based DS pattern. Copy it.

### Package architecture (Carbon + Spectrum 2)

- Per-component subpath exports: `import { Button } from '@oakoss/ui/Button'`
- `./private/*: null` exports guard so consumers can't reach into internals
- Tokens published separately (`@oakoss/tokens` ships JSON; component packages consume)
- Multi-framework org structure (Carbon's `packages/react`, `packages/web-components`, etc. siblings under one monorepo with shared tokens). Model to copy if we ever go multi-framework.

### Token architecture

Two strong candidates from the survey:

- **PatternFly's 3-layer model**: Palette → Base → Semantic, with naming `--prefix--[scope]--[component]--[property]--[concept]--[variant]--[state]` and emit shape `{name, value, var}`. The most defensible naming scheme found.
- **Ant Design's Seed → Map → Alias hierarchy** with algorithm derivation (`darkAlgorithm`, `compactAlgorithm`). More powerful but more complex.

Pair with our DTCG decision ([`architectural-standards.md`](architectural-standards.md)): DTCG describes the JSON shape; PatternFly/Ant Design describe the naming and derivation strategy.

### Semantic props (Ant Design v6)

Every component exposes `classNames` + `styles` props for named DOM slots:

```tsx
<Dialog classNames={{ header, body, footer }} styles={{ backdrop: { ... } }}>
```

Solves the "how do I style the internals" problem cleanly. Ship from v0.1; retrofitting later means breaking changes.

### Theming distribution (Semi Design)

Themes ship as versioned npm packages (`@oakoss/theme-default`, `@oakoss/theme-brand-x`); tenants pin a theme version. Strong governance pattern for multi-brand enterprise.

### Foundation/Adapter pattern (Semi Design)

DOM-free business logic in a `*-foundation` package; framework adapters on top. Cheap if planned from day 0, expensive to retrofit. Aligns with our defer-WC-to-post-v1.0 strategy (see [`web-components-ecosystem.md`](web-components-ecosystem.md)).

### Component-status taxonomy (Twilio Paste)

`backlog` / `alpha` / `beta` / `stable` enforced via `package.json` schema in `CONTRIBUTING.md`. Each component declares its status explicitly. Aligns with the roadmap status labels.

### i18n message packs (Cloudscape)

`src/i18n/messages/all.<locale>.json` with `<I18nProvider>` and `intl-messageformat`. Cloudscape ships 15 locales including Arabic for RTL: the strongest i18n investment of the four. Less critical for us since RAC already ships 37 locales, but the structure is worth borrowing for any oakoss-specific strings (component status badges, error microcopy).

### AI-era integration (Ant Design v6 + UI5 + TDesign)

- MCP server package for AI assistant integration (UI5's `@ui5/mcp-server`; Ant Design's `@ant-design/cli` with `mcp` subcommand is a comparative reference, though we ship a server rather than a CLI)
- Keep AI components (Chat, Markdown, JsonViewer) in a separate `@oakoss/aigc` package, not core (TDesign's `tdesign-react-aigc` separation)
- See [`architectural-standards.md`](architectural-standards.md) for the concrete deliverables

### Content guidelines (GOV.UK)

Plain-language style guide, error message format, button labels, microcopy. Almost no React DS in 2026 ships this. Meaningful differentiation.

### Telemetry transparency (Carbon)

`@ibm/telemetry-js` with documented opt-out and `telemetry.yml`. Disclosed-and-configurable, not silent collection.

### License clarity (USWDS)

USWDS is CC0 / public domain. For our use, MIT is standard. The lesson is to state the license unambiguously in `LICENSE` at root, not buried in README.

## Anti-patterns to actively avoid

| Anti-pattern                         | Source                                                   | Lesson                                                                                                   |
| ------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| "Bug-fixes only" contribution policy | AWS Cloudscape                                           | Kills external community; tank an OSS launch                                                             |
| "No plan for WCAG"                   | Ant Design maintainer statement                          | A11y must be a stated, measured priority; see [`../accessibility/README.md`](../accessibility/README.md) |
| React deprecation in favor of WC     | Shopify Polaris (Jan 2026)                               | Pick distribution model carefully; switching costs are real                                              |
| Vendor-collapse death spiral         | VMware Clarity (Broadcom acquisition → React story dead) | Build governance that survives sponsor changes                                                           |
| Library frozen post-acquisition      | Tremor (Vercel Jan 2025; NPM frozen since)               | If we ever add charts, plan to build or fork, not depend                                                 |

## Quick verdicts on the dismissed-as-primitive enterprise libs

All ship fully-styled components and internally consume the same headless libraries we'd use directly. Wrapping their styled output to strip styles would mean shipping CSS just to delete it.

- **Microsoft Fluent UI v9** (`@fluentui/react-components`): styled, depends on Griffel runtime + FluentProvider; no separately published primitive layer
- **GitHub Primer**: `@primer/primitives` is design tokens (CSS/JSON), not headless React; `@primer/react` is the styled component layer
- **Atlassian Design System** (`@atlaskit/primitives`): layout primitives only (`Box`, `Inline`, `Stack`), not behavioral. Atlassian's `@atlaskit/pragmatic-drag-and-drop` (~832k weekly) is a DnD complement candidate for Jira-scale lists
- **WorkOS post-Radix acquisition**: no successor library, no announced refresh; Radix remains in maintenance mode
- **GitLab Pajamas** (`gitlab-ui`): archived; Vue-only
- **All four Asian DSes** (Ant Design, Arco, Semi, TDesign): primarily styled libraries; a11y posture is the dealbreaker for any enterprise/regulated consumer (US federal, EU EAA 2025, UK PSBAR). Strong architectural references; non-viable as direct deps

## Sources

- Carbon Design System: `carbon-design-system/carbon` (gh API), `carbon-design-system/rfcs`, `carbon-design-system/roadmap`, `carbondesignsystem.com/guidelines/accessibility/overview/`
- AWS Cloudscape: `cloudscape-design/components` (gh API), `cloudscape.design/components/`, `CONTRIBUTING.md`
- Red Hat PatternFly: `patternfly/patternfly-react` (gh API), `patternfly.org/tokens/about-tokens/`, `patternfly.org/accessibility/about-accessibility`
- Shopify Polaris: `Shopify/polaris-react` (archived), `shopify.dev/docs/api/polaris/using-polaris-web-components`
- Twilio Paste: `twilio-labs/paste` (gh API), `paste.twilio.design`
- Adobe Spectrum 2: `adobe/react-spectrum/packages/@react-spectrum/s2/` (Button.tsx, package.json, style/), `rfcs/2023-react-aria-components.md`
- VMware Clarity: `vmware-clarity/core` (archived), `vmware-clarity/ng-clarity` (Angular still alive)
- SAP UI5 React: `SAP/ui5-webcomponents-react` (gh API), `@ui5/mcp-server` npm
- Ant Design v6: `ant-design/ant-design` (gh API), `ant.design/docs/blog/css-tricks/`, discussion #55332 (WCAG)
- Arco / Semi / TDesign: GitHub repos and npm registry data
- USWDS: `uswds/uswds` (gh API), `designsystem.digital.gov/about/contribute/`, `trussworks/react-uswds` (React community port)
- GOV.UK: `alphagov/govuk-design-system`, `alphagov/govuk-frontend`, `design-system.service.gov.uk/community/`
- GitLab Pajamas: `gitlab-org/gitlab-ui` (archived), `design.gitlab.com`
- Microsoft Fluent UI: `microsoft/fluentui` (gh API)
- GitHub Primer: `primer/react`, `primer/primitives` (gh API)
- Atlassian: `@atlaskit/primitives` (npm), `@atlaskit/pragmatic-drag-and-drop` (npm)
- WorkOS: Software Engineering Daily podcast Nov 18 2025, `pkgpulse` 2026 Radix analysis
- Tremor: Vercel blog announcement Jan 22 2025, `tremorlabs/tremor` (gh API)
