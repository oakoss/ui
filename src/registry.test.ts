import { expect, test } from 'vitest';

import registry from '../registry.json';

const addresses = new Set(
  registry.items.map((item) => `oakoss/ui/${item.name}`),
);
const deps = registry.items.flatMap((item) => item.registryDependencies ?? []);

test('registryDependencies point at items in this repo', () => {
  expect(deps.length).toBeGreaterThan(0);
  expect(deps.filter((dep) => !addresses.has(dep))).toEqual([]);
});
