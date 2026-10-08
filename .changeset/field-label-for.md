---
'@oakoss/ui': patch
---

### Fixed

FieldLabel: a label pointed at its own control with `htmlFor` names only that control. Inside a React Aria field it also took the field's label id, so a checkbox label in a TextField repeated the field's id.
