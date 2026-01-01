## Context

Building a component registry for React Aria components distributed via the shadcn CLI. The registry must support multiple styling solutions while maintaining consistent component APIs and following shadcn conventions.

This design is informed by research into:

- Official shadcn registry documentation and schema
- React Aria's official registry implementation (`@react-aria`)
- shadcn registry template patterns

### Stakeholders

- Library maintainers (us)
- End users installing components via shadcn CLI
- Documentation consumers

### Constraints

- Must follow shadcn registry schema
- Must wrap React Aria Components (not rebuild)
- Must support React 19 (ref as prop, no forwardRef)
- Must use Tailwind CSS v4 conventions
- Must use shadcn CSS variable naming for theme compatibility

## Goals / Non-Goals

### Goals

- Distribute components via `shadcn add <url>` command
- Support Tailwind CSS and plain CSS styling approaches
- Follow React Aria's proven registry patterns
- Wrap React Aria Components for accessibility
- Follow shadcn registry conventions exactly
- Use shadcn CSS variables for ecosystem compatibility

### Non-Goals

- Vanilla Extract / Panda CSS support (explicitly dropped)
- Multiple headless libraries (Base UI deferred to future)
- Custom theming system (use shadcn CSS variable defaults)
- Publishing to npm (copy-and-own model only)
- CSS Modules (using plain CSS like React Aria instead)

## Decisions

### 1. Follow React Aria's Registry Pattern

After analyzing React Aria's official registry, we'll follow their proven approach:

| Style                 | Variant Library     | Styling Approach                   | Shared Files                 |
| --------------------- | ------------------- | ---------------------------------- | ---------------------------- |
| `react-aria-tailwind` | `tailwind-variants` | Tailwind utility classes           | `tailwind-utils.ts`          |
| `react-aria-css`      | None                | Plain CSS with `data-*` attributes | `theme.css`, `utilities.css` |

**Rationale:** React Aria's team has already solved these patterns. Following their approach:

- Reduces maintenance burden
- Proven to work with shadcn CLI
- CSS version is simpler without extra dependencies

### 2. Directory Structure

Following React Aria's flat naming convention with prefixed component names:

```text
packages/ui/
├── starters/
│   ├── react-aria-tailwind/
│   │   └── src/
│   │       ├── lib/
│   │       │   └── utils.ts              # focusRing, composeTailwindRenderProps
│   │       └── components/
│   │           └── ui/
│   │               └── Button.tsx
│   └── react-aria-css/
│       └── src/
│           └── components/
│               └── ui/
│                   ├── Button.tsx
│                   ├── Button.css
│                   ├── theme.css         # Shared CSS variables
│                   └── utilities.css     # Shared utility classes
├── scripts/
│   └── build-registry.ts                 # Custom build script
├── public/
│   └── r/                                # Generated output (flat)
│       ├── registry.json
│       ├── react-aria-tailwind.json      # Style definition
│       ├── react-aria-tailwind-utils.json
│       ├── react-aria-tailwind-button.json
│       ├── react-aria-css.json           # Style definition
│       └── react-aria-css-button.json
├── registry.json                         # Source manifest
├── package.json
└── tsconfig.json
```

**Rationale:**

- Flat output structure matches React Aria's registry
- Prefixed names (`react-aria-tailwind-button`) prevent collisions
- Style definitions allow installing all components at once

### 3. Naming Convention

Component names are prefixed with style: `[style]-[component]`

| Component | Tailwind Name                | CSS Name                  |
| --------- | ---------------------------- | ------------------------- |
| Button    | `react-aria-tailwind-button` | `react-aria-css-button`   |
| Utils     | `react-aria-tailwind-utils`  | (none - CSS has no utils) |

**Rationale:** Matches React Aria's naming. Prevents collisions in flat registry structure.

### 4. URL Structure (Flat)

```text
https://ui.oakoss.com/r/react-aria-tailwind-button.json
https://ui.oakoss.com/r/react-aria-css-button.json
```

