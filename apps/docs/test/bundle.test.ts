import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

const client = path.join(import.meta.dirname, '../dist/client');
const assets = path.join(client, 'assets');

// Client chunks other than the per-page MDX ones, which every page shares.
function sharedChunks() {
  return readdirSync(assets)
    .filter((file) => file.endsWith('.js'))
    .filter((file) => !file.includes('.mdx'))
    .map((file) => ({ file, size: statSync(path.join(assets, file)).size }));
}

// A shared chunk over this means something like a whole icon set got bundled
// into every page.
it('keeps every shared client chunk under 400 kB', () => {
  expect(sharedChunks().filter(({ size }) => size > 400_000)).toEqual([]);
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
