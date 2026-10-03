import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import { cnTheme } from '#/lib/cn-config';

const css = readFileSync(
  new URL('../styles/theme.css', import.meta.url),
  'utf8',
);
const plainTheme = /^@theme \{\n(?<body>[\s\S]*?)^\}/mu.exec(css)?.groups?.body;
// `--text-ui--line-height` modifies `text-ui`; it isn't a utility of its own.
const utilities = (plainTheme ?? '')
  .matchAll(/^\s+--(?<ns>[a-z]+)-(?<name>[\w-]+):/gmu)
  .map((match) => [match.groups?.ns ?? '', match.groups?.name ?? ''] as const)
  .filter(([, name]) => !name.includes('--'))
  .toArray();
const expected: Record<string, string[]> = {};
for (const [namespace, name] of utilities) {
  (expected[namespace] ??= []).push(name);
}
for (const names of Object.values(expected)) {
  names.sort((a, b) => a.localeCompare(b));
}

describe('cnTheme', () => {
  test('matches the utilities in the plain @theme block', () => {
    expect(cnTheme).toEqual(expected);
  });
});
