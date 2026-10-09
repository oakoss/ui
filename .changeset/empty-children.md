---
'@oakoss/ui': patch
---

### Fixed

TextField treats a `label` or `description` that renders nothing, such as an empty fragment or an array of `false` and `null`, as absent, so it mounts no empty part for the input to point at. FieldError treats such children as absent too, so it falls back to `errors` rather than showing nothing. Field exports the check as `isEmptyNode`.
