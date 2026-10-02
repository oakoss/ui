import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { staticPages } from '../src/lib/static-pages';

const client = path.join(import.meta.dirname, '../dist/client');
const content = path.join(import.meta.dirname, '../content/docs');

// Each content page with its source file and the HTML and Markdown files it
// should prerender to.
function contentPages(
  dir = content,
  prefix = '',
): [string, string, string, string][] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const slug = path.join(prefix, entry.name.replace(/\.mdx$/u, ''));
    if (entry.isDirectory()) {
      return contentPages(path.join(dir, entry.name), slug);
    }
    if (!entry.name.endsWith('.mdx')) return [];
    const html =
      slug === 'index' ? 'docs/index.html' : `docs/${slug}/index.html`;
    return [
      [slug, path.join(dir, entry.name), html, `docs/${slug}.md`],
    ] as const;
  });
}

// The rendered text between the Props heading and the React Aria link.
function propsSection(file: string) {
  const text = visibleText(file);
  return text.slice(text.indexOf('Props'), text.indexOf('Also accepts'));
}

function read(file: string) {
  return readFileSync(path.join(client, file), 'utf8');
}

// Markdown link targets in a source file that are not absolute, an anchor, or
// an external URL.
function relativeLinks(source: string) {
  return readFileSync(source, 'utf8')
    .matchAll(/\]\(([^)\s]+)/gu)
    .map((match) => match[1] ?? '')
    .filter((target) => !/^(?:\/|#|https?:)/u.test(target))
    .toArray();
}

// Text a visitor sees, without the hydration payload in <script> tags.
function visibleText(file: string) {
  return read(file)
    .replaceAll(/<script[\s\S]*?<\/script>/gu, '')
    .replaceAll(/<[^>]+>/gu, ' ');
}

const pages = contentPages();
// Listed here rather than read from staticPages, so dropping an entry there
// fails instead of removing its own check.
const unlinkedFiles = ['404.html', 'api/search', 'llms.txt', 'llms-full.txt'];
const htmlFiles = readdirSync(client, { recursive: true })
  .map(String)
  .filter((file) => file.endsWith('.html'));

describe('prerendered docs', () => {
  it.each(pages)('renders %s', (_slug, _source, html, markdown) => {
    expect(existsSync(path.join(client, html))).toBe(true);
    expect(existsSync(path.join(client, markdown))).toBe(true);
  });

  it.each(htmlFiles)('renders %s without a failed boundary', (file) => {
    // React leaves this marker where a Suspense boundary failed to render,
    // which still produces a 200 page with the content missing.
    expect(read(file)).not.toContain('<!--$!-->');
  });

  it.each(pages)('links %s with absolute paths', (_slug, source) => {
    // Relative links render as links back to the current page.
    expect(relativeLinks(source)).toEqual([]);
  });
});

describe('prerendered site files', () => {
  it('prerenders every unlinked route', () => {
    expect(staticPages.map((page) => page.file)).toEqual(unlinkedFiles);
  });

  it.each(unlinkedFiles)('prerenders %s', (file) => {
    expect(existsSync(path.join(client, file))).toBe(true);
  });

  it('prerenders a 404 page for the host', () => {
    expect(visibleText('404.html')).toContain('Not Found');
  });

  it('bakes the page loader into static files for client navigation', () => {
    const cache = path.join(client, '__tsr/staticServerFnCache');
    expect(readdirSync(cache)).toHaveLength(pages.length);
  });

  it.each(['api/search', 'llms-full.txt', ...pages.map((page) => page[3])])(
    'keeps prop-table data out of %s',
    (file) => {
      expect(read(file)).not.toContain('~inherited:');
    },
  );

  it.each([
    ['docs/components/button/index.html', 'intent'],
    ['docs/components/text-field/index.html', 'errorMessage'],
  ])('lists only own props on %s', (file, ownProp) => {
    const section = propsSection(file);
    expect(section).toContain(ownProp);
    expect(section).not.toContain('onBlur');
    expect(section).not.toContain('~inherited:');
  });
});
