---
'@oakoss/ui': patch
---

### Fixed

A pressed item in a joined ToggleGroup keeps its size rather than shrinking away from its neighbors. An item's own corner classes, such as `rounded-full`, now set its outer corners in a joined group while its inner corners stay square; before, the group's corners won outside and the item's inside. Joining now comes from a shared `joined` recipe in `lib/recipes.ts`, which ButtonGroup uses too.
