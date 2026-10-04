import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { INHERITED_PREFIX } from '../src/lib/props';
import { staticPages } from '../src/lib/static-pages';

const client = path.join(import.meta.dirname, '../dist/client');
const content = path.join(import.meta.dirname, '../content/docs');

type ContentPage = {
  html: string;
  markdown: string;
  slug: string;
  source: string;
};

// Each content page with its source file and the files it prerenders to.
function contentPages(dir = content, prefix = ''): ContentPage[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const slug = path.join(prefix, entry.name.replace(/\.mdx$/u, ''));
    if (entry.isDirectory()) {
      return contentPages(path.join(dir, entry.name), slug);
    }
    if (!entry.name.endsWith('.mdx')) return [];
    return [
      {
        html: slug === 'index' ? 'docs/index.html' : `docs/${slug}/index.html`,
        markdown: `docs/${slug}.md`,
        slug,
        source: path.join(dir, entry.name),
      },
    ];
  });
}

// The rendered text between the Props heading and the React Aria link.
function propsSection(file: string) {
  const text = visibleText(file);
  return text.slice(text.indexOf('Props'), text.indexOf('Also accepts'));
}

function read(file: string) {
  return readFileSync(path.join(client, file), 'utf-8');
}

// Markdown link targets in a source file that are not absolute, an anchor, or
// an external URL.
function relativeLinks(source: string) {
  return readFileSync(source, 'utf-8')
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
  it.each(pages)('renders $slug', ({ html, markdown }) => {
    expect(existsSync(path.join(client, html))).toBe(true);
    expect(existsSync(path.join(client, markdown))).toBe(true);
  });

  it.each(htmlFiles)('renders %s without a failed boundary', (file) => {
    // React leaves this marker where a Suspense boundary failed to render,
    // which still produces a 200 page with the content missing.
    expect(read(file)).not.toContain('<!--$!-->');
  });

  it.each(pages)('links $slug with absolute paths', ({ source }) => {
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

  it.each([
    'api/search',
    'llms-full.txt',
    ...pages.map((page) => page.markdown),
  ])('keeps prop-table data out of %s', (file) => {
    expect(read(file)).not.toContain(INHERITED_PREFIX);
  });

  it.each([
    ['docs/components/button/index.html', 'intent'],
    ['docs/components/text-field/index.html', 'errorMessage'],
    ['docs/components/field/index.html', 'errors'],
  ])('lists only own props on %s', (file, ownProp) => {
    const section = propsSection(file);
    expect(section).toContain(ownProp);
    expect(section).not.toContain('onBlur');
    expect(section).not.toContain(INHERITED_PREFIX);
  });
});

describe('site icons', () => {
  const links = read('index.html')
    .matchAll(/<link[^>]+rel="(?:icon|apple-touch-icon)"[^>]*>/gu)
    .map(([tag]) =>
      Object.fromEntries(
        tag
          .matchAll(/([\w-]+)="([^"]*)"/gu)
          .map(([, name, value]) => [name, value]),
      ),
    )
    .toArray();

  it('links the ico, then the svg, then the touch icon', () => {
    // `sizes` on the ico keeps SVG-capable browsers on the SVG.
    expect(links).toEqual([
      { href: '/favicon.ico', rel: 'icon', sizes: '32x32' },
      { href: '/favicon.svg', rel: 'icon', type: 'image/svg+xml' },
      { href: '/apple-touch-icon.png', rel: 'apple-touch-icon' },
    ]);
  });

  it.each(links)('ships $href', ({ href }) => {
    const file = path.join(client, String(href));
    expect(existsSync(file)).toBe(true);
  });
});
