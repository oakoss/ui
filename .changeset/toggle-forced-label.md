---
'@oakoss/ui': patch
---

### Fixed

Toggle and ToggleGroupItem keep their label visible when on in Windows High Contrast. The page-colored backplate forced colors draw behind text covered the selection fill, so the light label disappeared; a selected toggle now opts out of it and paints its label on the system's selection color.
