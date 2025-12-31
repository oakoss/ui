# Component Patterns

> Implementation patterns for React Aria components with Tailwind styling.

## API Standards

This section defines the standardized API that all components must follow.

### Variant System

Use consistent variant names across all components:

```tsx
// Button, Badge, Alert variants
type Variant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link';

// Size variants (all interactive components)
type Size = 'sm' | 'md' | 'lg';

// Semantic tones (Alert, Banner, Toast)
type Tone = 'default' | 'success' | 'warning' | 'critical' | 'info';

// Radius variants (optional, for components that need it)
type Radius = 'none' | 'sm' | 'md' | 'lg' | 'full';
```

### Standard Sizes

| Size | Height      | Padding X   | Font Size          | Icon Size       |
| ---- | ----------- | ----------- | ------------------ | --------------- |
| `sm` | 32px (h-8)  | 12px (px-3) | 13px (text-[13px]) | 14px (size-3.5) |
| `md` | 36px (h-9)  | 16px (px-4) | 14px (text-sm)     | 16px (size-4)   |
| `lg` | 44px (h-11) | 24px (px-6) | 16px (text-base)   | 20px (size-5)   |

### Prop Naming Conventions

```tsx
// Boolean props: use "is" prefix for state, no prefix for config
isDisabled; // React Aria standard (not "disabled")
isReadOnly; // React Aria standard
isRequired; // React Aria standard
isInvalid; // React Aria standard
autoFocus; // Config prop, no "is" prefix

// Event handlers: use "on" prefix
onPress; // React Aria standard (not onClick)
onPressStart;
onPressEnd;
onFocus;
onBlur;
onChange;
onSelectionChange;
onOpenChange;

// Slots and children
children; // Content (can be render function)
className; // Can be string or render function
style; // Can be object or render function
asChild; // Render as child element (slot pattern)
```

### Component Type Definitions

```tsx
// Standard component interface pattern
import {
  type ButtonProps as AriaButtonProps,
  composeRenderProps,
} from 'react-aria-components';
import { type VariantProps } from 'class-variance-authority';

// Extend React Aria props + variant props
type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>;

// For compound components, define each part
type DialogProps = AriaDialogProps;
type DialogTriggerProps = { children: React.ReactNode; asChild?: boolean };
type DialogContentProps = AriaModalOverlayProps & { children: React.ReactNode };
```

### Required Exports

Every component file must export:

```tsx
// Named component export
export { Button };

// Variants function (if using cva/tv)
export { buttonVariants };

// Type export
export type { ButtonProps };
```

### Ref Forwarding (React 19)

React 19 allows `ref` as a regular prop - no `forwardRef` needed:

```tsx
// React 19 pattern
function Button({ ref, className, ...props }: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return <AriaButton ref={ref} className={...} {...props} />;
}
```

### Composition with asChild

For trigger components, support the `asChild` pattern:

```tsx
import { Slot } from '@radix-ui/react-slot';

type TriggerProps = {
  children: React.ReactNode;
  asChild?: boolean;
};

function DialogTrigger({ children, asChild, ...props }: TriggerProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp {...props}>{children}</Comp>;
}
```

### Accessibility Requirements

Every component must:

1. **Use React Aria primitives** - Never rebuild accessible behavior
2. **Support keyboard navigation** - Tested with Tab, Enter, Space, Arrow keys
3. **Include focus indicators** - Visible `data-[focus-visible]` styles
4. **Support screen readers** - Proper labels, descriptions, announcements
5. **Handle disabled state** - `data-[disabled]` with `pointer-events-none`

### File Structure

```text
src/components/ui/
├── button.tsx           # Single component per file
├── checkbox.tsx
├── dialog.tsx           # Compound components in one file
├── select.tsx
└── index.ts             # NO barrel exports (see AGENTS.md)
```

### Import Pattern

```tsx
// Inside component files
import { cn } from '@/lib/utils';
import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';

// External usage - import directly from source
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
```

---

## Core Principles

1. **Wrap React Aria Components** - Don't rebuild, extend
2. **Preserve render props** - Use `composeRenderProps` for className functions
3. **Use data attributes** - React Aria exposes state via `data-*` attributes
4. **Variant system** - Use `class-variance-authority` or `tailwind-variants`

## Key Pattern: composeRenderProps

React Aria's `composeRenderProps` utility lets you combine user-provided className functions with your own:

```tsx
import { composeRenderProps } from 'react-aria-components';

// This handles both string and function className props
className={composeRenderProps(className, (className) =>
  cn(buttonVariants({ variant, size }), className)
)}
```

**Why this matters:** React Aria components accept `className` as either a string or a function that receives render props (like `isPressed`, `isFocused`). `composeRenderProps` handles both cases.

## Data Attributes

React Aria components expose state via data attributes, not pseudo-classes:

| React Aria             | Use instead of           |
| ---------------------- | ------------------------ |
| `data-[hovered]`       | `:hover`                 |
| `data-[pressed]`       | `:active`                |
| `data-[focused]`       | `:focus`                 |
| `data-[focus-visible]` | `:focus-visible`         |
| `data-[disabled]`      | `:disabled`              |
| `data-[selected]`      | (checkbox/radio checked) |
| `data-[indeterminate]` | (checkbox indeterminate) |
| `data-[invalid]`       | (validation error)       |

**Tailwind plugin:** Install `tailwindcss-react-aria-components` for cleaner syntax:

```css
/* Without plugin */
data-[hovered]:bg-primary/90

/* With plugin */
hover:bg-primary/90  /* plugin maps to data-[hovered] */
```

## Button Pattern

