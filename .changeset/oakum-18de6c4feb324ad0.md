---
'@oakoss/ui': patch
---

Tag Group, Select, Combobox, Dropdown Menu, Context Menu and Command render their empty label through a shared `lib/empty-state.ts`, which installs with each of them. Tag Group's empty label is now a block like the others'.
