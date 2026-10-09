# Changelog

## 0.2.0 (2026-10-09)

### Added

Dialog: a modal built on React Aria's Modal and Dialog, with a title, description, footer and close buttons, sizes (`sm`, `md`, `lg`, `full`), and a `DialogBody` that scrolls between a fixed header and footer. Its height follows the visible viewport, and below the `sm` breakpoint every size but `full` sits on the bottom edge. `DialogContent` is the panel on its own, for a custom modal. Install with `npx shadcn@latest add oakoss/ui/dialog`.

AlertDialog: a dialog for a decision. Focus starts on Cancel, a click outside doesn't close it, and `AlertDialogAction` runs `onAction` before closing: a returned promise shows the button's pending state and blocks dismissal, and a failure keeps the dialog open and goes to `onError`. Install with `npx shadcn@latest add oakoss/ui/alert-dialog`.

Sheet: a panel that slides in from an edge, built on Dialog. `side` takes `start` and `end`, which follow the page's `dir`, plus `top` and `bottom`; `size` sets a side sheet's width, and a bottom sheet pads for a phone's home indicator. Install with `npx shadcn@latest add oakoss/ui/sheet`.

Popover: a panel anchored to a trigger, built on Dialog's parts, so `PopoverTitle` names it. `showArrow` adds an arrow that points at the trigger, `PopoverBody` scrolls tall content, and the panel sits on the `--z-popover` layer. `PopoverContent` is the panel without the dialog, for another React Aria popover to share its look. Install with `npx shadcn@latest add oakoss/ui/popover`.

Tooltip: a short label on hover or keyboard focus. Hover waits half a second to open and to close, the arrow points at the trigger from any placement, and it sits on the `--z-tooltip` layer above popovers and toasts. Any trigger React Aria can focus works without a wrapper, and open state lives on `TooltipTrigger`, so a disabled trigger's tooltip stays closed. Install with `npx shadcn@latest add oakoss/ui/tooltip`.

HoverCard: a preview of a link's content on hover, keyboard focus or long press, built on React Aria's `PreviewTrigger` (react-aria-components 1.20 or later) with Popover's styles. It requires a name, keeps React Aria's 600ms and 200ms delays, and stays reachable inside an open Dialog. Install with `npx shadcn@latest add oakoss/ui/hover-card`.

ContextualHelp: a help or info icon button that opens a Popover of explanation, for help a tooltip can't hold or touch can't reach. Its labels are props, and the popover lines up with the button's start edge. Install with `npx shadcn@latest add oakoss/ui/contextual-help`.

Checkbox: built on React Aria's `CheckboxField` and `CheckboxButton`, with its children as the label, so the label is the name and the click target. `description` and `errorMessage` or `errors` sit under the label, wired with no ids. Indeterminate shows a minus, an invalid box keeps its error border when checked, the box's hit area grows to 44px (`targetSize={false}` turns it off), and checked boxes stay visible in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/checkbox`.

Radio Group: `RadioGroup` takes a `label`, `description` and errors, and its `RadioGroupItem`s take their label as children and a `description` each, all wired with no ids. Built on React Aria's `RadioField` and `RadioButton`. `orientation="horizontal"` lays options out in a row, and `variant="card"` makes each option a card that selects from anywhere on it. A selected dot is a thick ring that stays visible in Windows High Contrast, and stacked options sit far enough apart for their 44px targets. Install with `npx shadcn@latest add oakoss/ui/radio-group`.

Switch: built on React Aria's `SwitchField` and `SwitchButton`, with its children as the label, so the label is the name and the click target. `size` takes `sm` and `md`, and `labelPlacement="start"` makes a settings row with the switch at the end. The thumb stays inside the track right to left, where upstream's overflowed, and stays visible on and off in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/switch`.

Slider: takes a `label`, shown with the value formatted for the locale, and a `description` that React Aria's Slider can't link, wired to every thumb. A range requires `thumbLabels`, so each thumb has its own name ("Minimum Price"), where upstream's thumbs shared one. The thumbs sit inside the track, so they stay on the fill's end with a label above, where upstream's drifted. The track takes presses in a 44px band, `orientation="vertical"` stands it upright, and the rail, fill and thumbs stay visible in Windows High Contrast. A disabled slider marks its whole group disabled, not just the inputs. `children` replace the layout with `FieldLabel`, `SliderOutput`, `SliderTrack` and `FieldDescription`. Install with `npx shadcn@latest add oakoss/ui/slider`.

Toggle: a React Aria `ToggleButton` on Button's sizes and 44px target, in `ghost` or `outline`. On is Button's solid neutral fill, where upstream's matched its hover at 1.1:1 and vanished in Windows High Contrast; there it now takes the system's selection colors. Icon sizes require an `aria-label`. Install with `npx shadcn@latest add oakoss/ui/toggle`.

