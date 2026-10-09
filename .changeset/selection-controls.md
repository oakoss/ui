---
'@oakoss/ui': minor
---

### Added

Checkbox: built on React Aria's `CheckboxField` and `CheckboxButton`, with its children as the label, so the label is the name and the click target. `description` and `errorMessage` or `errors` sit under the label, wired with no ids. Indeterminate shows a minus, an invalid box keeps its error border when checked, the box's hit area grows to 44px (`targetSize={false}` turns it off), and checked boxes stay visible in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/checkbox`.

Radio Group: `RadioGroup` takes a `label`, `description` and errors, and its `RadioGroupItem`s take their label as children and a `description` each, all wired with no ids. Built on React Aria's `RadioField` and `RadioButton`. `orientation="horizontal"` lays options out in a row, and `variant="card"` makes each option a card that selects from anywhere on it. A selected dot is a thick ring that stays visible in Windows High Contrast, and stacked options sit far enough apart for their 44px targets. Install with `npx shadcn@latest add oakoss/ui/radio-group`.

Switch: built on React Aria's `SwitchField` and `SwitchButton`, with its children as the label, so the label is the name and the click target. `size` takes `sm` and `md`, and `labelPlacement="start"` makes a settings row with the switch at the end. The thumb stays inside the track right to left, where upstream's overflowed, and stays visible on and off in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/switch`.

Slider: takes a `label`, shown with the value formatted for the locale, and a `description` that React Aria's Slider can't link, wired to every thumb. A range requires `thumbLabels`, so each thumb has its own name ("Minimum Price"), where upstream's thumbs shared one. The thumbs sit inside the track, so they stay on the fill's end with a label above, where upstream's drifted. The track takes presses in a 44px band, `orientation="vertical"` stands it upright, and the rail, fill and thumbs stay visible in Windows High Contrast. A disabled slider marks its whole group disabled, not just the inputs. `children` replace the layout with `FieldLabel`, `SliderOutput`, `SliderTrack` and `FieldDescription`. Install with `npx shadcn@latest add oakoss/ui/slider`.

Toggle: a React Aria `ToggleButton` on Button's sizes and 44px target, in `ghost` or `outline`. On is Button's solid neutral fill, where upstream's matched its hover at 1.1:1 and vanished in Windows High Contrast; there it now takes the system's selection colors. Icon sizes require an `aria-label`. Install with `npx shadcn@latest add oakoss/ui/toggle`.

Toggle Group: `ToggleGroup` and `ToggleGroupItem` select one option, as a radio group, or several with `selectionMode="multiple"`, as a toolbar. Items take the group's `size` and `variant` unless they set their own, where upstream's group overrode them, and show Toggle's solid on state, where upstream's matched its hover. Each item requires the `id` the group selects it by. Items sit 8px apart, or edge to edge with `joined`, whose corners follow right-to-left layouts and whose selected neighbors keep a line between them. Install with `npx shadcn@latest add oakoss/ui/toggle-group`.

Field: `Field` lays out a label and control, `vertical` by default; `horizontal` keeps them in a row, and `responsive` is a row once its `FieldGroup` is 28rem wide. `FieldContent` stacks a label and description beside a control, and `FieldSeparator` divides fields, with optional text between two lines. `Field` adds no role or context, so it leaves React Aria's own wiring alone. Installing Field now also installs Separator.