```tsx
'use client';

import {
  Button as AriaButton,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center rounded-md text-sm font-medium',
    'ring-offset-background transition-colors',
    // Disabled state
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
    // Focus visible
    'data-[focus-visible]:outline-none data-[focus-visible]:ring-2',
    'data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground data-[hovered]:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground data-[hovered]:bg-destructive/90',
        outline: 'border border-input bg-background data-[hovered]:bg-accent',
        secondary:
          'bg-secondary text-secondary-foreground data-[hovered]:bg-secondary/80',
        ghost: 'data-[hovered]:bg-accent data-[hovered]:text-accent-foreground',
        link: 'text-primary underline-offset-4 data-[hovered]:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ButtonProps = AriaButtonProps & VariantProps<typeof buttonVariants>;

function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AriaButton
      className={composeRenderProps(className, (className) =>
        cn(buttonVariants({ variant, size }), className),
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
```

## Checkbox Pattern

Checkboxes need to render the checkbox indicator inside, using render props:

```tsx
'use client';

import { Check, Minus } from 'lucide-react';
import {
  Checkbox as AriaCheckbox,
  composeRenderProps,
  type CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import { cn } from '@/lib/utils';

function Checkbox({ className, children, ...props }: AriaCheckboxProps) {
  return (
    <AriaCheckbox
      className={composeRenderProps(className, (className) =>
        cn(
          'group/checkbox flex items-center gap-x-2',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
          className,
        ),
      )}
      {...props}
    >
      {composeRenderProps(
        children,
        (children, { isSelected, isIndeterminate }) => (
          <>
            <div
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary',
                // Selected state
                'group-data-[selected]/checkbox:bg-primary group-data-[selected]/checkbox:text-primary-foreground',
                // Indeterminate state
                'group-data-[indeterminate]/checkbox:bg-primary group-data-[indeterminate]/checkbox:text-primary-foreground',
                // Focus
                'group-data-[focus-visible]/checkbox:ring-2 group-data-[focus-visible]/checkbox:ring-ring',
                // Invalid
                'group-data-[invalid]/checkbox:border-destructive',
              )}
            >
              {isIndeterminate ? (
                <Minus className="size-3" />
              ) : isSelected ? (
                <Check className="size-3" />
              ) : null}
            </div>
            {children}
          </>
        ),
      )}
    </AriaCheckbox>
  );
}

export { Checkbox };
```

**Key pattern:** Use `group/checkbox` and `group-data-[state]/checkbox:` to style the indicator based on parent state.

## Select Pattern

React Aria Select uses composition with multiple components:

```tsx
import {
  Select as AriaSelect,
  SelectValue,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  type SelectProps as AriaSelectProps,
} from 'react-aria-components';

function Select<T extends object>({ children, ...props }: AriaSelectProps<T>) {
  return (
    <AriaSelect {...props}>
      {composeRenderProps(children, (children) => (
        <>
          {/* Trigger button */}
          <Button className="...">
            <SelectValue />
            <ChevronDown className="size-4" />
          </Button>

          {/* Dropdown */}
          <Popover className="...">
            <ListBox className="...">{children}</ListBox>
          </Popover>
        </>
      ))}
    </AriaSelect>
  );
}

function SelectItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      className={composeRenderProps(props.className, (className) =>
        cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5',
          'data-[focused]:bg-accent data-[focused]:text-accent-foreground',
          'data-[selected]:font-medium',
          className,
        ),
      )}
      {...props}
    />
  );
}
```

## Form Field Pattern

Create a reusable field wrapper for labels, descriptions, and errors:

```tsx
import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  Text,
  type FieldErrorProps,
  type LabelProps,
  type TextProps,
} from 'react-aria-components';

function Label({ className, ...props }: LabelProps) {
  return (
    <AriaLabel
      className={cn(
        'text-sm font-medium leading-none',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

function Description({ className, ...props }: TextProps) {
  return (
    <Text
      slot="description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function FieldError({ className, ...props }: FieldErrorProps) {
  return (
    <AriaFieldError
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    />
  );
}
```

## Compound Component Pattern

For complex components, export named parts:

```tsx
// dialog.tsx
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

// Usage
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>;
```

## Tailwind v4 + React Aria Plugin

```css
/* app.css */
@import 'tailwindcss';
@plugin 'tailwindcss-react-aria-components';

@theme {
  --color-primary: oklch(0.21 0.03 264.05);
  --color-primary-foreground: oklch(0.98 0 0);
  /* ... */
}
```

The plugin maps standard Tailwind variants to React Aria data attributes:

| Tailwind         | Maps to                 |
| ---------------- | ----------------------- |
| `hover:`         | `data-[hovered]:`       |
| `focus:`         | `data-[focused]:`       |
| `focus-visible:` | `data-[focus-visible]:` |
| `pressed:`       | `data-[pressed]:`       |
| `selected:`      | `data-[selected]:`      |
| `disabled:`      | `data-[disabled]:`      |

## Differences from JollyUI

JollyUI uses `class-variance-authority` (cva). Consider `tailwind-variants` (tv) for:

- Slots (multiple elements in one variant definition)
- Responsive variants
- Compound variants with better DX

```tsx
// tailwind-variants example with slots
const checkbox = tv({
  slots: {
    base: 'group flex items-center gap-2',
    control: 'size-4 rounded border',
    label: 'text-sm font-medium',
  },
  variants: {
    size: {
      sm: { control: 'size-3', label: 'text-xs' },
      md: { control: 'size-4', label: 'text-sm' },
    },
  },
});

const { base, control, label } = checkbox({ size: 'md' });
```

Both are valid choices - cva is simpler, tv is more powerful.
