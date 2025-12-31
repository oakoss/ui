# What Makes a Good Design System

> Research on design system requirements from Atlassian, IBM Carbon, Shopify Polaris, Mantine, and shadcn/ui.

## Executive Summary

A complete design system needs:

1. **Design Tokens** - The atomic values (colors, spacing, typography)
2. **Components** - Reusable UI building blocks
3. **Patterns** - Common solutions to recurring problems
4. **Documentation** - Usage guidelines and examples
5. **Tooling** - CLI, Figma kits, linting, IDE support

---

## 1. Design Tokens

Design tokens are the single source of truth for design decisions.

### Token Categories

| Category        | Examples                                         | Notes                                                       |
| --------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| **Color**       | background, foreground, primary, destructive     | Need semantic naming, not visual (e.g., `danger` not `red`) |
| **Spacing**     | 0, 1, 2, 4, 8, 12, 16, 20, 24...                 | Consistent scale (4px base common)                          |
| **Typography**  | font-family, font-size, line-height, font-weight | Heading + body scales                                       |
| **Border**      | width, radius, color                             | radius-sm, radius-md, radius-lg                             |
| **Shadow**      | elevation levels                                 | 3-5 levels typically                                        |
| **Motion**      | duration, easing                                 | Enter, exit, hover timings                                  |
| **Breakpoints** | sm, md, lg, xl, 2xl                              | Responsive design                                           |
| **Z-Index**     | layer hierarchy                                  | Dropdown, modal, toast levels                               |

### Semantic Color System

From Polaris and Atlassian - use semantic tokens, not raw colors:

```css
/* Background tokens */
--color-bg                    /* Default page background */
--color-bg-surface            /* Card/panel background */
--color-bg-surface-hover      /* Hover state */
--color-bg-surface-selected   /* Selected state */
--color-bg-inverse            /* Dark backgrounds */

/* Foreground tokens */
--color-text                  /* Primary text */
--color-text-secondary        /* Muted text */
--color-text-disabled         /* Disabled state */
--color-text-inverse          /* Text on dark bg */

/* Semantic tokens */
--color-bg-success            /* Success backgrounds */
--color-bg-warning            /* Warning backgrounds */
--color-bg-critical           /* Error backgrounds */
--color-bg-info               /* Info backgrounds */

/* Interactive tokens */
--color-bg-fill-brand         /* Primary actions */
--color-bg-fill-brand-hover   /* Hover state */
--color-border-focus          /* Focus rings */
```

### State Tokens

Every interactive color needs state variants:

- `default` - Resting state
- `hover` - Mouse over
- `active` / `pressed` - Mouse down
- `focus` - Keyboard focus
- `disabled` - Not interactive
- `selected` - Active selection

---

## 2. Component Categories

Based on Atlassian, Polaris, and shadcn component libraries:

### Core (Must Have)

| Category         | Components                                                                         |
| ---------------- | ---------------------------------------------------------------------------------- |
| **Actions**      | Button, Button Group, Link                                                         |
| **Forms**        | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Form, Label, Field Error |
| **Layout**       | Box, Stack, Inline, Grid, Divider, Card                                            |
| **Navigation**   | Tabs, Breadcrumbs, Pagination, Link                                                |
| **Overlays**     | Dialog/Modal, Popover, Tooltip, Dropdown Menu, Sheet/Drawer                        |
| **Feedback**     | Toast, Banner/Alert, Progress, Spinner, Skeleton                                   |
| **Data Display** | Badge, Avatar, Table                                                               |

### Extended (High Value)

| Category            | Components                                                  |
| ------------------- | ----------------------------------------------------------- |
| **Selection**       | Combobox/Autocomplete, Date Picker, Color Picker, Tag Input |
| **Advanced Layout** | Accordion, Collapsible, Resizable Panels                    |
| **Navigation**      | Command Palette, Navigation Menu, Sidebar                   |
| **Data**            | Data Table (sorting, filtering, pagination), Tree View      |
| **Media**           | Image, Video Thumbnail, Carousel                            |

### Enterprise (Complex Needs)

| Category               | Components                                             |
| ---------------------- | ------------------------------------------------------ |
| **Advanced Forms**     | Multi-select, Date Range Picker, File Upload/Drop Zone |
| **Data Visualization** | Charts (via Recharts/etc.)                             |
| **Layout Systems**     | Page Layout, App Shell, Frame                          |
| **Drag and Drop**      | Sortable lists, Kanban boards                          |
| **Rich Text**          | WYSIWYG Editor                                         |

---

## 3. Community-Driven Needs

From shadcn/ui GitHub issues (sorted by reactions):

### Most Requested Features

