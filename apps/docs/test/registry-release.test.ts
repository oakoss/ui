import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  isItem,
  namespaceUrl,
  packageVersion,
  releasedVersions,
  releaseFile,
  releaseItem,
  releaseTags,
} from '#/lib/registry-release';
import { siteUrl } from '#/lib/site';

const client = path.join(import.meta.dirname, '../dist/client');
const dir = `${siteUrl}/v0.6.0/r`;

describe('releaseTags', () => {
  it('keeps release tags at or below the version, oldest first', () => {
    expect(
      releaseTags(
        ['v0.10.0', 'v0.2.0', 'v0.9.1', 'v1.0.0', 'v0.2.0-rc.1', 'x', ''],
        '0.10.0',
      ),
    ).toEqual(['v0.2.0', 'v0.9.1', 'v0.10.0']);
  });

  it('rejects a version that is not one', () => {
    expect(() => releaseTags([], 'next')).toThrow('"next"');
  });
});

describe('releasedVersions', () => {
  it("reads the changelog's version headings", () => {
    expect(
      releasedVersions(
        '# @oakoss/ui\n\n## 0.10.0 (2026-11-01)\n\n### Minor\n\n## 0.9.1\n- ## 1.0.0 in prose\n',
      ),
    ).toEqual(['0.10.0', '0.9.1']);
  });
});

describe('releaseItem', () => {
  it('points same-repo dependencies, pinned or not, into the directory', () => {
    expect(
      releaseItem(
        {
          name: 'button',
          registryDependencies: [
            'oakoss/ui/theme',
            'oakoss/ui/spinner#v0.5.0',
            'https://example.com/r/x.json',
            'acme/ui/button',
          ],
        },
        dir,
      ).registryDependencies,
    ).toEqual([
      `${dir}/theme.json`,
      `${dir}/spinner.json`,
      'https://example.com/r/x.json',
      'acme/ui/button',
    ]);
  });

  it("adds the directory's namespace to a base item's config", () => {
    expect(
      releaseItem(
        { config: { iconLibrary: 'lucide' }, type: 'registry:base' },
        dir,
      ).config,
    ).toEqual({
      iconLibrary: 'lucide',
      registries: { '@oakoss': namespaceUrl(dir) },
    });
    expect(releaseItem({ type: 'registry:ui' }, dir)).not.toHaveProperty(
      'config',
    );
  });
});

describe('releaseFile', () => {
  it('throws on a file that would ship unrewritten', () => {
    expect(() => releaseFile([], dir)).toThrow("isn't an object");
    expect(() => releaseFile({ items: ['button'] }, dir)).toThrow(
      "isn't an item",
    );
  });

  it('rewrites every item of an index', () => {
    expect(
      releaseFile(
        { items: [{ registryDependencies: ['oakoss/ui/theme'] }] },
        dir,
      ),
    ).toEqual({ items: [{ registryDependencies: [`${dir}/theme.json`] }] });
  });
});

// The built site, as `build-registry` leaves it after `vite build`.
const version = packageVersion(
  readFileSync(
    path.join(import.meta.dirname, '../../../packages/ui/package.json'),
    'utf-8',
  ),
);
const tags = releaseTags(
  execFileSync('git', ['tag', '--list', 'v*'], { encoding: 'utf-8' }).split(
    '\n',
  ),
  version,
);

function dependencies(entries: Record<string, unknown>[]): unknown[] {
  return entries.flatMap(({ registryDependencies: deps }) =>
    Array.isArray(deps) ? (deps as unknown[]) : [],
  );
}

function files(sub: string) {
  return readdirSync(path.join(client, sub)).filter((file) =>
    file.endsWith('.json'),
  );
}

function indexItems(json: unknown) {
  if (!isItem(json) || !Array.isArray(json.items)) {
    throw new Error('not a registry index');
  }
  return json.items.filter((item: unknown) => isItem(item));
}

// The item names a tree's registry.json lists: the tag's, or this tree's.
function itemNames(tag?: string) {
  const text =
    tag === undefined
      ? readFileSync(
          path.join(import.meta.dirname, '../../../packages/ui/registry.json'),
          'utf-8',
        )
      : execFileSync('git', ['show', `${tag}:packages/ui/registry.json`], {
          encoding: 'utf-8',
        });
  return indexItems(JSON.parse(text)).map(({ name }) => String(name));
}

function read(file: string) {
  const json: unknown = JSON.parse(
    readFileSync(path.join(client, file), 'utf-8'),
  );
  if (!isItem(json)) throw new Error(`${file} isn't an item`);
  return json;
}

const directories = [
  { sub: 'r', tag: undefined },
  ...tags.map((tag) => ({ sub: `${tag}/r`, tag })),
];

function byName(a: string, b: string) {
  return a.localeCompare(b);
}

// Every dependency in a directory: its items' and its index's.
function directoryDependencies(sub: string) {
  const items = files(sub)
    .filter((file) => file !== 'registry.json')
    .map((file) => read(`${sub}/${file}`));
  return [
    ...dependencies(items),
    ...dependencies(indexItems(read(`${sub}/registry.json`))),
  ];
}

describe('each hosted registry directory', () => {
  it.each(directories)('$sub holds its tree’s items and no others', (dir) => {
    const names = itemNames(dir.tag);
    expect(files(dir.sub).toSorted(byName)).toEqual(
      [...names.map((name) => `${name}.json`), 'registry.json'].toSorted(
        byName,
      ),
    );
    expect(
      indexItems(read(`${dir.sub}/registry.json`)).map(({ name }) => name),
    ).toEqual(names);
  });

  it.each(directories)(
    '$sub depends only on items in its own directory',
    ({ sub }) => {
      const expected = new Set(
        files(sub)
          .filter((file) => file !== 'registry.json')
          .map((file) => `${siteUrl}/${sub}/${file}`),
      );
      const deps = directoryDependencies(sub);
      expect(deps).not.toEqual([]);
      expect(deps.filter((dep) => !expected.has(String(dep)))).toEqual([]);
      expect(read(`${sub}/base.json`).config).toMatchObject({
        registries: { '@oakoss': namespaceUrl(`${siteUrl}/${sub}`) },
      });
    },
  );
});

describe('the hosted registry', () => {
  it('has a directory for each release tag and no other', () => {
    const versioned = readdirSync(client).filter((entry) =>
      /^v\d+\.\d+\.\d+$/u.test(entry),
    );
    expect(versioned.toSorted(byName)).toEqual(tags.toSorted(byName));
  });

  it("points the theme panel's items at the latest release", () => {
    const themes = files('r/themes');
    expect(themes).not.toEqual([]);
    expect(
      new Set(
        themes.map((file) =>
          JSON.stringify(read(`r/themes/${file}`).registryDependencies),
        ),
      ),
    ).toEqual(new Set([JSON.stringify([`${siteUrl}/r/theme.json`])]));
  });
});
