import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { expect, test } from 'vitest';

import { mobileQuery } from '#/components/ui/navigation/sidebar-provider';

const theme = readFileSync(
  createRequire(import.meta.url).resolve('tailwindcss/theme.css'),
  'utf-8',
);
const md = /--breakpoint-md:\s*(?<width>[^;]+);/u.exec(theme)?.groups?.width;

// The layout's `md:` classes and the hook that mounts the phone sheet must
// switch at the same width.
test("the phone query ends at Tailwind's md breakpoint", () => {
  expect(md).toBeDefined();
  expect(mobileQuery).toBe(`(width < ${md})`);
});
