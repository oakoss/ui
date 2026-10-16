#!/usr/bin/env bash
# Fails when a workspace package lacks a name, lint configs or a test script.
set -euo pipefail

cd "$(dirname "$0")/.."
workspace="$(pnpm ls -r --depth -1 --json | jq -e '
  (map(.path) | min_by(length)) as $root
  | map(. + {dir: (.path | ltrimstr($root) | ltrimstr("/"))})
  | map(select(.dir != ""))
  | if length == 0 then error("pnpm found no workspace packages") else . end')"
jq -e '
  [.[] | select(.name == null) | .dir]
  | if length > 0 then error("workspace packages without a name: \(join(" "))") else true end' <<<"$workspace" >/dev/null
no_lint="$(jq -r '.[] | select(.dir | startswith("tooling/") | not) | .dir' <<<"$workspace" | while IFS= read -r dir; do
  [ -f "$dir/oxlint.config.ts" ] && [ -f "$dir/eslint.config.js" ] || echo "$dir"
done)"
if [ -n "$no_lint" ]; then
  echo "Missing oxlint.config.ts or eslint.config.js in: $no_lint" >&2
  exit 1
fi
# Config-only tooling packages are covered by typecheck and lint.
exempt="$(jq -c '[.[] | select(.dir | startswith("tooling/")) | .name]' <<<"$workspace")"
missing="$(pnpm turbo run test --dry=json | jq -er --argjson exempt "$exempt" '
  (.packages | if length == 0 then error("turbo found no workspace packages") else . end)
  - $exempt
  - [.tasks[] | select(.task == "test" and (.command | type) == "string" and .command != "<NONEXISTENT>") | .package]
  | join(" ")')"
if [ -n "$missing" ]; then
  echo "No test script in: $missing" >&2
  exit 1
fi
