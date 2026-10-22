import registry from '@oakoss/ui/registry.json' with { type: 'json' };
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { expect, it } from 'vitest';

import { isShownAsSource } from '#/lib/registry-paths';

const client = path.join(import.meta.dirname, '../dist/client');
const assets = path.join(client, 'assets');
const serverAssets = path.join(import.meta.dirname, '../dist/server/assets');

function chunks() {
  return readdirSync(assets)
    .filter((file) => file.endsWith('.js'))
    .map((file) => ({ file, size: statSync(path.join(assets, file)).size }));
}

// The file name, without its extension, of every file a Manual tab shows.
function manualSourceStems() {
  return registry.items
    .flatMap((item) => item.files ?? [])
    .filter((file) => isShownAsSource(file))
    .map((file) => path.basename(file.path).replace(/\.[^.]+$/u, ''));
}

function scriptsContaining(dir: string, text: string) {
  return readdirSync(dir).filter(
    (file) =>
      file.endsWith('.js') &&
      readFileSync(path.join(dir, file), 'utf-8').includes(text),
  );
}

// A chunk over this means something got inlined that should load on its own:
// a whole icon set, or the Manual tab's file sources in a page.
it('keeps every client chunk under 400 kB', () => {
  expect(chunks().filter(({ size }) => size > 400_000)).toEqual([]);
});

// The theme panel's choices come from a virtual module, so the token package
// that computes them never reaches the browser. The server bundle, which
// serves the theme items, shows the marker still names token code.
it('keeps the token package out of the client', () => {
  const marker = "isn't one of its choices";
  expect(scriptsContaining(serverAssets, marker)).not.toEqual([]);
  expect(scriptsContaining(assets, marker)).toEqual([]);
});

// The Manual tab test tells a file's source chunk from a component's runtime
// chunk of the same name by this prefix.
it('names every Manual source chunk source-<file>-<hash>.js', () => {
  const sourceChunks = new Set(
    chunks().map(({ file }) => /^source-(.+)-[\w-]{8}\.js$/u.exec(file)?.[1]),
  );
  expect(manualSourceStems().filter((stem) => !sourceChunks.has(stem))).toEqual(
    [],
  );
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
