import { describe, expect, it } from 'vitest';

import { INHERITED_PREFIX, ownProps } from '../src/lib/props';
import {
  decodeMarkdownUrl,
  githubSourceUrl,
  markdownUrl,
} from '../src/lib/site';

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

describe('githubSourceUrl', () => {
  it('points at the content file on main', () => {
    expect(githubSourceUrl('components/button.mdx')).toBe(
      'https://github.com/oakoss/ui/blob/main/apps/docs/content/docs/components/button.mdx',
    );
  });
});

describe('ownProps', () => {
  it('drops entries tagged as inherited', () => {
    expect(
      ownProps({ [`${INHERITED_PREFIX}onPress`]: 1, intent: 2, size: 3 }),
    ).toEqual({ intent: 2, size: 3 });
  });
});
