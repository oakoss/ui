import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { contrast } from './color';

const meta = { render: () => <></>, title: 'Internal/Color' } satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// A transparent fill shows the color beneath it, so it can't pass for a
// visible one; a translucent fill measures as blended.
export const Translucent: Story = {
  play: async () => {
    await expect(contrast('transparent', 'white')).toBe(1);
    await expect(contrast('rgba(0, 0, 0, 0)', 'black')).toBe(1);
    await expect(contrast('black', 'white')).toBeCloseTo(21, 1);
    const half = contrast('rgba(0, 0, 0, 0.5)', 'white');
    await expect(half).toBeGreaterThan(3);
    await expect(half).toBeLessThan(5);
  },
};
