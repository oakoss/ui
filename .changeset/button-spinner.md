---
'@oakoss/ui': patch
---

### Changed

Button: a pending button renders the new Spinner, a `span`, instead of React Aria's ProgressBar `div`, which isn't allowed inside a `<button>`. Its name and announcement are unchanged ("Save Pending"). Installing Button now also installs Spinner.
