---
'@oakoss/ui': minor
---

### Added

Dialog: a modal built on React Aria's Modal and Dialog, with a title, description, footer and close buttons, sizes (`sm`, `md`, `lg`, `full`), and a `DialogBody` that scrolls between a fixed header and footer. Its height follows the visible viewport, and below the `sm` breakpoint every size but `full` sits on the bottom edge. Install with `npx shadcn@latest add oakoss/ui/dialog`.

AlertDialog: a dialog for a decision. Focus starts on Cancel, a click outside doesn't close it, and `AlertDialogAction` runs `onAction` before closing: a returned promise shows the button's pending state and blocks dismissal, and a failure keeps the dialog open and goes to `onError`. Install with `npx shadcn@latest add oakoss/ui/alert-dialog`.

Sheet: a panel that slides in from an edge, built on Dialog. `side` takes `start` and `end`, which follow the page's `dir`, plus `top` and `bottom`; `size` sets a side sheet's width, and a bottom sheet pads for a phone's home indicator. Install with `npx shadcn@latest add oakoss/ui/sheet`.

Popover: a panel anchored to a trigger, built on Dialog's parts, so `PopoverTitle` names it. `showArrow` adds an arrow that points at the trigger, `PopoverBody` scrolls tall content, and the panel sits on the `--z-popover` layer. `popoverStyles` and `PopoverArrow` let another React Aria popover share its look. Install with `npx shadcn@latest add oakoss/ui/popover`.

Tooltip: a short label on hover or keyboard focus. Hover waits half a second to open and to close, the arrow points at the trigger from any placement, and it sits on the `--z-tooltip` layer above popovers and toasts. Any trigger React Aria can focus works without a wrapper. Install with `npx shadcn@latest add oakoss/ui/tooltip`.

HoverCard: a preview of a link's content on hover, keyboard focus or long press, built on React Aria's `PreviewTrigger` (react-aria-components 1.20 or later) with Popover's styles. It requires a name, keeps React Aria's 600ms and 200ms delays, and stays reachable inside an open Dialog. Install with `npx shadcn@latest add oakoss/ui/hover-card`.

ContextualHelp: a help or info icon button that opens a Popover of explanation, for help a tooltip can't hold or touch can't reach. Its labels are props, and the popover lines up with the button's start edge. Install with `npx shadcn@latest add oakoss/ui/contextual-help`.
