import { describe, expect, it } from 'vitest';

import { cnConfigModule, cnTheme } from '#/cn-config';
import { styles, typographies } from '#/index';
import { defineStyle } from '#/style';

const { vega } = styles;
const typography = typographies.default;

describe('cnTheme', () => {
  it('lists each theme utility under its namespace, without modifiers', () => {
    const theme = cnTheme([vega], [typography]);

    expect(theme.spacing).toContain('control-x');
    expect(theme.radius).toContain('control');
    expect(theme.text).toContain('ui');
    expect(theme.font).toEqual(['heading', 'mono', 'sans']);
    expect(Object.values(theme).flat().join(' ')).not.toContain('--');
  });

  it('merges names across styles without duplicates', () => {
    const compact = defineStyle({
      ...vega,
      id: 'compact',
      tokens: {
        control: { description: '', namespace: 'spacing', value: '2rem' },
        dense: { description: '', namespace: 'spacing', value: '1rem' },
      },
    });

    const { spacing } = cnTheme([vega, compact], []);

    expect(spacing?.filter((name) => name === 'control')).toHaveLength(1);
    expect(spacing).toContain('dense');
  });

  it('rejects a variable it cannot split into namespace and name', () => {
    const unnamed = defineStyle({
      ...vega,
      tokens: { '': { description: '', namespace: 'spacing', value: '1rem' } },
    });

    expect(() => cnTheme([unnamed], [])).toThrow(
      'unexpected theme variable --spacing-',
    );
  });

  it('writes a module exporting the theme', () => {
    expect(cnConfigModule({ radius: ['control'] })).toContain(
      'export const cnTheme = {"radius":["control"]};',
    );
  });
});
