# @oakoss/ui

A shadcn-compatible component registry for React Aria components. Install accessible, customizable components directly into your project.

## Installation

Components are installed using the shadcn CLI. Choose your preferred styling approach:

### Tailwind CSS (Recommended)

Uses [Tailwind Variants](https://www.tailwind-variants.org/) for styling with full Tailwind CSS support.

```sh
# Install a component
npx shadcn@latest add https://ui.oakoss.com/r/react-aria-tailwind-button.json

# Install utilities (auto-installed as dependency)
npx shadcn@latest add https://ui.oakoss.com/r/react-aria-tailwind-utils.json
```

### Plain CSS

Uses CSS custom properties and data attributes. No Tailwind required.

```sh
# Install a component
npx shadcn@latest add https://ui.oakoss.com/r/react-aria-css-button.json

# Install theme and utilities
npx shadcn@latest add https://ui.oakoss.com/r/react-aria-css-theme.json
npx shadcn@latest add https://ui.oakoss.com/r/react-aria-css-utilities.json
```

## Available Components

| Component | Tailwind                     | CSS                        |
| --------- | ---------------------------- | -------------------------- |
| Button    | `react-aria-tailwind-button` | `react-aria-css-button`    |
| Utils     | `react-aria-tailwind-utils`  | -                          |
| Theme     | -                            | `react-aria-css-theme`     |
| Utilities | -                            | `react-aria-css-utilities` |

## Development

### Project Structure

```sh
packages/ui/
├── starters/
│   ├── react-aria-tailwind/     # Tailwind-based components
│   │   ├── src/
│   │   │   ├── components/ui/   # UI components
│   │   │   └── lib/             # Utilities
│   │   └── registry.json        # Component manifest
│   └── react-aria-css/          # CSS-based components
│       ├── src/
│       │   └── components/ui/   # UI components + CSS
│       └── registry.json        # Component manifest
├── scripts/
│   └── build-registry.ts        # Build script
└── public/r/                    # Generated registry output
```

### Scripts

```sh
pnpm --filter @oakoss/ui build      # Build registry JSON files
pnpm --filter @oakoss/ui lint       # Run ESLint
pnpm --filter @oakoss/ui typecheck  # Run TypeScript check
```

### Adding a New Component

1. Create the component in both starters:

```sh
starters/react-aria-tailwind/src/components/ui/NewComponent.tsx
starters/react-aria-css/src/components/ui/NewComponent.tsx
starters/react-aria-css/src/components/ui/NewComponent.css
```

2. Add entries to each `registry.json`:

```json
{
  "name": "newcomponent",
  "type": "registry:ui",
  "title": "New Component",
  "description": "Description of the component",
  "dependencies": ["react-aria-components"],
  "files": [
    {
      "path": "components/ui/NewComponent.tsx",
      "type": "registry:ui"
    }
  ]
}
```

3. Build the registry:

```sh
pnpm --filter @oakoss/ui build
```

4. Verify the output in `public/r/`.

### Component Guidelines

- Wrap React Aria Components, don't rebuild them
- Use React 19 patterns (ref as prop, no forwardRef)
- Follow shadcn CSS variable naming for theme compatibility
- Use data attributes for state styling (`data-pressed`, `data-disabled`, etc.)
- Keep variants consistent between Tailwind and CSS versions

## Registry URLs

Production registry will be available at:

```sh
https://ui.oakoss.com/r/registry.json
https://ui.oakoss.com/r/react-aria-tailwind-button.json
https://ui.oakoss.com/r/react-aria-css-button.json
```

## License

MIT
