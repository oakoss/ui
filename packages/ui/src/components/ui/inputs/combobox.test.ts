import { expect, test } from 'vitest';

import type { ComboboxProps } from '#/components/ui/inputs/combobox';

type Fruit = { id: string; name: string };

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a function child needs items or defaultItems, and only one', () => {
  const fruits: Fruit[] = [{ id: 'apple', name: 'Apple' }];
  const valid: ComboboxProps<Fruit>[] = [
    { children: 'Static' },
    { children: (item) => item.name, items: fruits },
    { children: (item) => item.name, defaultItems: fruits },
  ];
  // @ts-expect-error a function child renders nothing without items
  const noItems: ComboboxProps<Fruit> = { children: (item) => item.name };
  // @ts-expect-error items turn off filtering of static children
  const staticWithItems: ComboboxProps<Fruit> = {
    children: 'x',
    items: fruits,
  };
  // @ts-expect-error items and defaultItems compete
  const both: ComboboxProps<Fruit> = {
    children: (item) => item.name,
    defaultItems: fruits,
    items: fruits,
  };
  expect([...valid, noItems, staticWithItems, both]).toHaveLength(6);
});

test('a combobox selects one option', () => {
  // @ts-expect-error multiple selection isn't supported
  const multiple: ComboboxProps<Fruit> = { selectionMode: 'multiple' };
  expect(multiple).toBeDefined();
});
