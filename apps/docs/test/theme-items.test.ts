import { readdirSync } from 'node:fs';
import path from 'node:path';
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
