---
'@oakoss/ui': major
---

### Changed

The z-index scale gains `--z-tooltip` (1600) above everything, and `--z-toast` moves from 1500 to 1350, between modal and popover, so a menu opened from a toast renders above it. **Breaking:** `--z-dropdown` is removed. React Aria renders menus and lists as popovers, so replace it with `--z-popover`.
