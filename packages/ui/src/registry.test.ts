import { expect, test } from 'vitest';

import root from '../../../registry.json';
import ui from '../registry.json';

const addresses = new Set(ui.items.map((item) => `oakoss/ui/${item.name}`));
const deps = ui.items.flatMap((item) => item.registryDependencies ?? []);

test('the root registry includes only the files checked here', () => {
  expect(root.include).toEqual(['packages/ui/registry.json']);
});

test('registryDependencies point at items in this repo', () => {
  expect(deps.length).toBeGreaterThan(0);
  expect(deps.filter((dep) => !addresses.has(dep))).toEqual([]);
});
