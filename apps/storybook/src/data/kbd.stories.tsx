import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kbd, KbdGroup } from '@oakoss/ui/components/ui/data/kbd';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { Menu, MenuItem, Text } from 'react-aria-components';
import { expect, waitFor } from 'storybook/test';

import { part } from '../parts';

const meta = {
  args: { children: 'K' },
  component: Kbd,
  title: 'Data/Kbd',
} satisfies Meta<typeof Kbd>;

export default meta;

type Story = StoryObj<typeof meta>;

// A <kbd>, left to right even on a right-to-left page, as keys read.
export const Default: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expect(part('kbd').tagName).toBe('KBD');
    await expect(part('kbd')).toHaveAttribute('dir', 'ltr');
    await expect(part('kbd').getBoundingClientRect().height).toBe(20);
  },
};

// A glyph key reads as its label, so a button says "Command" rather than
// whatever a screen reader makes of ⌘.
export const Label: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('button')).toHaveAccessibleName(
      'Search Command K',
    );
  },
  render: () => (
    <button className="inline-flex items-center gap-2" type="button">
      Search
      <KbdGroup>
        <Kbd label="Command">⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  ),
};

// A blank label is no label: the glyph stays readable.
export const EmptyLabel: Story = {
  play: async ({ canvas }) => {
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAccessibleName('Close ⌘');
    }
  },
  render: () => (
    <div className="flex gap-2">
      <button type="button">
        Close <Kbd label="">⌘</Kbd>
      </button>
      <button type="button">
        Close <Kbd label=" ">⌘</Kbd>
      </button>
    </div>
  ),
};

// A menu item describes itself with its shortcut. The group takes the id the
// item hands out, so the whole shortcut is read and no id repeats.
export const InMenu: Story = {
  play: async ({ canvas, canvasElement }) => {
    const ids = [...canvasElement.querySelectorAll('[id]')].map(
      (element) => element.id,
    );
    await expect(new Set(ids).size).toBe(ids.length);
    await expect(
      canvas.getByRole('menuitem', { name: 'Search' }),
    ).toHaveAccessibleDescription('Command K');
    await expect(
      canvas.getByRole('menuitem', { name: 'Copy' }),
    ).toHaveAccessibleDescription('C');
  },
  render: () => (
    <Menu aria-label="Actions" className="w-48 text-sm">
      <MenuItem className="flex justify-between p-2" textValue="Search">
        <Text slot="label">Search</Text>
        <KbdGroup>
          <Kbd label="Command">⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </MenuItem>
      <MenuItem className="flex justify-between p-2" textValue="Copy">
        <Text slot="label">Copy</Text>
        <Kbd>C</Kbd>
      </MenuItem>
    </Menu>
  ),
};

// Inside a tooltip, a key takes the tooltip's own text color.
export const InTooltip: Story = {
  play: async () => {
    const tooltip = await waitFor(() => part('tooltip-content'));
    await expect(getComputedStyle(part('kbd', tooltip)).color).toBe(
      getComputedStyle(tooltip).color,
    );
  },
  render: () => (
    <TooltipTrigger isOpen>
      <Button>Save</Button>
      <Tooltip>
        Save <Kbd>S</Kbd>
      </Tooltip>
    </TooltipTrigger>
  ),
};

// Forced colors repaint the fill as the page color; the border keeps the key.
export const ForcedColors: Story = {
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const style = getComputedStyle(part('kbd'));
    await expect(style.borderTopWidth).toBe('1px');
    await expect(style.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  },
  tags: ['forced-colors'],
};
