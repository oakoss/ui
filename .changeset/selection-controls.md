---
'@oakoss/ui': minor
---

### Added

Field: `Field` lays out a label and control, `vertical` by default; `horizontal` keeps them in a row, and `responsive` is a row once its `FieldGroup` is 28rem wide. `FieldContent` stacks a label and description beside a control, and `FieldSeparator` divides fields, with optional text between two lines. `Field` adds no role or context, so it leaves React Aria's own wiring alone. Links in `FieldDescription` are underlined. Installing Field now also installs Separator.
