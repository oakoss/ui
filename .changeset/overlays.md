---
'@oakoss/ui': minor
---

### Added

Dialog: a modal built on React Aria's Modal and Dialog, with a title, description, footer and close buttons, sizes (`sm`, `md`, `lg`, `full`), and a `DialogBody` that scrolls between a fixed header and footer. Its height follows the visible viewport, and below the `sm` breakpoint every size but `full` sits on the bottom edge. Install with `npx shadcn@latest add oakoss/ui/dialog`.

AlertDialog: a dialog for a decision. Focus starts on Cancel, a click outside doesn't close it, and `AlertDialogAction` runs `onAction` before closing: a returned promise shows the button's pending state and blocks dismissal, and a failure keeps the dialog open and goes to `onError`. Install with `npx shadcn@latest add oakoss/ui/alert-dialog`.
