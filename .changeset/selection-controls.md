---
'@oakoss/ui': minor
---

### Added

Checkbox: built on React Aria's `CheckboxField` and `CheckboxButton`, with its children as the label, so the label is the name and the click target. `description` and `errorMessage` or `errors` sit under the label, wired with no ids. Indeterminate shows a minus, an invalid box keeps its error border when checked, the box's hit area grows to 44px (`targetSize={false}` turns it off), and checked boxes stay visible in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/checkbox`.

Radio Group: `RadioGroup` takes a `label`, `description` and errors, and its `RadioGroupItem`s take their label as children and a `description` each, all wired with no ids. Built on React Aria's `RadioField` and `RadioButton`. `orientation="horizontal"` lays options out in a row, and `variant="card"` makes each option a card that selects from anywhere on it. A selected dot is a thick ring that stays visible in Windows High Contrast, and stacked options sit far enough apart for their 44px targets. Install with `npx shadcn@latest add oakoss/ui/radio-group`.

Switch: built on React Aria's `SwitchField` and `SwitchButton`, with its children as the label, so the label is the name and the click target. `size` takes `sm` and `md`, and `labelPlacement="start"` makes a settings row with the switch at the end. The thumb stays inside the track right to left, where upstream's overflowed, and stays visible on and off in Windows High Contrast. Install with `npx shadcn@latest add oakoss/ui/switch`.

Field: `Field` lays out a label and control, `vertical` by default; `horizontal` keeps them in a row, and `responsive` is a row once its `FieldGroup` is 28rem wide. `FieldContent` stacks a label and description beside a control, and `FieldSeparator` divides fields, with optional text between two lines. `Field` adds no role or context, so it leaves React Aria's own wiring alone. Links in `FieldDescription` are underlined. Installing Field now also installs Separator.
