import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { SearchField } from '@oakoss/ui/components/ui/inputs/search-field';
import { expect, fn, userEvent } from 'storybook/test';

import { isPseudoHidden } from '#/pseudo';
import { setState } from '#/state';
import { atViewportWidth } from '#/viewport';

const onClear = fn<() => void>();
const onFilters = fn<() => void>();
const onSubmit = fn<(value: string) => void>();

const meta = {
  args: { className: 'w-80', label: 'Recipes', onClear, onSubmit },
  beforeEach: () => {
    for (const mock of [onClear, onFilters, onSubmit]) mock.mockClear();
  },
  component: SearchField,
  title: 'Inputs/Search Field',
} satisfies Meta<typeof SearchField>;

export default meta;

type Story = StoryObj<typeof meta>;

// A search box named by its label, with the Search key on phones. The clear
// button appears once there's text, named by React Aria and out of the tab
// order; pressing it clears and keeps focus in the input. WebKit's own clear
// button stays hidden.
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    await expect(input).toHaveAttribute('enterkeyhint', 'search');
    await expect(isPseudoHidden(input, '::-webkit-search-cancel-button')).toBe(
      true,
    );
    await expect(canvas.queryByRole('button')).toBeNull();
    await userEvent.type(input, 'soup');
    const clear = canvas.getByRole('button', { name: 'Clear search' });
    await expect(clear).toBeVisible();
    await expect(clear).toHaveAttribute('tabindex', '-1');
    await userEvent.click(clear);
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(onClear).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole('button')).toBeNull();
  },
};

// Escape clears what's typed; Enter submits it.
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    await userEvent.type(input, 'soup{Enter}');
    await expect(onSubmit).toHaveBeenCalledWith('soup');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('');
    await expect(onClear).toHaveBeenCalledTimes(1);
  },
};

// The icon leads, then start, the input, end and the clear button last. A
// button in a decoration keeps its own name, tab stop and action rather than
// the clear button's. The clear button is a square at the control height,
// 44px wide on phones, and tints on hover; the story ends hovered, so axe
// checks that state.
export const Decorated: Story = {
  args: {
    defaultValue: 'soup',
    end: (
      <Button onPress={onFilters} variant="ghost">
        Filters
      </Button>
    ),
    start: 'All',
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    const filters = canvas.getByRole('button', { name: 'Filters' });
    const clear = canvas.getByRole('button', { name: 'Clear search' });
    const icon = input
      .closest('[data-slot=input-group]')
      ?.querySelector('svg.lucide-search');
    if (!icon) throw new Error('No search icon');
    const lefts = [icon, canvas.getByText('All'), input, filters, clear].map(
      (element) => element.getBoundingClientRect().left,
    );
    await expect(lefts).toEqual(lefts.toSorted((a, b) => a - b));
    // The DOM order matches, so focus and reading order do too.
    await userEvent.click(input);
    await userEvent.tab();
    await expect(filters).toHaveFocus();
    await expect(input).toHaveAccessibleDescription('All');
    await expect(filters).not.toHaveAttribute('tabindex', '-1');
    await userEvent.click(filters);
    await expect(onFilters).toHaveBeenCalledTimes(1);
    await expect(input).toHaveValue('soup');
    await expect(onClear).not.toHaveBeenCalled();
    const box = clear.getBoundingClientRect();
    await expect(Math.round(box.width)).toBe(Math.round(box.height));
    await atViewportWidth(375, async () => {
      await expect(Math.round(clear.getBoundingClientRect().width)).toBe(44);
    });
    await setState(clear, 'resting');
    const resting = getComputedStyle(clear).backgroundImage;
    await setState(clear, 'hovered');
    await expect(getComputedStyle(clear).backgroundImage).not.toBe(resting);
  },
};

// A read-only field shows no clear button, though it has text; nor does the
// field fade for the disabled button inside it.
export const ReadOnly: Story = {
  args: { defaultValue: 'soup', isReadOnly: true },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('button')).toBeNull();
    const group = canvas
      .getByRole('searchbox')
      .closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    await expect(getComputedStyle(group).opacity).toBe('1');
  },
};

// Right to left, the icon leads on the right and the clear button ends on
// the left.
export const RightToLeft: Story = {
  args: { defaultValue: 'soup', label: 'وصفات' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox').getBoundingClientRect();
    const clear = canvas.getByRole('button').getBoundingClientRect();
    await expect(clear.right).toBeLessThanOrEqual(input.left + 1);
  },
};

// The description and error describe the input.
export const Invalid: Story = {
  args: {
    description: 'Search by name or ingredient.',
    errorMessage: 'Enter at least two letters.',
    isInvalid: true,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('searchbox', { name: 'Recipes' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Search by name or ingredient. Enter at least two letters.',
    );
  },
};
