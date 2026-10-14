---
'@oakoss/ui': patch
---

Input hides WebKit's built-in search clear button and decoration, so Command's input and the new Search Field show only their own. A Text Field with `type="search"` no longer shows the browser's clear button; `className="[&_input::-webkit-search-cancel-button]:block"` on the Text Field brings it back.
