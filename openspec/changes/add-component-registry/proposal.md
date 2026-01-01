# Change: Add Component Registry Package

## Why

Enable distribution of React Aria-based components via the shadcn CLI, supporting both Tailwind CSS and CSS Modules styling approaches. This establishes the foundation for a copy-and-own component library that users can install directly into their projects.

## What Changes

- Add `packages/ui/` package with shadcn registry structure
- Create `registry/react-aria-tailwind/` for Tailwind-styled components
- Create `registry/react-aria-css-modules/` for CSS Modules-styled components
- Add `utils` registry item with `cn()` / `cx()` helpers
- Add `button` component as first POC component
- Configure `registry.json` manifest for shadcn CLI
- Add build script to generate registry JSON files

## Impact

- Affected specs: component-registry (new capability)
- Affected code: `packages/ui/` (new package)
- New dependencies: `tailwind-variants`, `tailwind-merge`, `react-aria-components`
