import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { computedColor } from './color';

const meta = {
  render: () => <div data-testid="probe" />,
  title: 'Internal/Forced colors',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Each forced-colors project runs the High Contrast palette matching its
// theme: Chromium picks it from the context's color scheme, so a project that
// dropped the scheme would test the light palette twice.
export const PaletteMatchesTheme: Story = {
  play: async ({ canvas }) => {
    const isDark = import.meta.env.VITE_STORY_THEME === 'dark';
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await expect(matchMedia('(prefers-color-scheme: dark)').matches).toBe(
      isDark,
    );
    const probe = canvas.getByTestId('probe');
    probe.style.color = 'Canvas';
    await expect(getComputedStyle(probe).color).toBe(
      isDark ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
    );
    // contrast and flatBackground paint over white, then the body's
    // background, so it must paint the forced Canvas.
    await expect(getComputedStyle(document.body).backgroundColor).toBe(
      computedColor('Canvas'),
    );
  },
  tags: ['forced-colors'],
};
