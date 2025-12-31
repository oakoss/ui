# React Aria UI

> Research and planning for a React Aria-based component library with shadcn-style distribution.

## Goal

Build a design system using:

- **React Aria Components** - Accessible headless primitives
- **Tailwind CSS v4** - Styling
- **TanStack Start** - Documentation site framework (via Fumadocs template)
- **Fumadocs** - MDX processing and docs infrastructure
- **shadcn Registry** - Component distribution via CLI

## Quick Start

```bash
# Create docs site with TanStack Start + Fumadocs
pnpm create fumadocs-app react-aria-ui --template tanstack-start --pm pnpm
```

## Documents

| Document                               | Description                                                 |
| -------------------------------------- | ----------------------------------------------------------- |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | What makes a good design system (tokens, components, needs) |
| [ARCHITECTURE.md](./ARCHITECTURE.md)   | Project structure and tech decisions                        |
| [REGISTRY.md](./REGISTRY.md)           | shadcn registry format and CLI integration                  |
| [COMPONENTS.md](./COMPONENTS.md)       | React Aria component implementation patterns                |

## Prior Art

| Project                            | Description                  | Notes                                                             |
| ---------------------------------- | ---------------------------- | ----------------------------------------------------------------- |
| [JollyUI](https://jollyui.dev)     | React Aria + shadcn patterns | 1.1K stars, uses `class-variance-authority`, `composeRenderProps` |
| [shadcn/ui](https://ui.shadcn.com) | Registry and CLI patterns    | Registry schema, build command                                    |
| [Fumadocs](https://fumadocs.dev)   | Documentation infrastructure | TanStack Start template built-in                                  |

## Status

### Research Phase (Complete)

- [x] Research Fumadocs + TanStack Start integration
- [x] Document shadcn registry schema
- [x] Research JollyUI implementation patterns
- [x] Research design system requirements (tokens, components, enterprise needs)
- [x] Define component API patterns (variants, sizes, props, exports)

### Implementation Phase (Next)

- [ ] Set up project structure (`pnpm create fumadocs-app react-aria-ui --template tanstack-start`)
- [ ] Configure Tailwind v4 with React Aria plugin
- [ ] Create design tokens (colors, spacing, typography)
- [ ] Implement Phase 1 components:
  - [ ] Button
  - [ ] Input, Textarea, Label
  - [ ] Checkbox, Radio, Switch
  - [ ] Select
  - [ ] Dialog/Modal
  - [ ] Dropdown Menu
  - [ ] Popover, Tooltip
  - [ ] Toast
  - [ ] Card, Badge
  - [ ] Tabs
- [ ] Set up shadcn registry
- [ ] Write component documentation
