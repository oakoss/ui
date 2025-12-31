# Architecture

## Quick Start

Fumadocs CLI has a TanStack Start template:

```bash
# Create new project with TanStack Start + Fumadocs
pnpm create fumadocs-app my-ui --template tanstack-start --pm pnpm

# Or SPA mode (no SSR)
pnpm create fumadocs-app my-ui --template tanstack-start-spa --pm pnpm
```

Available templates:

- `tanstack-start` - Full SSR/SSG support
- `tanstack-start-spa` - Client-side only (simpler)
- `react-router` - React Router 7 with SSR
- `react-router-spa` - React Router SPA mode
- `waku` - Waku framework

## Project Structure

```text
react-aria-ui/
├── app/
│   ├── routes/                   # TanStack Start routes
│   │   ├── docs/
│   │   │   └── $slug.tsx         # MDX doc pages
│   │   └── __root.tsx
│   └── main.tsx
├── content/                      # MDX documentation
│   ├── docs/
│   │   ├── components/
│   │   │   ├── button.mdx
│   │   │   ├── checkbox.mdx
│   │   │   └── ...
│   │   └── getting-started.mdx
│   └── meta.json                 # Navigation structure
├── registry/                     # shadcn-style registry (ALL distributable code)
│   ├── ui/                       # UI components
│   │   ├── button.tsx
│   │   └── ...
│   ├── hooks/                    # Utility hooks
│   │   ├── use-media-query.ts
│   │   └── ...
│   ├── lib/                      # Utilities
│   │   └── utils.ts
│   └── registry.json             # Component manifest
├── public/
│   └── r/                        # Built registry JSON files (generated)
│       ├── button.json
│       └── ...
├── lib/
│   └── source.ts                 # Fumadocs source config
└── components/
    └── ui/                       # Local UI components for docs site
```

## Technology Choices

### React Aria Components

Using the high-level `react-aria-components` package, not raw hooks:

```tsx
// Preferred: react-aria-components
import { Button, Dialog, Select } from 'react-aria-components';

// Drop to hooks when needed for advanced control
import { useButton, useDialog } from 'react-aria';
```

**Rationale:** Components provide sensible defaults, hooks are escape hatch.

### Tailwind CSS v4

Using Tailwind v4 with the official React Aria plugin:

```bash
pnpm add tailwindcss@next tailwindcss-react-aria-components
```

```css
/* app.css */
@import 'tailwindcss';
@plugin 'tailwindcss-react-aria-components';
```

**Key benefit:** Plugin adds variants like `data-[selected]:`, `data-[disabled]:`, `data-[focus-visible]:` that map to React Aria's data attributes.

### TanStack Start

Full-stack React framework with:

- File-based routing
- Server functions
- SSR/SSG support
- Vite-powered

### Fumadocs

Using the `create-fumadocs-app` CLI with TanStack Start template handles integration automatically.

```bash
pnpm create fumadocs-app my-ui --template tanstack-start --pm pnpm
```

**What Fumadocs provides:**

- MDX processing with frontmatter
- Table of contents generation
- Search (Orama built-in, Orama Cloud optional)
- Sidebar navigation from file structure
- Breadcrumbs
- Full UI component library for docs

**Fumadocs CLI for customization:**

```bash
# Add customizable components
pnpm dlx @fumadocs/cli add

# Customize layouts
pnpm dlx @fumadocs/cli customise
```

## Component Architecture

### Variant System

Using `tailwind-variants` for type-safe variants:

```tsx
import { tv, type VariantProps } from 'tailwind-variants';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      outline: 'border border-input bg-transparent',
      ghost: 'hover:bg-accent',
      destructive: 'bg-destructive text-destructive-foreground',
    },
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-10 px-6 text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});
```

### React Aria Integration Pattern

```tsx
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';

const buttonVariants = tv({
  /* ... */
});

type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>;

function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={(renderProps) =>
        buttonVariants({
          variant,
          size,
          className:
            typeof className === 'function'
              ? className(renderProps)
              : className,
        })
      }
      {...props}
    />
  );
}
```

**Key pattern:** Preserve React Aria's render prop `className` while adding variants.

### CSS Variables for Theming

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --primary: 0 0% 9%;
  --primary-foreground: 0 0% 98%;
  /* ... */
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 0 0% 9%;
  /* ... */
}
```

## Registry Distribution

**No npm packages.** Everything distributed via JSON registry files:

```bash
# Install a component
pnpm dlx shadcn add https://react-aria-ui.dev/r/button.json

# Install a hook
pnpm dlx shadcn add https://react-aria-ui.dev/r/use-media-query.json

# Install a utility
pnpm dlx shadcn add https://react-aria-ui.dev/r/utils.json
```

### How It Works

1. User runs `pnpm dlx shadcn add <url>`
2. CLI fetches the JSON manifest
3. CLI writes source files to user's project
4. CLI installs npm dependencies (e.g., `react-aria-components`)
5. CLI updates CSS variables if needed

### Registry Types

| Type             | Target Path      | Example         |
| ---------------- | ---------------- | --------------- |
| `registry:ui`    | `components/ui/` | button, dialog  |
| `registry:hook`  | `hooks/`         | use-media-query |
| `registry:lib`   | `lib/`           | utils           |
| `registry:block` | various          | login-form      |

See [REGISTRY.md](./REGISTRY.md) for full schema details.

## Open Questions

- [ ] Live component previews in MDX - use Sandpack or custom?
- [ ] Monorepo structure - Turborepo vs pnpm workspaces only?
- [ ] Version management for registry components
- [ ] How to handle theme switching in component previews?
