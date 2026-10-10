---
'@oakoss/ui': minor
---

### Added

Select: single or multiple selection from a list, built on React Aria's `Select`. Its children are the options, with `label`, `description`, `errors`, `errorMessage`, `placeholder` and `size` around the trigger, where upstream had no field props, and its own field example named the select "Fruits" while the label read "Favorite Fruit". Invalid styling follows React Aria's state, in a custom layout too, where upstream's keyed on an `aria-invalid` React Aria never sets, so its error border never showed. The trigger's hit area reaches 44px. An option's `description` describes it in the list and is hidden in the trigger, where upstream read it as part of the trigger's name. The list is at least the trigger's width, so long options aren't cut off, the trigger shows focus as an outline, the focused option takes the system's selection colors in Windows High Contrast, and spacing follows the reading direction. Sections draw their own dividers, where upstream's separator was an invalid child of the listbox. `selectionMode="multiple"` lists the picks in the user's language, and `start` and `end` put text or an icon inside the trigger. Install with `npx shadcn@latest add oakoss/ui/select`.
