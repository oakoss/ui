# shadcn Registry

> How to distribute components via the shadcn CLI.

## Overview

The shadcn CLI can install components from any registry that follows the schema. Users run:

```sh
# From official shadcn registry
pnpm dlx shadcn@latest add button

# From namespaced registry (requires registry-index entry)
pnpm dlx shadcn@latest add @your-ui/button

# From URL directly
pnpm dlx shadcn@latest add https://your-ui.com/r/button.json
```

## Registry Structure

### registry.json

The manifest file that defines all available components:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "react-aria-ui",
  "homepage": "https://react-aria-ui.dev",
  "items": [
    {
      "name": "button",
      "type": "registry:ui",
      "title": "Button",
      "description": "A button component with variants.",
      "dependencies": ["react-aria-components", "tailwind-variants"],
      "files": [
        {
          "path": "registry/ui/button.tsx",
          "type": "registry:ui"
        }
      ]
    }
  ]
}
```

### Building the Registry

The shadcn CLI includes a `build` command:

```sh
# Generates public/r/*.json files from registry.json
pnpm dlx shadcn@latest build

# Custom output directory
pnpm dlx shadcn@latest build --output ./public/registry
```

This reads `registry.json` and generates individual JSON files for each component.

## registry-item.json Schema

Each component in the registry follows this schema:

### Required Fields

| Field   | Description                        |
| ------- | ---------------------------------- |
| `name`  | Unique identifier (e.g., `button`) |
| `type`  | Component type (see types below)   |
| `files` | Array of file objects              |

### Registry Types

| Type                 | Description        | Target Path       |
| -------------------- | ------------------ | ----------------- |
| `registry:ui`        | UI primitives      | `components/ui/`  |
| `registry:component` | Complex components | `components/`     |
| `registry:hook`      | React hooks        | `hooks/`          |
| `registry:lib`       | Utilities          | `lib/`            |
| `registry:block`     | Multi-file blocks  | various           |
| `registry:page`      | Route pages        | requires `target` |
| `registry:file`      | Misc files         | requires `target` |

### Optional Fields

```json
{
  "title": "Human-readable name",
  "description": "Component description",
  "author": "Your Name <email@example.com>",
  "dependencies": ["npm-package@1.0.0"],
  "registryDependencies": ["button", "@acme/input"],
  "cssVars": {
    "theme": {
      "font-heading": "Poppins, sans-serif"
    },
    "light": {
      "brand": "20 14.3% 4.1%"
    },
    "dark": {
      "brand": "60 14.3% 90%"
    }
  },
  "css": {
    "@layer components": {
      ".custom-class": {
        "color": "var(--brand)"
      }
    }
  },
  "docs": "Additional setup instructions shown after install",
  "categories": ["forms", "inputs"],
  "meta": { "custom": "data" }
}
```

### File Objects

```json
{
  "files": [
    {
      "path": "registry/ui/button.tsx",
      "type": "registry:ui"
    },
    {
      "path": "registry/hooks/use-button.ts",
      "type": "registry:hook"
    },
    {
      "path": "registry/pages/demo.tsx",
      "type": "registry:page",
      "target": "app/demo/page.tsx"
    }
  ]
}
```

## Example: Button Component

### Source File

```tsx
// registry/ui/button.tsx
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '@/lib/utils';

const buttonVariants = tv({
  base: 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline:
        'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={(renderProps) =>
        cn(
          buttonVariants({ variant, size }),
          typeof className === 'function' ? className(renderProps) : className,
        )
      }
      {...props}
    />
  );
}
```

### Registry Entry

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "An accessible button component built with React Aria.",
  "dependencies": ["react-aria-components", "tailwind-variants"],
  "registryDependencies": ["utils"],
  "files": [
    {
      "path": "registry/ui/button.tsx",
      "type": "registry:ui"
    }
  ],
  "cssVars": {
    "theme": {},
    "light": {
      "primary": "222.2 47.4% 11.2%",
      "primary-foreground": "210 40% 98%"
    },
    "dark": {
      "primary": "210 40% 98%",
      "primary-foreground": "222.2 47.4% 11.2%"
    }
  }
}
```

## Namespace Registration

To use `@your-ui/button` syntax, register in the shadcn registry index:

1. Submit PR to [shadcn-ui/ui](https://github.com/shadcn-ui/ui)
2. Add entry to registry index
3. Once merged, users can `pnpm dlx shadcn add @your-ui/button`

Until then, users can add via URL:

```sh
pnpm dlx shadcn add https://your-ui.dev/r/button.json
```

## Tailwind v4 Considerations

For Tailwind v4 projects, use `cssVars.theme` instead of `tailwind.config`:

```json
{
  "cssVars": {
    "theme": {
      "font-heading": "Poppins, sans-serif",
      "radius": "0.5rem"
    }
  }
}
```

The CLI handles the difference between v3 (`tailwind.config.js`) and v4 (`@theme` in CSS).

## CLI Commands

```sh
# Build registry JSON files
pnpm dlx shadcn build

# View component before installing
pnpm dlx shadcn view button

# Search registries
pnpm dlx shadcn search @your-ui -q "date"

# List all items
pnpm dlx shadcn list @your-ui
```
