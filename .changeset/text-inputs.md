---
'@oakoss/ui': minor
---

### Added

Textarea: a React Aria `TextArea` that grows with its content through CSS `field-sizing: content`, from `minRows` (3 by default) up to `maxRows`, then scrolls, where upstream's grew without limit and ignored `rows`. One row is exactly an Input of the same `size`, with its text on the same line. Where the box grows on its own the resize handle is hidden, since a drag would fix the height; `autoGrow={false}` keeps a fixed height with a vertical handle, and older browsers without auto-grow keep the handle too. Focus is an outline, so it shows in Windows High Contrast, where upstream's box-shadow ring disappeared. `TextareaField` takes TextField's label, description and error props with a Textarea in place of the input. Install with `npx shadcn@latest add oakoss/ui/textarea`, or `text-field` for `TextareaField`.

### Changed

Input moves from `field.tsx` to its own `input.tsx` and registry item, as upstream has it. `add field` still installs it, but imports change from `@ui/inputs/field` to `@ui/inputs/input`.
