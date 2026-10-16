#!/usr/bin/env bash
# Fails when the token generator would change its output files, so they're
# committed up to date. Compares the files themselves rather than git status,
# which would also flag unrelated uncommitted edits in packages/ui.
set -euo pipefail

cd "$(dirname "$0")/.."
files=(
  packages/ui/src/styles/theme.css
  packages/ui/src/styles/themes.css
  packages/ui/src/lib/cn-config.ts
  packages/ui/registry.json
)

before="$(git hash-object "${files[@]}")"
pnpm --silent --filter @oakoss/tokens generate >/dev/null
after="$(git hash-object "${files[@]}")"

if [ "$before" != "$after" ]; then
  echo "Generated theme files were stale and have been regenerated; review and commit them:" >&2
  git status --short -- "${files[@]}" >&2
  git diff -- "${files[@]}" >&2
  exit 1
fi
