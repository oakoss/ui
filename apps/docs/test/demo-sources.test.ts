import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

import { demoCode, demos } from '#/lib/demo-sources';

const client = path.join(import.meta.dirname, '../dist/client');
const components = path.join(import.meta.dirname, '../content/docs/components');

const previews = readdirSync(components)
  .filter((file) => file.endsWith('.mdx'))
  .flatMap((file) =>
    readFileSync(path.join(components, file), 'utf-8')
      .matchAll(/<ComponentPreview name="([^"]+)"/gu)
      .map(([, name = '']) => ({ name, page: file.replace(/\.mdx$/u, '') }))
      .toArray(),
  );

// The Markdown nests the code inside the tabs, indented.
function unindented(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');
}

// The page loads each Code tab's source on open; the Markdown output keeps
// it inline, imports rewritten.
it.each(previews)('writes $name into the $page Markdown', ({ name, page }) => {
  const markdown = readFileSync(
    path.join(client, `docs/components/${page}.md`),
    'utf-8',
  );
  const demo = readFileSync(path.join(demos, `${name}.tsx`), 'utf-8');
  expect(unindented(markdown)).toContain(unindented(demoCode(demo).trim()));
});
