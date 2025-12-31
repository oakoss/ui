# Project Context

## Purpose

React Aria UI is a component library built on React Aria Components, distributed via shadcn registry. The goal is to provide accessible, customizable React components with first-class TypeScript support.

## Tech Stack

- **Runtime:** Node.js >= 25.1.0
- **Package Manager:** pnpm 10.x
- **Language:** TypeScript 5.9+
- **Framework:** TanStack Start (SSR/SSG React)
- **UI Library:** React 19, React Aria Components
- **Styling:** Tailwind CSS v4, class-variance-authority
- **Documentation:** Fumadocs with MDX
- **Build:** Vite, Turbo (monorepo)
- **Linting:** ESLint 9 (flat config), Prettier

## Project Conventions

### Code Style

- **File naming:** kebab-case for all files (`button.tsx`, `use-media-query.ts`)
- **Components:** PascalCase function names
- **Types:** Use `type` keyword, not `interface`
- **Imports:** Auto-sorted by simple-import-sort, inline type imports required
- **Path aliases:** Use `@/` prefix, no relative parent imports

### Architecture Patterns

- **Composition over configuration:** Compound components preferred over prop-heavy ones
- **Colocate state:** Keep state close to where it's used
- **Derive don't sync:** Compute values instead of useEffect state sync
- **React Aria wrapping:** Wrap React Aria components, don't rebuild from scratch
- **No barrel files:** Import directly from source, not index re-exports

### Testing Strategy

No test framework currently configured. Tests will be added as the component library matures.

### Git Workflow

- **Commit format:** Conventional commits (`type(scope): message`)
- **Types:** feat, fix, docs, style, refactor, perf, test, chore, ci, revert
- **Scopes:** ui, hooks, lib, blocks, docs, eslint, tsconfig, registry, config, deps, repo
- **Hooks:** Lefthook for pre-commit (lint, format, typecheck)

## Domain Context

### React Aria Components

React Aria provides accessible UI primitives. Our components wrap these with:

- Tailwind CSS styling via `className` props
- CVA (class-variance-authority) for variant management
- `composeRenderProps` for merging className functions

### shadcn Registry

Components are distributed via the shadcn registry format, allowing users to copy components directly into their projects rather than installing a package.

## Important Constraints

- React 19 required (uses ref as regular prop, no forwardRef)
- Tailwind CSS v4 required (uses CSS-first configuration)
- ESM only (no CommonJS)
- Zero runtime CSS-in-JS (Tailwind only)

## External Dependencies

- **React Aria:** Adobe's accessibility-first component primitives
- **Fumadocs:** Documentation framework with TanStack Start adapter
- **Turbo:** Monorepo build system with caching
