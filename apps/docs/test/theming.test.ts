import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const client = path.join(import.meta.dirname, '../dist/client');

function read(file: string) {
  return readFileSync(path.join(client, file), 'utf-8');
}

describe('theming pages', () => {
  it.each(['docs/theming/tokens.md', 'docs/theming/token-names.md'])(
    'expands every token element in %s',
    (file) => {
      expect(read(file)).not.toMatch(/<Token(?:Table|Rules)\b/u);
    },
  );

  // The live tables are client-side; the Markdown carries Zinc's values.
  it("writes Zinc's light and dark values into tokens.md", () => {
    const markdown = read('docs/theming/tokens.md');
    expect(markdown).toContain(
      '| `--background` | `white` `oklch(1 0 0)` | `zinc-950` `oklch(0.141 0.005 285.823)` |',
    );
    expect(markdown).toContain(
      '| `--border` | `zinc-200` `oklch(0.92 0.004 286.32)` | `white / 10%` `oklch(1 0 0 / 10%)` |',
    );
    expect(markdown).toContain(
      '| `--field` | `transparent` `oklch(0 0 0 / 0%)` | `--foreground / 4.5%` `oklch(0.985 0 0 / 4.5%)` |',
    );
  });

  it('generates the rule tables on the token names page', () => {
    const markdown = read('docs/theming/token-names.md');
    expect(markdown).toMatch(/\| `--ring` +\| `--primary-text` +\|/u);
    expect(markdown).toMatch(
      /\| `--\{intent\}-border` +\|[^\n]+\| 200 in light, 800 in dark +\|/u,
    );
    expect(markdown).toMatch(/\| `--primary` +\| `--background` +\| 3:1 +\|/u);
    expect(markdown).toMatch(
      /\| `--chart-1` +\|[^\n]+\| blue 600 \(light\), 500 \(dark\) +\|/u,
    );
    expect(markdown).toMatch(
      /\| `--muted` +\|[^\n]+\| `zinc-100` +\| `zinc-800` +\|/u,
    );
    expect(markdown).not.toContain('0:1');
    expect(markdown).toContain('Default text on `background`.');
    expect(markdown).not.toContain('\\`');
    expect(
      read('docs/theming/token-names/index.html').match(/<table/gu),
    ).toHaveLength(5);
  });
});

describe('theming search', () => {
  it('indexes each token row for search', () => {
    const search = read('api/search');
    expect(search).toMatch(
      /"url":"\/docs\/theming\/tokens#primary","content":"--primary-subtle /u,
    );
    expect(search).toMatch(
      /"url":"\/docs\/theming\/token-names#derived-roles","content":"--sidebar-primary-foreground --primary-foreground /u,
    );
    expect(search).toContain('--{intent}-hover');
  });
});
