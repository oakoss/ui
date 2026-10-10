import { expect, test } from 'vitest';

import type { SelectProps } from '#/components/ui/inputs/select';

type Fruit = { id: string; name: string };

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a function child needs items, and items need a function child', () => {
  const fruits: Fruit[] = [{ id: 'apple', name: 'Apple' }];
  const valid: SelectProps<Fruit>[] = [
    { children: 'Static' },
    { children: (item) => item.name, items: fruits },
  ];
  // @ts-expect-error a function child renders nothing without items
  const noItems: SelectProps<Fruit> = { children: (item) => item.name };
  // @ts-expect-error items are ignored by static children
  const staticWithItems: SelectProps<Fruit> = { children: 'x', items: fruits };
  expect([...valid, noItems, staticWithItems]).toHaveLength(4);
});

test('selection mode is single or multiple, and value follows it', () => {
  // @ts-expect-error a select always selects
  const none: SelectProps<Fruit> = { selectionMode: 'none' };
  // @ts-expect-error single selection takes one key
  const array: SelectProps<Fruit> = { value: ['apple'] };
  expect([none, array]).toHaveLength(2);
});
