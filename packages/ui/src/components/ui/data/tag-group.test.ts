import { createElement } from 'react';
import { expect, test } from 'vitest';

import {
  Tag,
  type TagGroupProps,
  type TagProps,
} from '#/components/ui/data/tag-group';

type Item = { id: string; name: string };

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a tag needs text screen readers can read', () => {
  const valid: TagProps[] = [
    { children: 'News' },
    { children: ['3', ' unread'] },
    { children: createElement('span'), textValue: 'Verified' },
  ];
  // @ts-expect-error content that isn't plain text needs textValue
  const unnamed: TagProps = { children: createElement('span') };
  expect([...valid, unnamed]).toHaveLength(4);
});

test('a function child needs items and returns a tag', () => {
  const tag = (item: Item) => createElement(Tag, { textValue: item.name });
  const valid: TagGroupProps<Item>[] = [
    { children: createElement('span') },
    { children: tag, items: [] },
  ];
  // @ts-expect-error there's nothing to call the function with
  const noItems: TagGroupProps<Item> = { children: tag };
  // @ts-expect-error items need a function child to render them
  const noFunction: TagGroupProps<Item> = { children: 'News', items: [] };
  // @ts-expect-error a string isn't a tag; React Aria can't key it
  const text: TagGroupProps<Item> = { children: (i) => i.name, items: [] };
  // @ts-expect-error dependencies re-render the tags built from items
  const deps: TagGroupProps<Item> = { children: 'News', dependencies: [] };
  expect([...valid, noItems, noFunction, text, deps]).toHaveLength(6);
});
