import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect } from 'storybook/test';

import { tokenColor } from './color';

const meta = {
  // Storybook paints a docs story frame with one generated class, from a
  // stylesheet that loads after app.css; this sheet stands in for it.
  beforeEach: () => {
    const storybook = new CSSStyleSheet();
    storybook.replaceSync(
      '[data-testid=frame] { background-color: rgb(255, 255, 255); color: rgb(1, 2, 3); }',
    );
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, storybook];
    return () => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(
        (sheet) => sheet !== storybook,
      );
    };
  },
  render: () => <div className="sbdocs sbdocs-preview" data-testid="frame" />,
  title: 'Internal/Docs frame',
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// A docs frame takes the theme's colors, so dark-theme text doesn't land
// on Storybook's white.
export const ThemeColors: Story = {
  play: async ({ canvas }) => {
    const frame = getComputedStyle(canvas.getByTestId('frame'));
    await expect(frame.backgroundColor).toBe(tokenColor('--color-background'));
    await expect(frame.color).toBe(tokenColor('--color-foreground'));
  },
};
