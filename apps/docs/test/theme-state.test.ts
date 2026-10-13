import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

import { themeOptions } from '#/lib/theme-items';
import { themeScript, themeStorageKey } from '#/lib/theme-state';

const options = themeOptions();
const shared = { family: 'mauve', primary: 'red', radius: 'none' };

type Storage = { getItem: () => null | string; setItem: () => void };

// Runs the inline script as the page does, with only the globals it reads.
function run(
  search: string,
  storage: Storage,
  { hash = '', historyBlocked = false } = {},
) {
  const dataset: Record<string, string> = {};
  const style: Record<string, null | string> = {};
  const saved: string[] = [];
  const urls: string[] = [];
  const state = { key: 'router' };
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
    history: {
      replaceState: (kept: unknown, _: string, url: string) => {
        if (historyBlocked) throw new Error('SecurityError');
        expect(kept).toBe(state);
        urls.push(url);
      },
      state,
    },
    localStorage: {
      getItem: storage.getItem,
      setItem: (key: string, value: string) => {
        storage.setItem();
        saved.push(`${key}=${value}`);
      },
    },
    location: { hash, pathname: '/docs/components/button', search },
    URLSearchParams,
  });
  return {
    dataset,
    radius: style['--preview-radius'],
    saved,
    siteRadius: style['--site-radius'],
    urls,
  };
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
    const { dataset, radius, saved, siteRadius } = run(
      '?family=mauve&primary=red&radius=none',
      stored(JSON.stringify({ family: 'olive', primary: 'blue' })),
    );
    expect(dataset).toEqual(shared);
    expect(radius).toBe('0rem');
    expect(siteRadius).toBe('0.625rem');
    expect(saved).toEqual([`${themeStorageKey}=${JSON.stringify(shared)}`]);
  });

  it('takes the theme parameters out of the address bar', () => {
    const { urls } = run(
      '?q=dialog&family=mauve&primary=red&radius=none',
      stored('null'),
      { hash: '#usage' },
    );
    expect(urls).toEqual(['/docs/components/button?q=dialog#usage']);
  });

  it('drops the ? when no other parameters remain', () => {
    const { urls } = run(
      '?family=mauve&primary=red&radius=none',
      stored('null'),
    );
    expect(urls).toEqual(['/docs/components/button']);
  });

  it('applies the stored choice without a family in the URL', () => {
    const { dataset, saved, urls } = run(
      '?primary=red',
      stored(JSON.stringify(shared)),
    );
    expect(dataset).toEqual(shared);
    expect(saved).toEqual([]);
    expect(urls).toEqual([]);
  });
});

describe('the inline theme script on bad input', () => {
  // The script runs again before hydration and needs the parameters then.
  it('applies URL parameters and keeps them when storage is blocked', () => {
    const { dataset, urls } = run(
      '?family=mauve&primary=red&radius=none',
      blocked,
    );
    expect(dataset).toEqual(shared);
    expect(urls).toEqual([]);
  });

  it('applies and stores URL parameters when history is blocked', () => {
    const { dataset, saved } = run(
      '?family=mauve&primary=red&radius=none',
      stored('null'),
      { historyBlocked: true },
    );
    expect(dataset).toEqual(shared);
    expect(saved).toEqual([`${themeStorageKey}=${JSON.stringify(shared)}`]);
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
