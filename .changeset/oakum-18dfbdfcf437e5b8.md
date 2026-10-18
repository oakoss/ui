---
'@oakoss/ui': patch
---

Yellow and lime primaries stay yellow in dark mode: they fill at step 500 with dark text, as shadcn's accent themes do, instead of a dark olive at step 700. Light mode is unchanged, since shadcn's light yellow fails 3:1 against white.
