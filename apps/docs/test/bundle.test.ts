import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

const client = path.join(import.meta.dirname, '../dist/client');
const assets = path.join(client, 'assets');

function chunks() {
  return readdirSync(assets)
    .filter((file) => file.endsWith('.js'))
    .map((file) => ({ file, size: statSync(path.join(assets, file)).size }));
}

// A chunk over this means something got inlined that should load on its own:
// a whole icon set, or the Manual tab's file sources in a page.
it('keeps every client chunk under 400 kB', () => {
  expect(chunks().filter(({ size }) => size > 400_000)).toEqual([]);
});

it("renders the sidebar's page icons", () => {
  const html = readFileSync(
    path.join(client, 'docs/components/button/index.html'),
    'utf-8',
  );
  expect(html).toMatch(
    /<a[^>]*href="\/docs\/?"[^>]*>(?:(?!<\/a>).)*lucide-book-open/su,
  );
});
