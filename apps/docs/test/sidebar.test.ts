import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const components = path.join(import.meta.dirname, '../content/docs/components');
const client = path.join(import.meta.dirname, '../dist/client');

const meta: unknown = JSON.parse(
  readFileSync(path.join(components, 'meta.json'), 'utf-8'),
);
const entries: string[] =
  typeof meta === 'object' &&
  meta !== null &&
  'pages' in meta &&
  Array.isArray(meta.pages)
    ? meta.pages.map(String)
    : [];

function byName(a: string, b: string) {
  return a.localeCompare(b);
}

// A heading followed by another heading, or by nothing.
function emptyGroups(list: string[]): string[] {
  return list.filter(
    (entry, index) =>
      isSeparator(entry) &&
      (index === list.length - 1 || isSeparator(list[index + 1])),
  );
}

function isSeparator(entry: string | undefined): boolean {
  return entry !== undefined && /^---.+---$/u.test(entry);
}

// Each `Components: <group>` section of llms.txt with the pages it links.
function llmsGroups(): Record<string, string[]> {
  const llms = readFileSync(path.join(client, 'llms.txt'), 'utf-8');
  return Object.fromEntries(
    llms
      .split('\n## Components: ')
      .slice(1)
      .map((section) => {
        const [name = '', ...lines] =
          section.split('\n## ', 1)[0]?.split('\n') ?? [];
        const pages = lines
          .map((line) => /\/docs\/components\/([\w-]+)\.md\)/u.exec(line)?.[1])
          .filter((page) => page !== undefined);
        return [name, pages];
      }),
  );
}

// Each group in components/meta.json with its pages, in order.
function metaGroups(): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  let current = '';
  for (const entry of entries) {
    if (isSeparator(entry)) {
      current = entry.slice(3, -3);
      groups[current] = [];
    } else {
      groups[current]?.push(entry);
    }
  }
  return groups;
}

const listed = entries.filter((entry) => !isSeparator(entry));

// A page the list leaves out drops from the sidebar, and the prerender,
// which finds pages by their links, never builds it.
describe('components sidebar', () => {
  it('lists every component page once, in a group', () => {
    const pages = readdirSync(components)
      .filter((file) => file.endsWith('.mdx'))
      .map((file) => file.replace(/\.mdx$/u, ''));
    expect(listed.toSorted(byName)).toEqual(pages.toSorted(byName));
    expect(new Set(listed).size).toBe(listed.length);
    expect(isSeparator(entries[0])).toBe(true);
  });

  it('gives every group at least one page', () => {
    expect(emptyGroups(entries)).toEqual([]);
  });

  it('shows the group names in the built sidebar', () => {
    const html = readFileSync(
      path.join(client, 'docs/components/button/index.html'),
      'utf-8',
    );
    for (const name of ['Getting started', 'Date and time', 'Feedback']) {
      expect(html).toContain(`>${name}<`);
    }
  });
});

describe('sidebar groups in the generated output', () => {
  it('gives llms.txt one section per group, with its pages', () => {
    expect(llmsGroups()).toEqual(metaGroups());
  });

  // A separator heads every folder after it in the breadcrumbs, so the
  // folders sit behind a nameless one.
  it('keeps Getting started out of the other areas in search', () => {
    const search = readFileSync(path.join(client, 'api/search'), 'utf-8');
    expect(search).toContain('"breadcrumbs":["Docs","Components","Buttons"]');
    expect(search).toContain('"breadcrumbs":["Docs","Guides"]');
    expect(search).not.toMatch(
      /"Getting started","(?:Components|Guides|Theming)"/u,
    );
  });
});
