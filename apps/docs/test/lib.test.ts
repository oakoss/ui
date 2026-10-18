import registry from '@oakoss/ui/registry.json';
import { describe, expect, it } from 'vitest';

import { INHERITED_PREFIX, NO_OWN_PROPS, ownEntries } from '#/lib/props';
import { isShownAsSource } from '#/lib/registry-paths';
import { decodeMarkdownUrl, githubSourceUrl, markdownUrl } from '#/lib/site';
import { typeTableMarkdown } from '#/lib/type-tables';

describe('markdownUrl', () => {
  it.each([
    [[], '/docs/index.md'],
    [['components', 'button'], '/docs/components/button.md'],
  ])('maps %j to %s', (slugs, url) => {
    expect(markdownUrl(slugs)).toBe(url);
  });

  it.each([[[]], [['components', 'button']]])(
    'round-trips %j through decodeMarkdownUrl',
    (slugs) => {
      const segments = markdownUrl(slugs).slice('/docs/'.length).split('/');
      expect(decodeMarkdownUrl(segments)).toEqual(slugs);
    },
  );
});

describe('isShownAsSource', () => {
  const files = registry.items.flatMap((item) => item.files ?? []);

  // The Manual tab compiles each source as a module; a .css id would reach
  // Tailwind and fail the build.
  it('shows only script files and keeps the copied themes.css out', () => {
    const shown = files.filter((file) => isShownAsSource(file));
    expect(shown.length).toBeGreaterThan(0);
    expect(shown.filter((file) => !/\.tsx?$/u.test(file.path))).toEqual([]);
    expect(files.map((file) => file.path)).toContain('src/styles/themes.css');
  });
});

describe('githubSourceUrl', () => {
  it('points at the content file on main', () => {
    expect(githubSourceUrl('components/button.mdx')).toBe(
      'https://github.com/oakoss/ui/blob/main/apps/docs/content/docs/components/button.mdx',
    );
  });
});

describe('ownEntries', () => {
  it('drops entries tagged as inherited', () => {
    expect(
      ownEntries([
        { name: `${INHERITED_PREFIX}onPress` },
        { name: 'intent' },
        { name: 'size' },
      ]),
    ).toEqual([{ name: 'intent' }, { name: 'size' }]);
  });
});

describe('typeTableMarkdown', () => {
  const size = {
    deprecated: false,
    description: 'How large it renders.',
    name: 'size',
    required: false,
    simplifiedType: 'union',
    tags: [],
    type: "'sm' | 'md'",
  };

  it('writes the table without its heading', () => {
    const markdown = typeTableMarkdown({
      entries: [size],
      id: 'button.tsx-ButtonProps',
      name: 'ButtonProps',
    });
    expect(markdown).not.toContain('### ButtonProps');
    expect(markdown).toContain('| `size?`');
  });

  it('writes the page sentence for a table with no own props', () => {
    expect(
      typeTableMarkdown({ entries: [], id: 'x.tsx-XProps', name: 'XProps' }),
    ).toBe(NO_OWN_PROPS);
  });
});
