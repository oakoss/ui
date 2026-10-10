---
'@oakoss/ui': minor
---

### Added

Textarea: a React Aria `TextArea` that grows with its content through CSS `field-sizing: content`, from `minRows` (3 by default) up to `maxRows`, then scrolls, where upstream's grew without limit and ignored `rows`. One row is exactly an Input of the same `size`, with its text on the same line. Where the box grows on its own the resize handle is hidden, since a drag would fix the height; `autoGrow={false}` keeps a fixed height with a vertical handle, and older browsers without auto-grow keep the handle too. Focus is an outline, so it shows in Windows High Contrast, where upstream's box-shadow ring disappeared. `TextareaField` takes TextField's label, description and error props with a Textarea in place of the input. Install with `npx shadcn@latest add oakoss/ui/textarea`, or `text-field` for `TextareaField`.

InputGroup: text, icons and buttons inside an input's or textarea's border, built on React Aria's `Group`. Upstream wrapped Input and Textarea in parts of their own; ours go in as they are, dropping their border and focus outline for the group's. The outline wraps the group while the input has focus, where upstream's box-shadow ring vanished in Windows High Contrast, and a focused addon button shows only its own. Clicking an addon focuses the control, textarea included, but not when the click lands on something interactive, where upstream's found only an input and took focus from a select. Addons are plain elements rather than unnamed groups, and an unnamed group adds nothing for screen readers. Buttons in an addon are small and ghost with no 44px hit area, and the spacing follows the reading direction. `size` sets the height. Install with `npx shadcn@latest add oakoss/ui/input-group`.

TextField and TextareaField take `start` and `end`: text or an icon inside the border, in an InputGroup. Text is added to the input's description, so screen readers hear a unit such as "kg"; on a textarea they sit above and below it.

### Changed

Input moves from `field.tsx` to its own `input.tsx` and registry item, as upstream has it. `add field` still installs it, but imports change from `@ui/inputs/field` to `@ui/inputs/input`.
