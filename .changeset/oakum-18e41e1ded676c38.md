---
'@oakoss/ui': minor
---

chartColor returns undefined for a config with no series, so its return type now includes undefined. Select's trigger and IconPlaceholder no longer log console warnings; axe's nested-interactive rule reports a focusable element in a Select trigger. Internal cleanups to the chart hooks and date inputs.
