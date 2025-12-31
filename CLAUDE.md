<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Agent Instructions

## Package Manager

**Always use pnpm** - never npm or yarn.

| Instead of       | Use           |
| ---------------- | ------------- |
| `npm install`    | `pnpm add`    |
| `npm install -D` | `pnpm add -D` |
| `npm run`        | `pnpm`        |
| `npx`            | `pnpm dlx`    |

## Commands

```bash
pnpm dev                        # Start all apps in dev mode (Turbo)
pnpm build                      # Build all packages/apps
pnpm lint                       # ESLint (zero warnings allowed)
pnpm lint:fix                   # ESLint with auto-fix
pnpm format                     # Prettier format all files
pnpm typecheck                  # TypeScript check only
pnpm --filter docs dev          # Run dev in specific workspace
```

**No test framework configured** - No vitest or jest currently exists.

## Tech Stack

- **Framework:** TanStack Start (SSR/SSG React)
- **UI:** React 19, React Aria Components, Tailwind CSS v4
- **Docs:** Fumadocs with MDX
- **Build:** Vite, Turbo (monorepo)

## Project Structure

```text
apps/docs/               # Documentation site (TanStack Start + Fumadocs)
packages/
├── eslint-config/       # Shared ESLint configuration
└── typescript-config/   # Shared TypeScript configuration
docs/react-aria-ui/      # Component architecture documentation
openspec/                # Spec-driven development
```

## File Organization

### Avoid Barrel Files (index.ts re-exports)

**Do NOT create `index.ts` files that re-export.** Import directly from source:

```tsx
// Bad: barrel file import
import { Button, Input } from '@/components/ui';

// Good: direct imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
```

### When to Split Files

Split when you observe **multiple signals**:

- File exceeds ~300-400 lines AND contains distinct logical sections
- Multiple unrelated concepts in one file
- Testing becomes difficult due to complexity

**Avoid premature abstraction** - don't extract until you have 3+ uses (Rule of Three).

## Code Style

### File Naming

- **kebab-case** for all files: `button.tsx`, `use-media-query.ts`
- Route params may start with `$`: `$slug.tsx`
- Generated files use `.gen.ts` suffix

### Imports

```typescript
// Auto-sorted by simple-import-sort
// Inline type imports required
import { type ButtonProps, Button } from 'react-aria-components';

// Use path aliases, no relative parent imports
import { cn } from '@/lib/utils'; // Correct
import { cn } from '../../lib/utils'; // Wrong
```

### TypeScript

```typescript
// Use 'type' not 'interface'
type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>;

// Prefix unused variables with underscore
const [_unused, setUsed] = useState();
```

### React Components

```typescript
// React 19: ref as regular prop (no forwardRef)
function Button({ ref, className, ...props }: ButtonProps) {
  return <AriaButton ref={ref} {...props} />;
}

// composeRenderProps for React Aria className functions
className={composeRenderProps(className, (className) =>
  cn(buttonVariants({ variant }), className)
)}

// JSX props: reserved first, shorthand, alphabetical, callbacks last
<Button ref={ref} disabled variant="primary" onClick={handleClick} />
```

### Tailwind CSS v4

```css
/* Data attributes for React Aria state */
data-[hovered]:bg-primary/90
data-[disabled]:opacity-50
data-[focus-visible]:ring-2
```

## React Best Practices

- **Composition over configuration** - compound components over prop-heavy ones
- **Colocate state** - keep state close to where it's used
- **Derive don't sync** - compute values instead of useEffect state sync
- **Explicit hook deps** - never lie about useEffect/useMemo dependencies

```tsx
// Bad: syncing state
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// Good: derive during render
const fullName = `${first} ${last}`;
```

## Component Architecture

### React Aria Integration

```typescript
// Wrap React Aria components, don't rebuild
import { Button as AriaButton } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(['base-classes'], {
  variants: {
    variant: { default: '...', destructive: '...' },
    size: { sm: 'h-8', md: 'h-9', lg: 'h-11' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
});
```

### Standard Variants

```typescript
type Variant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';
type Size = 'sm' | 'md' | 'lg';
type Tone = 'default' | 'success' | 'warning' | 'critical' | 'info';
```

## Naming Conventions

| Element        | Convention | Example                    |
| -------------- | ---------- | -------------------------- |
| Files          | kebab-case | `use-media-query.ts`       |
| Components     | PascalCase | `function Button() {}`     |
| Hooks          | camelCase  | `useMediaQuery`            |
| Types          | PascalCase | `type ButtonProps`         |
| Event handlers | on- prefix | `onPress`, `onOpenChange`  |
| Boolean props  | is- prefix | `isDisabled`, `isSelected` |

## Commits

**Format:** `type(scope): message` (commitlint enforced)

**Types:** `feat|fix|docs|style|refactor|perf|test|chore|ci|revert`

**Scopes:** `ui|hooks|lib|blocks|docs|eslint|tsconfig|registry|config|deps|repo`

**Rules:**

- Only commit staged files - group related files logically
- Keep message concise; use body sparingly (4-5 bullets max)
- Stage and commit incrementally as work completes

**Example:** `feat(react-aria): add button component`