**Rationale:** Flat structure required for shadcn registry index. Matches React Aria's pattern.

### 5. Custom Build Script

Use a custom build script (like React Aria's `buildRegistry.mjs`) instead of `shadcn build` because we need to:

1. Read source files from `starters/[style]/src/`
2. Rewrite import paths (`./Button.css` → inline, `@/lib/utils` → proper paths)
3. Inline file content into JSON
4. Generate prefixed component names
5. Auto-detect dependencies from imports
6. Generate style definition JSONs

```typescript
// scripts/build-registry.ts
// Inspired by: https://github.com/adobe/react-spectrum/blob/main/scripts/buildRegistry.mjs
```

**Rationale:** React Aria uses a custom script for the same reasons. Standard `shadcn build` doesn't support our multi-style structure.

### 6. Styling Approaches

#### Tailwind Version (`react-aria-tailwind`)

```tsx
// Uses tailwind-variants for variant management
import { tv } from 'tailwind-variants';
import { focusRing } from '@/lib/utils';

const button = tv({
  extend: focusRing,
  base: 'inline-flex items-center justify-center...',
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground...',
      secondary: 'bg-secondary text-secondary-foreground...',
    },
  },
});
```

**Dependencies:**

- `tailwind-variants`
- `tailwind-merge`
- `tailwindcss-react-aria-components`
- `tailwindcss-animate`

#### CSS Version (`react-aria-css`)

```tsx
// Uses data-* attributes for variant selection (no TV)
import './Button.css';

function Button({ variant = 'primary', ...props }) {
  return (
    <RACButton className="button-base" data-variant={variant} {...props} />
  );
}
```

```css
/* Button.css */
@import './theme.css';

.button-base {
  /* base styles */
}

.button-base[data-variant='primary'] {
  background: var(--primary);
  color: var(--primary-foreground);
}
```

**Dependencies:**

- `react-aria-components`
- `clsx` (optional, for conditional classes)

### 7. CSS Variables (shadcn Compatible)

Use shadcn's CSS variable naming for theme compatibility:

```css
/* theme.css - based on shadcn defaults */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  /* ... etc */
}
```

**Rationale:** Users can use their existing shadcn theme. CSS variables work in both Tailwind and CSS versions.

### 8. Registry Dependencies

Components declare dependencies using full URLs (like React Aria):

```json
{
  "name": "react-aria-tailwind-button",
  "registryDependencies": [
    "https://ui.oakoss.com/r/react-aria-tailwind-utils.json"
  ]
}
```

**Rationale:** Full URLs required for cross-registry dependencies. shadcn CLI resolves them automatically.

### 9. CSS Plugins (Tailwind v4)

Tailwind components specify required plugins via `css` field:

```json
{
  "css": {
    "@plugin \"tailwindcss-react-aria-components\"": {},
    "@plugin \"tailwindcss-animate\"": {}
  }
}
```

**Rationale:** Tailwind v4 uses `@plugin` syntax. shadcn CLI adds these to user's CSS.

## Risks / Trade-offs

| Risk                                        | Mitigation                                    |
| ------------------------------------------- | --------------------------------------------- |
| Custom build script maintenance             | Base it on React Aria's proven implementation |
| Two implementations per component           | Start with Button POC, establish patterns     |
| CSS version has different API than Tailwind | Clear documentation, consistent prop names    |
| Breaking changes in shadcn schema           | Pin versions, monitor changelog               |

## Open Questions

None remaining - all decisions made based on React Aria's proven patterns.

## Migration Plan

Not applicable - this is a new package with no existing users.

## References

- [React Aria Registry](https://react-aria.adobe.com/registry/registry.json)
- [shadcn Registry Schema](https://ui.shadcn.com/schema/registry.json)
- [shadcn Registry Item Schema](https://ui.shadcn.com/schema/registry-item.json)
- [React Aria buildRegistry.mjs](https://github.com/adobe/react-spectrum/blob/main/scripts/buildRegistry.mjs)