Toggle Group: `ToggleGroup` and `ToggleGroupItem` select one option, as a radio group, or several with `selectionMode="multiple"`, as a toolbar. Items take the group's `size` and `variant` unless they set their own, where upstream's group overrode them, and show Toggle's solid on state, where upstream's matched its hover. Each item requires the `id` the group selects it by. Items sit 8px apart, or edge to edge with `joined`, whose corners follow right-to-left layouts and whose selected neighbors keep a line between them. Install with `npx shadcn@latest add oakoss/ui/toggle-group`.

Field: `Field` lays out a label and control, `vertical` by default; `horizontal` keeps them in a row, and `responsive` is a row once its `FieldGroup` is 28rem wide. `FieldContent` stacks a label and description beside a control, and `FieldSeparator` divides fields, with optional text between two lines. `Field` adds no role or context, so it leaves React Aria's own wiring alone. Installing Field now also installs Separator.

Avatar: a person's image with initials in `AvatarFallback` that show until it loads, and stay when it fails. The image reads its state when mounted, so a server-rendered image that loaded before hydration shows; it starts over when `src` changes, and a lazy image still loads. `size` takes `sm`, `md` and `lg`; `AvatarBadge` marks a status at the end edge, and `AvatarGroup` overlaps avatars as a `group`. The parts are spans, so an avatar fits in a link or button. Install with `npx shadcn@latest add oakoss/ui/avatar`.

Card: a surface for related content, with `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` and `CardFooter`. `CardTitle` is a heading (`level`, 3 by default), `size="sm"` tightens every part, and the card keeps a border in Windows High Contrast. The docs show a clickable card built from a stretched link. Install with `npx shadcn@latest add oakoss/ui/card`.

Empty: an empty state, with `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription` and `EmptyContent`. `EmptyTitle` is a heading (`level`, 3 by default) and `EmptyDescription` a paragraph. `EmptyMedia` is hidden from screen readers unless named, and its `icon` variant keeps an outline in Windows High Contrast. Its `data-slot` is `empty-media`, where upstream renders `empty-icon`. Install with `npx shadcn@latest add oakoss/ui/empty`.

Kbd: a keyboard key, and `KbdGroup` for a combination. A `label` prop has screen readers say "Command" instead of reading ⌘. Inside a React Aria menu item, the group takes the shortcut's id, so the item's description reads the whole combination and no id repeats. Install with `npx shadcn@latest add oakoss/ui/kbd`.

Scroll Area: a region that scrolls its content with thin native scrollbars, whose thumb meets 3:1 contrast. It's focusable, so keyboard users can scroll it, with the focus ring inside its edge; `orientation` limits scrolling to `vertical` or `horizontal`. Install with `npx shadcn@latest add oakoss/ui/scroll-area`.

Skeleton: a placeholder shape with a pulse, shown while content loads. It's `aria-hidden` by default, and the docs show marking the loading region `aria-busy` instead. Install with `npx shadcn@latest add oakoss/ui/skeleton`.

Spinner: a spinning indicator announced as an indeterminate progress bar, so screen readers say its `label` ("Loading" by default) instead of reading an unnamed icon. It's a `span`, so it fits inside text and buttons. `size` takes `sm`, `md` and `lg`, and it takes the surrounding text color. Install with `npx shadcn@latest add oakoss/ui/spinner`.

Separator: a horizontal or vertical divider built on React Aria's Separator, drawn as a border so it stays visible in Windows High Contrast. A horizontal separator rendered as a `div` keeps its line, and `data-orientation` is set for both orientations. Install with `npx shadcn@latest add oakoss/ui/separator`.

### Changed

Button: a pending button renders the new Spinner, a `span`, instead of React Aria's ProgressBar `div`, which isn't allowed inside a `<button>`. Its name and announcement are unchanged ("Save Pending"). Installing Button now also installs Spinner.

The z-index scale gains `--z-tooltip` (1600) above everything, and `--z-toast` moves from 1500 to 1350, between modal and popover, so a menu opened from a toast renders above it. **Breaking:** `--z-dropdown` is removed. React Aria renders menus and lists as popovers, so replace it with `--z-popover`.

### Fixed

FieldDescription, DialogDescription and EmptyDescription underline links nested in other text, such as a link inside `<strong>`, not only links placed directly in the description, so no link relies on color alone.

TextField treats a `label` or `description` that renders nothing, such as an empty fragment or an array of `false` and `null`, as absent, so it mounts no empty part for the input to point at. FieldError treats such children as absent too, so it falls back to `errors` rather than showing nothing. Field exports the check as `isEmptyNode`.

FieldLabel: a label pointed at its own control with `htmlFor` names only that control. Inside a React Aria field it also took the field's label id, so a checkbox label in a TextField repeated the field's id.

## 0.1.0 (2026-10-06)

### Added

First release. Install with the shadcn CLI from this repository: the base item (theme, color-scheme and reduced-motion styles, Lucide icons), Button, Text Field and Field, built on React Aria Components and Tailwind CSS v4.

Generated by oakum 0.5.0.
