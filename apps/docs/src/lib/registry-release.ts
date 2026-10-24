// The hosted registry: each directory's items depend on items in the same
// directory, so an install stays on one release whichever item it starts
// from (shadcn resolves every dependency by its own address).

import { siteUrl } from './site.ts';

const origin = /^https:\/\/[a-z\d-]+(?:\.[a-z\d-]+)+$/u;
const sameRepo = /^oakoss\/ui\/([\w-]+)(?:#.*)?$/u;
const tagPattern = /^v(\d+)\.(\d+)\.(\d+)$/u;
// shadcn's placeholder in a namespace URL, filled with the item's name.
const itemName = '{name}';

type Item = Record<string, unknown>;

export function isItem(value: unknown): value is Item {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// The namespace URL for a directory, as components.json takes it.
export function namespaceUrl(dir: string) {
  return `${dir}/${itemName}.json`;
}

// The version in a package.json's text.
export function packageVersion(text: string): string {
  const json: unknown = JSON.parse(text);
  if (!isItem(json) || typeof json.version !== 'string') {
    throw new Error('package.json has no version');
  }
  return json.version;
}

// The origin a build's registry is served from, from REGISTRY_URL: a PR
// preview's own address, so installs from it stay on the PR, or the site's.
export function registryOrigin(value: string | undefined): string {
  if (value === undefined || value === '') return siteUrl;
  if (!origin.test(value)) {
    throw new Error(`REGISTRY_URL "${value}" isn't an https origin`);
  }
  return value;
}

// The versions the changelog records as released, from its `## x.y.z`
// headings: the releases the hosted registry must have a directory for.
export function releasedVersions(changelog: string): string[] {
  return changelog
    .matchAll(/^## (\d+\.\d+\.\d+)\b/gmu)
    .map(([, version = '']) => version)
    .toArray();
}

// shadcn build also writes registry.json, an index of every item. Anything
// else would ship unrewritten, so it throws.
export function releaseFile(json: unknown, dir: string): Item {
  if (!isItem(json)) throw new Error("a built registry file isn't an object");
  if (!Array.isArray(json.items)) return releaseItem(json, dir);
  return {
    ...json,
    items: json.items.map((item: unknown) => {
      if (!isItem(item))
        throw new Error("a registry index entry isn't an item");
      return releaseItem(item, dir);
    }),
  };
}

// `dir` is the directory's URL, such as https://ui.oakoss.dev/v0.6.0/r.
export function releaseItem(item: Item, dir: string): Item {
  const out: Item = { ...item };
  if (Array.isArray(item.registryDependencies)) {
    out.registryDependencies = item.registryDependencies.map((dep: unknown) => {
      const name =
        typeof dep === 'string' ? sameRepo.exec(dep)?.[1] : undefined;
      return name === undefined ? dep : `${dir}/${name}.json`;
    });
  }
  // `shadcn init` writes a base item's config into components.json, so a
  // new project gets the namespace for this directory.
  if (item.type === 'registry:base') {
    const config = isItem(item.config) ? item.config : {};
    out.config = { ...config, registries: { '@oakoss': namespaceUrl(dir) } };
  }
  return out;
}

// Release tags at or below the version, oldest first. Selected by version
// rather than reachability, which a shallow clone can't answer.
export function releaseTags(tags: string[], version: string): string[] {
  const ceiling = parts(`v${version}`);
  if (ceiling === undefined) throw new Error(`"${version}" isn't a version`);
  return tags
    .map((tag) => ({ at: parts(tag), tag }))
    .filter(
      (entry): entry is { at: number[]; tag: string } =>
        entry.at !== undefined && compare(entry.at, ceiling) <= 0,
    )
    .toSorted((a, b) => compare(a.at, b.at))
    .map(({ tag }) => tag);
}

function compare(a: number[], b: number[]) {
  for (const [i, n] of a.entries()) {
    const diff = n - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function parts(tag: string) {
  const match = tagPattern.exec(tag);
  return match === null ? undefined : match.slice(1).map(Number);
}