1. **Multi-select** (#66) - The #1 most requested component
2. **Tree View with Drag & Drop** (#4642) - File explorers, nested lists
3. **Sidebar close on mobile item click** (#5561) - UX improvement
4. **Tailwind v4 support** (#5949, #6446) - Framework compatibility

### Common Pain Points

1. **Calendar/DatePicker stability** - react-day-picker version issues
2. **Hydration errors** - Theme provider + Next.js SSR
3. **Mobile responsiveness** - Sidebar, dialogs on small screens
4. **Form validation integration** - React Hook Form, TanStack Form

---

## 4. Enterprise Requirements

From Carbon, Atlassian, and enterprise adoption patterns:

### Accessibility (Non-negotiable)

- WCAG 2.1 AA compliance minimum
- Screen reader testing (VoiceOver, NVDA, JAWS)
- Keyboard navigation for all interactive elements
- Focus management for modals, dialogs
- Reduced motion support
- High contrast mode support

### Internationalization

- RTL layout support
- Date/number/currency formatting
- Locale-aware components (calendars, date pickers)
- String externalization (no hardcoded UI text)

### Theming & Customization

- Multiple theme support (light, dark, high contrast)
- Brand customization via tokens
- Component-level style overrides
- CSS-in-JS or CSS custom properties

### Developer Experience

- TypeScript support (full type coverage)
- Tree-shaking (minimal bundle impact)
- SSR/RSC compatibility
- Framework adapters (Next.js, Remix, etc.)
- ESLint/Stylelint plugins
- Storybook integration

### Documentation

- API reference for every component
- Usage guidelines (when to use, when not to use)
- Accessibility notes
- Code examples (copy-paste ready)
- Figma design kit synchronization

### Tooling

| Tool                  | Purpose                               |
| --------------------- | ------------------------------------- |
| **CLI**               | Component installation, project setup |
| **Figma Kit**         | Design-to-code alignment              |
| **ESLint Plugin**     | Enforce design system usage           |
| **VS Code Extension** | Autocomplete, documentation           |
| **Storybook**         | Component development, testing        |

---

## 5. Architecture Patterns

### Composition Over Configuration

Prefer:

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

Over:

```tsx
<Dialog trigger={<Button>Open</Button>} title="Title" content={/* ... */} />
```

### Primitive + Styled Layers

```text
Layer 1: Headless primitives (React Aria)
         └── Accessibility, behavior, state management

Layer 2: Styled components (Your design system)
         └── Visual design, variants, tokens

Layer 3: Patterns/Blocks (Pre-built compositions)
         └── Common UI patterns, page layouts
```

### Variant System

Use a consistent variant API across components:

```tsx
// Standard variants
variant: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';

// Standard sizes
size: 'sm' | 'md' | 'lg';

// Semantic variants for feedback
tone: 'success' | 'warning' | 'critical' | 'info';
```

---

## 6. Recommended Component Priority

### Phase 1: Foundation

Essential for any app:

- [ ] Button (with variants)
- [ ] Input, Textarea, Label
- [ ] Checkbox, Radio, Switch
- [ ] Select
- [ ] Dialog/Modal
- [ ] Dropdown Menu
- [ ] Popover
- [ ] Tooltip
- [ ] Toast/Sonner
- [ ] Card
- [ ] Badge
- [ ] Tabs

### Phase 2: Forms & Layout

For form-heavy applications:

- [ ] Form (with validation)
- [ ] Combobox/Autocomplete
- [ ] Date Picker
- [ ] Slider
- [ ] Field (label + input + error wrapper)
- [ ] Stack, Inline, Grid primitives
- [ ] Separator/Divider
- [ ] Accordion

### Phase 3: Data & Navigation

For data-rich applications:

- [ ] Table (basic)
- [ ] Data Table (sorting, filtering)
- [ ] Pagination
- [ ] Breadcrumbs
- [ ] Navigation Menu
- [ ] Sidebar
- [ ] Command Palette

### Phase 4: Advanced

For complex applications:

- [ ] Multi-select
- [ ] Tree View
- [ ] Calendar
- [ ] Date Range Picker
- [ ] Color Picker
- [ ] File Upload/Drop Zone
- [ ] Resizable Panels
- [ ] Drawer/Sheet

---

## 7. Success Metrics

How to measure design system success:

### Adoption

- Component usage across projects
- Developer satisfaction (NPS)
- Time to first component usage

### Quality

- Accessibility audit scores
- Bundle size impact
- Test coverage

### Efficiency

- Time saved vs building from scratch
- Consistency across products
- Design-to-code accuracy

---

## 8. Distribution Model: Registry-Only

Unlike Mantine or other design systems that publish npm packages, React Aria UI uses **registry-only distribution** via the shadcn CLI.

### Why Registry-Only?

| Aspect            | npm Packages             | Registry (shadcn)     |
| ----------------- | ------------------------ | --------------------- |
| **Ownership**     | Library maintains code   | User owns the code    |
| **Customization** | Override/extend          | Direct modification   |
| **Updates**       | Automatic via npm        | Manual, intentional   |
| **Bundle size**   | May include unused       | Only what you use     |
| **Versioning**    | semver, breaking changes | User controls updates |

### What Gets Distributed

Everything goes through the registry - no npm packages to install:

| Type           | Registry Type    | Target Path      | Example                       |
| -------------- | ---------------- | ---------------- | ----------------------------- |
| **Components** | `registry:ui`    | `components/ui/` | button, dialog, select        |
| **Hooks**      | `registry:hook`  | `hooks/`         | use-media-query, use-debounce |
| **Utilities**  | `registry:lib`   | `lib/`           | cn, formatters                |
| **Blocks**     | `registry:block` | various          | login-form, data-table        |

### Hook Distribution

Hooks are distributed the same way as components:

```bash
# Install a hook
pnpm dlx shadcn add https://react-aria-ui.dev/r/use-media-query.json

# Creates: hooks/use-media-query.ts
```

Registry entry for a hook:

```json
{
  "name": "use-media-query",
  "type": "registry:hook",
  "title": "useMediaQuery",
  "description": "Subscribe to media query changes",
  "files": [
    {
      "path": "registry/hooks/use-media-query.ts",
      "type": "registry:hook"
    }
  ]
}
```

### Priority Hooks (Mantine-inspired)

Based on Mantine's most useful hooks, prioritize these for the registry:

| Hook                   | Purpose                            |
| ---------------------- | ---------------------------------- |
| `use-media-query`      | Responsive breakpoints             |
| `use-local-storage`    | Persistent state                   |
| `use-debounced-value`  | Debounce state changes             |
| `use-disclosure`       | Open/close state (modals, drawers) |
| `use-clipboard`        | Copy to clipboard                  |
| `use-hotkeys`          | Keyboard shortcuts                 |
| `use-intersection`     | Intersection observer              |
| `use-scroll-into-view` | Scroll element into view           |
| `use-focus-trap`       | Trap focus in container            |
| `use-idle`             | Detect user idle state             |

### Comparison: Mantine's Package Architecture

For reference, Mantine uses npm packages:

| Package                  | Purpose               |
| ------------------------ | --------------------- |
| `@mantine/core`          | Core components       |
| `@mantine/hooks`         | 70+ utility hooks     |
| `@mantine/form`          | Form state management |
| `@mantine/dates`         | Date pickers          |
| `@mantine/notifications` | Toast system          |

**Our equivalent:** All of these would be individual registry items that users install as needed.

---

## 9. Mantine: A Full-Featured Reference

[Mantine](https://mantine.dev) is an excellent reference for component scope:

### Stats

- 120+ components
- 70+ hooks
- 28K+ GitHub stars

### Component Categories (Mantine)

**Layout:** AppShell, AspectRatio, Center, Container, Flex, Grid, Group, SimpleGrid, Space, Stack

**Inputs:** AngleSlider, Checkbox, Chip, ColorInput, ColorPicker, Fieldset, FileInput, Input, JsonInput, NativeSelect, NumberInput, PasswordInput, PinInput, Radio, RangeSlider, Rating, SegmentedControl, Slider, Switch, Textarea, TextInput

**Combobox:** Autocomplete, Combobox, MultiSelect, Pill, PillsInput, Select, TagsInput

**Buttons:** ActionIcon, Button, CloseButton, CopyButton, FileButton, UnstyledButton

**Navigation:** Anchor, Breadcrumbs, Burger, NavLink, Pagination, Stepper, TableOfContents, Tabs, Tree

**Feedback:** Alert, Loader, Notification, Progress, RingProgress, SemiCircleProgress, Skeleton

**Overlays:** Affix, Dialog, Drawer, FloatingIndicator, HoverCard, LoadingOverlay, Menu, Modal, Overlay, Popover, Tooltip

**Data Display:** Accordion, Avatar, BackgroundImage, Badge, Card, ColorSwatch, Image, Indicator, Kbd, NumberFormatter, Spoiler, ThemeIcon, Timeline

**Typography:** Blockquote, Code, Highlight, List, Mark, Table, Text, Title

**Miscellaneous:** Box, Collapse, Divider, FocusTrap, Paper, Portal, ScrollArea, Transition, VisuallyHidden

### Key Takeaways from Mantine

1. **Hooks Library** - 70+ hooks is a major differentiator (use-move, use-resize-observer, use-hotkeys, use-eye-dropper, etc.)

2. **Form Library** - Built-in form management with validation, not requiring external libs

3. **Styles API** - Every component exposes internal parts for custom styling

4. **Combobox Composability** - Single Combobox primitive powers Select, MultiSelect, Autocomplete, TagsInput

5. **PostCSS Preset** - Mixins for dark/light mode, RTL, responsive styles

6. **Extensions** - Separate packages for complex features (editor, charts, notifications)

7. **Templates** - Official templates for Vite, Next.js, Gatsby, React Router, including TanStack Start

8. **Color Scheme** - First-class dark mode with `defaultColorScheme="dark"`

---

## References

- [Atlassian Design System](https://atlassian.design)
- [IBM Carbon Design System](https://carbondesignsystem.com)
- [Shopify Polaris](https://polaris.shopify.com)
- [Mantine](https://mantine.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [React Aria](https://react-spectrum.adobe.com/react-aria/)
