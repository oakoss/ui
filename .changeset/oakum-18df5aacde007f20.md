---
'@oakoss/ui': patch
---

Text Field, Search Field, Sheet and `cx` import their types with `import type`, so an installed copy no longer keeps a runtime import of a module it uses only for types.
