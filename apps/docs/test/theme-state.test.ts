import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { themeOptions } from '#/lib/theme-items';
import { themeScript, themeStorageKey } from '#/lib/theme-state';

const options = themeOptions();
const shared = { family: 'mauve', primary: 'red', radius: 'none' };

type Storage = { getItem: () => null | string; setItem: () => void };

// Runs the inline script as the page does, with only the globals it reads.
function run(search: string, storage: Storage) {
  const dataset: Record<string, string> = {};
  const style: Record<string, null | string> = {};
  const saved: string[] = [];
  runInNewContext(themeScript(options), {
    document: {
      documentElement: {
        dataset,
        style: {
          setProperty: (name: string, value: null | string) => {
            style[name] = value;
          },
        },
      },
    },
    localStorage: {
      getItem: storage.getItem,
      setItem: (key: string, value: string) => {
        storage.setItem();
        saved.push(`${key}=${value}`);
      },
    },
    location: { search },
    URLSearchParams,
  });
  return { dataset, radius: style['--radius'], saved };
}

function stored(value: string): Storage {
  return { getItem: () => value, setItem: () => undefined };
}

const blocked: Storage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
};

describe('the inline theme script', () => {
  it('prefers URL parameters to the stored choice, and stores them', () => {
    const { dataset, radius, saved } = run(
      '?family=mauve&primary=red&radius=none',
      stored(JSON.stringify({ family: 'olive', primary: 'blue' })),
    );
    expect(dataset).toEqual(shared);
    expect(radius).toBe('0rem');
    expect(saved).toEqual([`${themeStorageKey}=${JSON.stringify(shared)}`]);
  });

  it('applies the stored choice without a family in the URL', () => {
    const { dataset, saved } = run(
      '?primary=red',
      stored(JSON.stringify(shared)),
    );
    expect(dataset).toEqual(shared);
    expect(saved).toEqual([]);
  });

  it('applies URL parameters when storage is blocked', () => {
    const { dataset } = run('?family=mauve&primary=red&radius=none', blocked);
    expect(dataset).toEqual(shared);
  });

  it.each([
    ['blocked storage', blocked],
    ['invalid JSON', stored('{')],
    ['a stored string', stored('"mauve"')],
    ['a stored array', stored('["mauve"]')],
    ['null fields', stored('{"family":null,"primary":null}')],
  ])('falls back to the defaults on %s', (_, storage) => {
    const { dataset, radius } = run('', storage);
    expect(dataset).toEqual(options.defaults);
    expect(radius).toBe('0.625rem');
  });

  it("replaces a primary or radius the family doesn't offer", () => {
    const { dataset } = run('?family=olive&primary=mauve&radius=huge', blocked);
    expect(dataset).toEqual({
      family: 'olive',
      primary: 'olive',
      radius: options.defaults.radius,
    });
  });
});
