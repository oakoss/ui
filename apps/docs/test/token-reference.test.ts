import { families } from '@oakoss/tokens';
import { describe, expect, it } from 'vitest';

import { tokenReference } from '#/lib/token-reference';
import { groupValues } from '#/lib/token-values';

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

function valueOf(
  groupId: string,
  name: string,
  choice: Parameters<typeof groupValues>[2],
) {
  return groupValues(reference, groupId, choice).values.find(
    (token) => token.name === name,
  );
}

describe('groupValues', () => {
  it("decodes a token's source and color", () => {
    expect(
      valueOf('neutral', 'background', { family: 'zinc', flavor: 'dark' }),
    ).toMatchObject({
      color: 'oklch(0.141 0.005 285.823)',
      source: 'zinc-950',
    });
  });

  // Every group reads the default primary unless the Primary group is asked
  // for another.
  it('reads the chosen primary for the Primary group only', () => {
    const choice = { family: 'zinc', flavor: 'dark', primary: 'blue' };
    expect(valueOf('primary', 'primary', choice)?.source).toBe('blue-600');
    expect(valueOf('derived', 'ring', choice)?.source).toBe('--primary-text');
    expect(
      valueOf('primary', 'primary', { family: 'zinc', flavor: 'dark' })?.source,
    ).toBe('zinc-200');
  });

  it('throws on a choice the data lacks', () => {
    expect(() =>
      groupValues(reference, 'neutral', { family: 'zinc', flavor: 'dim' }),
    ).toThrow('no neutral tokens for zinc/dim');
    expect(() =>
      groupValues(reference, 'nope', { family: 'zinc', flavor: 'light' }),
    ).toThrow('no token group "nope"');
  });
});

describe('tokenReference families', () => {
  it('opens each family on its default light flavor, listed first', () => {
    expect(
      reference.families.map(({ defaultFlavor, flavors, id }) => [
        id,
        defaultFlavor,
        flavors[0]?.id,
      ]),
    ).toEqual(
      Object.values(families).map(({ defaults, id }) => [
        id,
        defaults.light,
        defaults.light,
      ]),
    );
  });

  it("lists all four of Catppuccin's flavors", () => {
    const catppuccin = reference.families.find(({ id }) => id === 'catppuccin');
    expect(catppuccin?.flavors.map(({ name }) => name)).toEqual([
      'Latte',
      'Frappé',
      'Macchiato',
      'Mocha',
    ]);
  });
});
