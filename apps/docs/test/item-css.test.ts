import registry from '@oakoss/ui/registry.json';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

import { itemCss } from '#/lib/item-css';

const styles = path.dirname(
  fileURLToPath(import.meta.resolve('@oakoss/ui/styles.css')),
);

const styled = registry.items.filter(
  (item) => item.type === 'registry:ui' && ('css' in item || 'cssVars' in item),
);

function minified(css: string): string {
  return css
    .replaceAll(/\s*([{}:;,])\s*/gu, '$1')
    .replaceAll(/\s+/gu, ' ')
    .trim();
}

// Without it a manual install renders no link tint or progress animation.
it.each([
  ['table', '@custom-variant linked'],
  ['progress', '@keyframes progress-indeterminate'],
])("lists %s's CSS in its built manual steps", (name, css) => {
  const page = readFileSync(
    path.join(import.meta.dirname, `../dist/client/docs/components/${name}.md`),
    'utf-8',
  );
  expect(page).toContain('Add this CSS to your stylesheet.');
  expect(page).toContain(css);
});

// The manual install's CSS step must match what Storybook and the docs load.
it.each(styled.map((item) => [item.name, item] as const))(
  "gives %s's manual install its stylesheet",
  (name, item) => {
    const source = readFileSync(path.join(styles, `${name}.css`), 'utf-8');
    expect(minified(itemCss(item))).toBe(minified(source));
  },
);
