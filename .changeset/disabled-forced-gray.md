---
'@oakoss/ui': patch
---

### Fixed

A disabled Button, Toggle, ToggleGroupItem, or React Aria `Link` styled with `buttonStyles` paints like a native disabled button in Windows High Contrast: the system's disabled color, unfaded. A disabled link styled as a button showed black text at half opacity, and a disabled button showed the disabled color at half opacity. A disabled toggle that's on takes the disabled color too, rather than the selection colors, which made it look live.
