import type { Meta, StoryObj } from '@storybook/react-vite';

import { Kbd } from '@oakoss/ui/components/ui/data/kbd';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from '@oakoss/ui/components/ui/inputs/button-group';
import { Input } from '@oakoss/ui/components/ui/inputs/field';
import { expect } from 'storybook/test';

import { part } from '../parts';

const meta = {
  args: { variant: 'outline' },
  component: ButtonGroup,
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Archive</Button>
      <Button>Report</Button>
      <Button>Snooze</Button>
    </ButtonGroup>
  ),
  title: 'Inputs/ButtonGroup',
} satisfies Meta<typeof ButtonGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function children() {
  return [...part('button-group').children].map((child) => {
    if (!(child instanceof HTMLElement)) throw new Error('Not an element');
    return child;
  });
}

// An unnamed group only lays its Buttons out, joined: shared edges overlap
// and only the outer corners stay round. Its Buttons have no 44px hit areas,
// which would overlap.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group')).toBeNull();
    const [first, middle, last] = children();
    if (!first || !middle || !last) throw new Error('No buttons');
    await expect(middle.getBoundingClientRect().left).toBe(
      first.getBoundingClientRect().right - 1,
    );
    await expect(getComputedStyle(first).borderStartEndRadius).toBe('0px');
    await expect(getComputedStyle(first).borderStartStartRadius).not.toBe(
      '0px',
    );
    await expect(getComputedStyle(middle).borderStartStartRadius).toBe('0px');
    await expect(getComputedStyle(last).borderEndEndRadius).not.toBe('0px');
    await expect(getComputedStyle(first, '::after').minHeight).toBe('0px');
  },
};

// A named group is announced as a group.
export const Named: Story = {
  args: { 'aria-label': 'Message actions' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('group', { name: 'Message actions' }),
    ).toBeVisible();
  },
};

export const LabelledBy: Story = {
  args: { 'aria-labelledby': 'actions-label' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Actions' })).toBeVisible();
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <span id="actions-label">Actions</span>
      {meta.render(args)}
    </div>
  ),
};

export const BlankName: Story = {
  args: { 'aria-label': '  ' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('group')).toBeNull();
  },
};

// The group's size and variant reach its Buttons; a Button's own wins.
export const SizeAndVariant: Story = {
  args: { size: 'sm', variant: 'outline' },
  play: async ({ canvas }) => {
    const archive = canvas.getByRole('button', { name: 'Archive' });
    await expect(archive).toHaveAttribute('data-size', 'sm');
    await expect(archive).toHaveAttribute('data-variant', 'outline');
    const snooze = canvas.getByRole('button', { name: 'Snooze' });
    await expect(snooze).toHaveAttribute('data-variant', 'ghost');
    await expect(snooze).toHaveAttribute('data-size', 'lg');
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Archive</Button>
      <Button>Report</Button>
      <Button size="lg" variant="ghost">
        Snooze
      </Button>
    </ButtonGroup>
  ),
};

// Right to left, the first Button's round corners are on the right.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const [first, second] = children();
    if (!first || !second) throw new Error('No buttons');
    await expect(getComputedStyle(first).borderTopRightRadius).not.toBe('0px');
    await expect(getComputedStyle(first).borderTopLeftRadius).toBe('0px');
    await expect(second.getBoundingClientRect().right).toBe(
      first.getBoundingClientRect().left + 1,
    );
  },
};

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  play: async () => {
    const [first, second, last] = children();
    if (!first || !second || !last) throw new Error('No buttons');
    await expect(second.getBoundingClientRect().top).toBe(
      first.getBoundingClientRect().bottom - 1,
    );
    await expect(getComputedStyle(first).borderEndStartRadius).toBe('0px');
    await expect(getComputedStyle(last).borderStartStartRadius).toBe('0px');
    await expect(getComputedStyle(last).borderEndStartRadius).not.toBe('0px');
  },
};

// Groups inside a group keep a gap between them, and inherit the size and
// variant they don't set; one they set wins.
export const Nested: Story = {
  args: { size: 'sm', variant: 'outline' },
  play: async ({ canvas }) => {
    const left = canvas.getByRole('group', { name: 'Navigate' });
    const right = canvas.getByRole('group', { name: 'Edit' });
    await expect(
      right.getBoundingClientRect().left - left.getBoundingClientRect().right,
    ).toBeGreaterThanOrEqual(7);
    const back = canvas.getByRole('button', { name: 'Back' });
    await expect(back).toHaveAttribute('data-size', 'sm');
    await expect(back).toHaveAttribute('data-variant', 'outline');
    await expect(canvas.getByRole('button', { name: 'Cut' })).toHaveAttribute(
      'data-variant',
      'ghost',
    );
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroup aria-label="Navigate">
        <Button>Back</Button>
        <Button>Forward</Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Edit" variant="ghost">
        <Button>Cut</Button>
        <Button>Copy</Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};

// Only direct children join, so a Kbd inside a Button keeps its corners.
export const KbdInside: Story = {
  play: async () => {
    await expect(getComputedStyle(part('kbd')).borderTopLeftRadius).not.toBe(
      '0px',
    );
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button>Undo</Button>
      <Button>
        Search <Kbd>K</Kbd>
      </Button>
    </ButtonGroup>
  ),
};

// Any child joins: an input and a text label take the shared edges too.
export const WithInputAndText: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Amount' });
    await expect(getComputedStyle(input).borderStartStartRadius).toBe('0px');
    await expect(getComputedStyle(input).borderEndEndRadius).toBe('0px');
    await expect(
      getComputedStyle(part('button-group-text')).borderStartEndRadius,
    ).toBe('0px');
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <ButtonGroupText>USD</ButtonGroupText>
      <Input aria-label="Amount" />
      <Button>Send</Button>
    </ButtonGroup>
  ),
};

// The separator runs across the group, a visible line between joined
// Buttons.
export const Separator: Story = {
  play: async () => {
    const separator = part('button-group-separator');
    await expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    const style = getComputedStyle(separator);
    await expect(style.borderInlineStartWidth).toBe('1px');
    const box = separator.getBoundingClientRect();
    await expect(box.height).toBe(
      part('button-group').getBoundingClientRect().height,
    );
    await expect(
      document.elementFromPoint(box.left, box.top + box.height / 2),
    ).toBe(separator);
  },
  render: (args) => (
    <ButtonGroup {...args} variant="solid">
      <Button>Save</Button>
      <ButtonGroupSeparator />
      <Button>Publish</Button>
    </ButtonGroup>
  ),
};

// In forced colors the separator stays visible: it's a border, which the mode
// repaints in a system color, where a fill would turn the page's color.
export const ForcedColors: Story = {
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const separator = getComputedStyle(part('button-group-separator'));
    const page = getComputedStyle(document.body).backgroundColor;
    await expect(separator.borderInlineStartWidth).toBe('1px');
    await expect(separator.borderInlineStartColor).not.toBe(page);
  },
  render: Separator.render,
  tags: ['forced-colors'],
};

// Every part takes a consumer's className.
export const ClassNames: Story = {
  play: async () => {
    await expect(part('button-group')).toHaveClass('shadow-sm');
    await expect(part('button-group-separator')).toHaveClass('opacity-50');
    await expect(part('button-group-text')).toHaveClass('italic');
  },
  render: (args) => (
    <ButtonGroup {...args} className="shadow-sm">
      <ButtonGroupText className="italic">Mode</ButtonGroupText>
      <ButtonGroupSeparator className="opacity-50" />
      <Button>Edit</Button>
    </ButtonGroup>
  ),
};
