import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

import { themeOptions } from '#/lib/theme-items';
import { themeItemPath } from '#/lib/theme-state';

const themes = path.join(import.meta.dirname, '../dist/client/r/themes');

// Built from the panel's choices rather than the prerender list, so an item
// the build skips still fails.
it('prerenders every theme item the theme panel offers', () => {
  const { families, radii } = themeOptions();
  const offered = families.flatMap(({ id, primaries }) =>
    primaries.flatMap((primary) =>
      radii.map(({ name }) =>
        themeItemPath({ family: id, primary: primary.id, radius: name }),
      ),
    ),
  );
  const files = readdirSync(themes).map((file) => `/r/themes/${file}`);
  expect(new Set(files)).toEqual(new Set(offered));
  expect(files).toHaveLength(offered.length);
});

it("redeclares theme.css's radius scale for the panel's radius", () => {
  const ui = path.dirname(
    fileURLToPath(import.meta.resolve('@oakoss/ui/themes.css')),
  );
  const theme = scale(readFileSync(path.join(ui, 'theme.css'), 'utf-8'));
  const app = scale(
    readFileSync(
      path.join(import.meta.dirname, '../src/styles/app.css'),
      'utf-8',
    ),
  );
  expect(theme).not.toEqual([]);
  expect(app).toEqual(theme);
});

// Every step derived from --radius, so a new one fails until app.css has it.
function scale(css: string): string[] {
  return css
    .matchAll(/^\s*(--radius-[\w-]+: [^;]*var\(--radius\)[^;]*);/gmu)
    .map(([, declaration]) => declaration ?? '')
    .toArray();
}
