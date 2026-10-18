import { families } from '@oakoss/tokens';
import { describe, expect, it } from 'vitest';

import { tokenReference } from '#/lib/token-reference';

const reference = tokenReference();

const groupRows = (id: string) =>
  reference.groups.find((group) => group.id === id)?.rows.length;

// The table and the Markdown throw on a missing entry, so these keep every
// choice the switchers offer renderable.
describe('tokenReference', () => {
  const flavorKeys = Object.values(families).flatMap((family) =>
    Object.keys(family.flavors).map((flavor) => `${family.id}/${flavor}`),
  );

  it.each(flavorKeys)('has every group of %s', (key) => {
    const theme = reference.themes[key];
    const lengths = Object.fromEntries(
      reference.groups.map(({ id }) => [id, theme?.[id]?.length]),
    );
    expect(lengths).toEqual(
      Object.fromEntries(
        reference.groups.map(({ id, rows }) => [id, rows.length]),
      ),
    );
  });

  it('has the Primary group under every primary choice', () => {
    const missing = Object.values(families).flatMap((family) =>
      Object.keys(family.flavors).flatMap((flavor) =>
        family.intents.primary.choices
          .map((primary) => `${family.id}/${flavor}/${primary}`)
          .filter(
            (key) =>
              reference.primaryThemes[key]?.length !== groupRows('primary'),
          ),
      ),
    );
    expect(missing).toEqual([]);
  });

  it('indexes only stored sources and colors', () => {
    const entries = [
      ...Object.values(reference.themes).flatMap((theme) =>
        Object.values(theme).flat(),
      ),
      ...Object.values(reference.primaryThemes).flat(),
    ];
    const looked = entries.flatMap(([source, color]) => [
      reference.sources[source],
      reference.colors[color],
    ]);
    expect(looked).not.toContain(undefined);
  });
});

describe('tokenReference families', () => {
  it('opens each family on its default light flavor, listed first', () => {
    expect(
      reference.families.map(({ defaultFlavor, flavors }) => [
        defaultFlavor,
        flavors[0],
      ]),
    ).toEqual(
      reference.families.map(() => [
        'light',
        expect.objectContaining({ id: 'light' }),
      ]),
    );
  });
});
