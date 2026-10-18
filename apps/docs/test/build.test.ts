import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { agentInstructions, pagePreamble } from '#/lib/llms';
import { INHERITED_PREFIX } from '#/lib/props';
import { siteUrl } from '#/lib/site';
import { staticPages } from '#/lib/static-pages';

const client = path.join(import.meta.dirname, '../dist/client');
const content = path.join(import.meta.dirname, '../content/docs');

type ContentPage = {
  html: string;
  markdown: string;
  slug: string;
  source: string;
};

function byPath(a: string, b: string) {
  return a.localeCompare(b);
}

// Each content page with its source file and the files it prerenders to.
function contentPages(dir = content, prefix = ''): ContentPage[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const slug = path.join(prefix, entry.name.replace(/\.mdx$/u, ''));
    if (entry.isDirectory()) {
      return contentPages(path.join(dir, entry.name), slug);
    }
    if (!entry.name.endsWith('.mdx')) return [];
    return {
      html: slug === 'index' ? 'docs/index.html' : `docs/${slug}/index.html`,
      markdown: `docs/${slug}.md`,
      slug,
      source: path.join(dir, entry.name),
    };
  });
}

function llmsArea(slug: string) {
  const [folder = '', ...rest] = slug.split('/');
  if (rest.length === 0) return 'Overview';
  return `${folder.charAt(0).toUpperCase()}${folder.slice(1)}`;
}

function llmsSection(title: string) {
  return (
    read('llms.txt').split(`## ${title}\n`, 2)[1]?.split('\n## ', 1)[0] ?? ''
  );
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

const componentPages = pages.filter(({ slug }) =>
  slug.startsWith('components/'),
);

describe('component pages', () => {
  it.each(componentPages)('follows the template on $slug', ({ source }) => {
    const mdx = readFileSync(source, 'utf-8');
    const sections = mdx.matchAll(/^## (.+)$/gmu).map(([, title]) => title);
    expect(sections.toArray()).toEqual([
      'Installation',
      'Usage',
      'Examples',
      'Accessibility',
      'API',
    ]);
    expect(mdx.indexOf('<ComponentPreview')).toBeLessThan(
      mdx.indexOf('## Installation'),
    );
  });

  it.each(componentPages)(
    'links manual-install files instead of inlining them on $slug',
    ({ markdown }) => {
      // cx.ts, which every component installs. The .md lists links only (its
      // sources are stripped); e2e checks the Manual tab loads them.
      expect(read(markdown)).toContain('/blob/main/packages/ui/src/lib/cx.ts');
      expect(read(markdown)).not.toContain('createCn');
      // Every registry target alias maps to a folder in the project.
      expect(read(markdown)).not.toMatch(/\[`@\w+\//u);
    },
  );

  it.each(componentPages)(
    'writes type tables under the page heading on $slug',
    ({ markdown }) => {
      // Authored headings carry an `[#id]`; auto-type-table's own `###`
      // heading, which would sit under the page's `#### Props`, doesn't.
      expect(read(markdown)).not.toMatch(/^### (?!.*\[#).+$/mu);
    },
  );

  it.each(componentPages)('shows the demo source on $slug', ({ markdown }) => {
    // The Code tab's source reaches the Markdown output, imports rewritten.
    expect(read(markdown)).toContain("from '#/components/ui/");
    expect(read(markdown)).not.toContain('@oakoss/ui');
    // An unexpanded element means its Markdown wasn't recorded.
    expect(read(markdown)).not.toMatch(/<Component(?:Preview|Install)\b/u);
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
});

describe('props and search output', () => {
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

  it.each([
    ['docs/components/button.md', 'intent'],
    ['docs/components/text-field.md', 'errorMessage'],
    ['docs/components/field.md', 'errors'],
  ])('writes only own props into %s', (file, ownProp) => {
    expect(read(file)).toContain(`| \`${ownProp}`);
    expect(read(file)).not.toContain('`onBlur');
  });

  // ClientOnly is the docs site's, so the Markdown shows the demo alone.
  it.each(['docs/components/calendar.md', 'llms-full.txt'])(
    'leaves the docs-only ClientOnly out of %s',
    (file) => {
      expect(read(file)).toContain('<CalendarDemo />');
      expect(read(file)).not.toContain('ClientOnly');
    },
  );

  it('indexes the install steps for search', () => {
    expect(read('api/search')).toContain('Copy each file into your project');
    // Search records keep link text, not link syntax.
    expect(read('api/search')).not.toContain('](');
  });
});

describe('llms.txt page list', () => {
  // Each page-list link, as the path below the site URL.
  const listed = read('llms.txt')
    .matchAll(/\]\((\S+?)\)/gu)
    .map(([, url = '']) => url.replace(siteUrl, ''))
    .filter((url) => url.endsWith('.md'))
    .toArray();

  it('links every page once in llms.txt, by absolute Markdown URL', () => {
    expect(read('llms.txt')).toContain(
      `- [Button](${siteUrl}/docs/components/button.md): A pressable button built on React Aria.`,
    );
    expect(listed.toSorted(byPath)).toEqual(
      pages.map(({ markdown }) => `/${markdown}`).toSorted(byPath),
    );
  });

  it('groups llms.txt by area', () => {
    expect(read('llms.txt').match(/^## .+$/gmu)).toEqual([
      '## Instructions for agents',
      '## Overview',
      '## Components',
      '## Guides',
      '## Theming',
    ]);
  });

  it.each(pages)('lists $slug under its area', ({ markdown, slug }) => {
    expect(llmsSection(llmsArea(slug))).toContain(`(${siteUrl}/${markdown})`);
  });
});

describe('llms output', () => {
  it.each(['llms.txt', 'llms-full.txt'])(
    'opens %s with the agent instructions',
    (file) => {
      expect(read(file).startsWith(agentInstructions)).toBe(true);
    },
  );

  it('gives llms.txt one H1', () => {
    expect(read('llms.txt').match(/^# /gmu)).toHaveLength(1);
  });

  it.each(pages)('opens $slug.md with the preamble', ({ markdown }) => {
    expect(read(markdown).split('\n\n', 2)[1]).toBe(pagePreamble);
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
