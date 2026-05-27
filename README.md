# oakoss/ui

[![CI](https://github.com/oakoss/ui/actions/workflows/ci.yml/badge.svg)](https://github.com/oakoss/ui/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

Enterprise OSS React design system built on [React Aria Components](https://react-aria.adobe.com/), distributed via a [shadcn-compatible registry](https://ui.shadcn.com/docs/registry), and authored against the [W3C DTCG 2025.10 token format](https://www.designtokens.org/).

## Status

**Foundation phase (pre-v0.1).** Architectural decisions are locked; component implementation has not started. See [`docs/roadmap.md`](docs/roadmap.md) for phase plans, [`docs/decisions/`](docs/decisions/) for accepted decisions, and [`docs/research/`](docs/research/) for the evidence behind each.

One pending decision: the styling layer (Tailwind v4 recommended; see [`docs/research/styling-layer-evaluation.md`](docs/research/styling-layer-evaluation.md)).

## Stack

| Layer                | Decision                                                                              |
| -------------------- | ------------------------------------------------------------------------------------- |
| Primitive layer      | React Aria Components (best-in-class i18n, RTL, DnD, virtualization)                  |
| Distribution         | Registry-led hybrid (shadcn-compatible registry + small `@oakoss/tokens` npm package) |
| Multi-framework      | React-primary; tokens framework-agnostic; defer Lit/WC to post-v1.0                   |
| Tokens               | DTCG 2025.10 source + Terrazzo build pipeline                                         |
| Docs site            | Fumadocs on Next.js                                                                   |
| Component explorer   | Storybook 10 (also visual + a11y test target)                                         |
| Visual regression CI | Chromatic (OSS tier) + Argos (MIT) as fallback                                        |
| A11y CI              | `eslint-plugin-jsx-a11y` + `@storybook/addon-a11y`                                    |
| AI integration       | shadcn `registry.json` + `@oakoss/mcp-server` (stdio)                                 |

## Accessibility target

[WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) + [EN 301 549](https://www.etsi.org/standards-search#search=EN%20301%20549) (the harmonised European ICT accessibility standard referenced by the EU Accessibility Act) + Section 508 conformance. See [`docs/accessibility/README.md`](docs/accessibility/README.md).

## Install

The registry is not yet live. When v0.1 ships:

```bash
pnpm dlx shadcn@latest add <component>
```

## Documentation

- [Roadmap](docs/roadmap.md)
- [Decisions](docs/decisions/)
- [Research notes](docs/research/)
- [Glossary](docs/glossary.md)
- [Accessibility](docs/accessibility/README.md)
- [Governance](docs/governance/README.md)
- [Label state machine](docs/governance/labels.md)

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md). New components and significant changes go through the RFC process in [`docs/rfcs/`](docs/rfcs/).

## Code of Conduct

This project follows the [Contributor Covenant](docs/CODE_OF_CONDUCT.md).

## Security

Report vulnerabilities via [GitHub Security Advisories](https://github.com/oakoss/ui/security/advisories/new). See [`docs/SECURITY.md`](docs/SECURITY.md).

## License

[MIT](./LICENSE) © oakoss contributors
